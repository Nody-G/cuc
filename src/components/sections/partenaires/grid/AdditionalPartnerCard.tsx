'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { SitePartner } from '@/lib/data/site-service';
import { PartnerLogoBox } from './PartnerLogoBox';
import type { PartnerLocalizer } from './partner-localization';

interface AdditionalPartnerCardProps {
    partner: SitePartner;
    localizer: PartnerLocalizer;
    failed: boolean;
    onImageFail: () => void;
    /** Badge complet (span avec `data-cuc-field` éventuel) construit par la façade. */
    badge: React.ReactNode;
    /** Libellé « site officiel » (chrome éditable). */
    officialSite: string;
}

/** Carte d'un partenaire additionnel configuré dans le Cockpit. */
export const AdditionalPartnerCard: React.FC<AdditionalPartnerCardProps> = ({
    partner,
    localizer,
    failed,
    onImageFail,
    badge,
    officialSite,
}) => (
    <div className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 p-6 relative group transition-all flex flex-col justify-between">
        <div>
            <PartnerLogoBox
                name={partner.name}
                logoUrl={partner.logo_url}
                failed={failed}
                onError={onImageFail}
            />

            <div className="flex items-center justify-between gap-2 mb-2">
                {badge}
            </div>

            <h3 className="text-lg font-display uppercase text-white mb-2">
                {partner.name}
            </h3>

            {localizer(partner).description && (
                <p className="text-xs font-tech text-zinc-300 leading-relaxed">
                    {localizer(partner).description}
                </p>
            )}
        </div>

        {partner.website_url && (
            <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-end text-[11px] font-mono-tech text-zinc-500">
                <a
                    href={partner.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FFE500] hover:underline flex items-center gap-1 font-bold"
                >
                    <span data-cuc-field="sections_data.partenaires_grid.official_site">
                        {officialSite}
                    </span>
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        )}
    </div>
);
