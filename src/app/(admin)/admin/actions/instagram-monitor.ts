'use server';

import { revalidatePath } from 'next/cache';
import { getInstagramProfile, getReelLiveMetrics } from '@/lib/instagram/instagram-service';
import type {
    InstagramAccountStat,
    InstagramMetaApiConfig,
} from '@/types/instagram-monitor';

/**
 * Rafraîchit les statistiques d'un profil Instagram en direct.
 */
export async function refreshAccountAction(
    username: string,
    metaConfig?: InstagramMetaApiConfig
): Promise<{ success: boolean; data?: InstagramAccountStat; error?: string }> {
    try {
        const stat = await getInstagramProfile(username, metaConfig, true);
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
    const results: InstagramAccountStat[] = [];

    for (const u of usernames) {
        const stat = await getInstagramProfile(u, metaConfig, false);
        if (stat) {
            results.push(stat);
        }
    }

    // Trie par nombre d'abonnés décroissant
    results.sort((a, b) => b.followersCount - a.followersCount);

    return { success: true, results };
}

/**
 * Rafraîchit les métriques d'un Reel en direct.
 */
export async function refreshReelLiveMetricsAction(
    shortcode: string
): Promise<{ success: boolean; data?: { views?: number; viewsFormatted?: string; likes?: string }; error?: string }> {
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
