'use client';

import React from 'react';
import Image from 'next/image';
import { cucField } from '@/lib/preview/cuc-field';
import type { TeamBuildingOverview as OverviewCopy } from './useTeamBuildingPage';

interface TeamBuildingOverviewProps {
    overview: OverviewCopy;
}

/** Bandeau d'introduction : enseigne, badge, titre et description éditables. */
export const TeamBuildingOverview: React.FC<TeamBuildingOverviewProps> = ({ overview }) => (
    <section className="py-14 bg-[#09090d] border-b border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="mb-4 flex flex-col items-center justify-center gap-2">
                <Image
                    src="/images/logos/cuc-logo-yellow.png"
                    alt="CUC Events Team Building"
                    width={52}
                    height={52}
                    className="w-13 h-13 object-contain drop-shadow-[0_0_12px_rgba(255,229,0,0.35)]"
                />
                <span
                    {...cucField('sections_data.overview.badge')}
                    className="text-xs font-mono-tech text-[#FFE500] font-bold tracking-widest uppercase"
                >
                    {overview.badge}
                </span>
            </div>
            <h2
                {...cucField('sections_data.overview.title')}
                className="text-3xl sm:text-4xl font-display uppercase text-white mb-4"
            >
                {overview.title}
            </h2>
            <p
                {...cucField('sections_data.overview.description', 'textarea')}
                className="text-sm font-tech text-zinc-300 leading-relaxed"
            >
                {overview.description}
            </p>
        </div>
    </section>
);
