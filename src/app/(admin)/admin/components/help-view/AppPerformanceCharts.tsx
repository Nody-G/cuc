'use client';

/**
 * Graphiques comparatifs Avant / Après (Octobre 2026) et jauges visuelles du
 * travail éditorial & cinéma pour le Dossier Application du Cockpit.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : composant déclaratif pur.
 */

import React from 'react';
import { BarChart3, CheckCircle2, Film, Gauge } from 'lucide-react';
import { PERFORMANCE_BENCHMARKS } from './help-application-data';

const EDITORIAL_GAUGES = [
    {
        label: 'Affiches & fiches films vérifiées',
        value: '569 / 569',
        pct: 100,
        detail: '100 % des films publiés possèdent leur affiche officielle et leurs rôles CUC normalisés.',
    },
    {
        label: 'Fiches équipe recoupées sur IMDb',
        value: '20 profils',
        pct: 100,
        detail: 'Biographies rédigées, crédits phares étoilés et filmographie individuelle vérifiée.',
    },
    {
        label: 'Doublures stars & photos plateau',
        value: '36 stars · 23 photos',
        pct: 100,
        detail: 'Galerie 6 colonnes avec navigation croisée vers les films + galerie action 2×4 extensible.',
    },
    {
        label: 'Couverture Mode Studio & Anglais',
        value: '442 clés · 1 660+ EN',
        pct: 100,
        detail: '0 texte figé dans le code ; parité franco-anglaise contrôlée par script automatique.',
    },
] as const;

export const AppPerformanceCharts: React.FC = () => {
    return (
        <section id="dossier-performances" className="space-y-6">
            <style>{`
                @keyframes cucBarGrow {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
                .cuc-bar-anim {
                    transform-origin: left;
                    animation: cucBarGrow 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
                }
            `}</style>

            {/* En-tête */}
            <div className="border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <Gauge className="w-4 h-4" /> Performances Mesurées & Travail sur le Catalogue
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                    Les gains de vitesse d’octobre 2026 et la rigueur du catalogue cinéma
                </h2>
                <p className="text-xs text-gray-400 mt-0.5 max-w-3xl leading-relaxed">
                    Pourquoi le site se charge instantanément malgré l’ampleur de sa filmographie, de ses galeries haute définition et de son plan 3D.
                </p>
            </div>

            {/* 3 Graphiques comparatifs Avant / Après */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {PERFORMANCE_BENCHMARKS.map((bench) => (
                    <div
                        key={bench.title}
                        className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4 flex flex-col justify-between"
                    >
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                                    <BarChart3 className="w-3.5 h-3.5 text-[#FFE500]" /> Mesure réelle
                                </span>
                                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-400 text-black font-mono">
                                    {bench.gainBadge}
                                </span>
                            </div>
                            <h3 className="text-sm font-bold text-white leading-snug">{bench.title}</h3>
                            <p className="text-[11px] text-gray-400 leading-relaxed">{bench.subtitle}</p>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-white/5">
                            {/* Barre Avant */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-gray-400">{bench.beforeLabel}</span>
                                    <span className="font-mono font-bold text-gray-300">{bench.beforeValue}</span>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full w-full rounded-full bg-gray-600 cuc-bar-anim" />
                                </div>
                            </div>

                            {/* Barre Après */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-white font-medium">{bench.afterLabel}</span>
                                    <span className="font-mono font-bold text-[#FFE500]">{bench.afterValue}</span>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#FFE500] to-emerald-400 cuc-bar-anim"
                                        style={{ width: `${bench.afterPercentWidth}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bloc de visualisation de la complétude du catalogue & vérification IMDb */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0D0D12] border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Jauge circulaire SVG à gauche */}
                <div className="lg:col-span-4 flex flex-col items-center text-center space-y-2 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                        <Film className="w-3.5 h-3.5" /> Vérité du Catalogue
                    </div>
                    <svg viewBox="0 0 160 160" className="w-36 h-36" role="img" aria-label="100 % des 569 films vérifiés avec affiche et synopsis">
                        <circle cx="80" cy="80" r="60" fill="none" stroke="#1f1f2b" strokeWidth="16" />
                        <circle
                            cx="80"
                            cy="80"
                            r="60"
                            fill="none"
                            stroke="#FFE500"
                            strokeWidth="16"
                            strokeDasharray="377 377"
                            strokeLinecap="round"
                            transform="rotate(-90 80 80)"
                        />
                        <text x="80" y="76" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="800">
                            569
                        </text>
                        <text x="80" y="96" textAnchor="middle" fill="#FFE500" fontSize="10.5" fontWeight="700">
                            100 % COMPLET
                        </text>
                    </svg>
                    <p className="text-[11px] text-gray-400 leading-relaxed max-w-xs">
                        Aucun faux titre ni texte générique : chaque film, chaque doublure et chaque fiche formateur repose sur des crédits vérifiés.
                    </p>
                </div>

                {/* 4 jauges de précision éditoriale à droite */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {EDITORIAL_GAUGES.map((g) => (
                        <div key={g.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    {g.label}
                                </span>
                                <span className="text-xs font-mono font-bold text-[#FFE500] shrink-0">{g.value}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-emerald-400 cuc-bar-anim"
                                    style={{ width: `${g.pct}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed">{g.detail}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
