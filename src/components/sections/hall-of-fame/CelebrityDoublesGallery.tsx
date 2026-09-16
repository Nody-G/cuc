'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { DOUBLED_CELEBRITIES } from '@/data/filmography';
import { DoubledCelebrity } from '@/types';
import { ImdbLogo } from '@/components/ui/BrandLogos';
import { UserCheck, ExternalLink, ShieldCheck, Info } from 'lucide-react';

interface CelebrityDoublesGalleryProps {
  onSelectCelebrity: (celebrity: DoubledCelebrity) => void;
}

export const CelebrityDoublesGallery: React.FC<CelebrityDoublesGalleryProps> = ({
  onSelectCelebrity,
}) => {
  const [celebrityFilter, setCelebrityFilter] = useState<'all' | 'fr' | 'intl'>('all');

  // Acteurs doublés relevant du cinéma international / hollywoodien.
  // Cette liste est l'unique source de vérité : le filtre « fr » est son
  // complément exact, ce qui garantit des compteurs cohérents et sans doublon.
  const INTERNATIONAL_CELEBRITY_IDS = ['keanu-reeves', 'kevin-costner', 'omar-sy'];

  const isInternational = (id: string) => INTERNATIONAL_CELEBRITY_IDS.includes(id);

  const filteredCelebrities = DOUBLED_CELEBRITIES.filter((c) => {
    if (celebrityFilter === 'all') return true;
    if (celebrityFilter === 'intl') return isInternational(c.id);
    if (celebrityFilter === 'fr') return !isInternational(c.id);
    return true;
  });

  const internationalCount = DOUBLED_CELEBRITIES.filter((c) => isInternational(c.id)).length;
  const frenchCount = DOUBLED_CELEBRITIES.length - internationalCount;

  return (
    <div className="mb-20 bg-[#0c0c10] border-2 border-zinc-800 p-6 sm:p-8 relative shadow-2xl">

      {/* Section Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-5 h-5 text-[#FFE500]" />
            <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
              DOUBLURES DU 7E ART // CASCADEURS CUC
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-display uppercase tracking-tight text-white">
            LES ACTEURS ET COMÉDIENS DOUBLÉS
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 font-tech mt-1 max-w-2xl">
            Nos formateurs et cascadeurs professionnels doublent régulièrement les figures majeures
            du cinéma français et international sur des scènes d'action physique extrême.
          </p>
        </div>

        {/* Celebrity Filters */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <button
            onClick={() => setCelebrityFilter('all')}
            className={`px-3 py-1.5 text-xs font-mono-tech uppercase border transition-all cursor-pointer ${celebrityFilter === 'all'
              ? 'bg-[#FFE500] text-black border-[#FFE500] font-bold shadow-[0_0_10px_rgba(255,229,0,0.3)]'
              : 'bg-[#141419] text-zinc-300 border-zinc-800 hover:border-zinc-600'
              }`}
          >
            Toutes les Stars ({DOUBLED_CELEBRITIES.length})
          </button>
          <button
            onClick={() => setCelebrityFilter('fr')}
            className={`px-3 py-1.5 text-xs font-mono-tech uppercase border transition-all cursor-pointer ${celebrityFilter === 'fr'
              ? 'bg-[#FFE500] text-black border-[#FFE500] font-bold shadow-[0_0_10px_rgba(255,229,0,0.3)]'
              : 'bg-[#141419] text-zinc-300 border-zinc-800 hover:border-zinc-600'
              }`}
          >
            Cinéma Français ({frenchCount})
          </button>
          <button
            onClick={() => setCelebrityFilter('intl')}
            className={`px-3 py-1.5 text-xs font-mono-tech uppercase border transition-all cursor-pointer ${celebrityFilter === 'intl'
              ? 'bg-[#FFE500] text-black border-[#FFE500] font-bold shadow-[0_0_10px_rgba(255,229,0,0.3)]'
              : 'bg-[#141419] text-zinc-300 border-zinc-800 hover:border-zinc-600'
              }`}
          >
            Hollywood & International ({internationalCount})
          </button>
        </div>
      </div>

      {/* Celebrities Grid with Real Portraits & Rich Tactical Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8">
        {filteredCelebrities.map((actor) => (
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

              {/* Highlight Tag */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-black/90 backdrop-blur-xs border border-white/20 text-[10px] font-mono-tech text-[#FFE500] px-2.5 py-0.5 font-bold uppercase">
                  {actor.highlightTag}
                </span>
              </div>

              {/* IMDb Direct Link */}
              <a
                href={actor.imdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="absolute top-3 right-3 z-10 px-2 py-1 bg-[#f5c518] hover:bg-[#ffe500] text-black font-black text-[10px] font-mono-tech rounded-xs shadow-md flex items-center gap-1.5 transition-colors"
                title={`Voir la filmographie IMDb de ${actor.name}`}
              >
                <ImdbLogo className="h-3 w-auto" />
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Body Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-[10px] font-mono-tech text-[#00e5ff] uppercase font-bold tracking-wider mb-1">
                  {actor.roleType}
                </div>
                <h4 className="text-xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                  {actor.name}
                </h4>

                {/* Stunt Specialty */}
                <div className="mt-3 bg-[#181822] border border-zinc-800/80 p-2.5">
                  <div className="text-[10px] font-mono-tech text-[#FFE500] uppercase font-bold flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3 h-3 text-[#FFE500]" />
                    <span>Cascades Exécutées :</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-tech leading-relaxed line-clamp-3">
                    {actor.stuntSpecialty}
                  </p>
                </div>

                {/* Stunt Double Reference */}
                <div className="mt-2 text-[10px] font-mono-tech text-zinc-400">
                  <span className="text-zinc-500 uppercase">Doublure CUC : </span>
                  <span className="text-white font-bold">{actor.stuntDoubles}</span>
                </div>
              </div>

              {/* Key Productions Badges */}
              <div>
                <div className="text-[9px] font-mono-tech text-zinc-500 uppercase tracking-wider mb-1.5 font-bold">
                  Productions Clés :
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
                    <span>Profil Pro</span>
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
