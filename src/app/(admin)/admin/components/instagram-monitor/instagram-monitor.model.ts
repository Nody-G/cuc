/**
 * Domaine du moniteur Instagram : dérivations pures du comparatif d'abonnés.
 * Aucune dépendance React, aucun accès réseau (`AGENTS.md` § 1-2).
 */

import type {
    InstagramAccountStat,
    LeaderboardFilterMode,
} from '@/types/instagram-monitor';

/**
 * Classement affiché selon le mode choisi.
 *
 * Les rangs suivent la liste **déjà triée** : aucun rang n'est recalculé ni
 * interpolé ici, l'ordre affiché reste la seule vérité.
 */
export function filterLeaderboard(
    ranked: InstagramAccountStat[],
    mode: LeaderboardFilterMode
): InstagramAccountStat[] {
    if (mode === 'top_france') {
        return ranked.filter((a) => a.country === 'FR').slice(0, 15);
    }

    if (mode === 'action_stunt') {
        return ranked.filter(
            (a) =>
                a.isCuc ||
                a.category?.includes('Cascade') ||
                a.category?.includes('Parkour') ||
                a.category?.includes('Combat') ||
                a.category?.includes('Extrême') ||
                a.category?.includes('Cirque')
        );
    }

    if (mode === 'direct_context') {
        const cucIdx = ranked.findIndex((a) => a.isCuc);
        const start = Math.max(0, cucIdx - 10);
        const end = Math.min(ranked.length, cucIdx + 11);
        return ranked.slice(start, end);
    }

    return ranked;
}

/**
 * Fusion d'un relevé par pseudo : un compte dont le relevé échoue garde sa ligne
 * précédente au lieu de disparaître du comparatif.
 */
export function mergeLeaderboardStats(
    previous: InstagramAccountStat[],
    results: InstagramAccountStat[]
): { merged: InstagramAccountStat[]; updatedCount: number } {
    const fresh = new Map(results.map((stat) => [stat.username, stat]));
    const merged = previous.map((account) => fresh.get(account.username) ?? account);

    return { merged, updatedCount: fresh.size };
}
