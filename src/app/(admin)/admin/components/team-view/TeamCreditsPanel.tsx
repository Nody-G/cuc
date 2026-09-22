'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import type { FilmCredit, Instructor } from '@/types';
import { TeamCreditAdder } from './TeamCreditAdder';
import { TeamFeaturedCatalogue } from './TeamFeaturedCatalogue';
import { TeamCreditsList } from './TeamCreditsList';
import type {
    NewFilmDraft,
    TeamCreditIndexEntry,
    TeamCreditRow,
    TeamFeaturedEntry,
} from './team-credits';

export interface TeamCreditsPanelProps {
    /* Fiche en cours d'édition (limite d'affichage public). */
    member: Instructor;
    onMemberChange: (next: Instructor) => void;

    /* Compteurs d'en-tête. */
    selectedCount: number;
    featuredCount: number;

    /* Bloc 1 — ajouter un crédit. */
    search: string;
    onSearchChange: (value: string) => void;
    searchResults: FilmCredit[];
    creditIndex: ReadonlyMap<string, TeamCreditIndexEntry | undefined>;
    onToggleFilm: (film: FilmCredit) => void;
    onSetRole: (filmTitle: string, role: string) => void;
    newFilmDraft: NewFilmDraft | null;
    onNewFilmDraftChange: (draft: NewFilmDraft | null) => void;
    onCreateFilmAndCredit: () => void;

    /* Bloc 2 — catalogue mis en avant. */
    catalogueItems: Array<{ entry: { key: string }; film: FilmCredit }>;
    onMoveFeatured: (key: string, direction: -1 | 1) => void;
    onToggleFeatured: (filmTitle: string) => void;

    /* Bloc 3 — tous les crédits. */
    rows: TeamCreditRow[];
    sortedRows: TeamCreditRow[];
    sortMode: 'date' | 'name';
    onSortModeChange: (mode: 'date' | 'name') => void;
    featuredSet: ReadonlySet<string>;
    featuredOrder: TeamFeaturedEntry[];
    onRemoveCredit: (raw: string) => void;
}

/**
 * Modal d'édition d'un formateur — colonne droite « Filmographie & Rôles ».
 *
 * Compose les trois blocs (ajout, catalogue, tous les crédits) et la limite
 * d'affichage public. Aucun état propre : tout est piloté par le parent.
 */
export const TeamCreditsPanel: React.FC<TeamCreditsPanelProps> = (props) => (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono text-[#FFE500] uppercase tracking-wider font-bold">
                Filmographie & Rôles
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-purple-300">{props.selectedCount} crédit(s)</span>
                <span className="text-zinc-600">•</span>
                <span className="text-[#FFE500]">{props.featuredCount} en avant</span>
            </div>
        </div>

        {/* Limite d'affichage public */}
        <div className="flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded-xl">
            <label className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 shrink-0">
                <Eye className="w-3.5 h-3.5" />
                Crédits visibles avant « voir plus » :
            </label>
            <select
                value={props.member.creditsDisplayLimit ?? 8}
                onChange={(e) =>
                    props.onMemberChange({
                        ...props.member,
                        creditsDisplayLimit: parseInt(e.target.value, 10),
                    })
                }
                className="bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FFE500]"
            >
                {[4, 6, 8, 10, 12, 16, 24].map((n) => (
                    <option key={n} value={n}>
                        {n}
                    </option>
                ))}
            </select>
        </div>

        <TeamCreditAdder
            search={props.search}
            onSearchChange={props.onSearchChange}
            searchResults={props.searchResults}
            creditIndex={props.creditIndex}
            onToggleFilm={props.onToggleFilm}
            onSetRole={props.onSetRole}
            newFilmDraft={props.newFilmDraft}
            onNewFilmDraftChange={props.onNewFilmDraftChange}
            onCreateFilmAndCredit={props.onCreateFilmAndCredit}
            selectedCount={props.selectedCount}
        />

        <TeamFeaturedCatalogue
            items={props.catalogueItems}
            creditIndex={props.creditIndex}
            onMoveFeatured={props.onMoveFeatured}
            onToggleFeatured={props.onToggleFeatured}
        />

        <TeamCreditsList
            rows={props.rows}
            sortedRows={props.sortedRows}
            sortMode={props.sortMode}
            onSortModeChange={props.onSortModeChange}
            featuredSet={props.featuredSet}
            featuredOrder={props.featuredOrder}
            onSetRole={props.onSetRole}
            onToggleFeatured={props.onToggleFeatured}
            onRemove={props.onRemoveCredit}
        />
    </div>
);
