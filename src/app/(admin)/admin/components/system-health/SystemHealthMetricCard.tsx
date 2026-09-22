'use client';

import React from 'react';
import { Server } from 'lucide-react';
import type { SystemHealthReport } from '@/app/(admin)/admin/actions';
import { STATE_STYLES } from './health-state';

export type HealthMetric = SystemHealthReport['metrics'][number];

interface SystemHealthMetricCardProps {
    metric: HealthMetric;
}

/** Carte d'une mesure réelle (latence, quotas…) rapportée par la sonde. */
export const SystemHealthMetricCard: React.FC<SystemHealthMetricCardProps> = ({ metric }) => {
    const style = STATE_STYLES[metric.state];
    return (
        <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono text-gray-300 truncate">
                    <Server className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="truncate">{metric.label}</span>
                </div>
                <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border shrink-0 ${style.badge}`}
                >
                    {metric.value}
                </span>
            </div>
            <div className="text-gray-400 text-[11px]">{metric.detail}</div>
        </div>
    );
};
