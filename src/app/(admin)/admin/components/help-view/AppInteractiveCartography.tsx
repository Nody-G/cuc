'use client';

/**
 * Cartographie interactive et filtrable des 17 routes du site vitrine (FR/EN)
 * et des 27 écrans du Cockpit pour le Dossier Application.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1).
 */

import React, { useState } from 'react';
import { Compass, Globe, LayoutDashboard, Search, Sparkles } from 'lucide-react';
import {
    COCKPIT_POLE_LABELS,
    COCKPIT_SCREENS_CATALOG,
    PUBLIC_ROUTES_CATALOG,
    type CockpitPoleId,
} from './help-application-catalog';

export const AppInteractiveCartography: React.FC = () => {
    const [surface, setSurface] = useState<'vitrine' | 'cockpit'>('vitrine');
    const [pole, setPole] = useState<CockpitPoleId>('all');
    const [filterText, setFilterText] = useState('');

    const normalizedQuery = filterText.trim().toLowerCase();

    const filteredPublicRoutes = PUBLIC_ROUTES_CATALOG.filter((item) => {
        if (!normalizedQuery) return true;
        const haystack = `${item.title} ${item.route} ${item.role} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
        return haystack.includes(normalizedQuery);
    });

    const filteredCockpitScreens = COCKPIT_SCREENS_CATALOG.filter((item) => {
        if (pole !== 'all' && item.pole !== pole) return false;
        if (!normalizedQuery) return true;
        const haystack = `${item.title} ${item.route} ${item.role} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
        return haystack.includes(normalizedQuery);
    });

    return (
        <section id="dossier-cartographie" className="space-y-5">
            {/* En-tête */}
            <div className="border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider">
                    <Compass className="w-4 h-4" /> Explorateur Interactif de la Plateforme
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                    Cartographie détaillée : Routes Publiques (FR/EN) & 27 Écrans du Cockpit
                </h2>
                <p className="text-xs text-gray-400 mt-0.5 max-w-3xl leading-relaxed">
                    Basculez entre la vitrine publique et l’administration, ou recherchez un écran précis (ex : Tournage, Events, 3D, Sauvegarde).
                </p>
            </div>

            {/* Encart pédagogique : Comportement intelligent du menu Events */}
            <div className="p-4 rounded-xl bg-[#FFE500]/[0.06] border border-[#FFE500]/30 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#FFE500] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                    <div className="font-bold text-white">
                        Navigation intelligente sur l’onglet « Events » & Pages conservées en réserve
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                        Lorsqu’un seul sous-choix est actif dans l’onglet Events (<span className="text-[#FFE500] font-semibold">CUC Events</span> → <code className="text-[#FFE500]">/cuc-events-agence</code>),
                        la barre de navigation masque automatiquement la flèche de liste déroulante et redirige directement au clic.
                        Les 3 pages spécialisées (<em>Spectacles Cascadeurs</em>, <em>Animations Airbag & Parkour</em>, <em>Team Building</em>) ne sont pas supprimées :
                        elles restent intactes en base et réactivables en 1 clic depuis l’écran <code className="text-[#FFE500]">/admin/navigation</code>.
                    </p>
                </div>
            </div>

            {/* Barre de contrôle : Sélecteur Vitrine / Cockpit + Recherche */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#0D0D12] border border-white/10">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setSurface('vitrine')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${surface === 'vitrine'
                            ? 'bg-[#FFE500] text-black'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                            }`}
                    >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Site Vitrine ({PUBLIC_ROUTES_CATALOG.length} routes)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSurface('cockpit')}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${surface === 'cockpit'
                            ? 'bg-[#FFE500] text-black'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                            }`}
                    >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Cockpit Admin ({COCKPIT_SCREENS_CATALOG.length} écrans)</span>
                    </button>
                </div>

                <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="search"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        placeholder="Filtrer une route ou fonctionnalité (ex: IMDb, 3D, WebP)…"
                        className="w-full bg-black/50 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFE500]/50"
                        aria-label="Filtrer la cartographie de l'application"
                    />
                </div>
            </div>

            {/* Filtres par pôle (affichés en mode Cockpit) */}
            {surface === 'cockpit' && (
                <div className="flex flex-wrap gap-2">
                    {COCKPIT_POLE_LABELS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setPole(item.id)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-mono font-bold transition-colors cursor-pointer border ${pole === item.id
                                ? 'bg-[#FFE500]/15 text-[#FFE500] border-[#FFE500]'
                                : 'bg-[#0D0D12] text-gray-400 border-white/10 hover:border-white/25'
                                }`}
                        >
                            {item.label} ({item.count})
                        </button>
                    ))}
                </div>
            )}

            {/* Grille des cartes */}
            {surface === 'vitrine' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredPublicRoutes.map((routeItem) => (
                        <div
                            key={routeItem.route}
                            className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-2.5 hover:border-[#FFE500]/30 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="text-sm font-bold text-white">{routeItem.title}</div>
                                    <div className="text-[11px] text-gray-400">{routeItem.role}</div>
                                </div>
                                <span
                                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${routeItem.status === 'En réserve (1 clic)'
                                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                        }`}
                                >
                                    {routeItem.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">{routeItem.description}</p>
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
                                <code className="text-[11px] font-mono text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded">
                                    {routeItem.route}
                                </code>
                                <div className="flex flex-wrap gap-1.5">
                                    {routeItem.tags.map((t) => (
                                        <span
                                            key={t}
                                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#FFE500]"
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {filteredCockpitScreens.map((screen) => (
                        <div
                            key={screen.route}
                            className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 space-y-2.5 hover:border-[#FFE500]/30 transition-colors"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <div className="text-sm font-bold text-white">{screen.title}</div>
                                    <div className="text-[11px] text-gray-400">{screen.role}</div>
                                </div>
                                <code className="text-[11px] font-mono text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded shrink-0">
                                    {screen.route}
                                </code>
                            </div>
                            <p className="text-xs text-gray-300 leading-relaxed">{screen.description}</p>
                            {screen.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
                                    {screen.tags.map((t) => (
                                        <span
                                            key={t}
                                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#FFE500]"
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};
