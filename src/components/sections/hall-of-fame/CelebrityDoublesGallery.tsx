'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { DOUBLED_CELEBRITIES } from '@/data/filmography';
import { getCelebrities } from '@/lib/data/site-service';
import { DoubledCelebrity } from '@/types';
import { ImdbLogo } from '@/components/ui/BrandLogos';
import { UserCheck, ExternalLink, Info } from 'lucide-react';

interface CelebrityDoublesGalleryProps {
  onSelectCelebrity: (celebrity: DoubledCelebrity) => void;
}

/**
 * Galerie des comédiens doublés.
 *
 * Les filtres de segmentation marketing ont été retirés : cette lecture
 * (français / international) ne reposait sur aucune preuve éditoriale. Les
 * fiches restent factuelles : comédien, productions, doublure éventuellement
 * renseignée, profil IMDb.
 */
export const CelebrityDoublesGallery: React.FC<CelebrityDoublesGalleryProps> = ({
  onSelectCelebrity,
}) => {
  const [celebrities, setCelebrities] = useState<DoubledCelebrity[]>(DOUBLED_CELEBRITIES);

  useEffect(() => {
    getCelebrities().then(setCelebrities);
  }, []);

  return (
    <div className="mb-20 bg-[#0c0c10] border-2 border-zinc-800 p-6 sm:p-8 relative shadow-2xl">

      {/* Section Header */}
      <div className="pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-5 h-5 text-[#FFE500]" />
            <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
              ACTEURS &amp; TOURNAGES
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-display uppercase tracking-tight text-white">
            LES ACTEURS DOUBLÉS &amp; PRODUCTIONS
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 font-tech mt-1 max-w-2xl">
            Les formateurs et cascadeurs du Campus Univers Cascades interviennent sur les scènes d&apos;action des tournages français et internationaux.
          </p>
        </div>

      </div>

      {/* Celebrities Grid with Real Portraits & Clean Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
        {celebrities.map((actor) => (
          <div
            key={actor.id}
            onClick={() => onSelectCelebrity(actor)}
            className="group bg-[#121218] border border-zinc-800 hover:border-[#FFE500] transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative hover:shadow-[0_12px_35px_rgba(255,229,0,0.18)] luxury-metric-card"
          >
            {/* Photo Portrait Container */}
            <div className="relative h-60 w-full overflow-hidden bg-black">
              <Image
                src={actor.photo}
                alt={`Comédien doublé ${actor.name}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-top brightness-90 contrast-105 group-hover:scale-105 group-hover:brightness-100 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121218] via-[#121218]/30 to-transparent" />

              {/* IMDb Direct Link */}
              <a
                href={actor.imdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute top-3 right-3 z-10 px-2 py-1 bg-[#f5c518] hover:bg-[#ffe500] text-black font-black text-[10px] font-mono-tech rounded-xs shadow-md flex items-center transition-colors"
                title={`Voir la filmographie IMDb de ${actor.name}`}
              >
                <ImdbLogo className="h-3 w-auto" />
              </a>
            </div>

            {/* Body Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h4 className="text-xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                  {actor.name}
                </h4>

                {/* Stunt Double Reference - Uniquement si une doublure dédiée est renseignée */}
                {actor.stuntDoubles ? (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2 py-1 bg-[#FFE500]/10 border border-[#FFE500]/40 text-[10px] font-mono-tech text-[#FFE500] font-bold">
                    <UserCheck className="w-3 h-3 flex-shrink-0" />
                    <span>{actor.stuntDoubles}</span>
                  </div>
                ) : null}

                {/* Stunt Specialty */}
                {actor.stuntSpecialty ? (
                  <p className="mt-2 text-[11px] text-zinc-300 font-tech leading-relaxed line-clamp-2">
                    {actor.stuntSpecialty}
                  </p>
                ) : null}
              </div>

              {/* Key Productions Badges */}
              <div>
                <div className="text-[9px] font-mono-tech text-zinc-500 uppercase tracking-wider mb-1.5 font-bold">
                  Films :
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {actor.productions.slice(0, 3).map((prod, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-1.5 py-0.5 bg-[#1a1a24] border border-zinc-800 text-[10px] font-mono-tech text-zinc-300 truncate max-w-full"
                      title={prod}
                    >
                      {prod}
                    </span>
                  ))}
                </div>

                {/* Action Bar */}
                <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono-tech text-[#FFE500] group-hover:underline flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>Fiche détaillée</span>
                  </span>

                  <a
                    href={actor.imdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-1 bg-[#f5c518]/15 hover:bg-[#f5c518] text-[#f5c518] hover:text-black border border-[#f5c518]/40 text-[10px] font-mono-tech font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>IMDb</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Border Accent */}
            <div className="h-[2px] w-full bg-zinc-800 group-hover:bg-[#FFE500] transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
};
