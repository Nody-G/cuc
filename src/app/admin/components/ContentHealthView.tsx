'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Stethoscope,
    RefreshCw,
    Link2Off,
    ImageOff,
    Unlink,
    SearchCheck,
    AlertTriangle,
    AlertOctagon,
    Info,
    CheckCircle2,
    ArrowRight,
} from 'lucide-react';
import {
    getNavigation,
    getFooter,
    getSocialLinks,
    getPartners,
    getEvents,
    getSiteSettings,
    SitePageContent,
    SitePartner,
    SiteEvent,
    SiteSettings,
} from '@/lib/data/site-service';
import type {
    NavigationStructure,
    FooterStructure,
    SiteSocialLink,
} from '@/data/navigation';
import {
    analyzeContentHealth,
    ContentHealthReport,
    ContentIssue,
    ContentIssueKind,
    ContentIssueSeverity,
} from '@/lib/content-health';
import {
    CockpitViewHeader,
    CockpitCard,
    CockpitButton,
    CockpitBadge,
    CockpitEmptyState,
    CockpitSkeletonList,
} from './ui';

interface ContentHealthViewProps {
    pages: SitePageContent[];
    showToast: (msg: string) => void;
    onNavigateToTab?: (tab: 'pages' | 'navigation' | 'footer' | 'social' | 'partners' | 'events') => void;
}

const KIND_META: Record<
    ContentIssueKind,
    { label: string; icon: React.ComponentType<{ className?: string }>; tab: 'pages' | 'navigation' | 'footer' | 'social' | 'partners' | 'events' }
> = {
    'broken-link': { label: 'Liens cassés', icon: Link2Off, tab: 'navigation' },
    'missing-image': { label: 'Images manquantes', icon: ImageOff, tab: 'pages' },
    orphan: { label: 'Contenu orphelin', icon: Unlink, tab: 'navigation' },
    seo: { label: 'Métadonnées SEO', icon: SearchCheck, tab: 'pages' },
};

const SEVERITY_META: Record<
    ContentIssueSeverity,
    { label: string; icon: React.ComponentType<{ className?: string }>; tone: 'danger' | 'warning' | 'neutral' }
> = {
    error: { label: 'Critique', icon: AlertOctagon, tone: 'danger' },
    warning: { label: 'À corriger', icon: AlertTriangle, tone: 'warning' },
    info: { label: 'Optimisation', icon: Info, tone: 'neutral' },
};

function scoreTone(score: number): 'success' | 'warning' | 'danger' {
    if (score >= 85) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
}

export const ContentHealthView: React.FC<ContentHealthViewProps> = ({
    pages,
    showToast,
    onNavigateToTab,
}) => {
    const [report, setReport] = useState<ContentHealthReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [kindFilter, setKindFilter] = useState<ContentIssueKind | 'all'>('all');
    const [severityFilter, setSeverityFilter] = useState<ContentIssueSeverity | 'all'>('all');

    const runDiagnostic = async (showSpinner = false) => {
        if (showSpinner) setRefreshing(true);

        const [navigation, footer, socialLinks, partners, events, settings] = await Promise.all([
            getNavigation('main'),
            getFooter('main'),
            getSocialLinks(),
            getPartners(),
            getEvents(),
            getSiteSettings(),
        ]);

        const navStructure: NavigationStructure | null = navigation?.structure ?? null;
        const footerStructure: FooterStructure | null = footer?.structure ?? null;

        const result = analyzeContentHealth({
            pages,
            navigation: navStructure,
            footer: footerStructure,
            socialLinks: socialLinks as SiteSocialLink[],
            partners: partners as SitePartner[],
            events: events as SiteEvent[],
            settings: settings as SiteSettings,
        });

        setReport(result);
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        // Diagnostic recalculé à chaque changement de pages (synchronisation
        // avec la source distante : le setState est intentionnel).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void runDiagnostic();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pages]);

    const filteredIssues = useMemo(() => {
        if (!report) return [];
        return report.issues.filter((issue) => {
            if (kindFilter !== 'all' && issue.kind !== kindFilter) return false;
            if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
            return true;
        });
    }, [report, kindFilter, severityFilter]);

    const groupedBySeverity = useMemo(() => {
        const order: ContentIssueSeverity[] = ['error', 'warning', 'info'];
        return order
            .map((severity) => ({
                severity,
                issues: filteredIssues.filter((i) => i.severity === severity),
            }))
            .filter((group) => group.issues.length > 0);
    }, [filteredIssues]);

    const handleRefresh = async () => {
        await runDiagnostic(true);
        showToast('Diagnostic de contenu actualisé.');
    };

    const handleFix = (issue: ContentIssue) => {
        const meta = KIND_META[issue.kind];
        if (onNavigateToTab) {
            onNavigateToTab(meta.tab);
            showToast(`Ouverture du module « ${meta.label} » pour corriger : ${issue.label}`);
        }
    };

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
                        loading={refreshing}
                        onClick={handleRefresh}
                    >
                        Relancer le diagnostic
                    </CockpitButton>
                }
            />

            {loading ? (
                <CockpitSkeletonList rows={5} />
            ) : !report ? (
                <CockpitEmptyState
                    icon={Stethoscope}
                    title="Diagnostic indisponible"
                    description="Impossible de charger l’état du contenu pour le moment."
                />
            ) : (
                <>
                    {/* Score global */}
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
                                            : `${report.issues.length} anomalie(s) détectée(s) sur ${pages.length} page(s).`}
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
                                            onClick={() => setSeverityFilter(severityFilter === sev ? 'all' : sev)}
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

                    {/* Répartition par catégorie */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {(Object.keys(KIND_META) as ContentIssueKind[]).map((kind) => {
                            const meta = KIND_META[kind];
                            const Icon = meta.icon;
                            const active = kindFilter === kind;
                            return (
                                <button
                                    key={kind}
                                    type="button"
                                    onClick={() => setKindFilter(active ? 'all' : kind)}
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

                    {/* Liste des anomalies */}
                    {filteredIssues.length === 0 ? (
                        <CockpitEmptyState
                            icon={CheckCircle2}
                            title="Aucune anomalie"
                            description={
                                kindFilter !== 'all' || severityFilter !== 'all'
                                    ? 'Aucun problème ne correspond aux filtres sélectionnés.'
                                    : 'Tous les liens, images, contenus et métadonnées sont cohérents.'
                            }
                        />
                    ) : (
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

                                                            {onNavigateToTab && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleFix(issue)}
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
                    )}
                </>
            )}
        </div>
    );
};
