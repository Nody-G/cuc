import React, { useMemo } from 'react';
import { seriesToPolyline, type TrendSeries } from '@/lib/cockpit-analytics';

export interface SparklineProps {
    series: TrendSeries;
    label: string;
}

export const Sparkline: React.FC<SparklineProps> = ({ series, label }) => {
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
