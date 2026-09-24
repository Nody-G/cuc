'use client';

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import type { TrafficTimeSeriesPoint } from '@/types/site-traffic';

interface TrafficTimeChartProps {
    data: TrafficTimeSeriesPoint[];
    windowLabel: string;
}

export const TrafficTimeChart: React.FC<TrafficTimeChartProps> = ({ data, windowLabel }) => {
    const [metric, setMetric] = useState<'visitors' | 'pageViews'>('visitors');
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const values = data.map((d) => (metric === 'visitors' ? d.visitors : d.pageViews));
    const maxValue = Math.max(...values, 10);

    return (
        <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-6 shadow-xl">
            {/* Header du graphique */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-zinc-800/80 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#FFE500]" />
                        <h3 className="text-base font-display uppercase tracking-wider text-white">
                            Courbe de Fréquentation & Trafic
                        </h3>
                    </div>
                    <p className="text-xs font-tech text-zinc-400 mt-1">
                        Évolution chronologique sur la période {windowLabel}
                    </p>
                </div>

                {/* Sélecteur de métrique */}
                <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setMetric('visitors')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech uppercase transition-all cursor-pointer ${metric === 'visitors'
                                ? 'bg-[#FFE500] text-black font-bold shadow-md'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        Visiteurs
                    </button>
                    <button
                        type="button"
                        onClick={() => setMetric('pageViews')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech uppercase transition-all cursor-pointer ${metric === 'pageViews'
                                ? 'bg-cyan-400 text-black font-bold shadow-md'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        Pages Vues
                    </button>
                </div>
            </div>

            {/* Zone graphique à barres interactives */}
            <div className="pt-6 pb-2">
                <div className="h-52 w-full flex items-end gap-1.5 sm:gap-2 px-1 relative">
                    {data.map((point, index) => {
                        const val = metric === 'visitors' ? point.visitors : point.pageViews;
                        const heightPct = Math.max(6, Math.round((val / maxValue) * 100));
                        const isHovered = hoveredIndex === index;

                        return (
                            <div
                                key={point.timestamp + index}
                                className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {/* Tooltip au survol */}
                                {isHovered && (
                                    <div className="absolute -top-14 z-20 bg-zinc-900 border border-zinc-700 text-white rounded-lg px-2.5 py-1.5 shadow-2xl text-[11px] font-mono-tech whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                                        <div className="font-bold text-[#FFE500]">{point.label}</div>
                                        <div className="text-zinc-300">
                                            {val.toLocaleString('fr-FR')}{' '}
                                            {metric === 'visitors' ? 'visiteurs' : 'pages vues'}
                                        </div>
                                    </div>
                                )}

                                {/* Barre verticale */}
                                <div
                                    style={{ height: `${heightPct}%` }}
                                    className={`w-full rounded-t-md transition-all duration-300 ${metric === 'visitors'
                                            ? isHovered
                                                ? 'bg-[#FFE500]'
                                                : 'bg-[#FFE500]/70 hover:bg-[#FFE500]'
                                            : isHovered
                                                ? 'bg-cyan-400'
                                                : 'bg-cyan-500/70 hover:bg-cyan-400'
                                        }`}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Axe horizontal des étiquettes (dates/heures) */}
                <div className="flex justify-between items-center pt-3 text-[10px] font-mono-tech text-zinc-500 px-1 border-t border-zinc-800/60 mt-1">
                    {data
                        .filter((_, idx) => idx % Math.ceil(data.length / 8) === 0 || idx === data.length - 1)
                        .map((point, idx) => (
                            <span key={idx}>{point.label}</span>
                        ))}
                </div>
            </div>
        </div>
    );
};
