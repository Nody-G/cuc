'use client';

import React from 'react';
import { Globe, RefreshCw, Download, AlertTriangle } from 'lucide-react';
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
                description="Visiteurs en direct réellement mesurés. Les volumes par période restent un modèle de démonstration, à ne pas lire comme des relevés."
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

            {/* Origine des chiffres — un modèle ne doit pas passer pour une mesure */}
            {report?.dataSource === 'modelled' && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-tech text-amber-100">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" />
                    <span>
                        <strong>Volumes par période : modèle de démonstration.</strong> Les visiteurs uniques, pages vues,
                        canaux, appareils et zones géographiques sont calculés sur des ratios de référence, pas sur une
                        collecte d’audience : aucune adresse IP n’est conservée. Seuls les <strong>visiteurs en direct</strong>
                        {' '}sont mesurés, à partir des sessions réellement reçues par le site.
                    </span>
                </div>
            )}

            {/* Statut d'hébergement Vercel & domaine */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl gap-3 text-xs font-mono-tech">
                <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-zinc-400">
                        Hébergement actif : <strong className="text-white">Vercel Production</strong> (
                        <a
                            href="https://cuc-new.vercel.app/"
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#FFE500] hover:underline"
                        >
                            https://cuc-new.vercel.app
                        </a>
                        )
                    </span>
                </div>
                <div className="text-[11px] text-zinc-500">
                    Bascule automatique prête pour le nom de domaine définitif du Campus
                </div>
            </div>

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
                        {report.dataSource === 'modelled'
                            ? 'Volumes modélisés (démonstration) · Visiteurs en direct mesurés'
                            : 'Données de fréquentation mesurées'}{' '}
                        · Généré le {new Date(report.generatedAt).toLocaleString('fr-FR')} · Sans cookie tiers, sans adresse IP conservée
                    </div>
                </div>
            )}
        </div>
    );
};
