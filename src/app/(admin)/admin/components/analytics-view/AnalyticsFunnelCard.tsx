import React from 'react';
import { Inbox, Target } from 'lucide-react';
import type { AnalyticsReport } from '@/lib/cockpit-analytics';
import { CockpitCard, CockpitEmptyState } from '../ui';

export interface AnalyticsFunnelCardProps {
    report: AnalyticsReport;
}

export const AnalyticsFunnelCard: React.FC<AnalyticsFunnelCardProps> = ({ report }) => (
    <CockpitCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-[#FFE500]" aria-hidden="true" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                Entonnoir de conversion des candidatures
            </h2>
        </div>
        {report.kpis.inquiriesTotal === 0 ? (
            <CockpitEmptyState
                icon={Inbox}
                title="Aucune candidature enregistrée"
                description="L’entonnoir s’affichera dès la première demande reçue."
            />
        ) : (
            <ol className="space-y-3">
                {report.funnel.map((stage) => (
                    <li key={stage.id}>
                        <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                            <span className="text-zinc-200 font-medium">{stage.label}</span>
                            <span className="font-mono text-zinc-400">
                                {stage.count}
                                {stage.id !== 'received' && (
                                    <span className="ml-2 text-[#FFE500]">{stage.conversionFromPrevious}%</span>
                                )}
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[#FFE500] to-[#FFB800]"
                                style={{ width: `${Math.max(stage.conversionFromStart, stage.count > 0 ? 3 : 0)}%` }}
                            />
                        </div>
                    </li>
                ))}
            </ol>
        )}
    </CockpitCard>
);
