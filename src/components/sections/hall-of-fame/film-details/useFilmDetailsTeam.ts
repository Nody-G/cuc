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
import { parseCredit, type FilmCredit, type Instructor } from '@/types';
import { creditTitleKey } from '@/lib/credit-title';

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
        if (!movie) return [];
        const involvedSet = new Set(movie.cuc_team_involved || []);
        if (movie.cuc_team_roles) {
            Object.keys(movie.cuc_team_roles).forEach((id) => involvedSet.add(id));
        }
        const filmKey = creditTitleKey(movie.title);
        return teamMembers.filter((member) => {
            if (involvedSet.has(member.id)) return true;
            if (member.film_ids && member.film_ids.includes(movie.id)) return true;
            if (member.metadata?.film_roles && member.metadata.film_roles[movie.id]) return true;
            return (member.notableCredits || []).some((c) => {
                const creditKey = creditTitleKey(parseCredit(c).title || c);
                return creditKey && creditKey === filmKey;
            });
        });
    }, [movie, teamMembers]);

    return { involvedTeamMembers, entityOverrides };
}
