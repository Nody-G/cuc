'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CUC_TEAM } from '@/data/team';
import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { getTeam, getFilms } from '@/lib/data/site-service';
import { applyTeamOverlay } from '@/lib/i18n/apply-team-overlay';
import { applyFilmOverlays } from '@/lib/i18n/apply-film-overlay';
import { useEntityOverlays } from '@/lib/hooks/useEntityOverlays';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { parseCredit, type FilmCredit, type Instructor, type ParsedCredit } from '@/types';
import {
    buildFeaturedOrder,
    findRelatedFilms,
    sortCoachFilms,
    type FilmSort,
} from './coach-films';

export interface UseCoachDetailDataArgs {
    slug: string;
    /** Overlays EN des coachs, résolus côté serveur (`site_translations`, entité `team`). */
    teamOverlays?: Record<string, Record<string, unknown>>;
}

/**
 * Données de la fiche coach : équipe + films (repli statique puis chargement
 * serveur, synchronisation Realtime), appariement des crédits du coach aux
 * films du catalogue, ordre de mise en avant et tri.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1).
 */
export function useCoachDetailData({ slug, teamOverlays }: UseCoachDetailDataArgs) {
    const [allTeam, setAllTeam] = useState<Instructor[]>(() =>
        CUC_TEAM.map((m) => applyTeamOverlay(m, teamOverlays?.[m.id]))
    );
    const [allFilms, setAllFilms] = useState<FilmCredit[]>(FILMOGRAPHY_CREDITS);
    const [selectedFilmModal, setSelectedFilmModal] = useState<FilmCredit | null>(null);
    const [filmSort, setFilmSort] = useState<FilmSort>('year-desc');

    /**
     * Overlays EN du catalogue films (entité `film`) : le synopsis de la modale
     * était affiché en français faute d'application de l'overlay (défaut invisible
     * pour le crawler, la modale étant rendue côté navigateur).
     */
    const filmOverlays = useEntityOverlays('film');
    const films = useMemo(() => applyFilmOverlays(allFilms, filmOverlays), [allFilms, filmOverlays]);

    /** Recharge équipe + films (état initial + synchronisation Realtime). */
    const loadTeamAndFilms = React.useCallback(() => {
        getTeam().then((t) => {
            if (t && t.length > 0) {
                setAllTeam(t.map((m) => applyTeamOverlay(m, teamOverlays?.[m.id])));
            }
        });
        getFilms().then((f) => {
            if (f && f.length > 0) setAllFilms(f);
        });
    }, [teamOverlays]);

    useEffect(() => {
        loadTeamAndFilms();
    }, [loadTeamAndFilms]);

    // Synchronisation Realtime Cockpit → Vitrine (fiche coach = équipe + films).
    useRealtimeRefresh(['site_team', 'site_films'], loadTeamAndFilms);

    const member =
        allTeam.find((m) => m.id === slug) || CUC_TEAM.find((m) => m.id === slug);

    // Parsing des crédits de tournage du coach
    const parsedCredits: ParsedCredit[] = useMemo(() => {
        if (!member?.notableCredits) return [];
        return member.notableCredits.map(parseCredit);
    }, [member]);

    const relatedFilms = useMemo(() => findRelatedFilms(films, member), [films, member]);

    const featuredOrder = useMemo(() => buildFeaturedOrder(member), [member]);

    const sortedFilms = useMemo(
        () => sortCoachFilms(relatedFilms, filmSort, featuredOrder),
        [relatedFilms, filmSort, featuredOrder]
    );

    // Autres membres de l'équipe
    const otherMembers = useMemo(
        () => (member ? allTeam.filter((m) => m.id !== member.id).slice(0, 4) : []),
        [allTeam, member]
    );

    return {
        member,
        parsedCredits,
        relatedFilms,
        featuredOrder,
        sortedFilms,
        filmSort,
        setFilmSort,
        selectedFilmModal,
        setSelectedFilmModal,
        otherMembers,
    };
}
