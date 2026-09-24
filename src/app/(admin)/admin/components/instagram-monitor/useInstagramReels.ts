'use client';

/**
 * Orchestration des Reels Instagram : catalogue, métriques cumulées et relevés
 * en direct (Reel unitaire ou six Reels phares).
 */

import React from 'react';
import { ALL_INSTAGRAM_REELS } from '@/data/instagram-reels';
import { calculateReelsAggregates } from '@/lib/instagram/instagram-service';
import type { InstagramReelMetric } from '@/types/instagram-monitor';
import { refreshReelLiveMetricsAction } from '@/app/(admin)/admin/actions/instagram-monitor';

export function useInstagramReels(showToast: (msg: string) => void) {
    const [reels, setReels] = React.useState<InstagramReelMetric[]>(ALL_INSTAGRAM_REELS);
    const [isRefreshingAllReels, setIsRefreshingAllReels] = React.useState(false);
    const [refreshingReelId, setRefreshingReelId] = React.useState<string | null>(null);

    const aggregates = React.useMemo(() => calculateReelsAggregates(reels), [reels]);

    /** Applique les métriques fraîches à un Reel : les valeurs absentes restent. */
    const applyReelMetrics = React.useCallback(
        (reelId: string, likes: InstagramReelMetric['likes']) => {
            setReels((prev) =>
                prev.map((item) =>
                    item.id === reelId
                        ? {
                            ...item,
                            likes: likes || item.likes,
                            lastUpdated: new Date().toISOString(),
                        }
                        : item
                )
            );
        },
        []
    );

    // Rafraîchir un Reel individuel
    const handleRefreshReel = async (shortcode: string, id: string) => {
        setRefreshingReelId(id);
        const res = await refreshReelLiveMetricsAction(shortcode);
        setRefreshingReelId(null);
        if (res.success && res.data) {
            applyReelMetrics(id, res.data.likes);
            showToast(`Métriques du Reel #${shortcode} actualisées !`);
        } else {
            showToast(res.error || `Erreur d'actualisation du Reel #${shortcode}`);
        }
    };

    // Rafraîchir les 6 premiers Reels phares
    const handleRefreshTopReels = async () => {
        setIsRefreshingAllReels(true);
        let updatedCount = 0;
        const topReels = reels.slice(0, 6);
        for (const reel of topReels) {
            const res = await refreshReelLiveMetricsAction(reel.shortcode);
            if (res.success && res.data) {
                updatedCount++;
                applyReelMetrics(reel.id, res.data.likes);
            }
        }
        setIsRefreshingAllReels(false);
        showToast(`${updatedCount} Reels phares actualisés en direct !`);
    };

    return {
        reels,
        aggregates,
        isRefreshingAllReels,
        refreshingReelId,
        handleRefreshReel,
        handleRefreshTopReels,
    };
}
