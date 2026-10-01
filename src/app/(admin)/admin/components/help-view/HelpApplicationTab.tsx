'use client';

/**
 * Volet « Dossier Application » du Cockpit.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : composant déclaratif pur.
 */

import React from 'react';
import { CheckCircle2, ChevronRight, HardDrive, Layers, Sparkles, XCircle } from 'lucide-react';
import {
    APP_METRICS,
    COCKPIT_SCREENS_OVERVIEW,
    MEDIA_PIPELINE_INFO,
    PUBLIC_PAGES_OVERVIEW,
    WORDPRESS_VS_NEXT,
} from './help-application-data';

export const HelpApplicationTab: React.FC = () => {
    return (
        <div className="space-y-10 animate-in fade-in duration-200">
            {/* Chiffres clés */}
            <section className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-[#FFE500]" /> Envergure & métriques de l’application
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {APP_METRICS.map((metric) => (
                        <div
                            key={metric.label}
                            className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-1 hover:border-[#FFE500]/30 transition-colors"
                        >
                            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                                {metric.label}
                            </div>
                            <div className="text-2xl font-black text-[#FFE500] tracking-tight">
                                {metric.value}
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">{metric.subtext}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pourquoi quitter WordPress ? Comparatif */}
            <section className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                    <h2 className="text-base font-bold text-white">
                        Pourquoi avoir remplacé l’ancien site WordPress ?
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Une rupture technologique totale pour garantir vitesse, sécurité et évolutivité.
                    </p>
                </div>
                <div className="space-y-2.5">
                    {WORDPRESS_VS_NEXT.map((item) => (
                        <div
                            key={item.category}
                            className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-2"
                        >
                            <div className="text-xs font-bold text-[#FFE500] uppercase tracking-wider font-mono">
                                {item.category}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold block text-red-400">Ancien WordPress</span>
                                        <span className="text-gray-300 leading-relaxed">{item.oldWordpress}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-bold block text-emerald-400">Nouveau CUC (Next.js 15)</span>
                                        <span className="text-gray-300 leading-relaxed">{item.newNextApp}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Cartographie : Pages publiques & Écrans Cockpit */}
            <section className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                    <h2 className="text-base font-bold text-white">
                        Cartographie complète de la plateforme (42 modules)
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Chaque recoin de l’application est conçu sur-mesure pour le CUC.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 15 Pages publiques */}
                    <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[#FFE500]">
                                {PUBLIC_PAGES_OVERVIEW.title}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFE500]/10 text-[#FFE500] font-bold">
                                {PUBLIC_PAGES_OVERVIEW.count} pages
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {PUBLIC_PAGES_OVERVIEW.description}
                        </p>
                        <ul className="space-y-1.5 pt-2 border-t border-white/5">
                            {PUBLIC_PAGES_OVERVIEW.items.map((page) => (
                                <li key={page} className="flex items-center gap-2 text-xs text-gray-300">
                                    <ChevronRight className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                                    <span>{page}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 27 Écrans Cockpit */}
                    <div className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[#FFE500]">
                                {COCKPIT_SCREENS_OVERVIEW.title}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFE500]/10 text-[#FFE500] font-bold">
                                {COCKPIT_SCREENS_OVERVIEW.count} écrans
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {COCKPIT_SCREENS_OVERVIEW.description}
                        </p>
                        <ul className="space-y-1.5 pt-2 border-t border-white/5">
                            {COCKPIT_SCREENS_OVERVIEW.items.map((screen) => (
                                <li key={screen} className="flex items-center gap-2 text-xs text-gray-300">
                                    <ChevronRight className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                                    <span>{screen}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Filière média industrielle */}
            <section className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <HardDrive className="w-4 h-4" /> {MEDIA_PIPELINE_INFO.title}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">{MEDIA_PIPELINE_INFO.subtitle}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Les images de cascade nécessitent une clarté irréprochable sans alourdir le chargement.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MEDIA_PIPELINE_INFO.points.map((pt) => (
                        <div key={pt.title} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
                                {pt.title}
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">{pt.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
