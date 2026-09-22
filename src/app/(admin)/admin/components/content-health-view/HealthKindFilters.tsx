'use client';

import React from 'react';
import type { ContentHealthReport, ContentIssueKind } from '@/lib/content-health';
import { KIND_META } from './health-meta';

interface HealthKindFiltersProps {
    report: ContentHealthReport;
    kindFilter: ContentIssueKind | 'all';
    onToggleKind: (kind: ContentIssueKind) => void;
}

/** Répartition par catégorie : 4 tuiles filtrantes (liens, images, orphelins, SEO). */
export const HealthKindFilters: React.FC<HealthKindFiltersProps> = ({
    report,
    kindFilter,
    onToggleKind,
}) => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(KIND_META) as ContentIssueKind[]).map((kind) => {
            const meta = KIND_META[kind];
            const Icon = meta.icon;
            const active = kindFilter === kind;
            return (
                <button
                    key={kind}
                    type="button"
                    onClick={() => onToggleKind(kind)}
                    className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${active
                        ? 'bg-[#FFE500]/10 border-[#FFE500]/40'
                        : 'bg-[#0D0D12] border-white/10 hover:border-white/20'
                        }`}
                >
                    <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                        <Icon className="w-3.5 h-3.5" />
                        {meta.label}
                    </div>
                    <div className="text-xl font-bold text-white mt-2">
                        {report.counts[kind]}
                    </div>
                </button>
            );
        })}
    </div>
);
