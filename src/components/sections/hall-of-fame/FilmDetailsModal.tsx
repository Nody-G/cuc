'use client';

import React from 'react';

import { Clapperboard, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cucEntity } from '@/lib/preview/cuc-entity';
import { cucMicro } from '@/lib/preview/cuc-micro';
import { entityRef } from '@/lib/preview/entity-ref';
import { resolveEntityOverride } from '@/lib/preview/use-preview-entity';
import type { FilmCredit } from '@/types';
import { FilmDoublesList } from './film-details/FilmDoublesList';
import { FilmExternalLinks } from './film-details/FilmExternalLinks';
import { FilmDescription, FilmIdentityBlock } from './film-details/FilmIdentityBlock';
import { FilmPoster } from './film-details/FilmPoster';
import { FilmTeamList } from './film-details/FilmTeamList';
import { useFilmDetailsTeam } from './film-details/useFilmDetailsTeam';

interface FilmDetailsModalProps {
  movie: FilmCredit | null;
  onClose: () => void;
}

/**
 * Descriptif d'un film — **façade de composition**.
 *
 * Logique et blocs vivent dans `film-details/` : rapprochement film ↔ équipe et
 * overlays (`useFilmDetailsTeam`), résolution du rôle (`role-resolution.ts`) et
 * présentation (`FilmPoster`, `FilmIdentityBlock`, `FilmDoublesList`,
 * `FilmTeamList`, `FilmExternalLinks`).
 */
export const FilmDetailsModal: React.FC<FilmDetailsModalProps> = ({ movie, onClose }) => {
  const t = useTranslations('teamProduction');
  const { involvedTeamMembers, entityOverrides } = useFilmDetailsTeam(movie);

  if (!movie) return null;

  const filmAttr = (field: 'title' | 'year') => cucEntity('site_films', movie.id, field);
  const filmValue = (field: 'title' | 'year', base: string) =>
    resolveEntityOverride(entityOverrides, entityRef('site_films', movie.id, field)) ?? base;

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
              <span {...cucMicro('teamProduction.filmModal.title')}>
                {t('filmModal.title')}
              </span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-xs transition-colors cursor-pointer"
            aria-label={t('filmModal.closeAria')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
            <FilmPoster movie={movie} filmAttr={filmAttr} filmValue={filmValue} />

            <div className="sm:col-span-7 space-y-4">
              <FilmIdentityBlock movie={movie} filmAttr={filmAttr} filmValue={filmValue} />

              <FilmDescription movie={movie} />

              <FilmDoublesList movie={movie} />

              <FilmTeamList
                movie={movie}
                members={involvedTeamMembers}
                onNavigate={onClose}
              />

              <FilmExternalLinks movie={movie} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#141419] border-t border-zinc-800 px-5 py-2.5 flex items-center justify-end text-xs font-mono-tech">
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white uppercase font-bold cursor-pointer transition-colors"
          >
            <span {...cucMicro('teamProduction.filmModal.close')}>
              {t('filmModal.close')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
