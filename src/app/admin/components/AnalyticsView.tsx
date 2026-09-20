'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Minus,
    Inbox,
    CalendarCheck,
    FileText,
    Activity,
    RefreshCw,
    Download,
    Users,
    Target,
    Clock,
} from 'lucide-react';
import {
    getInquiries,
    getAuditLogsExtended,
    SiteInquiry,
    AuditLogEntry,
    SitePageContent,
} from '@/lib/data/site-service';
import type { StuntProgram } from '@/types';
import {
    analyzeCockpit,
    seriesToPolyline,
    type AnalyticsReport,
    type TrendSeries,
    type DistributionSlice,
} from '@/lib/cockpit-analytics';
import {
    CockpitViewHeader,
    CockpitCard,
    CockpitButton,
    CockpitBadge,
    CockpitEmptyState,
    CockpitSkeletonList,
} from './ui';

interface AnalyticsViewProps {
    programs: StuntProgram[];
    pages: SitePageContent[];
    showToast: (message: string) => void;
}

const WINDOW_OPTIONS = [7, 30, 90] as const;

function formatHours(hours: number | null): string {
    if (hours === null) return '—';
    if (hours < 24) return `${hours} h`;
    const days = Math.round((hours / 24) * 10) / 10;
    return `${days} j`;
}

const TrendBadge: React.FC<{ series: TrendSeries }> = ({ series }) => {
    const { direction, deltaPct } = series;
    const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;
    const tone = direction === 'up' ? 'success' : direction === 'down' ? 'danger' : 'neutral';
    const sign = deltaPct > 0 ? '+' : '';
    return (
        <CockpitBadge tone={tone}>
            <Icon className="w-3 h-3" aria-hidden="true" />
            {sign}
            {deltaPct}%
        </CockpitBadge>
    );
};

