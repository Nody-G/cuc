import React from 'react';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { TrendSeries } from '@/lib/cockpit-analytics';
import { CockpitBadge } from '../ui';

export interface TrendBadgeProps {
    series: TrendSeries;
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({ series }) => {
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
