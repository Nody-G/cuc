'use client';

import React from 'react';
import { Users, Eye, Radio, Clock, TrendingDown, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { TrafficKpis } from '@/types/site-traffic';
import { formatDuration } from '@/lib/traffic/traffic-service';

interface TrafficKpiOverviewProps {
    kpis: TrafficKpis;
    windowLabel: string;
}

export const TrafficKpiOverview: React.FC<TrafficKpiOverviewProps> = ({ kpis }) => {
    // Calcul de l'évolution des visiteurs uniques
    const diffVisitors = kpis.uniqueVisitors - kpis.prevPeriodUniqueVisitors;
    const pctVisitors = kpis.prevPeriodUniqueVisitors > 0
        ? Math.round((diffVisitors / kpis.prevPeriodUniqueVisitors) * 1000) / 10
        : 0;

    const pagesPerVisitor = kpis.uniqueVisitors > 0
        ? (kpis.pageViews / kpis.uniqueVisitors).toFixed(1)
        : '1.0';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* 1. Visiteurs Uniques */}
            <div className="bg-[#0b0b10] border border-zinc-800/80 rounded-2xl p-4 shadow-lg hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-mono-tech uppercase tracking-wider">Visiteurs Uniques</span>
                    <Users className="w-4 h-4 text-[#FFE500]" />
                </div>
                <div className="my-2">
                    <div className="text-2xl font-display text-white tracking-wide">
                        {kpis.uniqueVisitors.toLocaleString('fr-FR')}
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono-tech">
                    {pctVisitors >= 0 ? (
                        <span className="text-emerald-400 flex items-center font-bold">
                            <ArrowUpRight className="w-3 h-3" /> +{pctVisitors}%
                        </span>
                    ) : (
                        <span className="text-rose-400 flex items-center font-bold">
                            <ArrowDownRight className="w-3 h-3" /> {pctVisitors}%
                        </span>
                    )}
                    <span className="text-zinc-500 truncate">vs période préc.</span>
                </div>
            </div>

            {/* 2. Pages Vues */}
            <div className="bg-[#0b0b10] border border-zinc-800/80 rounded-2xl p-4 shadow-lg hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-mono-tech uppercase tracking-wider">Pages Vues</span>
                    <Eye className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="my-2">
                    <div className="text-2xl font-display text-white tracking-wide">
                        {kpis.pageViews.toLocaleString('fr-FR')}
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono-tech">
                    <span className="text-cyan-400 font-bold">{pagesPerVisitor}</span>
                    <span className="text-zinc-500 truncate">pages / visiteur</span>
                </div>
            </div>

            {/* 3. Visiteurs en Ligne (Live) */}
            <div className="bg-[#0b0b10] border border-emerald-500/30 bg-emerald-950/10 rounded-2xl p-4 shadow-lg hover:border-emerald-500/50 transition-all flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between text-emerald-400">
                    <span className="text-[11px] font-mono-tech uppercase tracking-wider flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        En Direct
                    </span>
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div className="my-2">
                    <div className="text-2xl font-display text-emerald-300 tracking-wide flex items-baseline gap-2">
                        {kpis.liveVisitorsCount}
                        <span className="text-xs font-mono-tech text-emerald-500 font-normal">actifs</span>
                    </div>
                </div>
                <div className="text-[11px] font-mono-tech text-emerald-400/80 truncate">
                    Sur le campus web CUC
                </div>
            </div>

            {/* 4. Durée Moyenne de Session */}
            <div className="bg-[#0b0b10] border border-zinc-800/80 rounded-2xl p-4 shadow-lg hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-mono-tech uppercase tracking-wider">Temps Moyen</span>
                    <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="my-2">
                    <div className="text-2xl font-display text-white tracking-wide">
                        {formatDuration(kpis.avgSessionDurationSec)}
                    </div>
                </div>
                <div className="text-[11px] font-mono-tech text-zinc-500 truncate">
                    Immersion & lecture fiches
                </div>
            </div>

            {/* 5. Taux de Rebond */}
            <div className="bg-[#0b0b10] border border-zinc-800/80 rounded-2xl p-4 shadow-lg hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-mono-tech uppercase tracking-wider">Taux de Rebond</span>
                    <TrendingDown className="w-4 h-4 text-purple-400" />
                </div>
                <div className="my-2">
                    <div className="text-2xl font-display text-white tracking-wide">
                        {kpis.bounceRate}%
                    </div>
                </div>
                <div className="text-[11px] font-mono-tech text-emerald-400 truncate">
                    Excellente rétention
                </div>
            </div>

            {/* 6. Taux de Conversion Global */}
            <div className="bg-[#0b0b10] border border-zinc-800/80 rounded-2xl p-4 shadow-lg hover:border-zinc-700 transition-all flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[11px] font-mono-tech uppercase tracking-wider">Conversion</span>
                    <Target className="w-4 h-4 text-[#FFE500]" />
                </div>
                <div className="my-2">
                    <div className="text-2xl font-display text-[#FFE500] tracking-wide">
                        {kpis.conversionRate}%
                    </div>
                </div>
                <div className="text-[11px] font-mono-tech text-zinc-500 truncate">
                    Candidatures & Devis pro
                </div>
            </div>
        </div>
    );
};
