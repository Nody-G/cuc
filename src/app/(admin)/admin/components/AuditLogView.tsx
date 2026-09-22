'use client';

import React from 'react';
import { Activity, Download, RefreshCw } from 'lucide-react';
import { CockpitViewHeader, CockpitButton, useProgressiveList } from './ui';
import { useAuditLogData } from './audit-log-view/useAuditLogData';
import { useAuditLogFilters } from './audit-log-view/useAuditLogFilters';
import { useAuditLogExport } from './audit-log-view/useAuditLogExport';
import { AuditStatsCards } from './audit-log-view/AuditStatsCards';
import { AuditFiltersBar } from './audit-log-view/AuditFiltersBar';
import { AuditLogList } from './audit-log-view/AuditLogList';

interface AuditLogViewProps {
    showToast: (msg: string) => void;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ showToast }) => {
    const data = useAuditLogData();
    const filters = useAuditLogFilters({ logs: data.logs, now: data.now });
    const { handleExportCsv } = useAuditLogExport({
        filteredLogs: filters.filteredLogs,
        showToast,
    });

    const {
        visibleItems: visibleLogs,
        visibleCount,
        total,
        loadMore,
    } = useProgressiveList(filters.filteredLogs, {
        step: 40,
        initial: 40,
        resetKey: `${filters.actionFilter}|${filters.entityFilter}|${filters.rangeFilter}|${filters.searchQuery}`,
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <CockpitViewHeader
                icon={Activity}
                eyebrow="Traçabilité des Actions"
                title="Journal d’Audit"
                description="Historique horodaté des modifications effectuées dans le Cockpit : création, édition, publication, suppression et restauration."
                actions={
                    <div className="flex items-center gap-2">
                        <CockpitButton
                            variant="secondary"
                            size="sm"
                            icon={RefreshCw}
                            loading={data.refreshing}
                            onClick={() => data.load(true)}
                        >
                            Actualiser
                        </CockpitButton>
                        <CockpitButton
                            variant="primary"
                            size="sm"
                            icon={Download}
                            onClick={handleExportCsv}
                        >
                            Exporter CSV
                        </CockpitButton>
                    </div>
                }
            />

            {/* Indicateurs synthétiques */}
            <AuditStatsCards stats={data.stats} />

            {/* Barre de filtres */}
            <AuditFiltersBar
                searchQuery={filters.searchQuery}
                onSearchQueryChange={filters.setSearchQuery}
                actionFilter={filters.actionFilter}
                onActionFilterChange={filters.setActionFilter}
                actionOptions={filters.actionOptions}
                entityFilter={filters.entityFilter}
                onEntityFilterChange={filters.setEntityFilter}
                entityOptions={filters.entityOptions}
                rangeFilter={filters.rangeFilter}
                onRangeFilterChange={filters.setRangeFilter}
                filteredCount={filters.filteredLogs.length}
                hasActiveFilters={filters.hasActiveFilters}
                onResetFilters={filters.resetFilters}
            />

            {/* Liste chronologique */}
            <AuditLogList
                loading={data.loading}
                filteredLogs={filters.filteredLogs}
                visibleLogs={visibleLogs}
                hasActiveFilters={filters.hasActiveFilters}
                visibleCount={visibleCount}
                total={total}
                onLoadMore={loadMore}
            />
        </div>
    );
};
