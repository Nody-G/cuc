'use client';

import React from 'react';
import { Star, Trash2 } from 'lucide-react';
import {
    ROLE_OPTIONS,
    type TeamCreditRow,
    type TeamFeaturedEntry,
} from './team-credits';

export interface TeamCreditsListProps {
    /** Tous les crédits (compteurs d'en-tête : catalogue / hors catalogue). */
    rows: TeamCreditRow[];
    /** Crédits triés affichés (source unique, catalogue et hors catalogue). */
    sortedRows: TeamCreditRow[];
    sortMode: 'date' | 'name';
    onSortModeChange: (mode: 'date' | 'name') => void;
    /** Clés normalisées des titres mis en avant. */
    featuredSet: ReadonlySet<string>;
    /** Mises en avant ordonnées (l'index fait le rang). */
    featuredOrder: TeamFeaturedEntry[];
    onSetRole: (title: string, role: string) => void;
    onToggleFeatured: (title: string) => void;
    onRemove: (raw: string) => void;
}

/**
 * Modal d'édition d'un formateur — bloc « 3. Tous les crédits ».
 *
 * Liste unique (catalogue et hors catalogue) : étoile de mise en avant, choix
 * du rôle sur la ligne, suppression. Composant de présentation pur.
 */
export const TeamCreditsList: React.FC<TeamCreditsListProps> = ({
    rows,
    sortedRows,
    sortMode,
    onSortModeChange,
    featuredSet,
    featuredOrder,
    onSetRole,
    onToggleFeatured,
    onRemove,
}) => (
    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2">
        <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                Tous les crédits ({rows.length})
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-zinc-500">
                    {rows.filter((c) => c.inCatalogue).length} cat. •{' '}
                    {rows.filter((c) => !c.inCatalogue).length} hors cat.
                </span>
                {/* Tri : par date (année décroissante) ou par nom */}
                <div className="flex items-center rounded-md border border-white/10 overflow-hidden">
                    {(['date', 'name'] as const).map((mode) => (
                        <button
                            type="button"
                            key={mode}
                            onClick={() => onSortModeChange(mode)}
                            className={`px-2 py-0.5 text-[10px] font-mono transition ${sortMode === mode
                                ? 'bg-white/15 text-white font-bold'
                                : 'bg-black/40 text-zinc-500 hover:text-zinc-300'
                                }`}
                            title={mode === 'date' ? 'Trier par date' : 'Trier par nom'}
                        >
                            {mode === 'date' ? 'DATE' : 'NOM'}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
            Cliquez sur l'étoile pour mettre un crédit en avant. Le rôle se choisit
            directement sur chaque ligne.
        </p>

        {sortedRows.length > 0 ? (
            <div className="space-y-1 max-h-[26rem] overflow-y-auto pr-1">
                {sortedRows.map(({ raw, title, role, key, year, inCatalogue }) => {
                    const isFeatured = featuredSet.has(key);
                    const featuredRank = featuredOrder.findIndex((e) => e.key === key);
                    return (
                        <div
                            key={raw}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${isFeatured
                                ? 'bg-[#FFE500]/10 border-[#FFE500]/40'
                                : 'bg-black/60 border-white/10'
                                }`}
                        >
                            <span
                                className={`px-1 py-0.5 rounded text-[8px] font-mono border shrink-0 ${inCatalogue
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                    : 'bg-white/5 text-zinc-500 border-white/10'
                                    }`}
                                title={
                                    inCatalogue
                                        ? 'Présent au catalogue'
                                        : 'Absent du catalogue — fiche à créer si besoin'
                                }
                            >
                                {inCatalogue ? 'CAT.' : 'H.C.'}
                            </span>
                            <span className="flex-1 min-w-0 truncate text-[11px] text-zinc-200">
                                {title}
                                {year && (
                                    <span className="ml-1.5 font-mono text-[9px] text-zinc-500">
                                        {year}
                                    </span>
                                )}
                            </span>

                            {/* Rôle : sélecteur compact sur la même ligne */}
                            <div className="flex items-center gap-0.5 shrink-0">
                                {ROLE_OPTIONS.map((option) => {
                                    const active = role === option;
                                    return (
                                        <button
                                            type="button"
                                            key={option}
                                            onClick={() => onSetRole(title, active ? '' : option)}
                                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition ${active
                                                ? 'bg-[#FFE500]/20 border-[#FFE500] text-[#FFE500] font-bold'
                                                : 'bg-black/60 border-white/10 text-zinc-500 hover:border-white/25'
                                                }`}
                                            title={option}
                                        >
                                            {option === 'Coordinateur des cascades'
                                                ? 'Coord.'
                                                : option === 'Doublure'
                                                    ? 'Doubl.'
                                                    : 'Casc.'}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                onClick={() => onToggleFeatured(title)}
                                className={`relative p-0.5 rounded transition shrink-0 ${isFeatured
                                    ? 'text-[#FFE500]'
                                    : 'text-zinc-600 hover:text-[#FFE500]'
                                    }`}
                                title={
                                    isFeatured
                                        ? `Mise en avant n°${featuredRank + 1} — cliquer pour retirer`
                                        : 'Mettre en avant sur la fiche publique'
                                }
                            >
                                <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-current' : ''}`} />
                                {isFeatured && (
                                    <span className="absolute -top-1 -right-1 min-w-[12px] h-3 px-0.5 rounded-full bg-[#FFE500] text-black font-mono text-[8px] font-bold leading-3 text-center">
                                        {featuredRank + 1}
                                    </span>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => onRemove(raw)}
                                className="p-0.5 text-zinc-500 hover:text-red-400 shrink-0"
                                title="Supprimer ce crédit"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    );
                })}
            </div>
        ) : (
            <p className="text-[11px] text-zinc-500 italic py-2">
                Aucun crédit. Recherchez un film ci-dessus pour en ajouter un.
            </p>
        )}
    </div>
);
