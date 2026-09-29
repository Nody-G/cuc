'use client';

/**
 * Filtres du hub Journal — état local et bascules.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1). Toute la décision est
 * déléguée au modèle pur (`log-hub-model.ts`) : ce hook ne fait que conserver un
 * état et exposer des actions nommées, ce qui évite les calculs dans le rendu.
 */

import { useCallback, useMemo, useState } from 'react';
import type { LogLevel, LogSource } from '@/lib/logging/types';
import type { RangeFilter } from '@/lib/time-range';
import { isFilterStateEmpty, toggleLevel, toggleSource } from './log-hub-model';
import { EMPTY_LOG_FILTERS, type LogHubFilterState } from './log-hub.types';

export interface UseLogHubFiltersResult {
    filters: LogHubFilterState;
    toggleLevelFilter: (level: LogLevel) => void;
    toggleSourceFilter: (source: LogSource) => void;
    setRangeFilter: (range: RangeFilter) => void;
    setSearchQuery: (value: string) => void;
    resetFilters: () => void;
    hasActiveFilters: boolean;
    /** Clé de réinitialisation du rendu progressif (change à chaque filtre). */
    resetKey: string;
}

export function useLogHubFilters(): UseLogHubFiltersResult {
    const [filters, setFilters] = useState<LogHubFilterState>(EMPTY_LOG_FILTERS);

    const toggleLevelFilter = useCallback((level: LogLevel) => {
        setFilters((current) => ({ ...current, levels: toggleLevel(current.levels, level) }));
    }, []);

    const toggleSourceFilter = useCallback((source: LogSource) => {
        setFilters((current) => ({ ...current, sources: toggleSource(current.sources, source) }));
    }, []);

    const setRangeFilter = useCallback((range: RangeFilter) => {
        setFilters((current) => ({ ...current, range }));
    }, []);

    const setSearchQuery = useCallback((search: string) => {
        setFilters((current) => ({ ...current, search }));
    }, []);

    const resetFilters = useCallback(() => setFilters(EMPTY_LOG_FILTERS), []);

    const hasActiveFilters = useMemo(() => !isFilterStateEmpty(filters), [filters]);

    const resetKey = useMemo(
        () =>
            [
                filters.levels.join(','),
                filters.sources.join(','),
                filters.range,
                filters.search,
            ].join('|'),
        [filters],
    );

    return {
        filters,
        toggleLevelFilter,
        toggleSourceFilter,
        setRangeFilter,
        setSearchQuery,
        resetFilters,
        hasActiveFilters,
        resetKey,
    };
}
