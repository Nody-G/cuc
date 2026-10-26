'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Camera, Maximize2 } from 'lucide-react';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { LightboxModal } from '@/components/ui/LightboxModal';
import { cucMicro } from '@/lib/preview/cuc-micro';
import { SPECTACLES_ARCHIVES_PHOTOS } from './spectacles-gallery.data';

export const SpectaclesArchivesGallery: React.FC = () => {
  const t = useTranslations('spectacles');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <section className="py-16 bg-[#09090d] border-t border-zinc-800">
      <div className="page-shell">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <StuntBadge variant="yellow" icon={<Camera className="w-3.5 h-3.5" />}>
            <span {...cucMicro('spectacles.archivesBadge')}>{t('archivesBadge')}</span>
          </StuntBadge>
          <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-3">
            <span {...cucMicro('spectacles.archivesTitle')}>{t('archivesTitle')}</span>
          </h2>
          <p className="text-sm font-tech text-zinc-400">
            <span {...cucMicro('spectacles.archivesSubtitle')}>{t('archivesSubtitle')}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {SPECTACLES_ARCHIVES_PHOTOS.map((photo, index) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500] transition-all p-2 group flex flex-col justify-between cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-[#FFE500]"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="px-2.5 py-1 bg-[#FFE500] text-black text-[11px] font-mono-tech font-bold uppercase flex items-center gap-1 shadow-lg">
                    <Maximize2 className="w-3 h-3" />
                    <span>{photo.category}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <LightboxModal
        images={SPECTACLES_ARCHIVES_PHOTOS}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(index) => setLightboxIndex(index)}
      />
    </section>
  );
};
