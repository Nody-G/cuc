'use client';

import React from 'react';
import { FILM_CATEGORIES } from '@/lib/film-category';

export interface FilmCategoryChipsProps {
    categoryFilter: string;
    onCategoryChange: (category: string) => void;
}

/** Filtres de catégorie (« Tous les films » + catégories canoniques). */
export const FilmCategoryChips: React.FC<FilmCategoryChipsProps> = ({
    categoryFilter,
    onCategoryChange,
}) => (
    <div className="flex flex-wrap gap-1.5 pb-2">
        {(['all', ...FILM_CATEGORIES] as const).map((cat) => (
            <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${categoryFilter === cat
                    ? 'bg-[#FFE500] text-black font-bold'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
            >
                {cat === 'all' ? 'Tous les films' : cat}
            </button>
        ))}
    </div>
);
