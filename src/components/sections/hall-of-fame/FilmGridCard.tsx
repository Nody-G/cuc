'use client';

import React from 'react';
import Image from 'next/image';
import { FilmCredit } from '@/types';
import { ImdbLogo, AllocineLogo, YouTubeLogo } from '@/components/ui/BrandLogos';
import { ExternalLink, Film, Info } from 'lucide-react';

interface FilmGridCardProps {
  movie: FilmCredit;
  onSelectMovie: (movie: FilmCredit) => void;
}

export const FilmGridCard: React.FC<FilmGridCardProps> = ({
  movie,
  onSelectMovie,
}) => {
  return (
    <div
      onClick={() => onSelectMovie(movie)}
      className="group bg-[#0e0e12] border border-zinc-800 hover:border-[#FFE500]/70 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
    >
      {/* Poster Image Container */}
      <div className="relative h-64 w-full overflow-hidden bg-zinc-900">
        <Image
          src={movie.image}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover object-center brightness-85 group-hover:brightness-95 group-hover:scale-105 transition-all duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e12] via-black/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <span className="bg-black/85 backdrop-blur-xs border border-white/20 text-[10px] font-mono-tech text-[#FFE500] px-2 py-0.5 font-bold">
            {movie.tag}
          </span>
        </div>
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-[#FFE500] text-black text-[10px] font-mono-tech px-2 py-0.5 font-bold">
            {movie.year}
          </span>
        </div>

        {/* HOVER ACTION BAR (DESKTOP QUICK ACCESS MULTI-LINK) */}
        <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <div className="text-[10px] font-mono-tech text-[#FFE500] uppercase tracking-wider font-bold mb-3 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" />
            <span>RÉFÉRENCES PROFESSIONNELLES</span>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-[210px]">
            {/* IMDb Pro Link */}
            <a
              href={movie.imdbUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between px-3 py-1.5 bg-[#f5c518] hover:bg-[#ffe500] text-black text-xs font-bold font-mono-tech transition-transform hover:scale-102 shadow-md"
              title={`Voir la fiche IMDb officielle de ${movie.title}`}
            >
              <span className="flex items-center gap-2">
                <ImdbLogo className="h-4 w-auto shrink-0" />
                <span className="text-[11px]">Fiche &amp; Stunt Team</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>

            {/* AlloCiné Link */}
            <a
              href={movie.allocineUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between px-3 py-1.5 bg-[#1f1f26] hover:bg-[#2c2c36] text-[#fecc00] border border-[#fecc00]/40 text-xs font-mono-tech transition-transform hover:scale-102"
              title={`Voir la fiche AlloCiné de ${movie.title}`}
            >
              <span className="flex items-center gap-2">
                <AllocineLogo className="h-4 w-auto shrink-0" />
                <span className="text-[11px]">Fiche France</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>

            {/* Official Trailer Link */}
            <a
              href={movie.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-mono-tech transition-transform hover:scale-102"
              title={`Regarder la bande-annonce de ${movie.title}`}
            >
              <span className="flex items-center gap-2">
                <YouTubeLogo className="w-4 h-4 shrink-0" variant="color" />
                <span className="text-[11px]">Trailer HD</span>
              </span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>

          <span className="text-[10px] text-zinc-400 font-tech mt-3 flex items-center gap-1">
            <Info className="w-3 h-3 text-[#00e5ff]" />
            <span>Cliquez pour le dossier complet</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] font-mono-tech text-zinc-500 uppercase mb-1">
            {movie.director || movie.category}
          </div>
          <h4 className="text-xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors leading-tight mb-2">
            {movie.title}
          </h4>
          <p className="text-xs text-zinc-400 font-tech leading-relaxed mb-4 line-clamp-3">
            {movie.stuntRoles}
          </p>
        </div>

        <div>
          {movie.doubledActors && movie.doubledActors.length > 0 && (
            <div className="pt-3 border-t border-zinc-800/80 text-[11px] font-mono-tech text-zinc-300 mb-3">
              <span className="text-[#FFE500] block text-[10px] uppercase font-bold">
                Cascades &amp; Doublures :
              </span>
              <span className="text-zinc-400 line-clamp-1">{movie.doubledActors.join(', ')}</span>
            </div>
          )}

          {/* Quick-Action Multi-Links Footer */}
          <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-1.5">
            <a
              href={movie.imdbUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 py-1 px-1.5 bg-[#f5c518]/15 hover:bg-[#f5c518] text-[#f5c518] hover:text-black border border-[#f5c518]/30 text-[10px] font-mono-tech font-bold flex items-center justify-center gap-1.5 transition-colors rounded-xs"
              title="IMDb"
            >
              <ImdbLogo className="h-3 w-auto" />
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <a
              href={movie.allocineUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 py-1 px-1.5 bg-[#fecc00]/10 hover:bg-[#fecc00] text-[#fecc00] hover:text-black border border-[#fecc00]/30 text-[10px] font-mono-tech flex items-center justify-center gap-1.5 transition-colors rounded-xs"
              title="AlloCiné"
            >
              <AllocineLogo className="h-3 w-auto" />
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <a
              href={movie.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="py-1 px-2 bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-[10px] font-mono-tech flex items-center justify-center gap-1 transition-colors rounded-xs"
              title="Bande-Annonce HD"
            >
              <YouTubeLogo className="w-3.5 h-3.5" variant="color" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="h-[2px] w-full bg-zinc-800 group-hover:bg-[#FFE500] transition-colors" />
    </div>
  );
};
