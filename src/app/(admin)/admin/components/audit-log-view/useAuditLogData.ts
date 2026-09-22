'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuditLogEntry, getAuditLogsExtended } from '@/lib/data/site-service';
import { RANGE_MS } from './audit-format';

export interface AuditStats {
    total: number;
    last24h: number;
    authors: number;
}

export interface UseAuditLogDataResult {
    logs: AuditLogEntry[];
    stats: AuditStats;
    loading: boolean;
    refreshing: boolean;
    now: number;
    load: (showSpinner?: boolean) => Promise<void>;
}

export function useAuditLogData(): UseAuditLogDataResult {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Horodatage de référence : figé au montage puis rafraîchi à chaque
    // rechargement. Évite d'appeler `Date.now()` (impur) pendant le rendu.
    const [now, setNow] = useState(() => Date.now());

    const load = useCallback(async (showSpinner = false) => {
        if (showSpinner) setRefreshing(true);
        const data = await getAuditLogsExtended(500);
        setLogs(data);
        setNow(Date.now());
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        // Chargement initial du journal d'audit (synchronisation avec la source
        // distante : le setState est intentionnel).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load]);

    const stats = useMemo<AuditStats>(() => {
        const last24h = logs.filter((l) => {
            const t = new Date(l.created_at).getTime();
            return !Number.isNaN(t) && now - t <= RANGE_MS['24h'];
        }).length;
        const authors = new Set(logs.map((l) => l.user_name).filter(Boolean)).size;
        return { total: logs.length, last24h, authors };
    }, [logs, now]);

    return { logs, stats, loading, refreshing, now, load };
}
