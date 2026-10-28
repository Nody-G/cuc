'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { DoubledCelebrity, FilmCredit } from '@/types';
import { X, Clapperboard } from 'lucide-react';
import { ImdbLogo, LogoLink } from '@/components/ui/BrandLogos';
import { cucMicro } from '@/lib/preview/cuc-micro';
import { resolveDoubledBy, type TeamNameRef } from '@/lib/celebrity-double';
import { creditTitleKey } from '@/lib/credit-title';
import {
  CelebrityStuntDoubles,
  type CelebrityFilmItem,
} from './celebrity-details/CelebrityStuntDoubles';

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
   * nom devient un lien vers sa fiche coach, avec photo avatar et rôle.
   */
  const doubledBy = useMemo(
    () => resolveDoubledBy(celebrity?.stuntDoubles ?? '', teamMembers),
    [celebrity?.stuntDoubles, teamMembers]
  );

  /** Vérifie si un film de la production correspond à un film coordonné par Lucas */
  const findMatchingLucasFilm = React.useCallback((prodName: string): FilmCredit | undefined => {
    if (!coordinatedFilms || coordinatedFilms.length === 0) return undefined;
    const cleanProd = prodName.replace(/\s*\([^)]*\)\s*$/, '').trim();
    const key = creditTitleKey(cleanProd || prodName);
    return coordinatedFilms.find((f) => creditTitleKey(f.title) === key);
  }, [coordinatedFilms]);

  /**
   * Liste unifiée et dédoublonnée des productions associées au comédien :
   * combine les productions listées sur la fiche et les films coordonnés par le CUC.
   * Chaque film n'apparaît qu'une seule fois. S'il fait partie du catalogue CUC, il est interactif.
   */
  const unifiedFilms = useMemo<CelebrityFilmItem[]>(() => {
    if (!celebrity) return [];
    const items: CelebrityFilmItem[] = [];
    const seen = new Set<string>();

    for (const prod of celebrity.productions || []) {
      const match = findMatchingLucasFilm(prod);
      const title = match?.title || prod;
      const key = creditTitleKey(title);
      if (!seen.has(key)) {
        seen.add(key);
        items.push({
          key,
          title,
          year: match?.year,
          cucFilm: match,
        });
      }
    }

    for (const film of coordinatedFilms) {
      if (
        film.doubledActors &&
        film.doubledActors.some((d) => d.toLowerCase().includes(celebrity.name.toLowerCase()))
      ) {
        const key = creditTitleKey(film.title);
        if (!seen.has(key)) {
          seen.add(key);
          items.push({
            key,
            title: film.title,
            year: film.year,
            cucFilm: film,
          });
        }
      }
    }

    return items;
  }, [celebrity, coordinatedFilms, findMatchingLucasFilm]);

  const [hasError, setHasError] = React.useState(false);

  if (!celebrity) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#0e0e12] border border-zinc-800 hover:border-[#FFE500]/50 transition-colors w-full max-w-xl sm:max-w-2xl overflow-hidden relative shadow-2xl max-h-[90vh] flex flex-col"
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
            {/* Photo — ratio 2/3 harmonisé avec les portraits verticaux officiels */}
            <div className="sm:col-span-5 relative aspect-[2/3] w-full max-w-xs mx-auto sm:max-w-none border border-zinc-800 bg-black overflow-hidden">
              <Image
                key={celebrity.photo}
                src={hasError ? '/images/actors/actor-placeholder.svg' : (celebrity.photo || '/images/actors/actor-placeholder.svg')}
                alt={celebrity.name}
                fill
                sizes="(max-width: 640px) 100vw, 250px"
                onError={() => setHasError(true)}
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

              {/* Cascadeurs CUC ayant doublé le comédien (avec photo avatar) & tournages associés dédoublonnés */}
              {(celebrity.stuntDoubles || unifiedFilms.length > 0) ? (
                <CelebrityStuntDoubles
                  doubledBy={doubledBy}
                  stuntDoublesRaw={celebrity.stuntDoubles}
                  films={unifiedFilms}
                  onSelectFilm={onSelectFilm}
                  onClose={onClose}
                />
              ) : null}

              {/* IMDb — logo seul */}
              {celebrity.imdbUrl && (
                <div className="pt-2">
                  <LogoLink
                    href={celebrity.imdbUrl}
                    label={t('celebrityModal.imdbCta')}
                    micro="teamProduction.celebrityModal.imdbCta"
                  >
                    <ImdbLogo className="h-6 w-auto" />
                  </LogoLink>
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
