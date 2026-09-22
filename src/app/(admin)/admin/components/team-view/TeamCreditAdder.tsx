'use client';

import React from 'react';
import { Check, Plus, PlusCircle, Search, X } from 'lucide-react';
import type { FilmCredit } from '@/types';
import { creditTitleKey } from '@/lib/credit-title';
import { FILM_CATEGORIES } from '@/lib/film-category';
import {
    ROLE_OPTIONS,
    type NewFilmDraft,
    type TeamCreditIndexEntry,
} from './team-credits';

export interface TeamCreditAdderProps {
    /** Texte de recherche dans le catalogue. */
    search: string;
    onSearchChange: (value: string) => void;
    /** Résultats de recherche (films du catalogue). */
    searchResults: FilmCredit[];
    /** Index des crédits du formateur (clé normalisée → crédit). */
    creditIndex: ReadonlyMap<string, TeamCreditIndexEntry | undefined>;
    /** Ajoute ou retire un film du catalogue comme crédit du formateur. */
    onToggleFilm: (film: FilmCredit) => void;
    /** Change le rôle d'un crédit existant (chaîne reconstruite côté parent). */
    onSetRole: (filmTitle: string, role: string) => void;
    /** Brouillon de création d'une fiche film (recherche sans résultat). */
    newFilmDraft: NewFilmDraft | null;
    onNewFilmDraftChange: (draft: NewFilmDraft | null) => void;
    /** Crée la fiche film et l'ajoute au formateur. */
    onCreateFilmAndCredit: () => void;
    /** Nombre de crédits du formateur (affiché dans l'en-tête). */
    selectedCount: number;
}

/**
 * Modal d'édition d'un formateur — bloc « 1. Ajouter un crédit ».
 *
 * Recherche dans le catalogue, ajout à la volée (« Créer la fiche ») et choix
 * du rôle sur la ligne sélectionnée. Aucun état local : tout remonte au parent.
 */
export const TeamCreditAdder: React.FC<TeamCreditAdderProps> = ({
    search,
    onSearchChange,
    searchResults,
    creditIndex,
    onToggleFilm,
    onSetRole,
    newFilmDraft,
    onNewFilmDraftChange,
    onCreateFilmAndCredit,
    selectedCount,
}) => (
    <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3">
        <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FFE500] uppercase tracking-wider">
                <Plus className="w-3.5 h-3.5" />
                Ajouter un crédit
            </div>
            <span className="text-[10px] font-mono text-purple-300 shrink-0">
                {selectedCount} crédit(s)
            </span>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
            Recherchez un film du catalogue pour l'ajouter à la filmographie de ce
            formateur, puis précisez son rôle.
        </p>

        <div className="relative">
            <Search className="w-3 h-3 text-zinc-500 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Ajouter un crédit — rechercher un film..."
                className="w-full bg-black/60 border border-white/15 rounded-lg pl-7 pr-7 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFE500]"
            />
            {search && (
                <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    title="Effacer la recherche"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>

        {search.trim() && (
            <div className="max-h-[18rem] overflow-y-auto pr-1 space-y-1.5">
                {searchResults.map((f) => {
                    const key = creditTitleKey(f.title);
                    const entry = creditIndex.get(key);
                    const isChecked = Boolean(entry);
                    return (
                        <div
                            key={f.id}
                            className={`rounded-lg border transition ${isChecked
                                ? 'bg-purple-500/10 border-purple-500/50'
                                : 'bg-black/60 border-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="flex items-center gap-2 px-2 py-1.5">
                                <button
                                    type="button"
                                    onClick={() => onToggleFilm(f)}
                                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                >
                                    <span
                                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 text-[9px] font-bold ${isChecked
                                            ? 'bg-purple-500 border-purple-400 text-white'
                                            : 'border-zinc-600 text-transparent'
                                            }`}
                                    >
                                        ✓
                                    </span>
                                    <span
                                        className={`truncate text-[11px] ${isChecked ? 'text-white font-semibold' : 'text-zinc-300'
                                            }`}
                                    >
                                        {f.title}
                                    </span>
                                    {f.year && (
                                        <span className="text-[9px] font-mono text-zinc-500 shrink-0">
                                            {f.year}
                                        </span>
                                    )}
                                </button>
                                {isChecked && (
                                    <span className="text-[9px] font-mono text-purple-300 shrink-0">
                                        Ajouté
                                    </span>
                                )}
                            </div>

                            {isChecked && (
                                <div className="flex items-center gap-1.5 px-2 pb-2 pl-7">
                                    {ROLE_OPTIONS.map((role) => {
                                        const active = entry?.role === role;
                                        return (
                                            <button
                                                type="button"
                                                key={role}
                                                onClick={() => onSetRole(f.title, active ? '' : role)}
                                                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition ${active
                                                    ? 'bg-[#FFE500]/20 border-[#FFE500] text-[#FFE500] font-bold'
                                                    : 'bg-black/60 border-white/10 text-zinc-400 hover:border-white/25'
                                                    }`}
                                            >
                                                {role}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {searchResults.length === 0 && (
                    <div className="py-2 space-y-2">
                        <p className="text-[11px] text-zinc-500 italic">
                            Aucun film du catalogue ne correspond à « {search} ».
                        </p>
                        {!newFilmDraft && (
                            <button
                                type="button"
                                onClick={() =>
                                    onNewFilmDraftChange({
                                        title: search.trim(),
                                        year: '',
                                        category: 'Film',
                                    })
                                }
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FFE500]/15 border border-[#FFE500]/40 text-[11px] font-semibold text-[#FFE500] hover:bg-[#FFE500]/25 transition"
                            >
                                <PlusCircle className="w-3.5 h-3.5" />
                                Créer la fiche « {search.trim()} »
                            </button>
                        )}
                    </div>
                )}

                {newFilmDraft && (
                    <div className="p-2.5 bg-[#FFE500]/5 border border-[#FFE500]/30 rounded-lg space-y-2">
                        <div className="text-[10px] font-mono text-[#FFE500] uppercase tracking-wider">
                            Nouvelle fiche film
                        </div>
                        <div className="grid grid-cols-[1fr_5rem] gap-2">
                            <input
                                type="text"
                                value={newFilmDraft.title}
                                onChange={(e) =>
                                    onNewFilmDraftChange({ ...newFilmDraft, title: e.target.value })
                                }
                                placeholder="Titre du film"
                                className="bg-black/60 border border-white/15 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFE500]"
                            />
                            <input
                                type="text"
                                value={newFilmDraft.year}
                                onChange={(e) =>
                                    onNewFilmDraftChange({ ...newFilmDraft, year: e.target.value })
                                }
                                placeholder="Année"
                                className="bg-black/60 border border-white/15 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFE500]"
                            />
                        </div>
                        <select
                            value={newFilmDraft.category}
                            onChange={(e) =>
                                onNewFilmDraftChange({
                                    ...newFilmDraft,
                                    category: e.target.value as FilmCredit['category'],
                                })
                            }
                            className="w-full bg-black/60 border border-white/15 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#FFE500]"
                        >
                            {FILM_CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onCreateFilmAndCredit}
                                disabled={!newFilmDraft.title.trim()}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FFE500] text-black text-[11px] font-bold uppercase tracking-wider hover:bg-[#ffe600e6] disabled:opacity-40"
                            >
                                <Check className="w-3.5 h-3.5" />
                                Créer et ajouter
                            </button>
                            <button
                                type="button"
                                onClick={() => onNewFilmDraftChange(null)}
                                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[11px] font-semibold"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
);
