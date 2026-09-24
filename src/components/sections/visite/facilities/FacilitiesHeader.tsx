'use client';

import React from 'react';

interface FacilitiesHeaderProps {
    tag: string;
    title: string;
    subtitle: string;
}

/** Chrome éditable de la section (tag, titre, sous-titre). */
export const FacilitiesHeader: React.FC<FacilitiesHeaderProps> = ({ tag, title, subtitle }) => (
    <div className="text-center max-w-3xl mx-auto mb-12">
        <span
            data-cuc-field="sections_data.installations.tag"
            className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-2"
        >
            {tag}
        </span>
        <h2
            data-cuc-field="sections_data.installations.title"
            className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mb-3"
        >
            {title}
        </h2>
        <p
            data-cuc-field="sections_data.installations.subtitle"
            className="text-sm font-tech text-zinc-400"
        >
            {subtitle}
        </p>
    </div>
);
