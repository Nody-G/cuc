'use client';

import { useCallback } from 'react';
import type { AnalyticsReport } from '@/lib/cockpit-analytics';
import { downloadCsv, toCsv } from '@/lib/csv-export';
import { formatHours } from './analytics-format';

export interface UseAnalyticsExportArgs {
    report: AnalyticsReport;
    showToast: (message: string) => void;
}

export interface UseAnalyticsExportResult {
    exportCsv: () => void;
}

export function useAnalyticsExport({
    report,
    showToast,
}: UseAnalyticsExportArgs): UseAnalyticsExportResult {
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

        const csv = toCsv(rows);

        downloadCsv(`cuc-analytique-${new Date().toISOString().slice(0, 10)}.csv`, csv);
        showToast('Export analytique téléchargé.');
    }, [report, showToast]);

    return { exportCsv };
}
