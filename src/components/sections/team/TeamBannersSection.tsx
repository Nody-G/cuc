'use client';

import React from 'react';
import Image from 'next/image';
import { LightboxImage } from '@/components/ui/LightboxModal';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { BANNER_GALLERY } from './teamGalleries.data';
import { useTranslations } from 'next-intl';
import { Film, Maximize2 } from 'lucide-react';
import { usePageSectionData, mergeSectionItems } from '@/lib/hooks/usePageSectionData';

interface TeamBannersSectionProps {
  onOpenLightbox: (images: LightboxImage[], index: number) => void;
}

interface AffichesBlock {
  badge?: string;
  title?: string;
  intro?: string;
  hd_label?: string;
  items?: Array<{ src?: string; title?: string }>;
}

export const TeamBannersSection: React.FC<TeamBannersSectionProps> = ({
  onOpenLightbox,
}) => {
  const t = useTranslations('teamProduction');
  const block = usePageSectionData<AffichesBlock>('affiches');

  const badge = block?.badge || t('teamBannersBadge');
  const title = block?.title || t('teamBannersTitle');
  const intro = block?.intro || t('teamBannersIntro');
  const hdLabel = block?.hd_label || t('teamBannersHdLabel');

  /** Affiches : les entrées éditoriales priment index par index, jamais de liste vidée. */
  const banners = React.useMemo(
    () => mergeSectionItems(BANNER_GALLERY, block?.items ? { items: block.items } : null),
    [block]
  );

  // Les frises d'affiches héritées de l'ancien site ont été supprimées au profit
  // des vraies affiches servies par le catalogue : sans bandeau, la section n'a
  // plus aucun contenu, on ne rend donc rien du tout.
  if (banners.length === 0) return null;

  return (
    <section id="affiches" className="py-16 bg-[#0c0c10] border-b border-zinc-800">
      <div className="page-shell">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <StuntBadge variant="yellow" icon={<Film className="w-3.5 h-3.5" />}>
            <span data-cuc-field="sections_data.affiches.badge">{badge}</span>
          </StuntBadge>
          <h2
            data-cuc-field="sections_data.affiches.title"
            className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-2"
          >
            {title}
          </h2>
          <p
            data-cuc-field="sections_data.affiches.intro"
            className="text-xs sm:text-sm font-tech text-zinc-400"
          >
            {intro}
          </p>
        </div>

        {/* Real CUC Banners */}
        <div className="space-y-8 mb-12">
          {banners.map((banner, index) => (
            <div
              key={index}
              onClick={() => onOpenLightbox(banners, index)}
              className="bg-[#121218] border-2 border-zinc-800 hover:border-[#FFE500] transition-colors p-3 relative group cursor-pointer"
              title={t('teamBannersPosterTitle')}
            >
              <div
                data-cuc-field={`sections_data.affiches.items.${index}.src`}
                data-cuc-kind="image"
                className="relative w-full h-32 sm:h-44 md:h-56 overflow-hidden"
              >
                <Image
                  src={banner.src}
                  alt={banner.title}
                  fill
                  sizes="100vw"
                  className="object-cover object-center group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/85 px-2.5 py-1 text-xs font-mono-tech text-[#FFE500] border border-[#FFE500]/60 flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span data-cuc-field="sections_data.affiches.hd_label">{hdLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
