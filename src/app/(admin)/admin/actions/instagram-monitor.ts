'use server';

import { revalidatePath } from 'next/cache';
import { getInstagramProfile, getReelLiveMetrics } from '@/lib/instagram/instagram-service';
import { isTokenRefreshDue, refreshInstagramToken } from '@/lib/instagram/instagram-token-refresh';
import { getOfficialReelMetrics } from '@/lib/instagram/instagram-reel-meta';
import {
    fetchLiveInstagramDashboard,
    fetchMoreLiveInstagramMedia,
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
        let activeToken = saved.accessToken || fallback.accessToken || '';

        // Auto-renouvellement perpétuel : prolonge de 60 jours supplémentaires si le jeton > 20 jours
        if (activeToken.startsWith('IG') && isTokenRefreshDue(data.updated_at)) {
            const refreshRes = await refreshInstagramToken(activeToken);
            if (refreshRes.success && refreshRes.accessToken) {
                activeToken = refreshRes.accessToken;
                await adminClient
                    .from('site_settings')
                    .update({
                        value: { ...saved, accessToken: activeToken },
                        updated_at: new Date().toISOString(),
                    })
                    .eq('key', 'instagram_meta_config');
            }
        }

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

        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Erreur inconnue lors de la sauvegarde.',
        };
    }
}

/**
 * Rafraîchit les statistiques d'un profil Instagram en direct.
 */
export async function refreshAccountAction(
    username: string,
    metaConfig?: InstagramMetaApiConfig
): Promise<{ success: boolean; data?: InstagramAccountStat; error?: string }> {
    try {
        let activeConfig = metaConfig;
        if (!activeConfig?.accessToken) {
            const loaded = await getInstagramMetaConfigAction();
            if (loaded.config.enabled && loaded.config.accessToken) {
                activeConfig = loaded.config;
            }
        }

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
        let activeConfig = metaConfig;
        if (!activeConfig?.accessToken) {
            const loaded = await getInstagramMetaConfigAction();
            if (loaded.config.enabled && loaded.config.accessToken) {
                activeConfig = loaded.config;
            }
        }

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

/**
 * Récupère les données exhaustives en direct du compte CUC (abonnés exacts + vidéos et photos réelles).
 */
export async function getLiveInstagramDashboardAction(
    forceRefresh = false
): Promise<{
    success: boolean;
    data?: LiveInstagramDashboardData;
    error?: string;
}> {
    try {
        const configRes = await getInstagramMetaConfigAction();
        const token = configRes.config.accessToken;
        if (!token) {
            return {
                success: false,
                error: 'Jeton Meta Graph API non configuré.',
            };
        }

        const adminClient = createAdminClient();
        const { data: featuredRow } = await adminClient
            .from('site_settings')
            .select('value')
            .eq('key', 'instagram_featured_reels')
            .maybeSingle();

        const featuredShortcodes = new Set<string>();
        const val = featuredRow?.value as { items?: { shortcode: string }[]; shortcodes?: string[] } | undefined;
        if (Array.isArray(val?.shortcodes)) {
            val.shortcodes.forEach((s) => featuredShortcodes.add(s));
        } else if (Array.isArray(val?.items)) {
            val.items.forEach((item) => item.shortcode && featuredShortcodes.add(item.shortcode));
        }

        const data = await fetchLiveInstagramDashboard(token, forceRefresh, featuredShortcodes);
        if (!data) {
            return {
                success: false,
                error: 'Impossible de joindre Meta Graph API.',
            };
        }

        return { success: true, data };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Erreur inconnue.',
        };
    }
}

/**
 * Récupère le lot suivant de publications antérieures (par tranches de 100) via curseur Meta.
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
        if (!token) {
            return { success: false, error: 'Jeton Meta Graph API non configuré.' };
        }

        const adminClient = createAdminClient();
        const { data: featuredRow } = await adminClient
            .from('site_settings')
            .select('value')
            .eq('key', 'instagram_featured_reels')
            .maybeSingle();

        const featuredShortcodes = new Set<string>();
        const val = featuredRow?.value as { items?: { shortcode: string }[]; shortcodes?: string[] } | undefined;
        if (Array.isArray(val?.shortcodes)) {
            val.shortcodes.forEach((s) => featuredShortcodes.add(s));
        } else if (Array.isArray(val?.items)) {
            val.items.forEach((item) => item.shortcode && featuredShortcodes.add(item.shortcode));
        }

        const res = await fetchMoreLiveInstagramMedia(token, afterCursor, featuredShortcodes);
        if (!res) {
            return { success: false, error: 'Impossible de récupérer les publications antérieures.' };
        }

        return {
            success: true,
            publications: res.publications,
            nextCursor: res.nextCursor,
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Erreur inconnue.',
        };
    }
}
