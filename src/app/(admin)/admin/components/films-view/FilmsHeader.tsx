'use client';

import React from 'react';
import { Film, Plus, Search } from 'lucide-react';

export interface FilmsHeaderProps {
    count: number;
    filteredCount: number;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onCreate: () => void;
}

/** En-tête du catalogue : intitulé, recherche et création de projet. */
export const FilmsHeader: React.FC<FilmsHeaderProps> = ({
    count,
    filteredCount,
    searchTerm,
    onSearchChange,
    onCreate,
}) => (
    <>
        <div className="border-b border-white/10 pb-6">
            <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                <Film className="w-3.5 h-3.5" /> Filmographie CUC
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                Projets Cinéma & Cascades
            </h1>
            <p className="text-sm text-gray-400 mt-1">
                Ajoutez vos dernières sorties cinéma et séries TV.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Rechercher un film, réalisateur, année..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#FFE500] w-64"
                    />
                </div>
                <div className="text-xs font-mono text-gray-400">
                    {filteredCount} / {count} PROJETS
                </div>
            </div>

            <button
                onClick={onCreate}
                className="px-4 py-2 rounded-lg bg-[#FFE500] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#ffe600e6] shrink-0"
            >
                <Plus className="w-4 h-4" />
                Ajouter un projet
            </button>
        </div>
    </>
);
