'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    getNavigation,
    getFooter,
    getSocialLinks,
    getPartners,
    getEvents,
    getSiteSettings,
    type SitePageContent,
    type SitePartner,
    type SiteEvent,
    type SiteSettings,
} from '@/lib/data/site-service';
import type {
    NavigationStructure,
    FooterStructure,
    SiteSocialLink,
} from '@/data/navigation';
import {
    analyzeContentHealth,
    type ContentHealthReport,
    type ContentIssue,
    type ContentIssueKind,
    type ContentIssueSeverity,
} from '@/lib/content-health';
import { KIND_META, type HealthTab } from './health-meta';

interface UseContentHealthArgs {
    pages: SitePageContent[];
    showToast: (msg: string) => void;
    onNavigateToTab?: (tab: HealthTab) => void;
}

export interface ContentHealthController {
    report: ContentHealthReport | null;
    loading: boolean;
    refreshing: boolean;
    kindFilter: ContentIssueKind | 'all';
    setKindFilter: React.Dispatch<React.SetStateAction<ContentIssueKind | 'all'>>;
    severityFilter: ContentIssueSeverity | 'all';
    setSeverityFilter: React.Dispatch<React.SetStateAction<ContentIssueSeverity | 'all'>>;
    filteredIssues: ContentIssue[];
    groupedBySeverity: { severity: ContentIssueSeverity; issues: ContentIssue[] }[];
    handleRefresh: () => Promise<void>;
    handleFix: (issue: ContentIssue) => void;
}

/**
 * Orchestration du diagnostic : collecte des 6 sources de la vitrine,
 * analyse de santé mémoïsée et filtres de lecture.
 */
export function useContentHealth({
    pages,
    showToast,
    onNavigateToTab,
}: UseContentHealthArgs): ContentHealthController {
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

    return {
        report,
        loading,
        refreshing,
        kindFilter,
        setKindFilter,
        severityFilter,
        setSeverityFilter,
        filteredIssues,
        groupedBySeverity,
        handleRefresh,
        handleFix,
    };
}
