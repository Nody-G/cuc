'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    revalidateSite,
    getSystemHealth,
    type HealthState,
    type SystemHealthReport,
} from '@/app/(admin)/admin/actions';

interface UseSystemHealthProbeArgs {
    isOpen: boolean;
    showToast: (msg: string) => void;
}

export interface SystemHealthProbeController {
    isProbing: boolean;
    isRevalidating: boolean;
    report: SystemHealthReport | null;
    probeError: string | null;
    overallState: HealthState;
    measuredLabel: string;
    runProbe: (notify?: boolean) => Promise<void>;
    handleRevalidateCache: () => Promise<void>;
}

/**
 * Sonde système du Cockpit : mesure réelle (`getSystemHealth`), revalidation du
 * cache vitrine et dérivation de l'état global affiché.
 */
export function useSystemHealthProbe({
    isOpen,
    showToast,
}: UseSystemHealthProbeArgs): SystemHealthProbeController {
    const [isRevalidating, setIsRevalidating] = useState(false);
    const [isProbing, setIsProbing] = useState(false);
    const [report, setReport] = useState<SystemHealthReport | null>(null);
    const [probeError, setProbeError] = useState<string | null>(null);

    const runProbe = useCallback(
        async (notify = false) => {
            setIsProbing(true);
            setProbeError(null);
            try {
                const result = await getSystemHealth();
                setReport(result);
                if (notify) {
                    showToast(
                        result.overall === 'ok'
                            ? 'Sonde système exécutée : tous les services répondent.'
                            : `Sonde système exécutée : état ${result.overall}.`
                    );
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Erreur inconnue';
                setProbeError(message);
                if (notify) showToast(`Erreur de sonde : ${message}`);
            } finally {
                setIsProbing(false);
            }
        },
        [showToast]
    );

    // Sonde automatique à l'ouverture.
    // `runProbe` appelle `setIsProbing(true)` de façon synchrone : on diffère donc
    // l'appel hors du corps de l'effet pour éviter les rendus en cascade
    // (règle react-hooks/set-state-in-effect).
    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => {
            void runProbe(false);
        }, 0);
        return () => clearTimeout(timer);
    }, [isOpen, runProbe]);

    const handleRevalidateCache = async () => {
        setIsRevalidating(true);
        const res = await revalidateSite();
        setIsRevalidating(false);
        if (res.success) {
            showToast('Cache vitrine revalidé en direct sur toutes les routes !');
            void runProbe(false);
        } else {
            showToast(`Erreur : ${res.error}`);
        }
    };

    const overallState: HealthState = probeError ? 'down' : (report?.overall ?? 'degraded');
    const measuredLabel = report
        ? new Date(report.measuredAt).toLocaleTimeString('fr-FR')
        : 'Mesure en cours…';

    return {
        isProbing,
        isRevalidating,
        report,
        probeError,
        overallState,
        measuredLabel,
        runProbe,
        handleRevalidateCache,
    };
}
