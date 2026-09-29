'use client';

/**
 * Barre de filtres du hub Journal.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : chaque contrôle remonte une
 * intention (`onToggleLevel`, `onToggleSource`, `onRangeChange`,
 * `onSearchChange`) ; aucun état n'est tenu ici.
 *
 * Les libellés de gravité et de domaine viennent des référentiels partagés
 * (`@/lib/logging/types`) : un domaine ajouté au journal apparaît donc dans les
 * filtres sans retouche de ce fichier.
 */

import React from 'react';
import { RefreshCw, Search, X } from 'lucide-react';
import { LOG_LEVELS, LOG_SOURCES, type LogLevel, type LogSource } from '@/lib/logging/types';
import { RANGE_LABELS, RANGE_OPTIONS, type RangeFilter } from '@/lib/time-range';
import { COCKPIT_INPUT_CLASS, CockpitButton, CockpitCard, cx } from '../ui';
import { levelLabel, sourceLabel } from './log-hub-format';
import type { LogHubFilterState } from './log-hub.types';

interface LogHubFiltersBarProps {
    filters: LogHubFilterState;
    onToggleLevel: (level: LogLevel) => void;
    onToggleSource: (source: LogSource) => void;
    onRangeChange: (range: RangeFilter) => void;
    onSearchChange: (value: string) => void;
    onReset: () => void;
    onRefresh: () => void;
    refreshing: boolean;
    /** Nombre d'entrées correspondant aux filtres, tel que compté en base. */
    total: number;
}

export const LogHubFiltersBar: React.FC<LogHubFiltersBarProps> = ({
    filters,
    onToggleLevel,
    onToggleSource,
    onRangeChange,
    onSearchChange,
    onReset,
    onRefresh,
    refreshing,
    total,
}) => {
    const hasFilters =
        filters.levels.length > 0 ||
        filters.sources.length > 0 ||
        filters.range !== 'all' ||
        filters.search.trim().length > 0;

    return (
        <CockpitCard padding="sm">
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    <div className="relative flex-1">
                        <Search
                            className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
                            aria-hidden="true"
                        />
                        <input
                            type="search"
                            value={filters.search}
                            onChange={(event) => onSearchChange(event.target.value)}
                            placeholder="Rechercher un message, une catégorie, une cible…"
                            aria-label="Rechercher dans le journal"
                            className={cx(COCKPIT_INPUT_CLASS, 'pl-9')}
                        />
                    </div>

                    <label className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-gray-500">
                        Période
                        <select
                            value={filters.range}
                            onChange={(event) => onRangeChange(event.target.value as RangeFilter)}
                            className={cx(COCKPIT_INPUT_CLASS, 'w-auto py-1.5')}
                        >
                            {RANGE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {RANGE_LABELS[option]}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-gray-500">
                            {total} événement(s)
                        </span>
                        <CockpitButton
                            variant="secondary"
                            size="sm"
                            icon={RefreshCw}
                            loading={refreshing}
                            onClick={onRefresh}
                        >
                            Actualiser
                        </CockpitButton>
                        {hasFilters && (
                            <CockpitButton variant="ghost" size="sm" icon={X} onClick={onReset}>
                                Effacer
                            </CockpitButton>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <fieldset className="flex flex-wrap items-center gap-2">
                        <legend className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mr-1">
                            Gravité
                        </legend>
                        {LOG_LEVELS.map((level) => {
                            const active = filters.levels.includes(level);
                            return (
                                <button
                                    key={level}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => onToggleLevel(level)}
                                    className={cx(
                                        'px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide transition-colors cursor-pointer',
                                        active
                                            ? 'bg-white/15 border-white/30 text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white',
                                    )}
                                >
                                    {levelLabel(level)}
                                </button>
                            );
                        })}
                    </fieldset>

                    <fieldset className="flex flex-wrap items-center gap-2">
                        <legend className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mr-1">
                            Domaine
                        </legend>
                        {LOG_SOURCES.map((source) => {
                            const active = filters.sources.includes(source);
                            return (
                                <button
                                    key={source}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => onToggleSource(source)}
                                    className={cx(
                                        'px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide transition-colors cursor-pointer',
                                        active
                                            ? 'bg-[#FFE500]/15 border-[#FFE500]/40 text-[#FFE500]'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white',
                                    )}
                                >
                                    {sourceLabel(source)}
                                </button>
                            );
                        })}
                    </fieldset>
                </div>
            </div>
        </CockpitCard>
    );
};
