'use client';

import React from 'react';
import { LEVEL_FILTERS, type DisciplineLevelFilter } from './discipline-form';

export interface DisciplineFiltersBarProps {
    filterLevel: DisciplineLevelFilter;
    onFilterChange: (level: DisciplineLevelFilter) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
}

/** Barre de filtre (niveau) et de recherche de la liste des modules. */
export const DisciplineFiltersBar: React.FC<DisciplineFiltersBarProps> = ({
    filterLevel,
    onFilterChange,
    searchQuery,
    onSearchChange,
}) => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800/80">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {LEVEL_FILTERS.map((lvl) => (
                <button
                    key={lvl}
                    onClick={() => onFilterChange(lvl)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${filterLevel === lvl
                        ? 'bg-cuc-gold text-black shadow-md shadow-cuc-gold/20'
                        : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700'
                        }`}
                >
                    {lvl === 'all' ? 'Tous les niveaux' : lvl}
                </button>
            ))}
        </div>

        <input
            type="text"
            placeholder="Rechercher un module, code MOD..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cuc-gold"
        />
    </div>
);
