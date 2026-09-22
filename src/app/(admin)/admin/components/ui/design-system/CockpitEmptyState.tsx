import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cx } from './cockpit-classes';

export interface CockpitEmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export const CockpitEmptyState: React.FC<CockpitEmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    action,
    className,
}) => (
    <div
        className={cx(
            'flex flex-col items-center justify-center text-center py-14 px-6 rounded-xl border border-dashed border-white/15 bg-white/[0.02]',
            className,
        )}
    >
        {Icon && (
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-gray-500" />
            </div>
        )}
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {description && (
            <p className="text-xs text-gray-400 mt-1 max-w-sm">{description}</p>
        )}
        {action && <div className="mt-5">{action}</div>}
    </div>
);
