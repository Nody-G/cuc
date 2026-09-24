'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { getFilms } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { creditTitleKey } from '@/lib/credit-title';
import { buildCucRoleBlock } from '@/components/sections/films/film-role-block';
import type { FilmCardRole } from '@/components/sections/films/FilmCard';
import type { FilmCredit } from '@/types';
import type { HomeTournagesData } from './home-tournages-data';

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
    selectedFilm: FilmCredit | null;
    setSelectedFilm: React.Dispatch<React.SetStateAction<FilmCredit | null>>;
    /** Bloc de rôle d'une jaquette (rôles CUC réellement enregistrés), ou null. */
    roleFor: (film?: FilmCredit) => FilmCardRole | null;
    /** Pied de jaquette : réalisateur, repli « Production » (comme la fiche coach). */
    footerFor: (film?: FilmCredit) => string;
}

/**
 * Orchestration du bloc tournages : libellés éditoriaux (données de page ou
 * traduction), catalogue `site_films` + Realtime, résolution par titre
 * normalisé et légende des rôles réellement enregistrés.
 */
export function useHomeTournages({ tournagesData }: UseHomeTournagesArgs): HomeTournagesController {
    const t = useTranslations('home.tournages');
    /** Namespace `team` : il porte déjà les libellés de rôle traduits (FR/EN). */
    const tTeam = useTranslations('team');

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

    /**
     * Catalogue live des films (`site_films`) : les affiches éditoriales de la
     * section sont résolues par titre normalisé dans le catalogue — mêmes
     * données, même modale et même navigation que « LES FILMS DOUBLÉS &
     * COORDONNÉS PAR LE CUC ».
     */
    const [films, setFilms] = React.useState<FilmCredit[]>([]);
    const [selectedFilm, setSelectedFilm] = React.useState<FilmCredit | null>(null);

    const loadFilms = React.useCallback(() => {
        getFilms().then(setFilms);
    }, []);

    React.useEffect(() => {
        loadFilms();
    }, [loadFilms]);

    // Synchronisation Realtime Cockpit → Vitrine (catalogue des films).
    useRealtimeRefresh(['site_films'], loadFilms);

    const filmsByTitle = React.useMemo(
        () => new Map(films.map((f) => [creditTitleKey(f.title), f])),
        [films]
    );

    /**
     * Bloc de rôle d'une jaquette : rôles CUC **réellement enregistrés** sur la
     * production (`metadata.cuc_team_roles`). Même objet que la fiche coach, donc
     * rendu `FilmCard` identique. Aucun rôle en base → aucun bloc (une affirmation
     * fausse serait pire qu'une absence).
     */
    const roleFor = (film?: FilmCredit): FilmCardRole | null =>
        buildCucRoleBlock(film?.cuc_team_roles, tTeam('roleOnProduction'), tTeam);

    /** Pied de jaquette : réalisateur, repli « Production » (comme la fiche coach). */
    const footerFor = (film?: FilmCredit): string =>
        film?.director
            ? tTeam('directorShort', { name: film.director })
            : tTeam('productionFallback');

    return { labels, films, filmsByTitle, selectedFilm, setSelectedFilm, roleFor, footerFor };
}
