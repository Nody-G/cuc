'use client';

/**
 * Orchestration du panneau « Versions & restauration » (`AGENTS.md` § 1).
 *
 * Toute la logique d'état vit ici : chargement de l'état, simulation, soumission
 * d'une restauration. La vue (`BackupVersionsPanel`) reste déclarative et
 * **n'appelle jamais** une Server Action directement.
 *
 * Convention du dépôt (cf. `dashboard-view/useAuditLogs.ts`) : le chargement
 * initial est branché par `.then(...)`, jamais par un `setState` synchrone dans
 * le corps de l'effet (`react-hooks/set-state-in-effect`).
 */

import { useCallback, useEffect, useState } from 'react';
import {
    listBackupVersions,
    restoreFromSnapshot,
    simulateRestore,
} from '@/app/(admin)/admin/actions/backup-versions';
import type {
    BackupStatusView,
    ListBackupVersionsResult,
    RestoreOutcome,
    RestorePlanView,
    RestoreRequest,
} from './backup-status.types';

/** Message unique de lecture impossible — jamais un état vide silencieux. */
const LOAD_ERROR = 'Lecture de l’état des sauvegardes impossible.';

/** Surface publique du hook, consommée telle quelle par la vue. */
export interface UseBackupVersionsResult {
    status: BackupStatusView | null;
    isLoading: boolean;
    statusError: string | null;
    reload: () => Promise<void>;
    plan: RestorePlanView | null;
    planError: string | null;
    isSimulating: boolean;
    simulate: (snapshotId: string) => Promise<void>;
    clearPlan: () => void;
    isRestoring: boolean;
    submit: (request: RestoreRequest) => Promise<RestoreOutcome>;
}

function describe(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
}

export function useBackupVersions(): UseBackupVersionsResult {
    const [status, setStatus] = useState<BackupStatusView | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [statusError, setStatusError] = useState<string | null>(null);
    const [plan, setPlan] = useState<RestorePlanView | null>(null);
    const [planError, setPlanError] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState<boolean>(false);
    const [isRestoring, setIsRestoring] = useState<boolean>(false);

    /** Applique un résultat de lecture : état fiable ou erreur nommée. */
    const applyResult = useCallback((result: ListBackupVersionsResult) => {
        if (result.ok) {
            setStatus(result.view);
            setStatusError(null);
        } else {
            setStatus(null);
            setStatusError(result.error);
        }
    }, []);

    useEffect(() => {
        void listBackupVersions()
            .then(applyResult)
            .catch((error: unknown) => {
                setStatus(null);
                setStatusError(describe(error, LOAD_ERROR));
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [applyResult]);

    const reload = useCallback(async () => {
        setIsLoading(true);
        setStatusError(null);
        try {
            applyResult(await listBackupVersions());
        } catch (error) {
            setStatus(null);
            setStatusError(describe(error, LOAD_ERROR));
        } finally {
            setIsLoading(false);
        }
    }, [applyResult]);

    const simulate = useCallback(async (snapshotId: string) => {
        setIsSimulating(true);
        setPlanError(null);
        setPlan(null);
        try {
            const result = await simulateRestore(snapshotId);
            if (result.ok) setPlan(result.plan);
            else setPlanError(result.error);
        } catch (error) {
            setPlanError(describe(error, 'Simulation impossible.'));
        } finally {
            setIsSimulating(false);
        }
    }, []);

    const clearPlan = useCallback(() => {
        setPlan(null);
        setPlanError(null);
    }, []);

    const submit = useCallback(
        async (request: RestoreRequest): Promise<RestoreOutcome> => {
            setIsRestoring(true);
            try {
                const outcome = await restoreFromSnapshot(request);
                // Le plan reste affiché en cas de succès : le dialogue montre
                // l'issue et le pré-instantané ; il se ferme sur action explicite.
                if (outcome.ok) await reload();
                return outcome;
            } catch (error) {
                return {
                    ok: false,
                    error: describe(error, 'Restauration impossible.'),
                    status: 'failed',
                    preSnapshotId: null,
                    tables: [],
                };
            } finally {
                setIsRestoring(false);
            }
        },
        [reload],
    );

    return {
        status,
        isLoading,
        statusError,
        reload,
        plan,
        planError,
        isSimulating,
        simulate,
        clearPlan,
        isRestoring,
        submit,
    };
}
