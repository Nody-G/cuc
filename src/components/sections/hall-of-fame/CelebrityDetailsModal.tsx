'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { DoubledCelebrity, FilmCredit } from '@/types';
import { X, Clapperboard, ExternalLink } from 'lucide-react';
import { ImdbLogo } from '@/components/ui/BrandLogos';
import { cucMicro } from '@/lib/preview/cuc-micro';
import { resolveDoubledBy, type TeamNameRef } from '@/lib/celebrity-double';
import { creditTitleKey } from '@/lib/credit-title';

interface CelebrityDetailsModalProps {
  celebrity: DoubledCelebrity | null;
  /** Référentiel de l'équipe CUC, pour rendre le nom du doubleur cliquable. */
  teamMembers: TeamNameRef[];
  onClose: () => void;
  /** Ouvre la fiche d'un film coordonné par Lucas Dollfus */
  onSelectFilm?: (film: FilmCredit) => void;
  /** Liste des films coordonnés par Lucas */
  coordinatedFilms?: FilmCredit[];
}

export const CelebrityDetailsModal: React.FC<CelebrityDetailsModalProps> = ({
  celebrity,
  teamMembers,
  onClose,
  onSelectFilm,
  coordinatedFilms = [],
}) => {
  const t = useTranslations('teamProduction');

  /**
   * Découpe « Doublé par X » et reconnaît l'éventuel membre de l'équipe : le
   * nom devient un lien vers sa fiche coach, comme sur les jaquettes de films.
   */
  const doubledBy = useMemo(
    () => resolveDoubledBy(celebrity?.stuntDoubles ?? '', teamMembers),
    [celebrity?.stuntDoubles, teamMembers]
  );

  /** Vérifie si un film de la production correspond à un film coordonné par Lucas */
  const findMatchingLucasFilm = (prodName: string): FilmCredit | undefined => {
    if (!coordinatedFilms || coordinatedFilms.length === 0) return undefined;
    const key = creditTitleKey(prodName);
    return coordinatedFilms.find((f) => creditTitleKey(f.title) === key);
  };

  if (!celebrity) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0e0e12] border border-zinc-800 hover:border-[#FFE500]/50 transition-colors w-full max-w-xl overflow-hidden relative shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#141419] border-b border-zinc-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-[#FFE500]" />
            <span className="text-xs font-mono-tech text-zinc-300 font-bold uppercase tracking-wider">
              <span {...cucMicro('teamProduction.celebrityModal.title')}>
                {t('celebrityModal.title')}
              </span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-xs transition-colors cursor-pointer"
            aria-label={t('celebrityModal.closeAria')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
            {/* Photo */}
            <div className="sm:col-span-5 relative h-64 w-full border border-zinc-800 bg-black overflow-hidden">
              <Image
                src={celebrity.photo}
                alt={celebrity.name}
                fill
                sizes="(max-width: 640px) 100vw, 250px"
                className="object-cover object-top"
              />
            </div>

            {/* Info */}
            <div className="sm:col-span-7 space-y-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-tight text-white">
                  {celebrity.name}
                </h3>
              </div>

              {/* Biographie originale du comédien */}
              {celebrity.bio ? (
                <p className="text-xs text-zinc-300 font-tech leading-relaxed">
                  {celebrity.bio}
                </p>
              ) : null}

              {/* Doublé par (coach du CUC) dans (nom du ou des films) */}
              {celebrity.stuntDoubles ? (
                <div className="p-3 bg-[#141419] border border-zinc-800/80 rounded-xs space-y-1.5">
                  <span className="text-[10px] font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider block">
                    DOUBLURE & TOURNAGES :
                  </span>
                  <div className="text-xs text-white font-mono-tech leading-relaxed">
                    {doubledBy.segments.length > 0 ? (
                      doubledBy.segments.map((seg, sIdx) => {
                        if (seg.type === 'member' && seg.member) {
                          return (
                            <Link
                              key={sIdx}
                              href={`/equipe-cascadeurs-pro/${seg.member.id}`}
                              onClick={onClose}
                              title={seg.member.name}
                              className="text-[#FFE500] font-bold underline decoration-dotted underline-offset-2 hover:text-white transition-colors"
                            >
                              {seg.text}
                            </Link>
                          );
                        }
                        return <span key={sIdx} className="text-zinc-200">{seg.text}</span>;
                      })
                    ) : (
                      <span>{doubledBy.name}</span>
                    )}
                    {celebrity.productions.length > 0 && (
                      <>
                        {' '}dans{' '}
                        {celebrity.productions.map((p, pIdx) => {
                          const matchingFilm = findMatchingLucasFilm(p);
                          return (
                            <React.Fragment key={pIdx}>
                              {pIdx > 0 && ', '}
                              {matchingFilm ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onSelectFilm?.(matchingFilm);
                                  }}
                                  className="text-[#FFE500] underline font-bold hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 group"
                                  title={`Voir la fiche du film « ${matchingFilm.title} » coordonné par Lucas Dollfus`}
                                >
                                  <span>{p}</span>
                                  <span className="text-[9px] bg-[#FFE500] text-black px-1 py-0.2 rounded-xs font-bold font-mono-tech group-hover:bg-white">
                                    CUC
                                  </span>
                                </button>
                              ) : (
                                <span className="text-zinc-300">{p}</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Scènes d'action */}
              {celebrity.stuntSpecialty ? (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono-tech text-zinc-400 uppercase font-bold block">
                    <span {...cucMicro('teamProduction.celebrityModal.scenesLabel')}>
                      {t('celebrityModal.scenesLabel')}
                    </span>
                  </span>
                  <p className="text-xs text-zinc-300 font-tech leading-relaxed">
                    {celebrity.stuntSpecialty}
                  </p>
                </div>
              ) : null}

              {/* Films / Productions */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono-tech text-zinc-500 uppercase font-bold block">
                  <span {...cucMicro('teamProduction.celebrityModal.filmsLabel')}>
                    {t('celebrityModal.filmsLabel')}
                  </span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {celebrity.productions.map((p, idx) => {
                    const matchingFilm = findMatchingLucasFilm(p);
                    if (matchingFilm) {
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectFilm?.(matchingFilm);
                          }}
                          className="px-2.5 py-1 bg-[#FFE500]/15 border border-[#FFE500]/60 text-xs font-mono-tech text-[#FFE500] font-bold hover:bg-[#FFE500] hover:text-black transition-all cursor-pointer flex items-center gap-1.5 rounded-xs"
                          title={`Voir la fiche du film « ${matchingFilm.title} » coordonné par Lucas Dollfus`}
                        >
                          <Clapperboard className="w-3 h-3 shrink-0" />
                          <span>{p}</span>
                        </button>
                      );
                    }
                    return (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#141419] border border-zinc-800 text-xs font-mono-tech text-zinc-300 rounded-xs"
                      >
                        {p}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* IMDb Button */}
              {celebrity.imdbUrl && (
                <div className="pt-2">
                  <a
                    href={celebrity.imdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#f5c518] hover:bg-[#ffe500] text-black font-bold font-mono-tech text-xs transition-colors"
                  >
                    <ImdbLogo className="h-3.5 w-auto" />
                    <span {...cucMicro('teamProduction.celebrityModal.imdbCta')}>
                      {t('celebrityModal.imdbCta')}
                    </span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#141419] border-t border-zinc-800 px-5 py-2.5 flex items-center justify-end text-xs font-mono-tech">
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white uppercase font-bold cursor-pointer transition-colors"
          >
            <span {...cucMicro('teamProduction.celebrityModal.close')}>
              {t('celebrityModal.close')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
