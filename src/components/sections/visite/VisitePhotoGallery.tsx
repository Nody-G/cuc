'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Building, Maximize2, ChevronDown, ChevronUp } from 'lucide-react';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { LightboxImage } from '@/components/ui/LightboxModal';
import { cucMicro } from '@/lib/preview/cuc-micro';

const INITIAL_VISIBLE_PHOTOS = 8;

interface VisitePhotoGalleryProps {
  photos: LightboxImage[];
  onOpenLightbox: (index: number) => void;
}

export const VisitePhotoGallery: React.FC<VisitePhotoGalleryProps> = ({
  photos,
  onOpenLightbox,
}) => {
  const t = useTranslations('visite');
  const [isExpanded, setIsExpanded] = useState(false);

  const visiblePhotos = isExpanded ? photos : photos.slice(0, INITIAL_VISIBLE_PHOTOS);

  return (
    <section className="py-16 bg-[#09090d] border-t border-zinc-800">
      <div className="page-shell">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <StuntBadge variant="yellow" icon={<Building className="w-3.5 h-3.5" />}>
            <span {...cucMicro('visite.galleryBadge')}>{t('galleryBadge')}</span>
          </StuntBadge>
          <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-3">
            <span {...cucMicro('visite.galleryTitle')}>{t('galleryTitle')}</span>
          </h2>
          <p className="text-sm font-tech text-zinc-400">
            <span {...cucMicro('visite.gallerySubtitle')}>{t('gallerySubtitle')}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {visiblePhotos.map((photo, i) => {
            const originalIndex = photos.indexOf(photo);
            const targetIndex = originalIndex >= 0 ? originalIndex : i;
            return (
              <button
                key={targetIndex}
                type="button"
                onClick={() => onOpenLightbox(targetIndex)}
                className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500] transition-all p-2 group flex flex-col justify-between cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-[#FFE500]"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <Image
                    src={photo.src}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="px-2.5 py-1 bg-[#FFE500] text-black text-[11px] font-mono-tech font-bold uppercase flex items-center gap-1 shadow-lg">
                      <Maximize2 className="w-3 h-3" />
                      <span>{t('zoom')}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {photos.length > INITIAL_VISIBLE_PHOTOS && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#101016] border border-zinc-700 hover:border-[#FFE500] text-zinc-300 hover:text-white text-xs font-mono-tech uppercase font-bold tracking-wider transition-all cursor-pointer shadow-md hover:bg-[#151520]"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 text-[#FFE500]" />
                  <span {...cucMicro('visite.showLessPhotos')}>{t('showLessPhotos')}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 text-[#FFE500]" />
                  <span {...cucMicro('visite.showAllPhotos')}>
                    {t('showAllPhotos', { count: photos.length - INITIAL_VISIBLE_PHOTOS })}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