const Sparkline: React.FC<{ series: TrendSeries; label: string }> = ({ series, label }) => {
    const polyline = useMemo(() => seriesToPolyline(series.points), [series.points]);
    const hasData = series.points.some((p) => p.value > 0);

    if (!hasData) {
        return (
            <div className="h-10 flex items-center text-[11px] font-mono text-zinc-500">
                Aucune donnée sur la période
            </div>
        );
    }

    return (
        <svg
            viewBox="0 0 100 32"
            preserveAspectRatio="none"
            className="w-full h-10"
            role="img"
            aria-label={label}
        >
            <polyline
                points={polyline}
                fill="none"
                stroke="#FFE500"
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
};

const DistributionBar: React.FC<{ slices: DistributionSlice[]; emptyLabel: string }> = ({
    slices,
    emptyLabel,
}) => {
    if (slices.length === 0) {
        return <p className="text-xs text-zinc-500">{emptyLabel}</p>;
    }
    return (
        <ul className="space-y-2.5">
            {slices.map((slice) => (
                <li key={slice.label}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-zinc-300 truncate">{slice.label}</span>
                        <span className="font-mono text-zinc-400 shrink-0">
                            {slice.value} · {slice.share}%
                        </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-[#FFE500]"
                            style={{ width: `${Math.min(100, slice.share)}%` }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ programs, pages, showToast }) => {
    const [inquiries, setInquiries] = useState<SiteInquiry[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [windowDays, setWindowDays] = useState<number>(30);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [inq, logs] = await Promise.all([getInquiries(), getAuditLogsExtended(500)]);
            setInquiries(inq);
            setAuditLogs(logs);
        } catch {
            showToast('Impossible de charger les données analytiques.');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        // Chargement initial des données analytiques (effet de synchronisation
        // avec la source distante : le setState est intentionnel).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load]);

    const report: AnalyticsReport = useMemo(
        () =>
            analyzeCockpit({
                inquiries,
                programs,
                auditLogs,
                pages,
                windowDays,
            }),
        [inquiries, programs, auditLogs, pages, windowDays]
    );

    const exportCsv = useCallback(() => {
        const rows: string[][] = [
            ['Indicateur', 'Valeur'],
            ['Fenêtre (jours)', String(report.windowDays)],
            ['Candidatures totales', String(report.kpis.inquiriesTotal)],
            ['Nouvelles candidatures', String(report.kpis.inquiriesNew)],
            ['Candidatures admises', String(report.kpis.inquiriesAdmitted)],
            ['Candidatures refusées', String(report.kpis.inquiriesRefused)],
            ['Taux d’admission (%)', String(report.kpis.admissionRate)],
            ['Délai moyen de traitement', formatHours(report.kpis.avgResponseHours)],
            ['Sessions totales', String(report.kpis.sessionsTotal)],
            ['Sessions complètes', String(report.kpis.sessionsFull)],
            ['Taux de remplissage (%)', String(report.kpis.seatFillRate)],
            ['Pages publiées', String(report.kpis.publishedPages)],
            ['Pages en brouillon', String(report.kpis.draftPages)],
            ['Événements d’audit', String(report.kpis.auditEvents)],
            ['Contributeurs actifs', String(report.kpis.activeEditors)],
            [],
            ['Entonnoir', 'Volume', 'Conversion depuis l’étape précédente (%)'],
            ...report.funnel.map((stage) => [
                stage.label,
                String(stage.count),
                String(stage.conversionFromPrevious),
            ]),
        ];

        const csv = rows
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
            .join('\r\n');

        const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cuc-analytique-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('Export analytique téléchargé.');
    }, [report, showToast]);

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
        <div className="space-y-6 animate-in fade-in duration-200">
            <CockpitViewHeader
                eyebrow="Analytique"
                icon={BarChart3}
                title="Tableau de Bord Analytique"
                description="Indicateurs dérivés des candidatures, sessions, contenus et du journal d’audit. Aucune donnée n’est estimée."
                actions={
                    <div className="flex items-center gap-2">
                        <div
                            className="flex items-center rounded-lg border border-white/15 overflow-hidden"
                            role="group"
                            aria-label="Fenêtre d’analyse"
                        >
                            {WINDOW_OPTIONS.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setWindowDays(option)}
                                    aria-pressed={windowDays === option}
                                    className={`px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider transition-colors ${windowDays === option
                                        ? 'bg-[#FFE500] text-black font-bold'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {option} j
                                </button>
                            ))}
                        </div>
                        <CockpitButton variant="secondary" size="sm" icon={RefreshCw} onClick={load} loading={loading}>
                            Actualiser
                        </CockpitButton>
                        <CockpitButton variant="secondary" size="sm" icon={Download} onClick={exportCsv}>
                            Export CSV
                        </CockpitButton>
                    </div>
                }
            />

            {loading ? (
                <CockpitSkeletonList rows={6} />
            ) : (
                <>
                    {/* Cartes d'indicateurs clés */}
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

                    {/* Entonnoir de conversion */}
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

                    {/* Répartitions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <CockpitCard className="p-5">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-4">
                                Statuts des candidatures
                            </h2>
                            <DistributionBar
                                slices={report.statusDistribution}
                                emptyLabel="Aucune candidature à répartir."
                            />
                        </CockpitCard>

                        <CockpitCard className="p-5">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-4">
                                Demande par programme
                            </h2>
                            <DistributionBar
                                slices={report.programDistribution}
                                emptyLabel="Aucune demande rattachée à un programme."
                            />
                        </CockpitCard>
                    </div>

                    {/* Pression sur les sessions */}
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

                    {/* Activité éditoriale */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <CockpitCard className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-4 h-4 text-[#FFE500]" aria-hidden="true" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                                    Activité par contributeur
                                </h2>
                            </div>
                            <DistributionBar
                                slices={report.activityByAuthor}
                                emptyLabel="Aucune activité enregistrée dans le journal d’audit."
                            />
                        </CockpitCard>

                        <CockpitCard className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity className="w-4 h-4 text-[#FFE500]" aria-hidden="true" />
                                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                                    Entités les plus modifiées
                                </h2>
                            </div>
                            <DistributionBar
                                slices={report.activityByEntity}
                                emptyLabel="Aucune entité modifiée enregistrée."
                            />
                        </CockpitCard>
                    </div>

                    <p className="text-[11px] font-mono text-zinc-500 text-center">
                        Rapport généré le {new Date(report.generatedAt).toLocaleString('fr-FR')} · fenêtre de{' '}
                        {report.windowDays} jours
                    </p>
                </>
            )}
        </div>
    );
};
