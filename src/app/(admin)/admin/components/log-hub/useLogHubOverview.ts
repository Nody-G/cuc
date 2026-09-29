'use client';

/**
 * Synthèse du hub Journal — volumétrie et dernier événement.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1). La synthèse est chargée
 * séparément du flux : elle repose sur des comptes exacts côté base (quinze
 * requêtes `head` parallèles), alors que le flux lit des lignes. Séparer les deux
 * permet de rafraîchir la liste sans repayer les compteurs.
 */

import { useCallback, useEffect, useState } from 'react';
import { getActivityLogOverview } from '@/app/(admin)/admin/actions/logs';
import type { LogStats } from '@/lib/logging/types';

export interface UseLogHubOverviewResult {
    stats: LogStats | null;
    loading: boolean;
    refused: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

export function useLogHubOverview(): UseLogHubOverviewResult {
    const [stats, setStats] = useState<LogStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refused, setRefused] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async () => {
        const overview = await getActivityLogOverview();
        setStats(overview.stats);
        setRefused(overview.refused);
        setError(overview.error);
        setLoading(false);
    }, []);

    useEffect(() => {
        // Chargement initial : synchronisation avec la source distante, le
        // setState est intentionnel.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void reload();
    }, [reload]);

    return { stats, loading, refused, error, reload };
}
