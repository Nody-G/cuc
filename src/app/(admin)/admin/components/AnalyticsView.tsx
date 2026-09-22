'use client';

import React from 'react';
import { BarChart3, Download, RefreshCw } from 'lucide-react';
import { SitePageContent } from '@/lib/data/site-service';
import type { StuntProgram } from '@/types';
import { CockpitViewHeader, CockpitButton, CockpitSkeletonList } from './ui';
import { useAnalyticsData } from './analytics-view/useAnalyticsData';
import { useAnalyticsExport } from './analytics-view/useAnalyticsExport';
import { AnalyticsWindowSelector } from './analytics-view/AnalyticsWindowSelector';
import { AnalyticsKpiGrid } from './analytics-view/AnalyticsKpiGrid';
import { AnalyticsFunnelCard } from './analytics-view/AnalyticsFunnelCard';
import { AnalyticsDistributionsRow } from './analytics-view/AnalyticsDistributionsRow';
import { AnalyticsSessionPressureCard } from './analytics-view/AnalyticsSessionPressureCard';
import { AnalyticsActivityRow } from './analytics-view/AnalyticsActivityRow';

interface AnalyticsViewProps {
    programs: StuntProgram[];
    pages: SitePageContent[];
    showToast: (message: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ programs, pages, showToast }) => {
    const data = useAnalyticsData({ programs, pages, showToast });
    const { exportCsv } = useAnalyticsExport({ report: data.report, showToast });

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <CockpitViewHeader
                eyebrow="Analytique"
                icon={BarChart3}
                title="Tableau de Bord Analytique"
                description="Indicateurs dérivés des candidatures, sessions, contenus et du journal d’audit. Aucune donnée n’est estimée."
                actions={
                    <div className="flex items-center gap-2">
                        <AnalyticsWindowSelector
                            windowDays={data.windowDays}
                            onChange={data.setWindowDays}
                        />
                        <CockpitButton
                            variant="secondary"
                            size="sm"
                            icon={RefreshCw}
                            onClick={data.load}
                            loading={data.loading}
                        >
                            Actualiser
                        </CockpitButton>
                        <CockpitButton variant="secondary" size="sm" icon={Download} onClick={exportCsv}>
                            Export CSV
                        </CockpitButton>
                    </div>
                }
            />

            {data.loading ? (
                <CockpitSkeletonList rows={6} />
            ) : (
                <>
                    {/* Cartes d'indicateurs clés */}
                    <AnalyticsKpiGrid report={data.report} />

                    {/* Entonnoir de conversion */}
                    <AnalyticsFunnelCard report={data.report} />

                    {/* Répartitions */}
                    <AnalyticsDistributionsRow report={data.report} />

                    {/* Pression sur les sessions */}
                    <AnalyticsSessionPressureCard report={data.report} />

                    {/* Activité éditoriale */}
                    <AnalyticsActivityRow report={data.report} />

                    <p className="text-[11px] font-mono text-zinc-500 text-center">
                        Rapport généré le {new Date(data.report.generatedAt).toLocaleString('fr-FR')} · fenêtre de{' '}
                        {data.report.windowDays} jours
                    </p>
                </>
            )}
        </div>
    );
};
