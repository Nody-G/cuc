'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    AuditLogEntry,
    getAuditLogsExtended,
    getInquiries,
    SiteInquiry,
    SitePageContent,
} from '@/lib/data/site-service';
import type { StuntProgram } from '@/types';
import { analyzeCockpit, type AnalyticsReport } from '@/lib/cockpit-analytics';

export interface UseAnalyticsDataArgs {
    programs: StuntProgram[];
    pages: SitePageContent[];
    showToast: (message: string) => void;
}

export interface UseAnalyticsDataResult {
    report: AnalyticsReport;
    loading: boolean;
    windowDays: number;
    setWindowDays: (days: number) => void;
    load: () => Promise<void>;
}

export function useAnalyticsData({
    programs,
    pages,
    showToast,
}: UseAnalyticsDataArgs): UseAnalyticsDataResult {
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

    return { report, loading, windowDays, setWindowDays, load };
}
