'use client';

import React from 'react';
import Image from 'next/image';
import { FilmCredit } from '@/types';
import { ImdbLogo, AllocineLogo, YouTubeLogo } from '@/components/ui/BrandLogos';
import { X, ShieldCheck, UserCheck, Layers, ExternalLink, Sparkles } from 'lucide-react';

interface FilmDetailsModalProps {
  movie: FilmCredit | null;
  onClose: () => void;
}

export const FilmDetailsModal: React.FC<FilmDetailsModalProps> = ({
  movie,
  onClose,
}) => {
  if (!movie) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0e0e12] border-2 border-[#FFE500] w-full max-w-3xl overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Modal Header */}
        <div className="bg-[#141419] border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFE500] animate-pulse" />
            <span className="text-xs font-mono-tech text-[#FFE500] font-bold tracking-wider uppercase">
              DOSSIER PRODUCTION // TOURNAGE &amp; RÉFÉRENCES CUC
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Fermer le dossier"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Film Poster */}
            <div className="md:col-span-5 relative h-72 md:h-full min-h-[300px] border border-zinc-800 bg-zinc-900 overflow-hidden">
              <Image
                src={movie.image}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute top-3 left-3">
                <span className="bg-[#FFE500] text-black text-xs font-mono-tech font-bold px-2 py-0.5">
                  {movie.year}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <span className="bg-black/90 backdrop-blur-xs border border-white/20 text-xs font-mono-tech text-[#FFE500] px-3 py-1 font-bold inline-block">
                  {movie.tag}
                </span>
              </div>
            </div>

            {/* Right: Detailed Dossier */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="text-xs font-mono-tech text-[#00e5ff] uppercase font-bold tracking-wider">
                  {movie.category} • {movie.director ? `Réalisé par ${movie.director}` : 'Production Officielle'}
                </div>
                <h3 className="text-3xl font-display uppercase tracking-tight text-white mt-1">
                  {movie.title}
                </h3>
              </div>

              {/* CUC Real Stunt Mission */}
              <div className="bg-[#141419] border border-zinc-800 p-4">
                <div className="flex items-center gap-2 text-xs font-mono-tech text-[#FFE500] font-bold uppercase mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#FFE500]" />
                  <span>MISSION CASCADES &amp; RÔLE OPÉRATIONNEL CUC</span>
                </div>
                <p className="text-sm text-zinc-300 font-tech leading-relaxed">
                  {movie.stuntRoles}
                </p>
              </div>

              {/* Doubled Actors */}
              {movie.doubledActors && movie.doubledActors.length > 0 && (
                <div className="bg-[#141419] border border-zinc-800 p-4">
                  <div className="flex items-center gap-2 text-xs font-mono-tech text-[#FFE500] font-bold uppercase mb-2">
                    <UserCheck className="w-4 h-4 text-[#FFE500]" />
                    <span>DOUBLURES CÉLÉBRITÉS &amp; CASCADEURS ASSOCIÉS</span>
                  </div>
                  <div className="text-xs text-zinc-300 font-tech flex flex-wrap gap-2">
                    {movie.doubledActors.map((actor, idx) => (
                      <span
                        key={idx}
                        className="bg-black/60 border border-zinc-700 px-2 py-1 text-zinc-200"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-Link Professional Hub */}
              <div className="pt-2">
                <div className="text-xs font-mono-tech text-zinc-400 uppercase tracking-wider font-bold mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#00e5ff]" />
                  <span>LIENS OFFICIELS DE L&apos;INDUSTRIE CINÉMA (ZÉRO LIEN MORT)</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {/* IMDb Link */}
                  <a
                    href={movie.imdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn flex items-center justify-between p-3 bg-[#f5c518] hover:bg-[#ffe500] text-black transition-all shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <ImdbLogo className="h-6 w-auto shadow-xs" />
                      <div>
                        <div className="text-xs font-mono-tech font-bold uppercase">
                          Fiche Officielle IMDb (Industry Benchmark)
                        </div>
                        <div className="text-[11px] text-zinc-900 font-tech">
                          Crédits complets, département Stunts &amp; Fiche Équipe
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </a>

                  {/* AlloCiné Link */}
                  <a
                    href={movie.allocineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn flex items-center justify-between p-3 bg-[#181820] hover:bg-[#22222d] border border-[#fecc00]/50 text-white transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <AllocineLogo className="h-6 w-auto shadow-xs" />
                      <div>
                        <div className="text-xs font-mono-tech font-bold text-[#fecc00] uppercase">
                          Fiche Officielle AlloCiné (France)
                        </div>
                        <div className="text-[11px] text-zinc-400 font-tech">
                          Synopsis français, critiques presse, box-office &amp; casting
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#fecc00] group-hover/btn:translate-x-1 transition-transform" />
                  </a>

                  {/* Official Trailer Link */}
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/btn flex items-center justify-between p-3 bg-[#181820] hover:bg-red-950/40 border border-red-600/50 text-white transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <YouTubeLogo className="w-6 h-6 shrink-0" variant="color" />
                      <div>
                        <div className="text-xs font-mono-tech font-bold text-red-400 uppercase">
                          Bande-Annonce Officielle
                        </div>
                        <div className="text-[11px] text-zinc-400 font-tech">
                          Visionner le trailer d&apos;action en haute définition
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-red-400 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#141419] border-t border-zinc-800 px-6 py-3 flex items-center justify-between text-xs font-mono-tech text-zinc-400">
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE500]" />
            <span>CERTIFIÉ CAMPUS UNIVERS CASCADES // LE CATEAU-CAMBRÉSIS</span>
          </span>
          <button
            onClick={onClose}
            className="text-[#FFE500] hover:underline uppercase font-bold cursor-pointer"
          >
            Fermer (Échap)
          </button>
        </div>
      </div>
    </div>
  );
};
