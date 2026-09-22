'use client';

import React from 'react';
import { ArrowDown, ArrowUp, Star } from 'lucide-react';
import type { FilmCredit } from '@/types';
import type { TeamCreditIndexEntry } from './team-credits';

export interface TeamFeaturedCatalogueProps {
    /** Films mis en avant, dans l'ordre public. */
    items: Array<{ entry: { key: string }; film: FilmCredit }>;
    /** Index des crédits (clé normalisée → crédit) pour afficher le rôle. */
    creditIndex: ReadonlyMap<string, TeamCreditIndexEntry | undefined>;
    /** Réordonne une mise en avant (par titre normalisé). */
    onMoveFeatured: (key: string, direction: -1 | 1) => void;
    /** Bascule la mise en avant d'un crédit (appariement par titre). */
    onToggleFeatured: (filmTitle: string) => void;
}

/**
 * Modal d'édition d'un formateur — bloc « 2. Catalogue ».
 *
 * Liste ordonnée des films mis en avant sur la fiche publique, réordonnables
 * par flèches, retirables par l'étoile. Composant de présentation pur.
 */
export const TeamFeaturedCatalogue: React.FC<TeamFeaturedCatalogueProps> = ({
    items,
    creditIndex,
    onMoveFeatured,
    onToggleFeatured,
}) => (
    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3">
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FFE500] uppercase tracking-wider">
                <Star className="w-3.5 h-3.5" />
                Catalogue
            </div>
            <span className="text-[10px] font-mono text-[#FFE500] shrink-0">
                {items.length} mis en avant
            </span>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
            Films mis en avant sur la fiche publique, dans cet ordre. Réordonnez-les
            avec les flèches, retirez-en un avec l'étoile. Le rôle se choisit dans
            « Tous les crédits » ci-dessous.
        </p>

        {items.length > 0 ? (
            <ol className="max-h-[22rem] overflow-y-auto pr-1 divide-y divide-white/5 border border-[#FFE500]/25 rounded-lg overflow-hidden">
                {items.map(({ entry, film }, idx) => (
                    <li key={film.id} className="bg-[#FFE500]/5">
                        <div className="flex items-center gap-2 px-2.5 py-2">
                            <span className="font-mono text-[11px] font-bold text-[#FFE500] w-5 text-center shrink-0 tabular-nums">
                                {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <div className="truncate text-[11px] text-white font-semibold">
                                    {film.title}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    {film.year && (
                                        <span className="text-[9px] font-mono text-zinc-500">
                                            {film.year}
                                        </span>
                                    )}
                                    <span className="text-[9px] font-mono text-zinc-500">
                                        {creditIndex.get(entry.key)?.role || 'Rôle à préciser'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onMoveFeatured(entry.key, -1)}
                                    disabled={idx === 0}
                                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent"
                                    title="Monter dans la liste"
                                >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onMoveFeatured(entry.key, 1)}
                                    disabled={idx === items.length - 1}
                                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent"
                                    title="Descendre dans la liste"
                                >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onToggleFeatured(film.title)}
                                    className="p-1 rounded text-[#FFE500] hover:text-red-400 hover:bg-white/10 transition"
                                    title="Retirer de la mise en avant"
                                >
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
        ) : (
            <p className="text-[11px] text-zinc-500 italic py-2">
                Aucun film mis en avant. Recherchez un film ci-dessus, ajoutez-le, puis
                cliquez sur son étoile.
            </p>
        )}
    </div>
);
