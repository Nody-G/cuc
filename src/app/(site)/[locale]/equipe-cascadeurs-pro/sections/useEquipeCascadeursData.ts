'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { CUC_TEAM } from '@/data/team';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { getTeam, getFilms } from '@/lib/data/site-service';
import { applyTeamOverlay } from '@/lib/i18n/apply-team-overlay';
import { applyFilmOverlays } from '@/lib/i18n/apply-film-overlay';
import { useEntityOverlays } from '@/lib/hooks/useEntityOverlays';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import type { Instructor, FilmCredit } from '@/types';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';

const HERO_BG_FALLBACK =
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/img-equipe.jpg';

export interface EquipeCascadeursData {
    displayTeam: Instructor[];
    displayFilms: FilmCredit[];
    selectedFilm: FilmCredit | null;
    setSelectedFilm: React.Dispatch<React.SetStateAction<FilmCredit | null>>;
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroBg: string;
}

/**
 * Orchestration de la page équipe : état initial + synchronisation Realtime,
 * overlays EN coachs / films et contenu éditable du hero.
 */
export function useEquipeCascadeursData(): EquipeCascadeursData {
    const [team, setTeam] = React.useState<Instructor[]>(CUC_TEAM);
    const [films, setFilms] = React.useState<FilmCredit[]>(FILMOGRAPHY_CREDITS);
    const [selectedFilm, setSelectedFilm] = React.useState<FilmCredit | null>(null);
    const { content } = usePageDynamicContent('equipe-cascadeurs-pro');
    const t = useTranslations('team');

    // Overlays EN des coachs (`site_translations`, entité `team`) : la base FR
    // reste la référence, l'anglais se pose par-dessus dès qu'il est disponible.
    const teamOverlays = useEntityOverlays('team');

    /**
     * Overlays EN des films (entité `film`).
     *
     * Sans eux, le synopsis affiché dans `FilmDetailsModal` restait en français sur
     * les pages anglaises : les 501 traductions de `site_translations` étaient
     * semées mais **jamais appliquées**. Le défaut échappait au crawler parce que
     * le synopsis n'apparaît que dans une modale cliente, hors du HTML initial.
     */
    const filmOverlays = useEntityOverlays('film');

    const heroBadge = content.hero?.badge || t('badge');
    const heroTitle = content.hero?.title || t('title');
    const heroSubtitle = content.hero?.subtitle || t('subtitle');
    const heroBg = content.hero?.bg_image || HERO_BG_FALLBACK;

    /** Rechargement de la vitrine équipe : état initial + synchronisation Realtime. */
    const loadTeamAndFilms = React.useCallback(() => {
        getTeam().then(setTeam);
        getFilms().then(setFilms);
    }, []);

    React.useEffect(() => {
        loadTeamAndFilms();
    }, [loadTeamAndFilms]);

    // Synchronisation Realtime Cockpit → Vitrine (équipe + films, un seul canal).
    useRealtimeRefresh(['site_team', 'site_films'], loadTeamAndFilms);

    const displayTeam = React.useMemo(
        () => team.map((m) => applyTeamOverlay(m, teamOverlays?.[m.id])),
        [team, teamOverlays]
    );

    /** Catalogue localisé : la version FR reste la référence, l'EN se pose dessus. */
    const displayFilms = React.useMemo(
        () => applyFilmOverlays(films, filmOverlays),
        [films, filmOverlays]
    );

    return {
        displayTeam,
        displayFilms,
        selectedFilm,
        setSelectedFilm,
        heroBadge,
        heroTitle,
        heroSubtitle,
        heroBg,
    };
}
