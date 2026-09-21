'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import Image from 'next/image';

import { FilmCredit, Instructor } from '@/types';
import { CUC_TEAM } from '@/data/team';
import { getTeam } from '@/lib/data/site-service';
import { normalizeRole } from '@/lib/credit-role';
import { ImdbLogo, AllocineLogo, YouTubeLogo } from '@/components/ui/BrandLogos';
import { X, Clapperboard, ExternalLink, ChevronRight, Film } from 'lucide-react';

interface FilmDetailsModalProps {
  movie: FilmCredit | null;
  onClose: () => void;
}

export const FilmDetailsModal: React.FC<FilmDetailsModalProps> = ({
  movie,
  onClose,
}) => {
  const [teamMembers, setTeamMembers] = React.useState<Instructor[]>(CUC_TEAM);

  React.useEffect(() => {
    getTeam().then(setTeamMembers);
  }, []);

  if (!movie) return null;

  const involvedIds = movie.cuc_team_involved || [];
  const involvedTeamMembers = teamMembers.filter((m) => involvedIds.includes(m.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0e0e12] border border-zinc-700 w-full max-w-2xl overflow-hidden relative shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#141419] border-b border-zinc-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-[#FFE500]" />
            <span className="text-xs font-mono-tech text-zinc-300 font-bold uppercase tracking-wider">
              Détails du Film
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-xs transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
            {/* Poster */}
            <div className="sm:col-span-5 relative h-64 sm:h-72 w-full border border-zinc-800 bg-zinc-900 overflow-hidden">
              {movie.image ? (
                <Image
                  src={movie.image}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 250px"
                  className="object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900 to-black">
                  <Film className="w-10 h-10 text-zinc-700" />
                  <span className="text-[10px] font-mono-tech uppercase tracking-wider text-zinc-600 px-4 text-center">
                    {movie.title}
                  </span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className="bg-[#FFE500] text-black text-[10px] font-mono-tech font-bold px-2 py-0.5">
                  {movie.year}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="sm:col-span-7 space-y-4">
              <div>
                <div className="text-[11px] font-mono-tech text-zinc-500 uppercase">
                  {movie.year}{movie.director ? ` • Réalisé par ${movie.director}` : ''}
                </div>
                <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-tight text-white mt-0.5">
                  {movie.title}
                </h3>
              </div>

              {/* Description factuelle de la fiche film */}
              {movie.description && (
                <p className="text-xs text-zinc-300 font-tech leading-relaxed">
                  {movie.description}
                </p>
              )}

              {/* Doublures */}
              {movie.doubledActors && movie.doubledActors.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono-tech text-zinc-500 uppercase font-bold block">
                    Doublures & comédiens :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {movie.doubledActors.map((actor, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#141419] border border-zinc-800 text-xs font-mono-tech text-zinc-300"
                      >
                        {actor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Équipe CUC */}
              {involvedTeamMembers.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono-tech text-zinc-500 uppercase font-bold block">
                    Équipe CUC :
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {involvedTeamMembers.map((member) => (
                      <Link
                        key={member.id}
                        href={`/equipe-cascadeurs-pro/${member.id}`}
                        onClick={onClose}
                        className="flex items-center gap-2.5 p-1.5 bg-[#141419] border border-zinc-800 hover:border-zinc-600 transition-colors"
                      >
                        <div className="relative w-7 h-7 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                          {member.avatarUrl ? (
                            <Image
                              src={member.avatarUrl}
                              alt={member.name}
                              fill
                              sizes="28px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-400">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-mono-tech text-white truncate font-bold">
                            {member.name}
                          </div>
                          {(() => {
                            const rawRole =
                              movie.cuc_team_roles?.[member.id] ||
                              member.metadata?.film_roles?.[movie.id] ||
                              (() => {
                                const matchingCredit = member.notableCredits?.find((c) =>
                                  c.toLowerCase().includes(movie.title.toLowerCase())
                                );
                                if (matchingCredit && matchingCredit.includes(' — ')) {
                                  return matchingCredit.split(' — ')[1].trim();
                                }
                                return member.role;
                              })();

                            // Rôle ramené à un libellé canonique lisible
                            // (Coordinateur des cascades · Doublure de X · Cascadeur · Parkour · Câblage).
                            const normalized = normalizeRole(rawRole);
                            const isCoord = normalized.roles.includes('Coordinateur des cascades');

                            return (
                              <div
                                className={`text-[10px] font-mono-tech truncate ${isCoord ? 'text-[#FFE500] font-semibold' : 'text-zinc-400'
                                  }`}
                                title={normalized.detail || normalized.label}
                              >
                                {normalized.label}
                              </div>
                            );
                          })()}
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Liens externes */}
              <div className="pt-2 flex flex-wrap gap-2">
                {movie.imdbUrl && (
                  <a
                    href={movie.imdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f5c518] hover:bg-[#ffe500] text-black font-bold font-mono-tech text-xs transition-colors"
                  >
                    <ImdbLogo className="h-3.5 w-auto" />
                    <span>IMDb</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}
                {movie.allocineUrl && (
                  <a
                    href={movie.allocineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141419] hover:bg-zinc-800 text-[#fecc00] border border-zinc-700 font-mono-tech text-xs transition-colors"
                  >
                    <AllocineLogo className="h-3.5 w-auto" />
                    <span>AlloCiné</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}
                {movie.trailerUrl && (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141419] hover:bg-zinc-800 text-red-400 border border-zinc-700 font-mono-tech text-xs transition-colors"
                  >
                    <YouTubeLogo className="w-3.5 h-3.5" variant="color" />
                    <span>Bande-annonce</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#141419] border-t border-zinc-800 px-5 py-2.5 flex items-center justify-end text-xs font-mono-tech">
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white uppercase font-bold cursor-pointer transition-colors"
          >
            Fermer
          </button>
        </div>
      </div >
    </div >
  );
};
