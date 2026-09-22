import React from 'react';
import { cx } from './cockpit-classes';

export interface CockpitSkeletonProps {
    className?: string;
}

export const CockpitSkeleton: React.FC<CockpitSkeletonProps> = ({ className }) => (
    <div className={cx('animate-pulse rounded-lg bg-white/5', className)} />
);

export interface CockpitSkeletonListProps {
    /** Nombre de lignes à afficher. */
    rows?: number;
    className?: string;
}

export const CockpitSkeletonList: React.FC<CockpitSkeletonListProps> = ({
    rows = 4,
    className,
}) => (
    <div className={cx('space-y-3', className)} aria-busy="true" aria-live="polite">
        {Array.from({ length: rows }).map((_, idx) => (
            <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#0D0D12] border border-white/10"
            >
                <CockpitSkeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                    <CockpitSkeleton className="h-3 w-1/3" />
                    <CockpitSkeleton className="h-3 w-2/3" />
                </div>
            </div>
        ))}
    </div>
);
