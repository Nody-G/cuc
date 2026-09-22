import React from 'react';
import type { AnalyticsReport } from '@/lib/cockpit-analytics';
import { CockpitCard } from '../ui';
import { DistributionBar } from './DistributionBar';

export interface AnalyticsDistributionsRowProps {
    report: AnalyticsReport;
}

export const AnalyticsDistributionsRow: React.FC<AnalyticsDistributionsRowProps> = ({ report }) => (
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
);
