import React from 'react';
import { Activity, Users } from 'lucide-react';
import type { AnalyticsReport } from '@/lib/cockpit-analytics';
import { CockpitCard } from '../ui';
import { DistributionBar } from './DistributionBar';

export interface AnalyticsActivityRowProps {
    report: AnalyticsReport;
}

export const AnalyticsActivityRow: React.FC<AnalyticsActivityRowProps> = ({ report }) => (
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
);
