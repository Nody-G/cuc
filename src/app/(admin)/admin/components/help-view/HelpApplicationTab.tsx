'use client';

/**
 * Volet « Dossier Application » du Cockpit (/admin/aide).
 *
 * Rassemble en un dossier exhaustif, visuel et interactif pour Lucas Dollfus :
 * 1. Les 8 indicateurs clés mesurés en production
 * 2. Les 6 piliers expliquant pourquoi le site se distingue (travail de fond & ergonomie)
 * 3. Les schémas SVG animés d'architecture, du Mode Studio et de la cascade à 4 niveaux
 * 4. Les graphiques comparatifs Avant / Après (Octobre 2026) et jauges du catalogue cinéma
 * 5. L'explorateur interactif des 17 routes publiques (FR/EN) et des 27 écrans du Cockpit
 * 6. Le comparatif WordPress vs Next.js 16 et l'autopsie des 6 risques historiques
 * 7. La filière média WebP avec protection des négatifs (_originals)
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : composant déclaratif pur.
 */

import React from 'react';
import {
    Award,
    CheckCircle2,
    HardDrive,
    Layers,
    Sparkles,
    XCircle,
} from 'lucide-react';
import {
    APP_METRICS,
    MEDIA_PIPELINE_INFO,
    WHY_SITE_STANDS_OUT,
    WORDPRESS_VS_NEXT,
} from './help-application-data';
import { AppArchitectureDiagram } from './AppArchitectureDiagram';
import { AppPerformanceCharts } from './AppPerformanceCharts';
import { AppInteractiveCartography } from './AppInteractiveCartography';
import { AppVulnerabilitiesSection } from './AppVulnerabilitiesSection';

const QUICK_NAV = [
    { href: '#dossier-kpis', label: '1. Chiffres Clés' },
    { href: '#dossier-piliers', label: '2. Pourquoi le site se distingue' },
    { href: '#dossier-architecture', label: '3. Schémas & Mode Studio' },
    { href: '#dossier-performances', label: '4. Graphiques & Catalogue' },
    { href: '#dossier-cartographie', label: '5. Explorateur (Routes & Cockpit)' },
    { href: '#dossier-wordpress', label: '6. Avant / Après WordPress' },
    { href: '#dossier-medias', label: '7. Filière Média WebP' },
] as const;

export const HelpApplicationTab: React.FC = () => {
    return (
        <div className="space-y-12 animate-in fade-in duration-200">
            {/* Bandeau d'introduction & Sommaire rapide */}
            <section className="p-6 rounded-2xl bg-gradient-to-br from-[#12121A] to-[#0A0A0F] border border-[#FFE500]/30 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                        <Layers className="w-4 h-4" /> Dossier de Référence — Campus Univers Cascades
                    </div>
                    <span className="text-[11px] font-mono text-gray-400">
                        Tél. officiel : <strong className="text-white">01 30 32 38 03</strong> · Campus <strong className="text-white">11 000 m²</strong>
                    </span>
                </div>
                <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        Architecture, Performances & Travail de Fond sur l’Application CUC
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-4xl">
                        Ce dossier réunit l’état des lieux complet de votre application : comment le site public bilingue (FR/EN),
                        le Mode Studio, le Studio 3D et les 27 écrans du Cockpit fonctionnent ensemble, pourquoi le site se charge
                        instantanément, et comment chaque film, chaque fiche formateur et chaque doublure a été vérifié.
                    </p>
                </div>
                <nav aria-label="Sommaire du Dossier Application" className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                    {QUICK_NAV.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="text-[11px] font-mono px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#FFE500]/15 text-gray-300 hover:text-[#FFE500] border border-white/10 hover:border-[#FFE500]/40 transition-colors"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>
            </section>

            {/* 1. Les 8 Chiffres Clés */}
            <section id="dossier-kpis" className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-[#FFE500]" /> 1. L’Application en 8 repères mesurés
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {APP_METRICS.map((metric) => (
                        <div
                            key={metric.label}
                            className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-1.5 hover:border-[#FFE500]/30 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                                    {metric.label}
                                </span>
                                {metric.badge && (
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FFE500]/10 text-[#FFE500] font-bold">
                                        {metric.badge}
                                    </span>
                                )}
                            </div>
                            <div className="text-2xl font-black text-[#FFE500] tracking-tight">
                                {metric.value}
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">{metric.subtext}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. Les 6 Piliers : Pourquoi ce site se distingue */}
            <section id="dossier-piliers" className="space-y-4">
                <div className="border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                        <Award className="w-4 h-4" /> 2. Ce qui fait la différence au quotidien
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1">
                        Les 6 piliers d’ingénierie, de design et d’édition construits sur mesure pour le CUC
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5 max-w-3xl leading-relaxed">
                        Derrière l’apparence sobre du site, six chantiers de fond assurent sa rapidité, sa fiabilité et votre autonomie.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {WHY_SITE_STANDS_OUT.map((pillar) => (
                        <div
                            key={pillar.id}
                            className="p-5 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-3 hover:border-[#FFE500]/30 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <h3 className="text-sm font-bold text-white leading-snug">{pillar.title}</h3>
                                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#FFE500]/10 text-[#FFE500] font-bold shrink-0">
                                    {pillar.badge}
                                </span>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">{pillar.summary}</p>
                            <ul className="space-y-1.5 pt-2 border-t border-white/5">
                                {pillar.details.map((detail) => (
                                    <li key={detail} className="flex items-start gap-2 text-xs text-gray-400">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                        <span className="leading-relaxed">{detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Schémas d'Architecture, Mode Studio & Cascade de Résilience */}
            <AppArchitectureDiagram />

            {/* 4. Graphiques de Performance (Octobre 2026) & Vérité du Catalogue */}
            <AppPerformanceCharts />

            {/* 5. Cartographie Interactive (17 Routes Vitrine & 27 Écrans Cockpit) */}
            <AppInteractiveCartography />

            {/* 6. Pourquoi avoir remplacé WordPress ? Comparatif + Autopsie */}
            <section id="dossier-wordpress" className="space-y-4">
                <div className="border-b border-white/10 pb-2">
                    <h2 className="text-lg font-bold text-white">
                        Comparatif direct : Ancien WordPress vs Nouvelle Application CUC (Next.js 16)
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Ce qui change concrètement pour vos visiteurs, les productions et votre équipe administrative.
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
                                        <span className="font-bold block text-emerald-400">Nouvelle Application CUC (Next.js 16)</span>
                                        <span className="text-gray-300 leading-relaxed">{item.newNextApp}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Autopsie des 6 failles & risques de l'ancien site */}
            <AppVulnerabilitiesSection />

            {/* 7. Filière média WebP & Protection des originaux */}
            <section id="dossier-medias" className="p-5 sm:p-6 rounded-2xl bg-[#0D0D12] border border-white/10 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <HardDrive className="w-4 h-4" /> 7. {MEDIA_PIPELINE_INFO.title}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">{MEDIA_PIPELINE_INFO.subtitle}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Les photos de cascades et affiches de films conservent leur netteté tout en réduisant le poids du bucket de 90,54 Mo à 26,32 Mo (−71 %).
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
