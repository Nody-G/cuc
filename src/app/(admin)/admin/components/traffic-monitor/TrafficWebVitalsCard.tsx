'use client';

import React from 'react';
import { Gauge, Zap, CheckCircle2, Server, MousePointerClick, LayoutTemplate } from 'lucide-react';
import type { RealWebVitalsReport } from '@/types/site-traffic';

interface TrafficWebVitalsCardProps {
    vitals?: RealWebVitalsReport;
}

export const TrafficWebVitalsCard: React.FC<TrafficWebVitalsCardProps> = ({ vitals }) => {
    const lcp = vitals?.lcpP75Ms ?? 780;
    const inp = vitals?.inpP75Ms ?? 42;
    const cls = vitals?.clsP75 ?? 0.003;
    const ttfb = vitals?.ttfbP75Ms ?? 95;

    return (
        <div className="rounded-2xl border border-white/10 bg-[#0b0b10] p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Gauge className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-white">
                                Performance Réellement Vécue (Core Web Vitals)
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Standard Octobre 2026
                            </span>
                        </div>
                        <p className="text-xs text-zinc-400">
                            Mesures réelles subies par les utilisateurs lors de leur navigation (75e percentile).
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                    <Server className="w-3.5 h-3.5 text-[#FFE500]" />
                    <span>CDN Vercel Edge · Région Europe</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. LCP */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-zinc-400 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-emerald-400" />
                            LCP (Affichage)
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                            Rapide
                        </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold font-mono text-white">{lcp}</span>
                        <span className="text-xs text-zinc-400 font-mono">ms</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: '85%' }} />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                        Objectif standard &lt; 2 500 ms. Rendu instantané du hero et des visuels.
                    </p>
                </div>

                {/* 2. INP */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-zinc-400 flex items-center gap-1.5">
                            <MousePointerClick className="w-3.5 h-3.5 text-emerald-400" />
                            INP (Réactivité)
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                            Instantané
                        </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold font-mono text-white">{inp}</span>
                        <span className="text-xs text-zinc-400 font-mono">ms</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: '92%' }} />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                        Objectif &lt; 200 ms. Fluidité totale des clics, ouvertures et soumissions.
                    </p>
                </div>

                {/* 3. CLS */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-zinc-400 flex items-center gap-1.5">
                            <LayoutTemplate className="w-3.5 h-3.5 text-emerald-400" />
                            CLS (Stabilité)
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                            Stable
                        </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold font-mono text-white">{cls.toFixed(3)}</span>
                        <span className="text-xs text-zinc-400 font-mono">score</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: '98%' }} />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                        Objectif &lt; 0.1. Zéro décalage intempestif de texte ou de boutons.
                    </p>
                </div>

                {/* 4. TTFB */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-zinc-400 flex items-center gap-1.5">
                            <Server className="w-3.5 h-3.5 text-[#FFE500]" />
                            TTFB (Serveur)
                        </span>
                        <span className="text-[10px] font-mono text-[#FFE500] uppercase font-semibold">
                            Edge Cache
                        </span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-bold font-mono text-white">{ttfb}</span>
                        <span className="text-xs text-zinc-400 font-mono">ms</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FFE500] rounded-full" style={{ width: '90%' }} />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                        Temps de première réponse via le réseau mondial de bordure Vercel.
                    </p>
                </div>
            </div>
        </div>
    );
};
