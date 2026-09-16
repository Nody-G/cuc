'use client';

import React from 'react';
import Image from 'next/image';
import { LightboxImage } from '@/components/ui/LightboxModal';
import { STUDIO_GALLERY, CASCADEUR_GALLERY, EQUIPMENT_GALLERY } from './teamGalleries.data';
import { Maximize2, Eye } from 'lucide-react';

interface TeamProductionGalleriesProps {
  onOpenLightbox: (images: LightboxImage[], index: number) => void;
}

export const TeamProductionGalleries: React.FC<TeamProductionGalleriesProps> = ({
  onOpenLightbox,
}) => {
  return (
    <>
      {/* 1. CUC PROD — LE STUDIO ET LA SALLE (Grille 3x2) */}
      <section className="py-14 bg-[#09090d] border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1">
              INFRASTRUCTURES DE TOURNAGE
            </span>
            <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
              LE STUDIO &amp; LA SALLE D&apos;ACTION
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STUDIO_GALLERY.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onOpenLightbox(STUDIO_GALLERY, i)}
                className="relative aspect-video border-2 border-zinc-800 hover:border-[#FFE500] overflow-hidden group bg-black cursor-pointer text-left focus:outline-hidden transition-all shadow-md hover:shadow-[0_4px_20px_rgba(255,229,0,0.12)]"
                title="Cliquer pour voir en plein écran"
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
                <div className="absolute bottom-2 left-2 bg-black/85 px-2.5 py-1 text-xs font-mono-tech text-zinc-300 group-hover:text-[#FFE500] border border-zinc-800">
                  Vue #{i + 1}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. CUC PROD — LES CASCADEURS */}
      <section className="py-14 bg-[#060608] border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1">
              DOUBLURES &amp; CHORÉGRAPHES
            </span>
            <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
              LES CASCADEURS EN ACTION
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CASCADEUR_GALLERY.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onOpenLightbox(CASCADEUR_GALLERY, i)}
                className="relative aspect-video border border-zinc-800 hover:border-[#FFE500] overflow-hidden group bg-black cursor-pointer text-left focus:outline-hidden transition-all"
                title="Cliquer pour agrandir la photo de cascade"
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
                    <span>Agrandir</span>
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/90 px-2 py-0.5 text-[10px] font-mono-tech text-[#FFE500] border border-zinc-800">
                  {item.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CUC PROD — LES ÉQUIPEMENTS (Grille aérée et organisée) */}
      <section className="py-14 bg-[#09090d] border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block mb-1">
              MATÉRIEL TECHNIQUE CINÉMA
            </span>
            <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
              LES ÉQUIPEMENTS DE TOURNAGE
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {EQUIPMENT_GALLERY.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onOpenLightbox(EQUIPMENT_GALLERY, i)}
                className="relative aspect-video border-2 border-zinc-800 hover:border-[#FFE500] overflow-hidden group bg-black cursor-pointer text-left focus:outline-hidden transition-all shadow-md hover:shadow-[0_4px_20px_rgba(255,229,0,0.12)]"
                title="Cliquer pour voir l'équipement en détail"
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
                <div className="absolute bottom-2 left-2 right-2 bg-black/85 px-2 py-1 text-[11px] font-mono-tech text-zinc-300 group-hover:text-[#FFE500] border border-zinc-800 truncate">
                  {item.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
