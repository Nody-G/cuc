'use server';

import { revalidatePath } from 'next/cache';
import { getInstagramProfile, getReelLiveMetrics } from '@/lib/instagram/instagram-service';
import { resolveRefreshedInstagramToken } from '@/lib/instagram/instagram-config-refresh';
import { getOfficialReelMetrics } from '@/lib/instagram/instagram-reel-meta';
import {
    fetchLiveInstagramDashboard,
    fetchMoreLiveInstagramMedia,
    mergeFreshPublications,
    computeDashboardMetrics,
    type LiveInstagramDashboardData,
} from '@/lib/instagram/instagram-feed';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
    InstagramAccountStat,
    InstagramMetaApiConfig,
} from '@/types/instagram-monitor';

/**
 * Récupère la configuration Meta Graph API stockée dans Supabase (site_settings),
 * avec auto-renouvellement transparent si le jeton long-lived a plus de 20 jours.
 */
export async function getInstagramMetaConfigAction(): Promise<{
    success: boolean;
    config: InstagramMetaApiConfig;
}> {
    const fallback: InstagramMetaApiConfig = {
        enabled: Boolean(process.env.INSTAGRAM_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN),
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || '',
        instagramAccountId: process.env.INSTAGRAM_ACCOUNT_ID || process.env.META_INSTAGRAM_ACCOUNT_ID || '',
    };

    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('site_settings')
            .select('value, updated_at')
            .eq('key', 'instagram_meta_config')
            .maybeSingle();

        if (error || !data?.value) {
            return { success: true, config: fallback };
        }

        const saved = data.value as InstagramMetaApiConfig;
        /**
         * Renouvellement, décision comprise : le service
         * `instagram-config-refresh.ts` décide s'il faut prolonger le jeton,
         * l'écrit s'il est accepté, et journalise un refus de Meta. Cette fonction
         * n'en garde que le résultat — c'est ce qui permet de rester sous le
         * plafond de 300 lignes (`AGENTS.md` § 2).
         */
        const activeToken =
            (await resolveRefreshedInstagramToken(adminClient, saved, data.updated_at)) ||
            fallback.accessToken ||
            '';

        return {
            success: true,
            config: {
                enabled: saved.enabled ?? fallback.enabled,
                accessToken: activeToken,
                instagramAccountId: saved.instagramAccountId || fallback.instagramAccountId,
                appId: saved.appId || fallback.appId,
                appSecret: saved.appSecret || fallback.appSecret,
            },
        };
    } catch {
        return { success: true, config: fallback };
    }
}

/**
 * Enregistre la configuration Meta Graph API dans Supabase (site_settings).
 * Assure une persistance immédiate partagée entre local et Vercel sans redéploiement.
 */
export async function saveInstagramMetaConfigAction(
    config: InstagramMetaApiConfig
): Promise<{ success: boolean; error?: string }> {
    try {
        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('site_settings')
            .upsert({
                key: 'instagram_meta_config',
                value: {
                    enabled: config.enabled,
                    accessToken: config.accessToken?.trim() || '',
                    instagramAccountId: config.instagramAccountId?.trim() || '',
                    appId: config.appId?.trim() || '',
                    appSecret: config.appSecret?.trim() || '',
                },
                updated_at: new Date().toISOString(),
            });

        return error ? { success: false, error: error.message } : { success: true };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue lors de la sauvegarde.' };
    }
}

async function resolveActiveConfig(metaConfig?: InstagramMetaApiConfig) {
    if (metaConfig?.accessToken) return metaConfig;
    const loaded = await getInstagramMetaConfigAction();
    return loaded.config.enabled && loaded.config.accessToken ? loaded.config : metaConfig;
}

/**
 * Rafraîchit les statistiques d'un profil Instagram en direct.
 */
export async function refreshAccountAction(
    username: string,
    metaConfig?: InstagramMetaApiConfig
): Promise<{ success: boolean; data?: InstagramAccountStat; error?: string }> {
    try {
        const activeConfig = await resolveActiveConfig(metaConfig);
        const stat = await getInstagramProfile(username, activeConfig, true);
        if (!stat) {
            return {
                success: false,
                error: `Impossible de récupérer les statistiques pour @${username}. Compte privé ou introuvable.`,
            };
        }
        return { success: true, data: stat };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Erreur réseau inconnue.',
        };
    }
}

/**
 * Rafraîchit les métriques d'un Reel (vues certifiées et likes).
 * Utilise la Meta Graph API officielle en priorité, avec repli sur le scraper public.
 */
