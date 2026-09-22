'use client';

import React from 'react';
import { Loader2, Save, Search } from 'lucide-react';
import { cx } from '../ui';
import type { EditorLocale } from './useMicrocopyEditor';

interface MicrocopyToolbarProps {
    entriesCount: number;
    groupsCount: number;
    groups: string[];
    group: string;
    onSetGroup: (group: string) => void;
    query: string;
    onSetQuery: (query: string) => void;
    locale: EditorLocale;
    onSetLocale: (locale: EditorLocale) => void;
    overrideCount: { fr: number; en: number };
    dirtyCount: number;
    isSaving: boolean;
    onSave: () => void;
}

/** Carte d'en-tête : description, compteurs, recherche, groupes, langue, publier. */
export const MicrocopyToolbar: React.FC<MicrocopyToolbarProps> = ({
    entriesCount,
    groupsCount,
    groups,
    group,
    onSetGroup,
    query,
    onSetQuery,
    locale,
    onSetLocale,
    overrideCount,
    dirtyCount,
    isSaving,
    onSave,
}) => (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                <h2 className="text-lg font-semibold text-white">Micro-textes du site</h2>
                <p className="mt-1 max-w-3xl text-xs text-zinc-400">
                    Tous les libellés d'interface (boutons, badges, intitulés, mentions) réunis
                    ici. Une valeur vide n'est jamais publiée : effacer un champ le ramène au
                    catalogue. La publication revalide les 15 pages, en français et en anglais.
                </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <span className="rounded border border-zinc-700 bg-zinc-950/60 px-2 py-1 font-mono text-zinc-300">
                    {entriesCount} clés
                </span>
                <span className="rounded border border-[#FFE500]/40 bg-[#FFE500]/10 px-2 py-1 font-mono text-[#FFE500]">
                    {overrideCount.fr} FR · {overrideCount.en} EN surchargés
                </span>
                {dirtyCount > 0 && (
                    <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1 font-mono text-amber-300">
                        {dirtyCount} modification(s)
                    </span>
                )}
            </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                    type="search"
                    value={query}
                    onChange={(event) => onSetQuery(event.target.value)}
                    placeholder="Rechercher une clé ou un texte…"
                    className="w-64 rounded border border-zinc-700 bg-zinc-950/60 py-1.5 pl-8 pr-3 text-xs text-white outline-hidden focus:border-[#FFE500]"
                />
            </div>

            <select
                value={group}
                onChange={(event) => onSetGroup(event.target.value)}
                className="rounded border border-zinc-700 bg-zinc-950/60 px-2 py-1.5 text-xs text-white outline-hidden focus:border-[#FFE500]"
            >
                <option value="all">Tous les groupes ({groupsCount})</option>
                {groups.map((item) => (
                    <option key={item} value={item}>
                        {item}
                    </option>
                ))}
            </select>

            <div className="ml-auto flex items-center gap-1 rounded border border-zinc-700 bg-zinc-950/60 p-0.5">
                {(['fr', 'en'] as EditorLocale[]).map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onSetLocale(item)}
                        className={cx(
                            'rounded px-2.5 py-1 text-xs font-semibold uppercase transition-colors',
                            locale === item
                                ? 'bg-[#FFE500] text-black'
                                : 'text-zinc-400 hover:text-white'
                        )}
                    >
                        {item}
                    </button>
                ))}
            </div>

            <button
                type="button"
                onClick={onSave}
                disabled={isSaving || dirtyCount === 0}
                className={cx(
                    'inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-semibold transition-colors',
                    dirtyCount === 0 || isSaving
                        ? 'cursor-not-allowed bg-zinc-800 text-zinc-500'
                        : 'bg-[#FFE500] text-black hover:bg-[#FFF04D]'
                )}
            >
                {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                    <Save className="h-3.5 w-3.5" />
                )}
                Publier
            </button>
        </div>
    </div>
);
