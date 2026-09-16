'use client';

import React from 'react';
import Image from 'next/image';
import { LightboxImage } from '@/components/ui/LightboxModal';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { BANNER_GALLERY } from './teamGalleries.data';
import { Film, Maximize2, Eye } from 'lucide-react';

interface TeamBannersSectionProps {
  onOpenLightbox: (images: LightboxImage[], index: number) => void;
}

export const TeamBannersSection: React.FC<TeamBannersSectionProps> = ({
  onOpenLightbox,
}) => {
  return (
    <section id="affiches-officielles" className="py-16 bg-[#0c0c10] border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <StuntBadge variant="yellow" icon={<Film className="w-3.5 h-3.5" />}>
            CRÉDITS CINÉMATOGRAPHIQUES
          </StuntBadge>
          <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-2">
            LES FILMS COORDONNÉS PAR LE CUC & LUCAS DOLLFUS
          </h2>
          <p className="text-xs sm:text-sm font-tech text-zinc-400">
            Retrouvez les affiches officielles des productions françaises et internationales
            sur lesquelles nos équipes sont intervenues. Cliquez sur une affiche pour la voir en haute résolution.
          </p>
        </div>

        {/* Real CUC Banners */}
        <div className="space-y-8 mb-12">
          {BANNER_GALLERY.map((banner, index) => (
            <div
              key={index}
              onClick={() => onOpenLightbox(BANNER_GALLERY, index)}
              className="bg-[#121218] border-2 border-zinc-800 hover:border-[#FFE500] transition-colors p-3 relative group cursor-pointer"
              title="Cliquer pour ouvrir l'affiche en plein écran"
            >
              <div className="relative w-full h-32 sm:h-44 md:h-56 overflow-hidden">
                <Image
                  src={banner.src}
                  alt={banner.title}
                  fill
                  sizes="100vw"
                  className="object-cover object-center group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/85 px-2.5 py-1 text-xs font-mono-tech text-[#FFE500] border border-[#FFE500]/60 flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>AFFICHE HD</span>
                </div>
              </div>
              <div className="pt-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="font-display uppercase tracking-wider text-white text-sm group-hover:text-[#FFE500] transition-colors">
                  {banner.title}
                </span>
                <span className="font-mono-tech text-[#FFE500] text-[11px] flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>Cliquer pour agrandir</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
