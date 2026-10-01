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
 * la présentation canonique partagée par toute la vitrine. Seul le bloc de rôle
 * est spécifique à la fiche coach — les libellés d'appel (« Fiche film »,
 * « Détails ») ont été retirés.
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
    type ParticipationFilter = 'all' | 'coord' | 'doublure' | 'cascadeur';
    const [participationFilter, setParticipationFilter] = React.useState<ParticipationFilter>('all');

    /** Décompte dynamique des rôles pour ce coach. */
    const counts = React.useMemo(() => {
        let coord = 0;
        let doublure = 0;
        let cascadeur = 0;
        for (const film of relatedFilms) {
            const r = getFilmRole(film);
            if (r.isCoord) coord++;
            if (r.isDoublure) doublure++;
            if (r.isCascadeur) cascadeur++;
        }
        return { all: relatedFilms.length, coord, doublure, cascadeur };
    }, [relatedFilms, getFilmRole]);

    /** Options de filtre visibles (uniquement si au moins 1 film dans la catégorie). */
    const filterOptions: Array<{ id: ParticipationFilter; label: string; count: number }> = React.useMemo(() => {
        const opts: Array<{ id: ParticipationFilter; label: string; count: number }> = [
            { id: 'all', label: 'Toutes les participations', count: counts.all },
        ];
        if (counts.coord > 0) {
            opts.push({ id: 'coord', label: 'Coordination des cascades', count: counts.coord });
        }
        if (counts.doublure > 0) {
            opts.push({ id: 'doublure', label: 'Doublures', count: counts.doublure });
        }
        if (counts.cascadeur > 0) {
            opts.push({ id: 'cascadeur', label: 'Cascades & Combats', count: counts.cascadeur });
        }
        return opts;
    }, [counts]);

    /** Liste filtrée selon la participation active. */
    const displayedFilms = React.useMemo(() => {
        if (participationFilter === 'all') return sortedFilms;
        return sortedFilms.filter((film) => {
            const r = getFilmRole(film);
            if (participationFilter === 'coord') return r.isCoord;
            if (participationFilter === 'doublure') return r.isDoublure;
            if (participationFilter === 'cascadeur') return r.isCascadeur;
            return true;
        });
    }, [sortedFilms, participationFilter, getFilmRole]);

    return (
        <div className="mb-20 pt-12 border-t border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
                        {displayedFilms.length !== relatedFilms.length
                            ? `${displayedFilms.length} / ${relatedFilms.length} films`
                            : relatedFilms.length > 1
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

            {/* Système de tri / filtrage par type de participation */}
            {filterOptions.length > 1 && (
                <div className="flex flex-wrap items-center gap-2 mb-8">
                    {filterOptions.map((opt) => {
                        const isActive = participationFilter === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setParticipationFilter(opt.id)}
                                className={`px-3 py-1.5 text-xs font-mono-tech uppercase tracking-wider transition-all flex items-center gap-2 border ${
                                    isActive
                                        ? 'bg-[#FFE500] text-black font-bold border-[#FFE500] shadow-sm'
                                        : 'bg-[#121218] text-zinc-300 hover:text-white hover:bg-zinc-800 border-zinc-700'
                                }`}
                            >
                                <span>{opt.label}</span>
                                <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] ${
                                        isActive
                                            ? 'bg-black/20 text-black font-bold'
                                            : 'bg-zinc-800 text-zinc-400'
                                    }`}
                                >
                                    {opt.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {displayedFilms.length === 0 ? (
                <div className="p-8 text-center bg-[#121218] border border-zinc-800 text-zinc-400 text-xs font-mono-tech">
                    Aucune production trouvée pour ce filtre.
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                    {displayedFilms.map((film) => {
                        const { role, isCoord, isDoublure } = getFilmRole(film);
                        const isFeatured = featuredOrder.has(normalizeTitleKey(film.title));

                        const roleBlock: FilmCardRole = {
                            label: tt('roleOnProduction'),
                            value: role,
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
            )}
        </div>
    );
};
