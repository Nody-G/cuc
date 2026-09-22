'use client';

import React from 'react';
import { Stethoscope, RefreshCw } from 'lucide-react';
import type { SitePageContent } from '@/lib/data/site-service';
import { CockpitViewHeader, CockpitButton, CockpitEmptyState, CockpitSkeletonList } from './ui';
import { useContentHealth } from './content-health-view/useContentHealth';
import { HealthScoreCard } from './content-health-view/HealthScoreCard';
import { HealthKindFilters } from './content-health-view/HealthKindFilters';
import { HealthIssueList } from './content-health-view/HealthIssueList';
import type { HealthTab } from './content-health-view/health-meta';

interface ContentHealthViewProps {
    pages: SitePageContent[];
    showToast: (msg: string) => void;
    onNavigateToTab?: (tab: HealthTab) => void;
}

/**
 * Diagnostic de santé du contenu — façade de composition.
 *
 * L'orchestration (collecte des 6 sources, analyse, filtres) vit dans
 * `useContentHealth` ; les blocs visuels dans `content-health-view/**`.
 */
export const ContentHealthView: React.FC<ContentHealthViewProps> = ({
    pages,
    showToast,
    onNavigateToTab,
}) => {
    const health = useContentHealth({ pages, showToast, onNavigateToTab });

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <CockpitViewHeader
                icon={Stethoscope}
                eyebrow="Intégrité du Contenu"
                title="Diagnostic de Santé"
                description="Détection automatique des liens internes cassés, images manquantes, contenus orphelins et métadonnées SEO incomplètes sur l’ensemble de la vitrine."
                actions={
                    <CockpitButton
                        variant="secondary"
                        size="sm"
                        icon={RefreshCw}
                        loading={health.refreshing}
                        onClick={health.handleRefresh}
                    >
                        Relancer le diagnostic
                    </CockpitButton>
                }
            />

            {health.loading ? (
                <CockpitSkeletonList rows={5} />
            ) : !health.report ? (
                <CockpitEmptyState
                    icon={Stethoscope}
                    title="Diagnostic indisponible"
                    description="Impossible de charger l’état du contenu pour le moment."
                />
            ) : (
                <>
                    {/* Score global */}
                    <HealthScoreCard
                        report={health.report}
                        pageCount={pages.length}
                        severityFilter={health.severityFilter}
                        onToggleSeverity={(sev) =>
                            health.setSeverityFilter(health.severityFilter === sev ? 'all' : sev)
                        }
                    />

                    {/* Répartition par catégorie */}
                    <HealthKindFilters
                        report={health.report}
                        kindFilter={health.kindFilter}
                        onToggleKind={(kind) =>
                            health.setKindFilter(health.kindFilter === kind ? 'all' : kind)
                        }
                    />

                    {/* Liste des anomalies */}
                    <HealthIssueList
                        groupedBySeverity={health.groupedBySeverity}
                        filteredCount={health.filteredIssues.length}
                        hasActiveFilters={health.kindFilter !== 'all' || health.severityFilter !== 'all'}
                        canFix={Boolean(onNavigateToTab)}
                        onFix={health.handleFix}
                    />
                </>
            )}
        </div>
    );
};
