'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { LightboxModal, LightboxImage } from '@/components/ui/LightboxModal';
import { cucMicro } from '@/lib/preview/cuc-micro';
import { usePageSectionData, mergeSectionItems } from '@/lib/hooks/usePageSectionData';
import { EVENTS_SPECTACLES_GALLERY } from './events-gallery.data';

const INITIAL_VISIBLE_PHOTOS = 8;

interface EventsGallerySectionProps {
  onOpenLightbox?: (images: LightboxImage[], index: number) => void;
}

export const EventsGallerySection: React.FC<EventsGallerySectionProps> = ({
  onOpenLightbox,
}) => {
  const t = useTranslations('eventsAgence');
  const [isExpanded, setIsExpanded] = useState(false);
  const [internalLightboxIndex, setInternalLightboxIndex] = useState<number | null>(null);

  const block = usePageSectionData<{
    badge?: string;
    title?: string;
    subtitle?: string;
    expand?: string;
    items?: Array<{ src?: string; title?: string; category?: string }>;
  }>('gallery');

  const galleryBadge = block?.badge || t('galleryBadge');
  const galleryTitle = block?.title || t('galleryTitle');
  const gallerySubtitle = block?.subtitle || t('gallerySubtitle');
  const expandLabel = block?.expand || t('expand');

  const gallery = useMemo(
    () =>
      mergeSectionItems(
        EVENTS_SPECTACLES_GALLERY,
        block?.items ? { items: block.items } : null
      ),
    [block]
  );

  const handleOpenPhoto = (index: number) => {
    if (onOpenLightbox) {
      onOpenLightbox(gallery, index);
    } else {
      setInternalLightboxIndex(index);
    }
  };

  const visiblePhotos = isExpanded ? gallery : gallery.slice(0, INITIAL_VISIBLE_PHOTOS);

  return (
    <section className="py-16 bg-[#060608] border-t border-zinc-800">
      <div className="page-shell">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span
            data-cuc-field="sections_data.gallery.badge"
            className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1.5"
          >
            <span {...cucMicro('eventsAgence.galleryBadge')}>{galleryBadge}</span>
          </span>
          <h2
            data-cuc-field="sections_data.gallery.title"
            className="text-2xl sm:text-3xl md:text-4xl font-display uppercase tracking-wide text-white"
          >
            <span {...cucMicro('eventsAgence.galleryTitle')}>{galleryTitle}</span>
          </h2>
          <p
            data-cuc-field="sections_data.gallery.subtitle"
            className="text-sm font-tech text-zinc-400 mt-2"
          >
            <span {...cucMicro('eventsAgence.gallerySubtitle')}>{gallerySubtitle}</span>
          </p>
        </div>

        {/* 2 rangées de 4 photos au départ (8 photos) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {visiblePhotos.map((item, i) => {
            const originalIndex = gallery.indexOf(item);
            const targetIndex = originalIndex >= 0 ? originalIndex : i;
            return (
              <button
                key={item.src || targetIndex}
                type="button"
                onClick={() => handleOpenPhoto(targetIndex)}
                data-cuc-field={`sections_data.gallery.items.${targetIndex}.src`}
                data-cuc-kind="image"
                className="relative aspect-video border border-zinc-800 hover:border-[#FFE500] overflow-hidden group bg-black cursor-pointer text-left focus:outline-hidden transition-all shadow-md"
                title={t('zoomPhoto')}
              >
                <Image
                  src={item.src}
                  alt={item.title || 'Photo Spectacle CUC Events'}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-2.5 bg-black/85 rounded-full text-[#FFE500] border border-[#FFE500]/60 flex items-center gap-1.5 text-xs font-mono-tech">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{expandLabel}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bouton déroulant comme sur la page Tournage */}
        {gallery.length > INITIAL_VISIBLE_PHOTOS && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#101016] border border-zinc-700 hover:border-[#FFE500] text-zinc-300 hover:text-white text-xs font-mono-tech uppercase font-bold tracking-wider transition-all cursor-pointer shadow-md hover:bg-[#151520]"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 text-[#FFE500]" />
                  <span>{t('showLessPhotos')}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 text-[#FFE500]" />
                  <span>{t('showAllPhotos', { count: gallery.length - INITIAL_VISIBLE_PHOTOS })}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {!onOpenLightbox && (
        <LightboxModal
          images={gallery}
          currentIndex={internalLightboxIndex}
          onClose={() => setInternalLightboxIndex(null)}
          onNavigate={(idx) => setInternalLightboxIndex(idx)}
        />
      )}
    </section>
  );
};
