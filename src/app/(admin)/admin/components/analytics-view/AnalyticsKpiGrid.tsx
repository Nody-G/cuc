import React from 'react';
import {
    Activity,
    CalendarCheck,
    Clock,
    FileText,
    Inbox,
    Target,
} from 'lucide-react';
import type { AnalyticsReport } from '@/lib/cockpit-analytics';
import { CockpitCard } from '../ui';
import { formatHours } from './analytics-format';
import { Sparkline } from './Sparkline';
import { TrendBadge } from './TrendBadge';

export interface AnalyticsKpiGridProps {
    report: AnalyticsReport;
}

export const AnalyticsKpiGrid: React.FC<AnalyticsKpiGridProps> = ({ report }) => {
    const kpiCards = [
        {
            id: 'inquiries',
            label: 'Candidatures',
            value: report.kpis.inquiriesTotal,
            hint: `${report.kpis.inquiriesNew} nouvelle(s)`,
            icon: Inbox,
            trend: report.inquiryTrend,
        },
        {
            id: 'admission',
            label: 'Taux d’admission',
            value: `${report.kpis.admissionRate}%`,
            hint: `${report.kpis.inquiriesAdmitted} admis · ${report.kpis.inquiriesRefused} refusés`,
            icon: Target,
            trend: null,
        },
        {
            id: 'response',
            label: 'Délai de traitement',
            value: formatHours(report.kpis.avgResponseHours),
            hint: 'Moyenne sur dossiers traités',
            icon: Clock,
            trend: null,
        },
        {
            id: 'sessions',
            label: 'Remplissage sessions',
            value: `${report.kpis.seatFillRate}%`,
            hint: `${report.kpis.sessionsFull}/${report.kpis.sessionsTotal} complètes`,
            icon: CalendarCheck,
            trend: null,
        },
        {
            id: 'pages',
            label: 'Pages publiées',
            value: report.kpis.publishedPages,
            hint: `${report.kpis.draftPages} en brouillon`,
            icon: FileText,
            trend: null,
        },
        {
            id: 'activity',
            label: 'Activité éditoriale',
            value: report.kpis.auditEvents,
            hint: `${report.kpis.activeEditors} contributeur(s)`,
            icon: Activity,
            trend: report.auditTrend,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiCards.map((card) => {
                const Icon = card.icon;
                return (
                    <CockpitCard key={card.id} className="p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                                    {card.label}
                                </p>
                                <p className="mt-2 text-3xl font-black text-white leading-none">{card.value}</p>
                                <p className="mt-1.5 text-xs text-zinc-500 truncate">{card.hint}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-[#FFE500]/10 text-[#FFE500] shrink-0">
                                <Icon className="w-4 h-4" aria-hidden="true" />
                            </div>
                        </div>
                        {card.trend && (
                            <div className="mt-4 space-y-2">
                                <Sparkline series={card.trend} label={`Évolution — ${card.label}`} />
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                                        {report.windowDays} derniers jours
                                    </span>
                                    <TrendBadge series={card.trend} />
                                </div>
                            </div>
                        )}
                    </CockpitCard>
                );
            })}
        </div>
    );
};
