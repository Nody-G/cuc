'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Film, Award } from 'lucide-react';
import { CUC_PARTNERS } from './partenaires.data';
import { usePageSectionData } from '@/lib/hooks/usePageSectionData';
import { usePartnersGrid } from './grid/usePartnersGrid';
import { AdditionalPartnerCard } from './grid/AdditionalPartnerCard';
import { StaticPartnerCard } from './grid/StaticPartnerCard';
import { CATEGORY_KEYS, type PartnerCopy } from './grid/partner-localization';

/**
 * Grille des partenaires — façade de composition.
 *
 * L'orchestration (catalogue certifié + fiches CMS + Realtime + dédup) vit dans
 * `usePartnersGrid` ; les cartes dans `grid/**`.
 */
export const PartenairesGridSection: React.FC = () => {
  const t = useTranslations('partenaires');
  const partnerCopy = t.raw('partners') as PartnerCopy[];

  /**
   * Chrome éditorial du bloc : chaque libellé retombe sur sa traduction. Les
   * fiches partenaires elles-mêmes restent pilotées par `site_partners`.
   */
  const chrome = usePageSectionData<{
    cinema_heading?: string;
    specialized_heading?: string;
    production_badge?: string;
    official_site?: string;
    website_label?: string;
  }>('partenaires_grid');

  const cinemaHeading = chrome?.cinema_heading || t('cinemaHeading');
  const specializedHeading = chrome?.specialized_heading || t('specializedHeading');
  const productionBadge = chrome?.production_badge || t('productionBadge');
  const officialSite = chrome?.official_site || t('officialSite');
  const websiteLabel = chrome?.website_label || t('website');

  const grid = usePartnersGrid(partnerCopy);

  return (
    <section className="py-16">
      <div className="page-shell space-y-16">
        {/* Section Partenaires Cinéma additionnels configurés dans le Cockpit */}
        {grid.additionalCinemaPartners.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <Film className="w-4 h-4 text-[#FFE500]" />
              <h2
                data-cuc-field="sections_data.partenaires_grid.cinema_heading"
                className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white"
              >
                {cinemaHeading}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {grid.additionalCinemaPartners.map((partner) => (
                <AdditionalPartnerCard
                  key={partner.id}
                  partner={partner}
                  localizer={grid.localizer}
                  failed={Boolean(grid.failedImages[partner.id])}
                  onImageFail={() => grid.markImageFailed(partner.id)}
                  officialSite={officialSite}
                  badge={
                    <span
                      data-cuc-field="sections_data.partenaires_grid.production_badge"
                      className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold"
                    >
                      {productionBadge}
                    </span>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Section Partenaires Additionnels (Équipements, Institutions, Médias) */}
        {grid.additionalOtherPartners.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <Award className="w-4 h-4 text-[#FFE500]" />
              <h2
                data-cuc-field="sections_data.partenaires_grid.specialized_heading"
                className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white"
              >
                {specializedHeading}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {grid.additionalOtherPartners.map((partner) => (
                <AdditionalPartnerCard
                  key={partner.id}
                  partner={partner}
                  localizer={grid.localizer}
                  failed={Boolean(grid.failedImages[partner.id])}
                  onImageFail={() => grid.markImageFailed(partner.id)}
                  officialSite={officialSite}
                  badge={
                    <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold">
                      {partner.category === 'materiel'
                        ? t('roleMateriel')
                        : partner.category === 'media'
                          ? t('roleMedia')
                          : t('roleInstitutionnel')}
                    </span>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Groupes de partenaires statiques certifiés */}
        {CUC_PARTNERS.map((catGroup, idx) => (
          <div key={idx} className="space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              {catGroup.icon}
              <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                {CATEGORY_KEYS[catGroup.category]
                  ? t(CATEGORY_KEYS[catGroup.category])
                  : catGroup.category}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {catGroup.partners.map((partner, pIdx) => (
                <StaticPartnerCard
                  key={pIdx}
                  partner={partner}
                  localizer={grid.localizer}
                  websiteLabel={websiteLabel}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
