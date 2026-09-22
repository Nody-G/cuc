import React from 'react';
import { cx } from './cockpit-classes';

export type CockpitBadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

const BADGE_TONES: Record<CockpitBadgeTone, string> = {
    neutral: 'bg-white/10 text-gray-300 border-white/15',
    accent: 'bg-[#FFE500]/15 text-[#FFE500] border-[#FFE500]/30',
    success: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    danger: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export interface CockpitBadgeProps {
    children: React.ReactNode;
    tone?: CockpitBadgeTone;
    className?: string;
}

export const CockpitBadge: React.FC<CockpitBadgeProps> = ({
    children,
    tone = 'neutral',
    className,
}) => (
    <span
        className={cx(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border',
            BADGE_TONES[tone],
            className,
        )}
    >
        {children}
    </span>
);
