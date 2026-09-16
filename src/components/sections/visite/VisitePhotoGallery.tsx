'use client';

import React from 'react';
import Image from 'next/image';
import { Building, Maximize2 } from 'lucide-react';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { LightboxImage } from '@/components/ui/LightboxModal';

interface VisitePhotoGalleryProps {
  photos: LightboxImage[];
  onOpenLightbox: (index: number) => void;
}

export const VisitePhotoGallery: React.FC<VisitePhotoGalleryProps> = ({
  photos,
  onOpenLightbox,
}) => {
  return (
    <section className="py-16 bg-[#09090d] border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <StuntBadge variant="yellow" icon={<Building className="w-3.5 h-3.5" />}>
            GALERIE OFFICIELLE DU CAMPUS
          </StuntBadge>
          <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-3">
            LE DOMAINE EN IMAGES
          </h2>
          <p className="text-sm font-tech text-zinc-400">
            100% des photographies réelles du campus au Cateau-Cambrésis issues du site officiel.
            <span className="text-[#FFE500] block mt-1 font-mono-tech text-xs">
              (Cliquez sur n'importe quelle photo pour l'agrandir en haute résolution)
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => onOpenLightbox(i)}
              className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500] transition-all p-2 group flex flex-col justify-between cursor-pointer text-left focus:outline-none focus:ring-1 focus:ring-[#FFE500]"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-black mb-2">
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
                    <span>Agrandir</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] font-mono-tech uppercase text-zinc-400 group-hover:text-[#FFE500] truncate text-center">
                {photo.title}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
