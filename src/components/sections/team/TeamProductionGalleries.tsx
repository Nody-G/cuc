'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { LightboxImage } from '@/components/ui/LightboxModal';
import { STUDIO_GALLERY, CASCADEUR_GALLERY, EQUIPMENT_GALLERY } from './teamGalleries.data';
import { Maximize2, Eye } from 'lucide-react';
import { usePageSectionData, mergeSectionItems } from '@/lib/hooks/usePageSectionData';

interface TeamProductionGalleriesProps {
  onOpenLightbox: (images: LightboxImage[], index: number) => void;
}

export const TeamProductionGalleries: React.FC<TeamProductionGalleriesProps> = ({
  onOpenLightbox,
}) => {
  const t = useTranslations('teamProduction');
  /**
   * Chrome éditorial + visuels des trois galeries : chaque libellé retombe sur sa
   * traduction, chaque visuel sur son socle local (`teamGalleries.data`).
   */
  const block = usePageSectionData<{
    studio_badge?: string;
    studio_title?: string;
    doubles_badge?: string;
    doubles_title?: string;
    equipment_badge?: string;
    equipment_title?: string;
    expand?: string;
    studio_items?: Array<{ src?: string; title?: string }>;
    doubles_items?: Array<{ src?: string; title?: string }>;
    equipment_items?: Array<{ src?: string; title?: string }>;
  }>('galeries_production');

  const studioBadge = block?.studio_badge || t('galleries.studioBadge');
  const studioTitle = block?.studio_title || t('galleries.studioTitle');
  const doublesBadge = block?.doubles_badge || t('galleries.doublesBadge');
  const doublesTitle = block?.doubles_title || t('galleries.doublesTitle');
  const equipmentBadge = block?.equipment_badge || t('galleries.equipmentBadge');
  const equipmentTitle = block?.equipment_title || t('galleries.equipmentTitle');
  const expandLabel = block?.expand || t('galleries.expand');

  const studioGallery = React.useMemo(
    () =>
      mergeSectionItems(
        STUDIO_GALLERY,
        block?.studio_items ? { items: block.studio_items } : null
      ),
    [block?.studio_items]
  );
  const doublesGallery = React.useMemo(
    () =>
      mergeSectionItems(
        CASCADEUR_GALLERY,
        block?.doubles_items ? { items: block.doubles_items } : null
      ),
    [block?.doubles_items]
  );
  const equipmentGallery = React.useMemo(
    () =>
      mergeSectionItems(
        EQUIPMENT_GALLERY,
        block?.equipment_items ? { items: block.equipment_items } : null
      ),
    [block?.equipment_items]
  );

  return (
    <>
      {/* 1. CUC PROD — LE STUDIO ET LA SALLE (Grille 3x2) */}
      <section className="py-14 bg-[#09090d] border-b border-zinc-800">
        <div className="page-shell">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span
              data-cuc-field="sections_data.galeries_production.studio_badge"
              className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1"
            >
              {studioBadge}
            </span>
            <h2
              data-cuc-field="sections_data.galeries_production.studio_title"
              className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white"
            >
              {studioTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {studioGallery.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onOpenLightbox(studioGallery, i)}
                data-cuc-field={`sections_data.galeries_production.studio_items.${i}.src`}
                data-cuc-kind="image"
                className="relative aspect-video border-2 border-zinc-800 hover:border-[#FFE500] overflow-hidden group bg-black cursor-pointer text-left focus:outline-hidden transition-all shadow-md hover:shadow-[0_4px_20px_rgba(255,229,0,0.12)]"
                title={t('galleries.zoomStudio')}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-3 bg-black/85 rounded-full text-[#FFE500] border border-[#FFE500]/50 shadow-lg">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CUC PROD — LES CASCADEURS */}
      <section className="py-14 bg-[#060608] border-b border-zinc-800">
        <div className="page-shell">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span
              data-cuc-field="sections_data.galeries_production.doubles_badge"
              className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1"
            >
              {doublesBadge}
            </span>
            <h2
              data-cuc-field="sections_data.galeries_production.doubles_title"
              className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white"
            >
              {doublesTitle}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {doublesGallery.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onOpenLightbox(doublesGallery, i)}
                data-cuc-field={`sections_data.galeries_production.doubles_items.${i}.src`}
                data-cuc-kind="image"
                className="relative aspect-video border border-zinc-800 hover:border-[#FFE500] overflow-hidden group bg-black cursor-pointer text-left focus:outline-hidden transition-all"
                title={t('galleries.zoomStunt')}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-2.5 bg-black/85 rounded-full text-[#FFE500] border border-[#FFE500]/60 flex items-center gap-1.5 text-xs font-mono-tech">
                    <Eye className="w-3.5 h-3.5" />
                    <span data-cuc-field="sections_data.galeries_production.expand">
                      {expandLabel}
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CUC PROD — LES ÉQUIPEMENTS (Grille aérée et organisée) */}
      <section className="py-14 bg-[#09090d] border-b border-zinc-800">
        <div className="page-shell">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span
              data-cuc-field="sections_data.galeries_production.equipment_badge"
              className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1"
            >
              {equipmentBadge}
            </span>
            <h2
              data-cuc-field="sections_data.galeries_production.equipment_title"
              className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white"
            >
              {equipmentTitle}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {equipmentGallery.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onOpenLightbox(equipmentGallery, i)}
                data-cuc-field={`sections_data.galeries_production.equipment_items.${i}.src`}
                data-cuc-kind="image"
                className="relative aspect-video border-2 border-zinc-800 hover:border-[#FFE500] overflow-hidden group bg-black cursor-pointer text-left focus:outline-hidden transition-all shadow-md hover:shadow-[0_4px_20px_rgba(255,229,0,0.12)]"
                title={t('galleries.zoomEquipment')}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-2.5 bg-black/85 rounded-full text-[#FFE500] border border-[#FFE500]/50 shadow-lg">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
