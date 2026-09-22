import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';
import type { AuditLogEntry } from '@/lib/data/site-service';
import { CockpitEmptyState, CockpitLoadMore, CockpitSkeletonList } from '../ui';
import { groupLogsByDay } from './audit-format';
import { AuditLogEntryCard } from './AuditLogEntryCard';

export interface AuditLogListProps {
    loading: boolean;
    filteredLogs: AuditLogEntry[];
    visibleLogs: AuditLogEntry[];
    hasActiveFilters: boolean;
    visibleCount: number;
    total: number;
    onLoadMore: () => void;
}

export const AuditLogList: React.FC<AuditLogListProps> = ({
    loading,
    filteredLogs,
    visibleLogs,
    hasActiveFilters,
    visibleCount,
    total,
    onLoadMore,
}) => {
    const groupedLogs = useMemo(() => groupLogsByDay(visibleLogs), [visibleLogs]);

    if (loading) {
        return <CockpitSkeletonList rows={6} />;
    }

    if (filteredLogs.length === 0) {
        return (
            <CockpitEmptyState
                icon={Activity}
                title="Aucune entrée d’audit"
                description={
                    hasActiveFilters
                        ? 'Aucune action ne correspond aux filtres sélectionnés. Élargissez la période ou réinitialisez les filtres.'
                        : 'Les actions réalisées dans le Cockpit apparaîtront ici automatiquement.'
                }
            />
        );
    }

    return (
        <div className="space-y-6">
            {groupedLogs.map((group) => (
                <div key={group.key} className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-[#FFE500] uppercase tracking-wider">
                            {group.label}
                        </span>
                        <span className="flex-1 h-px bg-white/10" />
                        <span className="text-[10px] font-mono text-zinc-500">
                            {group.entries.length}
                        </span>
                    </div>

                    <div className="space-y-2">
                        {group.entries.map((log) => (
                            <AuditLogEntryCard key={log.id} log={log} />
                        ))}
                    </div>
                </div>
            ))}

            <CockpitLoadMore
                visibleCount={visibleCount}
                total={total}
                onLoadMore={onLoadMore}
                label="Afficher plus d’entrées"
            />
        </div>
    );
};
