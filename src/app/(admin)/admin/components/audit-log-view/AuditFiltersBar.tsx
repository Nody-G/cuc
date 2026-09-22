import React from 'react';
import { Filter, Search } from 'lucide-react';
import { CockpitCard } from '../ui';
import { RANGE_LABELS, type RangeFilter } from './audit-format';

export interface AuditFiltersBarProps {
    searchQuery: string;
    onSearchQueryChange: (value: string) => void;
    actionFilter: string;
    onActionFilterChange: (value: string) => void;
    actionOptions: string[];
    entityFilter: string;
    onEntityFilterChange: (value: string) => void;
    entityOptions: string[];
    rangeFilter: RangeFilter;
    onRangeFilterChange: (value: RangeFilter) => void;
    filteredCount: number;
    hasActiveFilters: boolean;
    onResetFilters: () => void;
}

export const AuditFiltersBar: React.FC<AuditFiltersBarProps> = ({
    searchQuery,
    onSearchQueryChange,
    actionFilter,
    onActionFilterChange,
    actionOptions,
    entityFilter,
    onEntityFilterChange,
    entityOptions,
    rangeFilter,
    onRangeFilterChange,
    filteredCount,
    hasActiveFilters,
    onResetFilters,
}) => (
    <CockpitCard className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" /> Filtres
            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={onResetFilters}
                    className="ml-auto text-[10px] font-mono text-[#FFE500] hover:underline cursor-pointer"
                >
                    Réinitialiser
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    placeholder="Rechercher une action, un auteur, un détail…"
                    className="w-full bg-black/60 border border-white/20 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FFE500]"
                />
            </div>

            <select
                value={actionFilter}
                onChange={(e) => onActionFilterChange(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
            >
                <option value="all">Toutes les actions</option>
                {actionOptions.map((a) => (
                    <option key={a} value={a}>
                        {a}
                    </option>
                ))}
            </select>

            <select
                value={entityFilter}
                onChange={(e) => onEntityFilterChange(e.target.value)}
                className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
            >
                <option value="all">Toutes les entités</option>
                {entityOptions.map((e) => (
                    <option key={e} value={e}>
                        {e}
                    </option>
                ))}
            </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(RANGE_LABELS) as RangeFilter[]).map((range) => (
                <button
                    key={range}
                    type="button"
                    onClick={() => onRangeFilterChange(range)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider border transition-colors cursor-pointer ${rangeFilter === range
                        ? 'bg-[#FFE500] text-black border-[#FFE500]'
                        : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                        }`}
                >
                    {RANGE_LABELS[range]}
                </button>
            ))}
            <span className="ml-auto text-[11px] font-mono text-zinc-500">
                {filteredCount} entrée(s) affichée(s)
            </span>
        </div>
    </CockpitCard>
);
