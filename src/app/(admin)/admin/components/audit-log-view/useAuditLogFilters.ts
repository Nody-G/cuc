'use client';

import { useMemo, useState } from 'react';
import type { AuditLogEntry } from '@/lib/data/site-service';
import { RANGE_MS, type RangeFilter } from './audit-format';

export interface UseAuditLogFiltersArgs {
    logs: AuditLogEntry[];
    now: number;
}

export interface UseAuditLogFiltersResult {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    actionFilter: string;
    setActionFilter: (value: string) => void;
    entityFilter: string;
    setEntityFilter: (value: string) => void;
    rangeFilter: RangeFilter;
    setRangeFilter: (value: RangeFilter) => void;
    actionOptions: string[];
    entityOptions: string[];
    filteredLogs: AuditLogEntry[];
    hasActiveFilters: boolean;
    resetFilters: () => void;
}

export function useAuditLogFilters({
    logs,
    now,
}: UseAuditLogFiltersArgs): UseAuditLogFiltersResult {
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [entityFilter, setEntityFilter] = useState<string>('all');
    const [rangeFilter, setRangeFilter] = useState<RangeFilter>('all');

    const actionOptions = useMemo(() => {
        const set = new Set<string>();
        logs.forEach((l) => l.action && set.add(l.action));
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
    }, [logs]);

    const entityOptions = useMemo(() => {
        const set = new Set<string>();
        logs.forEach((l) => l.entity && set.add(l.entity));
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
    }, [logs]);

    const filteredLogs = useMemo(() => {
        const threshold =
            rangeFilter === 'all' ? null : now - RANGE_MS[rangeFilter];
        const q = searchQuery.trim().toLowerCase();

        return logs.filter((log) => {
            if (actionFilter !== 'all' && log.action !== actionFilter) return false;
            if (entityFilter !== 'all' && log.entity !== entityFilter) return false;

            if (threshold !== null) {
                const t = new Date(log.created_at).getTime();
                if (Number.isNaN(t) || t < threshold) return false;
            }

            if (q) {
                const haystack = [
                    log.action,
                    log.entity,
                    log.details || '',
                    log.user_name || '',
                ]
                    .join(' ')
                    .toLowerCase();
                if (!haystack.includes(q)) return false;
            }

            return true;
        });
    }, [logs, actionFilter, entityFilter, rangeFilter, searchQuery, now]);

    const hasActiveFilters =
        actionFilter !== 'all' ||
        entityFilter !== 'all' ||
        rangeFilter !== 'all' ||
        searchQuery.trim().length > 0;

    const resetFilters = () => {
        setActionFilter('all');
        setEntityFilter('all');
        setRangeFilter('all');
        setSearchQuery('');
    };

    return {
        searchQuery,
        setSearchQuery,
        actionFilter,
        setActionFilter,
        entityFilter,
        setEntityFilter,
        rangeFilter,
        setRangeFilter,
        actionOptions,
        entityOptions,
        filteredLogs,
        hasActiveFilters,
        resetFilters,
    };
}
