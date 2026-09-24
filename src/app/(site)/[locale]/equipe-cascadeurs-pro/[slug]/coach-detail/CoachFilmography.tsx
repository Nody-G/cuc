'use client';

import React from 'react';
import { ArrowUpDown, Film } from 'lucide-react';
import type { useTranslations } from 'next-intl';
import type { FilmCredit, Instructor } from '@/types';
import { type CoachFilmRole, type FilmSort, normalizeTitleKey } from '@/lib/coach-films';
import { cucMicro } from '@/lib/preview/cuc-micro';
import { FilmCard, type FilmCardRole } from '@/components/sections/films/FilmCard';

export interface CoachFilmographyProps {
    member: Instructor;
    relatedFilms: FilmCredit[];
    sortedFilms: FilmCredit[];
    filmSort: FilmSort;
    onFilmSortChange: (sort: FilmSort) => void;
    /** Résolution du rôle du coach sur un film (dépend du membre et de ses crédits). */
    getFilmRole: (film: FilmCredit) => CoachFilmRole;
    /** Crédits mis en avant (ordre du cockpit). */
    featuredOrder: Map<string, number>;
    tt: ReturnType<typeof useTranslations<'team'>>;
    tf: ReturnType<typeof useTranslations<'films'>>;
    onSelectFilm: (film: FilmCredit) => void;
}

/**
 * Filmographie du coach : tri (mise en avant d'abord, puis critère choisi),
 * affiches cliquables et rôle précis sur chaque production.
 *
 * Les jaquettes sont rendues par [`FilmCard`](src/components/sections/films/FilmCard.tsx),
 * la présentation canonique de toute la vitrine : affiche 2/3, badge d'année,
 * bloc de rôle puis titre, pied réalisateur — exactement ce que reprennent la
 * vitrine TOURNAGE et l'accueil (bloc CUC via `film-role-block.ts`). Aucun
 * libellé d'appel (« Fiche film », « Détails »).
 */
export const CoachFilmography: React.FC<CoachFilmographyProps> = ({
    member,
    relatedFilms,
    sortedFilms,
    filmSort,
    onFilmSortChange,
    getFilmRole,
    featuredOrder,
    tt,
    tf,
    onSelectFilm,
}) => {
    /**
     * Le normaliseur de rôles (`credit-role.ts`) renvoie des libellés canoniques
     * FRANÇAIS (« Coordinateur des cascades », « Doublure », « Cascadeur ») : on les
     * traduit ici, à l'affichage, sans toucher à la logique métier.
     */
    const roleLabels: Record<string, string> = {
        'Coordinateur des cascades': tt('roleCoordination'),
        Doublure: tt('roleDouble'),
        Cascadeur: tt('roleStunt'),
    };
    const translateRole = (role: string) =>
        role
            .split('·')
            .map((part) => roleLabels[part.trim()] ?? part.trim())
            .join(' · ');

    return (
        <div className="mb-20 pt-12 border-t border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-xs font-mono-tech text-[#FFE500] uppercase font-bold mb-1">
                        <Film className="w-4 h-4" />
                        <span {...cucMicro('team.filmographyTag')}>{tt('filmographyTag')}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white">
                        Cascades & Tournages de {member.name}
                    </h2>
                    <p className="text-xs font-tech text-zinc-400 mt-1">
                        <span {...cucMicro('team.filmographyHint')}>{tt('filmographyHint')}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono-tech text-zinc-400">
                        {relatedFilms.length > 1
                            ? tt('listedMany', { count: relatedFilms.length })
                            : tt('listedOne', { count: relatedFilms.length })}
                    </span>
                    <label className="flex items-center gap-1.5 text-[11px] font-mono-tech text-zinc-400">
                        <ArrowUpDown className="w-3.5 h-3.5 text-[#FFE500]" />
                        <select
                            value={filmSort}
                            onChange={(e) => onFilmSortChange(e.target.value as FilmSort)}
                            className="bg-black/60 border border-zinc-700 text-zinc-200 text-[11px] font-mono-tech px-2 py-1 focus:outline-none focus:border-[#FFE500]"
                            aria-label={tt('coachSortFilmographyAria')}
                        >
                            <option value="year-desc">{tf('sortYearDesc')}</option>
                            <option value="year-asc">{tf('sortYearAsc')}</option>
                            <option value="title-asc">{tf('sortTitleAsc')}</option>
                            <option value="title-desc">{tf('sortTitleDesc')}</option>
                        </select>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {sortedFilms.map((film) => {
                    const { role, isCoord, isDoublure } = getFilmRole(film);
                    const isFeatured = featuredOrder.has(normalizeTitleKey(film.title));

                    const roleBlock: FilmCardRole = {
                        label: tt('roleOnProduction'),
                        value: translateRole(role),
                        variant: isCoord ? 'coord' : isDoublure ? 'doublure' : 'other',
                        micro: cucMicro('team.roleOnProduction'),
                    };

                    return (
                        <FilmCard
                            key={film.id}
                            film={film}
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                            featured={
                                isFeatured
                                    ? { label: tt('featuredBadge'), micro: cucMicro('team.featuredBadge') }
                                    : null
                            }
                            role={roleBlock}
                            footer={
                                film.director
                                    ? tt('directorShort', { name: film.director })
                                    : tt('productionFallback')
                            }
                            onOpen={() => onSelectFilm(film)}
                        />
                    );
                })}
            </div>
        </div>
    );
};
