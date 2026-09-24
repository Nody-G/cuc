'use client';

import React from 'react';
import { Target, ArrowDown, Award, Briefcase, PlayCircle } from 'lucide-react';
import type { ConversionFunnel } from '@/types/site-traffic';

interface TrafficConversionFunnelsProps {
    funnels: ConversionFunnel[];
}

export const TrafficConversionFunnels: React.FC<TrafficConversionFunnelsProps> = ({ funnels }) => {
    const getFunnelIcon = (category: ConversionFunnel['category']) => {
        switch (category) {
            case 'formation_pro':
                return <Award className="w-5 h-5 text-[#FFE500]" />;
            case 'team_building':
                return <Briefcase className="w-5 h-5 text-cyan-400" />;
            case 'immersion_campus':
                return <PlayCircle className="w-5 h-5 text-purple-400" />;
            default:
                return <Target className="w-5 h-5 text-zinc-400" />;
        }
    };

    return (
        <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl p-6 shadow-xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-zinc-800 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#FFE500]" />
                        <h3 className="text-base font-display uppercase tracking-wider text-white">
                            Tunnels de Conversion Clés CUC
                        </h3>
                    </div>
                    <p className="text-xs font-tech text-zinc-400 mt-1">
                        Du premier clic jusqu&apos;à la signature : suivi du parcours des candidats et entreprises
                    </p>
                </div>
            </div>

            {/* Grille des 3 tunnels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {funnels.map((funnel) => {
                    return (
                        <div
                            key={funnel.id}
                            className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between"
                        >
                            <div>
                                {/* Header du tunnel */}
                                <div className="flex items-start justify-between pb-3 border-b border-zinc-800/80">
                                    <div className="flex items-center gap-2">
                                        {getFunnelIcon(funnel.category)}
                                        <h4 className="text-sm font-display text-white">{funnel.title}</h4>
                                    </div>
                                    <div className="px-2 py-0.5 rounded-full bg-[#FFE500]/20 text-[#FFE500] font-mono-tech text-xs font-bold border border-[#FFE500]/30 shrink-0">
                                        {funnel.conversionRate}% conv.
                                    </div>
                                </div>

                                {/* Étapes successives */}
                                <div className="space-y-3 mt-4">
                                    {funnel.steps.map((step, idx) => {
                                        const isFirst = idx === 0;
                                        const isLast = idx === funnel.steps.length - 1;
                                        const pctOfTotal = Math.round((step.visitors / funnel.totalEntered) * 100);

                                        return (
                                            <div key={step.name} className="relative">
                                                {!isFirst && (
                                                    <div className="flex items-center justify-center my-1 text-zinc-600">
                                                        <ArrowDown className="w-3 h-3 text-zinc-500" />
                                                        <span className="text-[9px] font-mono-tech text-zinc-500 ml-1">
                                                            -{step.dropoffRate}% abandon
                                                        </span>
                                                    </div>
                                                )}

                                                <div
                                                    className={`p-3 rounded-lg border transition-all ${
                                                        isLast
                                                            ? 'bg-[#FFE500]/10 border-[#FFE500]/50'
                                                            : 'bg-zinc-900/90 border-zinc-800'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between text-xs font-mono-tech">
                                                        <span className="text-zinc-300 font-medium">
                                                            {step.stepNumber}. {step.name}
                                                        </span>
                                                        <span className="font-bold text-white">
                                                            {step.visitors.toLocaleString('fr-FR')}
                                                        </span>
                                                    </div>

                                                    <div className="h-1 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                                                        <div
                                                            style={{ width: `${pctOfTotal}%` }}
                                                            className={`h-full rounded-full ${
                                                                isLast ? 'bg-[#FFE500]' : 'bg-zinc-400'
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Résultat */}
                            <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono-tech">
                                <span className="text-zinc-400">Total convertis :</span>
                                <span className="text-[#FFE500] font-bold text-sm">
                                    {funnel.totalConverted.toLocaleString('fr-FR')} actions réussies
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