export async function refreshReelLiveMetricsAction(
    shortcode: string,
    metaConfig?: InstagramMetaApiConfig
): Promise<{
    success: boolean;
    data?: { likes?: string; views?: number; viewsFormatted?: string };
    error?: string;
}> {
    try {
        const activeConfig = await resolveActiveConfig(metaConfig);

        // Si le jeton Meta Graph officiel est présent, interroger l'API Insights certifiée
        if (activeConfig?.enabled && activeConfig.accessToken) {
            const official = await getOfficialReelMetrics(shortcode, activeConfig.accessToken);
            if (official) {
                revalidatePath('/[locale]/videos-cascadeur');
                return {
                    success: true,
                    data: {
                        likes: official.likes,
                        views: official.views,
                        viewsFormatted: official.viewsFormatted,
                    },
                };
            }
        }

        // Repli sur le scraper public (likes uniquement)
        const data = await getReelLiveMetrics(shortcode, true);
        if (!data) {
            return { success: false, error: 'Reel introuvable ou métadonnées non accessibles.' };
        }
        revalidatePath('/[locale]/videos-cascadeur');
        return { success: true, data };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue.' };
    }
}

async function loadFeaturedShortcodes(adminClient: ReturnType<typeof createAdminClient>): Promise<Set<string>> {
    const { data: row } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'instagram_featured_reels')
        .maybeSingle();

    const set = new Set<string>();
    const val = row?.value as { items?: { shortcode: string }[]; shortcodes?: string[] } | undefined;
    if (Array.isArray(val?.shortcodes)) {
        val.shortcodes.forEach((s) => set.add(s));
    } else if (Array.isArray(val?.items)) {
        val.items.forEach((item) => item.shortcode && set.add(item.shortcode));
    }
    return set;
}

/**
 * Récupère les données exhaustives du compte CUC (abonnés exacts + 262 vidéos + 706M+ vues).
 */
export async function getLiveInstagramDashboardAction(
    forceRefresh = false
): Promise<{ success: boolean; data?: LiveInstagramDashboardData; error?: string }> {
    try {
        const adminClient = createAdminClient();
        const featuredShortcodes = await loadFeaturedShortcodes(adminClient);

        // 1. Lecture de l'instantané complet en base (300 publications, 262 vidéos, 706M+ vues)
        const { data: row } = await adminClient
            .from('site_settings')
            .select('value')
            .eq('key', 'instagram_feed_snapshot')
            .maybeSingle();

        const snapshot = row?.value as LiveInstagramDashboardData | undefined;

        if (snapshot && !forceRefresh) {
            if (featuredShortcodes.size > 0) {
                snapshot.publications = snapshot.publications.map((p) => ({
                    ...p,
                    isFeatured: featuredShortcodes.has(p.shortcode),
                }));
            }
            return { success: true, data: snapshot };
        }

        // 2. Rafraîchissement direct depuis Meta Graph API
        const configRes = await getInstagramMetaConfigAction();
        const token = configRes.config.accessToken;
        if (!token) {
            return snapshot ? { success: true, data: snapshot } : { success: false, error: 'Jeton Meta non configuré.' };
        }

        const freshData = await fetchLiveInstagramDashboard(token, true, featuredShortcodes);
        if (!freshData) {
            return snapshot ? { success: true, data: snapshot } : { success: false, error: 'Impossible de joindre Meta.' };
        }

        let finalData = freshData;
        if (snapshot?.publications && snapshot.publications.length > 0) {
            const merged = mergeFreshPublications(snapshot.publications, freshData.publications);
            const m = computeDashboardMetrics(merged);
            finalData = {
                profile: freshData.profile,
                publications: merged,
                totalVideoViews: m.totalVideoViews,
                videoCount: m.videoCount,
                photoCount: m.photoCount,
                totalAccountPosts: freshData.totalAccountPosts || snapshot.totalAccountPosts,
                nextCursor: snapshot.nextCursor,
                lastSyncedAt: freshData.lastSyncedAt,
            };
        }

        await adminClient.from('site_settings').upsert({
            key: 'instagram_feed_snapshot',
            value: finalData,
            updated_at: new Date().toISOString(),
        });

        return { success: true, data: finalData };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue.' };
    }
}

/**
 * Récupère le lot suivant de publications antérieures via curseur Meta.
 */
export async function fetchMoreLiveInstagramPublicationsAction(
    afterCursor: string
): Promise<{
    success: boolean;
    publications?: import('@/types/instagram-monitor').InstagramReelMetric[];
    nextCursor?: string | null;
    error?: string;
}> {
    try {
        const configRes = await getInstagramMetaConfigAction();
        const token = configRes.config.accessToken;
        if (!token) return { success: false, error: 'Jeton Meta non configuré.' };

        const adminClient = createAdminClient();
        const featuredShortcodes = await loadFeaturedShortcodes(adminClient);

        const res = await fetchMoreLiveInstagramMedia(token, afterCursor, featuredShortcodes);
        if (!res) return { success: false, error: 'Impossible de récupérer les publications antérieures.' };

        return { success: true, publications: res.publications, nextCursor: res.nextCursor };
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue.' };
    }
}
