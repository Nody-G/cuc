'use client';

import React from 'react';
import { Globe, RefreshCw, Download, Calendar } from 'lucide-react';
import type { TrafficWindow } from '@/types/site-traffic';
import { CockpitViewHeader, CockpitButton, CockpitSkeletonList } from './ui';
import { useTrafficMonitor } from './traffic-monitor/useTrafficMonitor';
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
        pollingInterval,
        setPollingInterval,
        refresh,
        simulateVisitor,
        isSimulating,
        exportCsv,
    } = useTrafficMonitor({ showToast });

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* En-tête de la vue */}
            <CockpitViewHeader
                eyebrow="Trafic & Audience"
                icon={Globe}
                title="Monitoring des Visites & Fréquentation Web"
                description="Audience en temps réel, provenance Instagram & Google, et suivi des parcours de conversion CUC (Formation, Stages, B2B)."
                actions={
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Sélecteur de période */}
                        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                            {(['today', '24h', '7d', '30d', '90d', '12m'] as TrafficWindow[]).map((w) => (
                                <button
                                    key={w}
                                    type="button"
                                    onClick={() => setWindow(w)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-mono-tech transition-all cursor-pointer ${
                                        window === w
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

            {loading || !report ? (
                <CockpitSkeletonList rows={6} />
            ) : (
                <div className="space-y-6">
                    {/* 1. KPIs majeurs */}
                    <TrafficKpiOverview kpis={report.kpis} windowLabel={WINDOW_LABELS[window]} />

                    {/* 2. Graphique d'évolution temporelle */}
                    <TrafficTimeChart data={report.timeSeries} windowLabel={WINDOW_LABELS[window]} />

                    {/* 3. Visiteurs en direct & stream temps réel */}
                    <TrafficRealtimeStream
                        visitors={report.realtimeVisitors}
                        isRefreshing={isRefreshing}
                        onRefresh={refresh}
                        onSimulate={simulateVisitor}
                        isSimulating={isSimulating}
                        pollingInterval={pollingInterval}
                        onChangePolling={setPollingInterval}
                    />

                    {/* 4. Top pages & contenus */}
                    <TrafficPagesTable pages={report.topPages} />

                    {/* 5. Canaux, Géographie & Terminaux */}
                    <TrafficSourcesAndGeo
                        referrers={report.referrers}
                        geography={report.geography}
                        devices={report.devices}
                        browsers={report.browsers}
                    />

                    {/* 6. Tunnels de conversion clés CUC */}
                    <TrafficConversionFunnels funnels={report.funnels} />

                    {/* Pied de page informatif */}
                    <div className="text-center pt-2 pb-4 text-xs font-mono-tech text-zinc-500">
                        Données de fréquentation CUC · Généré le {new Date(report.generatedAt).toLocaleString('fr-FR')} · Conforme RGPD (sans cookies tiers)
                    </div>
                </div>
            )}
        </div>
    );
};
