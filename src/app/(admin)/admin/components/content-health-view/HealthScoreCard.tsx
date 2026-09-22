'use client';

import React from 'react';
import type { ContentHealthReport, ContentIssueSeverity } from '@/lib/content-health';
import { CockpitCard, CockpitBadge } from '../ui';
import { scoreTone, SEVERITY_META } from './health-meta';

interface HealthScoreCardProps {
    report: ContentHealthReport;
    pageCount: number;
    severityFilter: ContentIssueSeverity | 'all';
    onToggleSeverity: (severity: ContentIssueSeverity) => void;
}

/** Score global du contenu et compteurs cliquables par sévérité. */
export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
    report,
    pageCount,
    severityFilter,
    onToggleSeverity,
}) => (
    <CockpitCard className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex items-center gap-4">
                <div
                    className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border ${report.score >= 85
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : report.score >= 60
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        }`}
                >
                    <span className="text-2xl font-black leading-none">{report.score}</span>
                    <span className="text-[9px] font-mono uppercase tracking-wider mt-1">/ 100</span>
                </div>
                <div>
                    <div className="text-sm font-bold text-white">Score de santé du contenu</div>
                    <div className="text-xs text-zinc-400 mt-1">
                        {report.issues.length === 0
                            ? 'Aucune anomalie détectée.'
                            : `${report.issues.length} anomalie(s) détectée(s) sur ${pageCount} page(s).`}
                    </div>
                    <div className="mt-2">
                        <CockpitBadge tone={scoreTone(report.score)}>
                            {report.score >= 85
                                ? 'Contenu sain'
                                : report.score >= 60
                                    ? 'Corrections recommandées'
                                    : 'Corrections prioritaires'}
                        </CockpitBadge>
                    </div>
                </div>
            </div>

            <div className="sm:ml-auto grid grid-cols-3 gap-3 w-full sm:w-auto">
                {(['error', 'warning', 'info'] as ContentIssueSeverity[]).map((sev) => {
                    const meta = SEVERITY_META[sev];
                    const Icon = meta.icon;
                    return (
                        <button
                            key={sev}
                            type="button"
                            onClick={() => onToggleSeverity(sev)}
                            className={`px-3 py-2.5 rounded-xl border text-left transition-colors cursor-pointer ${severityFilter === sev
                                ? 'bg-[#FFE500]/10 border-[#FFE500]/40'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                                <Icon className="w-3 h-3" />
                                {meta.label}
                            </div>
                            <div className="text-lg font-bold text-white mt-1">
                                {report.severityCounts[sev]}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    </CockpitCard>
);
