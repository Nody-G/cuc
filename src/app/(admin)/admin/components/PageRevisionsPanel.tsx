'use client';

import React from 'react';
import { History, ChevronDown, ChevronRight } from 'lucide-react';
import type { SitePageContent } from '@/lib/data/site-service';
import { CockpitCard, CockpitEmptyState, CockpitSkeletonList } from './ui';
import { usePageRevisions } from './page-revisions-panel/usePageRevisions';
import { RevisionListItem } from './page-revisions-panel/RevisionListItem';
import { RevisionDiffView } from './page-revisions-panel/RevisionDiffView';

export interface PageRevisionsPanelProps {
    /** Slug de la page dont on affiche l'historique. */
    slug: string;
    /** Contenu courant de la page (pour le diff avec la version sélectionnée). */
    currentContent?: SitePageContent | null;
    /** Callback appelé après une restauration réussie. */
    onRestored?: (content: SitePageContent) => void;
    /** Notifications Cockpit. */
    showToast: (msg: string) => void;
    /** Panneau replié par défaut ? */
    defaultCollapsed?: boolean;
}

/**
 * Historique des versions d'une page — façade de composition.
 *
 * L'orchestration (chargement par slug, restauration, suppression) vit dans
 * `usePageRevisions` ; les blocs visuels dans `page-revisions-panel/**`.
 */
export const PageRevisionsPanel: React.FC<PageRevisionsPanelProps> = ({
    slug,
    currentContent,
    onRestored,
    showToast,
    defaultCollapsed = false,
}) => {
    const history = usePageRevisions({
        slug,
        currentContent,
        onRestored,
        showToast,
        defaultCollapsed,
    });

    return (
        <CockpitCard className="overflow-hidden">
            <button
                type="button"
                onClick={history.toggleCollapsed}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
            >
                <span className="flex items-center gap-2.5 min-w-0">
                    {history.collapsed ? (
                        <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                    <History className="w-4 h-4 text-[#FFE500] shrink-0" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-gray-300">
                        Historique des versions
                    </span>
                    {!history.loading && history.revisions.length > 0 && (
                        <span className="text-[10px] font-mono text-gray-500">
                            ({history.revisions.length})
                        </span>
                    )}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 shrink-0">
                    {history.collapsed ? 'Afficher' : 'Masquer'}
                </span>
            </button>

            {!history.collapsed && (
                <div className="border-t border-white/10">
                    {history.loading ? (
                        <div className="p-4">
                            <CockpitSkeletonList rows={3} />
                        </div>
                    ) : history.revisions.length === 0 ? (
                        <div className="p-4">
                            <CockpitEmptyState
                                icon={History}
                                title="Aucune version enregistrée"
                                description="Un instantané est créé automatiquement avant chaque modification de la page. Publiez une première modification pour amorcer l'historique."
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
                            {/* Liste des révisions */}
                            <ul className="max-h-[26rem] overflow-y-auto divide-y divide-white/5">
                                {history.revisions.map((rev) => {
                                    const isSelected = rev.id === history.selectedId;
                                    const isCompared = rev.id === history.compareId;
                                    return (
                                        <RevisionListItem
                                            key={rev.id}
                                            rev={rev}
                                            isSelected={isSelected}
                                            isCompared={isCompared}
                                            onToggleSelect={() =>
                                                history.setSelectedId(isSelected ? null : rev.id)
                                            }
                                            onToggleCompare={() => {
                                                history.setSelectedId(rev.id);
                                                history.setCompareId(isCompared ? null : rev.id);
                                            }}
                                            onRestore={() => history.handleRestore(rev)}
                                            onDelete={() => history.handleDelete(rev)}
                                        />
                                    );
                                })}
                            </ul>

                            {/* Détail / diff */}
                            <RevisionDiffView
                                selected={history.selected}
                                compared={history.compared}
                                diff={history.diff}
                                onClearCompare={() => history.setCompareId(null)}
                                onRestore={() => {
                                    if (history.selected) history.handleRestore(history.selected);
                                }}
                            />
                        </div>
                    )}
                </div>
            )}
        </CockpitCard>
    );
};
