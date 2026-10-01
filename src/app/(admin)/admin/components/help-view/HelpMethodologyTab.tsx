'use client';

/**
 * Volet « Méthodologie & Vibe Coding » du Cockpit.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : composant déclaratif pur.
 */

import React from 'react';
import {
    Clock,
    Cpu,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Terminal,
} from 'lucide-react';
import {
    METHODOLOGY_STACK,
    PROJECT_DEV_STATS,
    VIBE_CODING_PRINCIPLES,
} from './help-methodology-data';

export const HelpMethodologyTab: React.FC = () => {
    return (
        <div className="space-y-10 animate-in fade-in duration-200">
            {/* Statistiques d'engagement & intensité */}
            <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-[#FFE500]" /> L’intensité du travail investi pour le CUC
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {PROJECT_DEV_STATS.map((stat) => (
                        <div
                            key={stat.label}
                            className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-1 hover:border-[#FFE500]/30 transition-colors"
                        >
                            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                                {stat.label}
                            </div>
                            <div className="text-xl font-black text-[#FFE500] tracking-tight">
                                {stat.value}
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">{stat.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Le Vibe Coding selon Niels */}
            <section className="p-6 rounded-2xl bg-[#0D0D12] border border-[#FFE500]/25 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" /> Les Coulisses de la Création
                </div>
                <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">
                        {VIBE_CODING_PRINCIPLES[0].title}
                    </h2>
                    <p className="text-xs text-[#FFE500]/90 font-mono mt-0.5">
                        {VIBE_CODING_PRINCIPLES[0].subtitle}
                    </p>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                    {VIBE_CODING_PRINCIPLES[0].detail}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {VIBE_CODING_PRINCIPLES[0].points.map((pt) => (
                        <div
                            key={pt}
                            className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300 flex items-start gap-2.5"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FFE500] shrink-0 mt-1.5" />
                            <span className="leading-relaxed">{pt}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* L'Arsenal Technologique & IA */}
            <section className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                        <Cpu className="w-3.5 h-3.5 text-[#FFE500]" /> La stack d’ingénierie augmentée par l’IA
                    </div>
                    <h2 className="text-base font-bold text-white mt-1">
                        Les outils utilisés pour bâtir et faire tourner la plateforme
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {METHODOLOGY_STACK.map((tool) => (
                        <div
                            key={tool.name}
                            className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-2 hover:border-white/20 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 text-gray-300">
                                    {tool.badge}
                                </span>
                                <Terminal className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                            <div className="text-sm font-bold text-white">{tool.name}</div>
                            <div className="text-[11px] font-mono text-[#FFE500]">{tool.role}</div>
                            <p className="text-xs text-gray-400 leading-relaxed">{tool.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Le Système de Règles Canoniques */}
            <section className="p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" /> Organisation & Garde-Fous
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">
                        {VIBE_CODING_PRINCIPLES[1].title}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {VIBE_CODING_PRINCIPLES[1].subtitle}
                    </p>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                    {VIBE_CODING_PRINCIPLES[1].detail}
                </p>
                <div className="space-y-2 pt-2">
                    {VIBE_CODING_PRINCIPLES[1].points.map((point) => (
                        <div
                            key={point}
                            className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3"
                        >
                            <ShieldAlert className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                            <div className="text-xs text-gray-300 leading-relaxed">{point}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
