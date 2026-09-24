'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TrafficWindow, SiteTrafficReport, RealtimeVisitor } from '@/types/site-traffic';
import {
    getSiteTrafficReportAction,
    getRealtimeVisitorsAction,
    simulateVisitorAction,
} from '@/app/(admin)/admin/actions/traffic-monitor';
import { exportTrafficCsv } from '@/lib/traffic/traffic-service';

interface UseTrafficMonitorProps {
    showToast: (message: string) => void;
}

export function useTrafficMonitor({ showToast }: UseTrafficMonitorProps) {
    const [windowState, setWindowState] = useState<TrafficWindow>('30d');
    const [report, setReport] = useState<SiteTrafficReport | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [pollingInterval, setPollingInterval] = useState<number>(10000); // 10s par défaut
    const [isSimulating, setIsSimulating] = useState<boolean>(false);

    // Charge le rapport complet pour la fenêtre sélectionnée
    const loadReport = useCallback(
        async (targetWindow: TrafficWindow, silent = false) => {
            if (!silent) setLoading(true);
            else setIsRefreshing(true);

            try {
                const res = await getSiteTrafficReportAction(targetWindow);
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

    // Simule un visiteur pour tester le pulse en direct
    const handleSimulateVisitor = useCallback(async () => {
        setIsSimulating(true);
        try {
            const res = await simulateVisitorAction();
            if (res.success && res.data) {
                showToast(`Visiteur simulé sur ${res.data.currentPath}`);
                await refreshRealtime();
            } else {
                showToast('Échec de la simulation');
            }
        } catch {
            showToast('Erreur lors de la simulation');
        } finally {
            setIsSimulating(false);
        }
    }, [showToast, refreshRealtime]);

    // Export CSV
    const handleExportCsv = useCallback(() => {
        if (!report) return;
        const csvContent = exportTrafficCsv(report);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cuc-traffic-report-${report.window}-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Rapport CSV téléchargé avec succès');
    }, [report, showToast]);

    // Changement de fenêtre
    const handleSetWindow = useCallback(
        (newWindow: TrafficWindow) => {
            setWindowState(newWindow);
            loadReport(newWindow);
        },
        [loadReport]
    );

    // Initial load
    useEffect(() => {
        loadReport(windowState);
    }, [loadReport, windowState]);

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
        pollingInterval,
        setPollingInterval,
        refresh: () => loadReport(windowState, true),
        simulateVisitor: handleSimulateVisitor,
        isSimulating,
        exportCsv: handleExportCsv,
    };
}
