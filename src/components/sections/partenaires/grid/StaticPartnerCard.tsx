'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import type { Partner } from '../partenaires.data';
import type { PartnerLocalizer } from './partner-localization';

interface StaticPartnerCardProps {
    partner: Partner;
    localizer: PartnerLocalizer;
    /** Libellé « site web » (chrome éditable). */
    websiteLabel: string;
}

/** Carte d'un partenaire du catalogue certifié (`partenaires.data`). */
export const StaticPartnerCard: React.FC<StaticPartnerCardProps> = ({
    partner,
    localizer,
    websiteLabel,
}) => (
    <div className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 p-6 relative group transition-all flex flex-col justify-between">
        <div>
            {/* Logo Box */}
            <div
                className={`relative h-28 w-full ${partner.bgVariant === 'light'
                    ? 'bg-white border-zinc-200 shadow-sm group-hover:border-[#FFE500]'
                    : 'bg-black/90 border-zinc-800 group-hover:border-[#FFE500]/60'
                    } mb-5 p-4 flex items-center justify-center overflow-hidden transition-colors`}
            >
                <div className="relative w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Image
                        src={partner.logo}
                        alt={`Logo ${partner.name}`}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold">
                    {localizer(partner).role}
                </span>
                <span className="text-[10px] font-mono-tech text-zinc-500 uppercase">
                    {localizer(partner).category}
                </span>
            </div>

            <h3 className="text-xl font-display uppercase text-white mb-2">
                {partner.name}
            </h3>

            <p className="text-xs font-tech text-zinc-300 leading-relaxed">
                {localizer(partner).description}
            </p>
        </div>

        <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono-tech text-zinc-500">
            <span>{partner.featuredCertificate || ''}</span>
            {partner.website ? (
                <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFE500] hover:underline flex items-center gap-1 font-bold"
                >
                    <span data-cuc-field="sections_data.partenaires_grid.website_label">
                        {websiteLabel}
                    </span>
                    <ExternalLink className="w-3 h-3" />
                </a>
            ) : null}
        </div>
    </div>
);
