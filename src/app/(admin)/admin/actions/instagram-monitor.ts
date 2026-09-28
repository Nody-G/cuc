'use server';

import { revalidatePath } from 'next/cache';
import { getInstagramProfile, getReelLiveMetrics } from '@/lib/instagram/instagram-service';
import { createAdminClient } from '@/lib/supabase/admin';
import type {
    InstagramAccountStat,
    InstagramMetaApiConfig,
} from '@/types/instagram-monitor';

/**
 * Récupère la configuration Meta Graph API stockée dans Supabase (site_settings),
 * avec repli automatique sur les variables d'environnement.
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
            .select('value')
            .eq('key', 'instagram_meta_config')
            .maybeSingle();

        if (error || !data?.value) {
            return { success: true, config: fallback };
        }

        const saved = data.value as InstagramMetaApiConfig;
        return {
            success: true,
            config: {
                enabled: saved.enabled ?? fallback.enabled,
                accessToken: saved.accessToken || fallback.accessToken,
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
 * Rafraîchit un lot de comptes pour le classement comparatif.
 */
export async function refreshLeaderboardBatchAction(
    usernames: string[],
    metaConfig?: InstagramMetaApiConfig
): Promise<{ success: boolean; results: InstagramAccountStat[] }> {
    let activeConfig = metaConfig;
    if (!activeConfig?.accessToken) {
        const loaded = await getInstagramMetaConfigAction();
        if (loaded.config.enabled && loaded.config.accessToken) {
            activeConfig = loaded.config;
        }
    }

    const results: InstagramAccountStat[] = [];

    for (const u of usernames) {
        const stat = await getInstagramProfile(u, activeConfig, false);
        if (stat) {
            results.push(stat);
        }
    }

    // Trie par nombre d'abonnés décroissant
    results.sort((a, b) => b.followersCount - a.followersCount);

    return { success: true, results };
}

/**
 * Rafraîchit les mentions publiques d'un Reel (likes).
 * Les vues ne sont pas exposées par Instagram hors API Meta Graph.
 */
export async function refreshReelLiveMetricsAction(
    shortcode: string
): Promise<{ success: boolean; data?: { likes?: string }; error?: string }> {
    try {
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
