import React from 'react';
import { CalendarCheck } from 'lucide-react';
import type { AnalyticsReport } from '@/lib/cockpit-analytics';
import { CockpitCard, CockpitEmptyState } from '../ui';

export interface AnalyticsSessionPressureCardProps {
    report: AnalyticsReport;
}

export const AnalyticsSessionPressureCard: React.FC<AnalyticsSessionPressureCardProps> = ({
    report,
}) => (
    <CockpitCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
            <CalendarCheck className="w-4 h-4 text-[#FFE500]" aria-hidden="true" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                Remplissage des sessions par programme
            </h2>
        </div>
        {report.sessionPressure.length === 0 ? (
            <CockpitEmptyState
                icon={CalendarCheck}
                title="Aucune session ouverte"
                description="Les taux de remplissage apparaîtront dès l’ouverture de sessions."
            />
        ) : (
            <ul className="space-y-3">
                {report.sessionPressure.map((item) => (
                    <li key={item.programId}>
                        <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                            <span className="text-zinc-200 font-medium truncate">{item.programTitle}</span>
                            <span className="font-mono text-zinc-400 shrink-0">
                                {item.bookedSeats}/{item.totalSeats} places · {item.fillRate}%
                            </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${item.fillRate >= 90
                                    ? 'bg-red-500'
                                    : item.fillRate >= 60
                                        ? 'bg-[#FFE500]'
                                        : 'bg-emerald-500'
                                    }`}
                                style={{ width: `${Math.min(100, item.fillRate)}%` }}
                            />
                        </div>
                        <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                            {item.openSessions} ouverte(s) · {item.fullSessions} complète(s)
                        </p>
                    </li>
                ))}
            </ul>
        )}
    </CockpitCard>
);
