'use client';

import { useMemo, useState } from 'react';
import type { FilmCredit } from '@/types';
import { useProgressiveList } from '../ui';

/**
 * État de vue du catalogue : recherche (titre, réalisateur, année), filtre de
 * catégorie et rendu progressif — la fenêtre se réinitialise à chaque
 * changement de recherche ou de catégorie.
 */
export function useFilmFilters(films: FilmCredit[]) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const filteredFilms = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return films.filter((f) => {
            const matchSearch =
                !searchTerm ||
                f.title.toLowerCase().includes(term) ||
                (f.director && f.director.toLowerCase().includes(term)) ||
                (f.year && f.year.includes(searchTerm));
            const matchCat = categoryFilter === 'all' || f.category === categoryFilter;
            return matchSearch && matchCat;
        });
    }, [films, searchTerm, categoryFilter]);

    const {
        visibleItems: visibleFilms,
        visibleCount: visibleFilmCount,
        total: totalFilms,
        loadMore: loadMoreFilms,
    } = useProgressiveList(filteredFilms, {
        step: 24,
        initial: 24,
        resetKey: `${categoryFilter}|${searchTerm}`,
    });

    return {
        searchTerm,
        setSearchTerm,
        categoryFilter,
        setCategoryFilter,
        filteredFilms,
        visibleFilms,
        visibleFilmCount,
        totalFilms,
        loadMoreFilms,
    };
}
