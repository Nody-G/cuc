'use client';

import React from 'react';
import Image from 'next/image';
import { Award, ArrowUpDown, Film, Maximize2, ShieldCheck, Users } from 'lucide-react';
import type { useTranslations } from 'next-intl';
import type { FilmCredit, Instructor } from '@/types';
import { type CoachFilmRole, type FilmSort, normalizeTitleKey } from './coach-films';
import { cucMicro } from '@/lib/preview/cuc-micro';

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedFilms.map((film) => {
                    const { role, isCoord, isDoublure } = getFilmRole(film);
                    const isFeatured = featuredOrder.has(normalizeTitleKey(film.title));

                    return (
                        <div
                            key={film.id}
                            onClick={() => onSelectFilm(film)}
                            className={`bg-[#0e0e14] border-2 transition-all flex flex-col justify-between group overflow-hidden cursor-pointer shadow-lg hover:shadow-[0_10px_30px_rgba(255,229,0,0.1)] ${isFeatured ? 'border-[#FFE500]/60 hover:border-[#FFE500]' : 'border-zinc-800 hover:border-[#FFE500]'}`}
                            title={`Cliquez pour voir les détails de ${film.title}`}
                        >
                            <div>
                                {/* Affiche du film */}
                                <div className="relative aspect-[2/3] w-full bg-black overflow-hidden">
                                    {film.image ? (
                                        <Image
                                            src={film.image}
                                            alt={film.title}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900 to-black">
                                            <Film className="w-10 h-10 text-zinc-700" />
                                            <span className="text-[10px] font-mono-tech uppercase tracking-wider text-zinc-600 px-4 text-center">
                                                {film.title}
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-transparent to-transparent opacity-90" />

                                    {/*
                    * Badge d'année en haut à GAUCHE : position canonique
                    * de la vitrine (`FilmPosterCard`) — la fiche coach
                    * aligne sa jaquette sur le showcase des films.
                    */}
                                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/85 backdrop-blur-xs text-[10px] font-mono-tech text-[#FFE500] border border-zinc-800 font-bold shadow-md">
                                        {film.year}
                                    </span>

                                    {/* Mise en avant (définie dans le cockpit) */}
                                    {isFeatured && (
                                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-[#FFE500] text-black text-[9px] font-mono-tech font-bold uppercase tracking-wider shadow-md">
                                            <span {...cucMicro('team.featuredBadge')}>{tt('featuredBadge')}</span>
                                        </span>
                                    )}

                                    {/* Hover action icon */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                        <span className="px-3 py-1.5 bg-[#FFE500] text-black font-mono-tech text-xs uppercase font-bold flex items-center gap-1.5 shadow-xl">
                                            <Maximize2 className="w-3.5 h-3.5" />
                                            <span {...cucMicro('team.filmCardHover')}>{tt('filmCardHover')}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Informations & Rôle spécifique */}
                                <div className="p-4 space-y-3">
                                    {/* RÔLE DU COACH SUR CE FILM */}
                                    <div>
                                        <span className="text-[9px] font-mono-tech text-zinc-500 uppercase block mb-1">
                                            <span {...cucMicro('team.roleOnProduction')}>{tt('roleOnProduction')}</span>
                                        </span>
                                        {isCoord ? (
                                            <div className="px-2.5 py-1 bg-[#FFE500]/15 border border-[#FFE500]/50 text-[#FFE500] text-[11px] font-mono-tech font-bold uppercase flex items-center gap-1.5 rounded-xs">
                                                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{translateRole(role)}</span>
                                            </div>
                                        ) : isDoublure ? (
                                            <div className="px-2.5 py-1 bg-sky-500/15 border border-sky-500/40 text-sky-300 text-[11px] font-mono-tech font-bold uppercase flex items-center gap-1.5 rounded-xs">
                                                <Users className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{translateRole(role)}</span>
                                            </div>
                                        ) : (
                                            <div className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-zinc-200 text-[11px] font-mono-tech font-semibold uppercase flex items-center gap-1.5 rounded-xs">
                                                <Award className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                                                <span className="truncate">{translateRole(role)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-display uppercase text-white group-hover:text-[#FFE500] transition-colors leading-tight">
                                        {film.title}
                                    </h3>

                                </div>
                            </div>

                            <div className="p-4 pt-0 border-t border-zinc-800/80 mt-2 flex items-center justify-between text-[10px] font-mono-tech text-zinc-500">
                                <span>
                                    {film.director
                                        ? tt('directorShort', { name: film.director })
                                        : tt('productionFallback')}
                                </span>
                                <span className="text-[#FFE500] group-hover:underline">{tt('detailsCta')}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
