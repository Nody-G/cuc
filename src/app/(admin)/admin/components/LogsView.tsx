'use client';

/**
 * Hub « Journal & Activité » — orchestrateur de la vue.
 *
 * Couche « UI / Présentation » (`AGENTS.md` § 1) : ce composant **assemble**,
 * il ne calcule rien. Les données viennent des hooks du dossier `log-hub/`, la
 * mise en texte du modèle pur, et le flux « Métier » est rendu par la vue
 * d'audit existante (`AuditLogView`) — la réutiliser plutôt que la réécrire
 * évite deux comportements à maintenir pour la même information.
 *
 * Répartition assumée des indicateurs : la synthèse technique n'est affichée que
 * sur l'onglet « Système ». L'onglet « Métier » a déjà ses propres chiffres ;
 * superposer deux sources de comptage sur un même écran est précisément la
 * mécanique qui fait diverger un tableau de bord.
 */

import React, { useState } from 'react';
import { Activity, Download, FileJson, ScrollText } from 'lucide-react';
import type { ActivityLogEntry } from '@/lib/logging/types';
import { CockpitButton, CockpitViewHeader, useProgressiveList } from './ui';
import { AuditLogView } from './AuditLogView';
import { LogDetailDrawer } from './log-hub/LogDetailDrawer';
import { LogHubFiltersBar } from './log-hub/LogHubFiltersBar';
import { LogHubList } from './log-hub/LogHubList';
import { LogHubRetentionPanel } from './log-hub/LogHubRetentionPanel';
import { LogHubSourceTabs } from './log-hub/LogHubSourceTabs';
import { LogHubStatsCards } from './log-hub/LogHubStatsCards';
import { summarizeLogs, worstLevel } from './log-hub/log-hub-model';
import type { LogHubTab } from './log-hub/log-hub.types';
import { useLogHubData } from './log-hub/useLogHubData';
import { useLogHubExport } from './log-hub/useLogHubExport';
import { useLogHubFilters } from './log-hub/useLogHubFilters';
import { useLogHubOverview } from './log-hub/useLogHubOverview';
import { useLogHubRetention } from './log-hub/useLogHubRetention';

interface LogsViewProps {
    showToast: (msg: string) => void;
}

export const LogsView: React.FC<LogsViewProps> = ({ showToast }) => {
    const [activeTab, setActiveTab] = useState<LogHubTab>('systeme');
    const [selectedEntry, setSelectedEntry] = useState<ActivityLogEntry | null>(null);

    const filters = useLogHubFilters();
    const data = useLogHubData(filters.filters);
    const overview = useLogHubOverview();
    const retention = useLogHubRetention();
    const exporter = useLogHubExport({ entries: data.entries, showToast });

    /**
     * Deux étages de liste : le serveur pagine (40 par page) et le DOM reste borné
     * par `useProgressiveList`. Un seul bouton les enchaîne — d'abord étendre la
     * fenêtre visible, puis demander la page suivante.
     */
    const progressive = useProgressiveList(data.entries, {
        step: 40,
        initial: 40,
        resetKey: `${activeTab}|${filters.resetKey}`,
    });

    const handleLoadMore = () => {
        if (progressive.hasMore) {
            progressive.loadMore();
            return;
        }
        if (data.hasMore) void data.loadMore();
    };

    const loadedSummary = summarizeLogs(data.entries);
    const alertCount = (overview.stats?.byLevel.error ?? 0) + (overview.stats?.byLevel.critical ?? 0);
    const worst = worstLevel(data.entries);

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <CockpitViewHeader
                icon={ScrollText}
                eyebrow="Traçabilité & Exploitation"
                title="Journal & Activité"
                description="Tout ce qui se passe, rangé par nature : modifications métier du Cockpit d’un côté, erreurs techniques classées, dégradations d’outils et synchronisations de l’autre."
                actions={
                    <div className="flex items-center gap-2">
                        <CockpitButton
                            variant="secondary"
                            size="sm"
                            icon={FileJson}
                            disabled={exporter.exporting || data.entries.length === 0}
                            onClick={exporter.handleExportJson}
                        >
                            Exporter JSON
                        </CockpitButton>
                        <CockpitButton
                            variant="primary"
                            size="sm"
                            icon={Download}
                            disabled={exporter.exporting || data.entries.length === 0}
                            onClick={exporter.handleExportCsv}
                        >
                            Exporter CSV
                        </CockpitButton>
                    </div>
                }
            />

            <LogHubSourceTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                alertCount={alertCount}
            />

            {activeTab === 'metier' && <AuditLogView showToast={showToast} />}

            {activeTab === 'systeme' && (
                <div className="space-y-4">
                    <LogHubStatsCards stats={overview.stats} loading={overview.loading} />

                    {overview.refused && (
                        <p className="text-xs text-amber-300">
                            Synthèse indisponible : la lecture du journal technique est réservée à la Direction.
                        </p>
                    )}

                    <LogHubFiltersBar
                        filters={filters.filters}
                        onToggleLevel={filters.toggleLevelFilter}
                        onToggleSource={filters.toggleSourceFilter}
                        onRangeChange={filters.setRangeFilter}
                        onSearchChange={filters.setSearchQuery}
                        onReset={filters.resetFilters}
                        onRefresh={() => {
                            void data.refresh();
                            void overview.reload();
                        }}
                        refreshing={data.refreshing}
                        total={data.total}
                    />

                    {worst === 'critical' && (
                        <p className="text-xs text-red-300 inline-flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5" aria-hidden="true" />
                            Au moins un incident critique figure dans les événements chargés.
                        </p>
                    )}

                    {loadedSummary.total > 0 && data.entries.length < data.total && (
                        <p className="text-[11px] text-gray-500">
                            {data.entries.length} événement(s) chargé(s) sur {data.total} — les compteurs
                            ci-dessus portent sur la totalité, jamais sur un échantillon.
                        </p>
                    )}

                    <LogHubList
                        entries={data.entries}
                        visibleEntries={progressive.visibleItems}
                        total={Math.max(data.total, data.entries.length)}
                        visibleCount={progressive.visibleCount}
                        loading={data.loading}
                        loadingMore={data.loadingMore}
                        refused={data.refused}
                        error={data.error}
                        hasActiveFilters={filters.hasActiveFilters}
                        now={data.now}
                        onLoadMore={handleLoadMore}
                        onOpenEntry={setSelectedEntry}
                    />
                </div>
            )}

            {activeTab === 'retention' && <LogHubRetentionPanel {...retention} />}

            <LogDetailDrawer entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        </div>
    );
};
