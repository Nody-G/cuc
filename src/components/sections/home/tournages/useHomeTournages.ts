'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { getFilms } from '@/lib/data/site/films';
import { getTeam } from '@/lib/data/site/team';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { creditTitleKey } from '@/lib/credit-title';
import { selectCoordinatedFilms } from '@/lib/coach-films';
import type { FilmCredit, Instructor } from '@/types';
import {
    FEATURED_PRODUCTIONS,
    INITIAL_COORDINATED_FILMS,
    type HighlightProject,
    type HomeTournagesData,
} from './home-tournages-data';

interface UseHomeTournagesArgs {
    tournagesData?: HomeTournagesData;
}

export interface HomeTournagesController {
    labels: {
        badge: string;
        title: string;
        subtitle: string;
        ctaText: string;
        ctaLink: string;
        teamTag: string;
        ctaProduction: string;
        ctaCatalog: string;
        pillar1Title: string;
        pillar1Desc: string;
        pillar2Title: string;
        pillar2Desc: string;
        pillar3Title: string;
        pillar3Desc: string;
    };
    films: FilmCredit[];
    filmsByTitle: Map<string, FilmCredit>;
    featuredProductions: HighlightProject[];
    /** Ensemble des films coordonnés en cascade par Lucas Dollfus. */
    coordinatedFilms: FilmCredit[];
    selectedFilm: FilmCredit | null;
    setSelectedFilm: React.Dispatch<React.SetStateAction<FilmCredit | null>>;
    /** Pied de jaquette : nom du réalisateur (« Réal. X »), absent si inconnu. */
    directorFor: (film?: FilmCredit) => string | undefined;
}

/**
 * Orchestration du bloc tournages : libellés éditoriaux (données de page ou
 * traduction), catalogue `site_films` + `site_team` + Realtime, et sélection
 * dynamique de tous les films coordonnés en cascade par Lucas Dollfus.
 */
export function useHomeTournages({ tournagesData }: UseHomeTournagesArgs): HomeTournagesController {
    const t = useTranslations('home.tournages');

    const labels = {
        badge: tournagesData?.badge || t('badge'),
        title: tournagesData?.title || t('title'),
        subtitle: tournagesData?.subtitle || t('subtitle'),
        ctaText: tournagesData?.cta_text || t('cta'),
        ctaLink: tournagesData?.cta_link || '/cuc-team-cascadeur',
        teamTag: tournagesData?.team_tag || t('teamTag'),
        ctaProduction: tournagesData?.cta_production || t('ctaProduction'),
        ctaCatalog: tournagesData?.cta_catalog || t('ctaCatalog'),
        pillar1Title: tournagesData?.pillar1_title || t('pillar1Title'),
        pillar1Desc: tournagesData?.pillar1_desc || t('pillar1Desc'),
        pillar2Title: tournagesData?.pillar2_title || t('pillar2Title'),
        pillar2Desc: tournagesData?.pillar2_desc || t('pillar2Desc'),
        pillar3Title: tournagesData?.pillar3_title || t('pillar3Title'),
        pillar3Desc: tournagesData?.pillar3_desc || t('pillar3Desc'),
    };

    const [films, setFilms] = React.useState<FilmCredit[]>(INITIAL_COORDINATED_FILMS);
    const [team, setTeam] = React.useState<Instructor[]>([]);
    const [selectedFilm, setSelectedFilm] = React.useState<FilmCredit | null>(null);

    const loadFilmsAndTeam = React.useCallback(() => {
        getFilms().then(setFilms);
        getTeam().then(setTeam);
    }, []);

    React.useEffect(() => {
        loadFilmsAndTeam();
    }, [loadFilmsAndTeam]);

    // Synchronisation Realtime Cockpit → Vitrine (catalogue des films + équipe).
    useRealtimeRefresh(['site_films', 'site_team'], loadFilmsAndTeam);

    const filmsByTitle = React.useMemo(
        () => new Map(films.map((f) => [creditTitleKey(f.title), f])),
        [films]
    );

    const featuredProductions = React.useMemo(() => {
        return tournagesData?.featured_films && tournagesData.featured_films.length > 0
            ? tournagesData.featured_films
            : FEATURED_PRODUCTIONS;
    }, [tournagesData]);

    const coordinatedFilms = React.useMemo(() => {
        const coordinator =
            team.find((m) => m.id === 'lucas-dollfus') ??
            team.find((m) => m.name.toLowerCase().includes('dollfus'));
        if (!coordinator) return INITIAL_COORDINATED_FILMS;
        const resolved = selectCoordinatedFilms(films, coordinator);
        return resolved.length > 0 ? resolved : INITIAL_COORDINATED_FILMS;
    }, [films, team]);

    const directorFor = React.useCallback(
        (film?: FilmCredit) => (film?.director ? `Réal. ${film.director}` : undefined),
        []
    );

    return {
        labels,
        films,
        filmsByTitle,
        featuredProductions,
        coordinatedFilms,
        selectedFilm,
        setSelectedFilm,
        directorFor,
    };
}
