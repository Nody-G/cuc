'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Film, ArrowUpDown } from 'lucide-react';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { getFilms } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { FilmCredit } from '@/types';
import { StuntBadge } from '@/components/ui/StuntBadge';
import { FilmDetailsModal } from '@/components/sections/hall-of-fame/FilmDetailsModal';
import { FilmPosterCard } from '@/components/sections/films/FilmPosterCard';
import { applyFilmOverlays } from '@/lib/i18n/apply-film-overlay';
import { useEntityOverlays } from '@/lib/hooks/useEntityOverlays';

type FilmSort = 'year-desc' | 'year-asc' | 'title-asc' | 'title-desc';

export interface CucFilmsShowcaseProps {
    /** Ancre éventuelle (ex. `filmographie`). */
    id?: string;
    badge?: string;
    title?: string;
    subtitle?: string;
    /** Classes additionnelles appliquées au conteneur racine (marges…). */
    className?: string;
    /** Affiche le liseré supérieur séparateur (défaut : true). */
    divider?: boolean;
}

/**
 * Vitrine « LES FILMS DOUBLÉS & COORDONNÉS PAR LE CUC ».
 *
 * Composant partagé extrait de `/equipe-cascadeurs-pro` et réutilisé sur la page
 * TOURNAGE (`/cuc-team-cascadeur`) à la place de l'ancien bloc « FILMS & SÉRIES ».
 * Source live : Supabase `site_films` (+ Realtime), repli sur `FILMOGRAPHY_CREDITS`.
 */
export const CucFilmsShowcase: React.FC<CucFilmsShowcaseProps> = ({
    id,
    badge,
    title,
    subtitle,
    className = '',
    divider = true,
}) => {
    const tFilms = useTranslations('films');
    const tTeam = useTranslations('team');
    const tProduction = useTranslations('teamProduction');

    /**
     * Copie par défaut servie par le catalogue (`films.*`) : plus aucune chaîne
     * FR en dur, donc plus de fuite en anglais. Les props restent prioritaires
     * (contenu piloté par `site_pages`).
     */
    const resolvedBadge = badge || tFilms('badge');
    const resolvedTitle = title || tFilms('title');
    const resolvedSubtitle = subtitle || tFilms('subtitle');

    const [films, setFilms] = React.useState<FilmCredit[]>(FILMOGRAPHY_CREDITS);
    const [filmSort, setFilmSort] = React.useState<FilmSort>('year-desc');
    const [selectedFilm, setSelectedFilm] = React.useState<FilmCredit | null>(null);

    /**
     * Overlays EN du catalogue films (entité `film`) : le synopsis de la modale
     * était servi en français sur les pages anglaises, faute d'application de
     * l'overlay — défaut hors de portée du crawler, la modale étant rendue côté
     * navigateur et non dans le HTML initial.
     */
    const filmOverlays = useEntityOverlays('film');
    const localizedFilms = React.useMemo(
        () => applyFilmOverlays(films, filmOverlays),
        [films, filmOverlays]
    );

    /** Rechargement du catalogue : état initial + synchronisation Realtime. */
    const loadFilms = React.useCallback(() => {
        getFilms().then(setFilms);
    }, []);

    React.useEffect(() => {
        loadFilms();
    }, [loadFilms]);

    // Synchronisation Realtime Cockpit → Vitrine (catalogue des films).
    useRealtimeRefresh(['site_films'], loadFilms);

    // Tri du catalogue (date ou nom, croissant/décroissant)
    const sortedFilms = React.useMemo(() => {
        const list = [...localizedFilms];
        const yearOf = (f: FilmCredit) => {
            const parsed = parseInt(String(f.year ?? '').replace(/\D/g, ''), 10);
            return Number.isFinite(parsed) ? parsed : 0;
        };
        switch (filmSort) {
            case 'year-asc':
                return list.sort((a, b) => yearOf(a) - yearOf(b));
            case 'title-asc':
                return list.sort((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }));
            case 'title-desc':
                return list.sort((a, b) => b.title.localeCompare(a.title, 'fr', { sensitivity: 'base' }));
            case 'year-desc':
            default:
                return list.sort((a, b) => yearOf(b) - yearOf(a));
        }
    }, [localizedFilms, filmSort]);

    return (
        <div id={id} className={`${divider ? 'border-t border-zinc-800 pt-16' : ''} ${className}`.trim()}>
            <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 mb-3">
                    <StuntBadge variant="yellow" icon={<Film className="w-3.5 h-3.5" />}>
                        {resolvedBadge}
                    </StuntBadge>
                    <span className="text-xs font-mono-tech text-zinc-400">
                        {tTeam('showcaseTag')}
                    </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mb-3">
                    {resolvedTitle}
                </h2>
                <p className="text-xs sm:text-sm font-tech text-zinc-400">{resolvedSubtitle}</p>
                <label className="mt-5 inline-flex items-center gap-2 text-[11px] font-mono-tech text-zinc-400">
                    <ArrowUpDown className="w-3.5 h-3.5 text-[#FFE500]" />
                    <span className="uppercase tracking-wider">{tProduction('showcase.sortLabel')}</span>
                    <select
                        value={filmSort}
                        onChange={(e) => setFilmSort(e.target.value as FilmSort)}
                        className="bg-black/60 border border-zinc-700 text-zinc-200 text-[11px] font-mono-tech px-2 py-1 focus:outline-none focus:border-[#FFE500]"
                        aria-label={tProduction('showcase.sortAria')}
                    >
                        <option value="year-desc">{tFilms('sortYearDesc')}</option>
                        <option value="year-asc">{tFilms('sortYearAsc')}</option>
                        <option value="title-asc">{tFilms('sortTitleAsc')}</option>
                        <option value="title-desc">{tFilms('sortTitleDesc')}</option>
                    </select>
                </label>
            </div>

            {/*
              * Grille des affiches — cartes partagées `FilmPosterCard`.
              * Source unique de la présentation et de la navigation des
              * jaquettes sur toute la vitrine (décision 2026-09-21).
              */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {sortedFilms.map((film) => (
                    <FilmPosterCard
                        key={film.id}
                        film={film}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        onOpen={() => setSelectedFilm(film)}
                    />
                ))}
            </div>

            <FilmDetailsModal movie={selectedFilm} onClose={() => setSelectedFilm(null)} />
        </div>
    );
};

export default CucFilmsShowcase;
