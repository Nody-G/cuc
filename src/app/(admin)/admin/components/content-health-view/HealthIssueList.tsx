'use client';

import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { ContentIssue, ContentIssueSeverity } from '@/lib/content-health';
import { CockpitCard, CockpitBadge, CockpitEmptyState } from '../ui';
import { KIND_META, SEVERITY_META } from './health-meta';

interface HealthIssueListProps {
    groupedBySeverity: { severity: ContentIssueSeverity; issues: ContentIssue[] }[];
    filteredCount: number;
    hasActiveFilters: boolean;
    canFix: boolean;
    onFix: (issue: ContentIssue) => void;
}

/** Anomalies groupées par sévérité, avec action « Corriger » par élément. */
export const HealthIssueList: React.FC<HealthIssueListProps> = ({
    groupedBySeverity,
    filteredCount,
    hasActiveFilters,
    canFix,
    onFix,
}) => {
    if (filteredCount === 0) {
        return (
            <CockpitEmptyState
                icon={CheckCircle2}
                title="Aucune anomalie"
                description={
                    hasActiveFilters
                        ? 'Aucun problème ne correspond aux filtres sélectionnés.'
                        : 'Tous les liens, images, contenus et métadonnées sont cohérents.'
                }
            />
        );
    }

    return (
        <div className="space-y-6">
            {groupedBySeverity.map((group) => {
                const meta = SEVERITY_META[group.severity];
                const GroupIcon = meta.icon;
                return (
                    <div key={group.severity} className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-300">
                                <GroupIcon className="w-3.5 h-3.5" />
                                {meta.label}
                            </span>
                            <span className="flex-1 h-px bg-white/10" />
                            <span className="text-[10px] font-mono text-zinc-500">
                                {group.issues.length}
                            </span>
                        </div>

                        <div className="space-y-2">
                            {group.issues.map((issue) => {
                                const kindMeta = KIND_META[issue.kind];
                                const KindIcon = kindMeta.icon;
                                return (
                                    <CockpitCard key={issue.id} className="p-3.5">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-white/5 text-zinc-300 shrink-0 mt-0.5">
                                                <KindIcon className="w-4 h-4" />
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-semibold text-white">
                                                        {issue.label}
                                                    </span>
                                                    <CockpitBadge tone={meta.tone}>
                                                        {kindMeta.label}
                                                    </CockpitBadge>
                                                </div>

                                                <p className="text-xs text-zinc-400 leading-relaxed break-words">
                                                    {issue.message}
                                                </p>

                                                {issue.value && (
                                                    <code className="inline-block text-[10px] font-mono text-zinc-500 bg-black/40 border border-white/10 rounded px-1.5 py-0.5 break-all">
                                                        {issue.value}
                                                    </code>
                                                )}

                                                <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-zinc-500">
                                                    <span>{issue.scope}</span>
                                                    {issue.hint && <span className="text-zinc-400">→ {issue.hint}</span>}
                                                </div>
                                            </div>

                                            {canFix && (
                                                <button
                                                    type="button"
                                                    onClick={() => onFix(issue)}
                                                    className="shrink-0 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#FFE500] hover:underline cursor-pointer"
                                                >
                                                    Corriger
                                                    <ArrowRight className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </CockpitCard>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
