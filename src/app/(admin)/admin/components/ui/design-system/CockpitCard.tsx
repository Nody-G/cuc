import React from 'react';
import { cx } from './cockpit-classes';

export interface CockpitCardProps {
    children: React.ReactNode;
    className?: string;
    /** Padding interne. `none` laisse la carte gérer ses propres zones. */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Rend la carte interactive (survol accentué). */
    interactive?: boolean;
}

const CARD_PADDING: Record<NonNullable<CockpitCardProps['padding']>, string> = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
};

export const CockpitCard: React.FC<CockpitCardProps> = ({
    children,
    className,
    padding = 'md',
    interactive = false,
}) => (
    <div
        className={cx(
            'bg-[#0D0D12] border border-white/10 rounded-xl',
            CARD_PADDING[padding],
            interactive && 'transition-colors hover:border-[#FFE500]/50',
            className,
        )}
    >
        {children}
    </div>
);
