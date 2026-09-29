'use client';

/**
 * Rétention du journal — état, simulation et application de la purge.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1).
 *
 * La purge s'exécute **d'abord en simulation**, jamais directement : l'action
 * `purgeActivityLogs(true)` compte ce qui partirait, et l'écran présente ce
 * compte avant de demander confirmation. Effacer un journal est irréversible —
 * `durability_health.md` § 3 impose de mesurer avant d'agir, et un journal est
 * précisément ce qui permet de comprendre un incident passé.
 */

import { useCallback, useEffect, useState } from 'react';
import {
    getActivityLogRetention,
    purgeActivityLogs,
    type ActivityLogRetention,
    type PurgeResult,
} from '@/app/(admin)/admin/actions/logs-retention';

export interface UseLogHubRetentionResult {
    retention: ActivityLogRetention | null;
    loading: boolean;
    simulating: boolean;
    applying: boolean;
    simulation: PurgeResult | null;
    lastApplied: PurgeResult | null;
    error: string | null;
    simulate: () => Promise<void>;
    apply: () => Promise<void>;
}

export function useLogHubRetention(): UseLogHubRetentionResult {
    const [retention, setRetention] = useState<ActivityLogRetention | null>(null);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState(false);
    const [applying, setApplying] = useState(false);
    const [simulation, setSimulation] = useState<PurgeResult | null>(null);
    const [lastApplied, setLastApplied] = useState<PurgeResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const state = await getActivityLogRetention();
        setRetention(state);
        setError(state ? null : 'État de rétention indisponible — lecture refusée ou base injoignable.');
        setLoading(false);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load]);

    const simulate = useCallback(async () => {
        setSimulating(true);
        const result = await purgeActivityLogs(true);
        setSimulation(result);
        setError(result.error);
        setSimulating(false);
        await load();
    }, [load]);

    const apply = useCallback(async () => {
        setApplying(true);
        const result = await purgeActivityLogs(false);
        setLastApplied(result);
        setError(result.error);
        setSimulation(null);
        setApplying(false);
        await load();
    }, [load]);

    return {
        retention,
        loading,
        simulating,
        applying,
        simulation,
        lastApplied,
        error,
        simulate,
        apply,
    };
}
