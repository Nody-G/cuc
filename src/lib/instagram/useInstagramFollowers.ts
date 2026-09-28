'use client';

import { useState, useEffect } from 'react';
import {
    getPublicInstagramFollowersAction,
    type PublicInstagramFollowersResult,
} from '@/app/(admin)/admin/actions/instagram';

export interface UseInstagramFollowersResult {
    followersCount: number;
    followersFormatted: string;
    exactFollowersFormatted: string;
    totalVideoViews: number;
    totalVideoViewsFormatted: string;
    isLoading: boolean;
}

const DEFAULT_METRICS: PublicInstagramFollowersResult = {
    success: true,
    followersCount: 1120672,
    followersFormatted: '1,1M',
    totalVideoViews: 706828446,
    totalVideoViewsFormatted: '706M',
};

/**
 * Hook temps réel pour afficher le compteur d'abonnés officiel CUC sur le site vitrine.
 * Utilise l'instantané synchronisé Supabase issu de la Meta Graph API v19.0.
 */
export function useInstagramFollowers(): UseInstagramFollowersResult {
    const [metrics, setMetrics] = useState<PublicInstagramFollowersResult>(DEFAULT_METRICS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        getPublicInstagramFollowersAction()
            .then((res) => {
                if (isMounted && res.success) {
                    setMetrics(res);
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        followersCount: metrics.followersCount,
        followersFormatted: metrics.followersFormatted,
        exactFollowersFormatted: metrics.followersCount.toLocaleString('fr-FR'),
        totalVideoViews: metrics.totalVideoViews,
        totalVideoViewsFormatted: metrics.totalVideoViewsFormatted,
        isLoading,
    };
}
