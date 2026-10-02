'use client';

import React from 'react';
import { Globe, RefreshCw, Download } from 'lucide-react';
import type { TrafficWindow } from '@/types/site-traffic';
import { CockpitViewHeader, CockpitButton, CockpitSkeletonList } from './ui';
import { useTrafficMonitor } from './traffic-monitor/useTrafficMonitor';
import { TrafficDataSourceBanner } from './traffic-monitor/TrafficDataSourceBanner';
import { TrafficWebVitalsCard } from './traffic-monitor/TrafficWebVitalsCard';
import { TrafficKpiOverview } from './traffic-monitor/TrafficKpiOverview';
import { TrafficTimeChart } from './traffic-monitor/TrafficTimeChart';
import { TrafficRealtimeStream } from './traffic-monitor/TrafficRealtimeStream';
import { TrafficPagesTable } from './traffic-monitor/TrafficPagesTable';
import { TrafficSourcesAndGeo } from './traffic-monitor/TrafficSourcesAndGeo';
import { TrafficConversionFunnels } from './traffic-monitor/TrafficConversionFunnels';

interface TrafficMonitorViewProps {
    showToast: (message: string) => void;
}

const WINDOW_LABELS: Record<TrafficWindow, string> = {
    today: "Aujourd'hui",
    '24h': '24 heures',
    '7d': '7 jours',
    '30d': '30 jours',
    '90d': '90 jours',
    '12m': '12 mois',
};

export const TrafficMonitorView: React.FC<TrafficMonitorViewProps> = ({ showToast }) => {
    const {
        report,
        loading,
        isRefreshing,
        window,
        setWindow,
        sourceMode,
        setSourceMode,
        pollingInterval,
        setPollingInterval,
        refresh,
        exportCsv,
    } = useTrafficMonitor({ showToast });

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* En-tête de la vue */}
            <CockpitViewHeader
                eyebrow="Trafic & Audience"
                icon={Globe}
                title="Monitoring des Visites & Fréquentation Web"
                description="Suivi en direct des visiteurs connectés et analyse des consultations de pages du Campus."
                actions={
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Sélecteur de période */}
                        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                            {(['today', '24h', '7d', '30d', '90d', '12m'] as TrafficWindow[]).map((w) => (
                                <button
                                    key={w}
                                    type="button"
                                    onClick={() => setWindow(w)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${window === w
                                        ? 'bg-[#FFE500] text-black font-bold shadow-sm'
                                        : 'text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    {WINDOW_LABELS[w]}
                                </button>
                            ))}
                        </div>

                        {/* Bouton d'actualisation manuelle */}
                        <CockpitButton
                            variant="secondary"
                            size="sm"
                            icon={RefreshCw}
                            onClick={refresh}
                            loading={isRefreshing}
                        >
                            Actualiser
                        </CockpitButton>

                        {/* Export CSV */}
                        <CockpitButton
                            variant="secondary"
                            size="sm"
                            icon={Download}
                            onClick={exportCsv}
                        >
                            Export CSV
                        </CockpitButton>
                    </div>
                }
            />

            {/* Sélecteur de source de données & information de bascule DNS */}
            <TrafficDataSourceBanner
                sourceMode={sourceMode}
                onChangeSourceMode={setSourceMode}
            />

            {loading || !report ? (
                <CockpitSkeletonList rows={6} />
            ) : (
                <div className="space-y-6">
                    {/* 1. KPIs majeurs */}
                    <TrafficKpiOverview kpis={report.kpis} windowLabel={WINDOW_LABELS[window]} />

                    {/* 2. Core Web Vitals réels (standard Octobre 2026) */}
                    <TrafficWebVitalsCard vitals={report.vitalsSummary} />

                    {/* 3. Graphique d'évolution temporelle */}
                    <TrafficTimeChart data={report.timeSeries} windowLabel={WINDOW_LABELS[window]} />

                    {/* 4. Visiteurs en direct & stream temps réel */}
                    <TrafficRealtimeStream
                        visitors={report.realtimeVisitors}
                        isRefreshing={isRefreshing}
                        onRefresh={refresh}
                        pollingInterval={pollingInterval}
                        onChangePolling={setPollingInterval}
                    />

                    {/* 5. Top pages & contenus */}
                    <TrafficPagesTable pages={report.topPages} />

                    {/* 6. Canaux, Géographie & Terminaux */}
                    <TrafficSourcesAndGeo
                        referrers={report.referrers}
                        geography={report.geography}
                        devices={report.devices}
                        browsers={report.browsers}
                    />

                    {/* 7. Tunnels de conversion clés CUC */}
                    <TrafficConversionFunnels funnels={report.funnels} />

                    {/* Pied de page informatif */}
                    <div className="text-center pt-2 pb-4 text-xs font-mono-tech text-zinc-500">
                        Audience &amp; Fréquentation Web en direct · Relevé actualisé le {new Date(report.generatedAt).toLocaleString('fr-FR')} · Sans cookie tiers, sans adresse IP conservée
                    </div>
                </div>
            )}
        </div>
    );
};
