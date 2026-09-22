'use client';

import { useMemo, useState } from 'react';
import type { Discipline } from '@/types';
import { useProgressiveList } from '../ui';
import type { DisciplineLevelFilter } from './discipline-form';

/**
 * État de vue de la liste des modules : niveau, recherche et rendu progressif
 * (fenêtre bornée, réinitialisée à chaque changement de filtre).
 */
export function useDisciplineFilters(disciplines: Discipline[]) {
    const [filterLevel, setFilterLevel] = useState<DisciplineLevelFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDisciplines = useMemo(
        () =>
            disciplines.filter((d) => {
                const matchesLevel = filterLevel === 'all' || d.level === filterLevel;
                const matchesQuery =
                    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    d.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    d.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesLevel && matchesQuery;
            }),
        [disciplines, filterLevel, searchQuery]
    );

    const {
        visibleItems: visibleDisciplines,
        visibleCount: visibleDisciplineCount,
        total: totalDisciplines,
        loadMore: loadMoreDisciplines,
    } = useProgressiveList(filteredDisciplines, {
        step: 24,
        initial: 24,
        resetKey: `${filterLevel}|${searchQuery}`,
    });

    return {
        filterLevel,
        setFilterLevel,
        searchQuery,
        setSearchQuery,
        visibleDisciplines,
        visibleDisciplineCount,
        totalDisciplines,
        loadMoreDisciplines,
    };
}
