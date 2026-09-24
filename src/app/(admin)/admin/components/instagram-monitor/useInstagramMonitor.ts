'use client';

/**
 * Moniteur Instagram — **façade d'orchestration**.
 *
 * Deux domaines distincts, deux hooks : le comparatif d'abonnés
 * (`useInstagramLeaderboard`) et les Reels (`useInstagramReels`). La surface
 * publique de ce hook reste inchangée pour l'écran du Cockpit.
 */

import { useInstagramLeaderboard } from './useInstagramLeaderboard';
import { useInstagramReels } from './useInstagramReels';

export function useInstagramMonitor(showToast: (msg: string) => void) {
    const leaderboard = useInstagramLeaderboard(showToast);
    const reels = useInstagramReels(showToast);

    return {
        ...leaderboard,
        ...reels,
    };
}
