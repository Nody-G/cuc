import React from 'react';
import { cx } from './cockpit-classes';

export interface CockpitFormActionsProps {
    children: React.ReactNode;
    className?: string;
}

export const CockpitFormActions: React.FC<CockpitFormActionsProps> = ({
    children,
    className,
}) => (
    <div
        className={cx(
            'pt-4 border-t border-white/10 flex flex-wrap items-center justify-end gap-2',
            className,
        )}
    >
        {children}
    </div>
);
