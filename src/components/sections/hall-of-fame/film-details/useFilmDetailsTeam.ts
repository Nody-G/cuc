'use client';

/**
 * Orchestration de la fiche film : équipe CUC référencée par le film.
 *
 * - repli certifié `CUC_TEAM` servi immédiatement, puis chargement serveur ;
 * - resynchronisation Realtime `site_team` (le Cockpit prime sur la vitrine) ;
 * - overlays d'édition en place (titre / année de `site_films`).
 *
 * Le rapprochement film ↔ membres est **dérivé ici**, jamais dans la vue.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CUC_TEAM } from '@/data/team';
import { getTeam } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { usePreviewEntities } from '@/lib/preview/use-preview-entity';
import type { FilmCredit, Instructor } from '@/types';

export interface FilmDetailsTeam {
    /** Membres CUC crédités sur le film, dans l'ordre du catalogue équipe. */
    involvedTeamMembers: Instructor[];
    /** Overlays d'édition en place (résolus par le parent pour les champs film). */
    entityOverrides: ReturnType<typeof usePreviewEntities>;
}

export function useFilmDetailsTeam(movie: FilmCredit | null): FilmDetailsTeam {
    const [teamMembers, setTeamMembers] = useState<Instructor[]>(CUC_TEAM);
    const entityOverrides = usePreviewEntities();

    const loadTeam = useCallback(() => {
        getTeam().then(setTeamMembers);
    }, []);

    useEffect(() => {
        loadTeam();
    }, [loadTeam]);

    useRealtimeRefresh(['site_team'], loadTeam);

    const involvedTeamMembers = useMemo(() => {
        const involvedIds = movie?.cuc_team_involved || [];
        return teamMembers.filter((member) => involvedIds.includes(member.id));
    }, [movie, teamMembers]);

    return { involvedTeamMembers, entityOverrides };
}
