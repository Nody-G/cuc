import React from 'react';
import type { DistributionSlice } from '@/lib/cockpit-analytics';

export interface DistributionBarProps {
    slices: DistributionSlice[];
    emptyLabel: string;
}

export const DistributionBar: React.FC<DistributionBarProps> = ({ slices, emptyLabel }) => {
    if (slices.length === 0) {
        return <p className="text-xs text-zinc-500">{emptyLabel}</p>;
    }
    return (
        <ul className="space-y-2.5">
            {slices.map((slice) => (
                <li key={slice.label}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-zinc-300 truncate">{slice.label}</span>
                        <span className="font-mono text-zinc-400 shrink-0">
                            {slice.value} · {slice.share}%
                        </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-[#FFE500]"
                            style={{ width: `${Math.min(100, slice.share)}%` }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
};
