'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TrafficWindow, SiteTrafficReport } from '@/types/site-traffic';
import {
    getSiteTrafficReportAction,
    getRealtimeVisitorsAction,
} from '@/app/(admin)/admin/actions/traffic-monitor';
import { exportTrafficCsv } from '@/lib/traffic/traffic-service';

interface UseTrafficMonitorProps {
    showToast: (message: string) => void;
}

export function useTrafficMonitor({ showToast }: UseTrafficMonitorProps) {
    const [windowState, setWindowState] = useState<TrafficWindow>('30d');
    const [sourceMode, setSourceMode] = useState<'measured' | 'modelled'>('measured');
    const [report, setReport] = useState<SiteTrafficReport | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [pollingInterval, setPollingInterval] = useState<number>(10000); // 10s par défaut

    // Charge le rapport complet pour la fenêtre et la source sélectionnées
    const loadReport = useCallback(
        async (targetWindow: TrafficWindow, targetSource: 'measured' | 'modelled', silent = false) => {
            if (!silent) setLoading(true);
            else setIsRefreshing(true);

            try {
                const res = await getSiteTrafficReportAction(targetWindow, targetSource);
                if (res.success && res.data) {
                    setReport(res.data);
                } else {
                    showToast(res.error || 'Erreur chargement rapport');
                }
            } catch {
                showToast('Impossible de contacter le serveur');
            } finally {
                setLoading(false);
                setIsRefreshing(false);
            }
        },
        [showToast]
    );

    // Rafraîchit uniquement le flux temps réel
    const refreshRealtime = useCallback(async () => {
        try {
            const res = await getRealtimeVisitorsAction();
            if (res.success && res.data) {
                setReport((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        kpis: {
                            ...prev.kpis,
                            liveVisitorsCount: res.data!.count,
                        },
                        realtimeVisitors: res.data!.visitors,
                    };
                });
            }
        } catch {
            // Silencieux pour le polling
        }
    }, []);

    // Export CSV
    const handleExportCsv = useCallback(() => {
        if (!report) return;
        const csvContent = exportTrafficCsv(report);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cuc-traffic-report-${report.window}-${report.dataSource}-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Rapport CSV téléchargé avec succès');
    }, [report, showToast]);

    // Changement de fenêtre
    const handleSetWindow = useCallback(
        (newWindow: TrafficWindow) => {
            setWindowState(newWindow);
            loadReport(newWindow, sourceMode);
        },
        [loadReport, sourceMode]
    );

    // Changement de source de données
    const handleSetSourceMode = useCallback(
        (newMode: 'measured' | 'modelled') => {
            setSourceMode(newMode);
            loadReport(windowState, newMode);
        },
        [loadReport, windowState]
    );

    /**
     * Chargement initial.
     */
    useEffect(() => {
        void (async () => {
            await loadReport(windowState, sourceMode);
        })();
    }, [loadReport, windowState, sourceMode]);

    // Polling temps réel automatique
    useEffect(() => {
        if (pollingInterval <= 0) return;
        const timer = setInterval(() => {
            refreshRealtime();
        }, pollingInterval);
        return () => clearInterval(timer);
    }, [pollingInterval, refreshRealtime]);

    return {
        report,
        loading,
        isRefreshing,
        window: windowState,
        setWindow: handleSetWindow,
        sourceMode,
        setSourceMode: handleSetSourceMode,
        pollingInterval,
        setPollingInterval,
        refresh: () => loadReport(windowState, sourceMode, true),
        exportCsv: handleExportCsv,
    };
}
