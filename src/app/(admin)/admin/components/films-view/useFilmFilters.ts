'use client';

import { useMemo, useState } from 'react';
import type { FilmCredit } from '@/types';
import { useProgressiveList } from '../ui';
import {
    type FilmViewPreset,
    isLucasCoordinated,
    isAnyCucCoordinated,
    isLucasInvolved,
    isCoachInvolved,
} from './film-filters-domain';

/**
 * État de vue du catalogue de films :
 * - Préréglage de vue : films coordonnés par Lucas Dollfus (par défaut), coordonnés CUC, participations, ou tous.
 * - Filtre ciblé par coach (« qui a bossé dans quoi »).
 * - Recherche (titre, réalisateur, comédien doublé, rôle, cascadeur).
 * - Filtre de catégorie vitrine (Film, Série, Court métrage).
 * - Rendu progressif avec pagination.
 */
export function useFilmFilters(films: FilmCredit[]) {
    // Par défaut : exclusivement les films coordonnés / réalisés par Lucas DOLLFUS
    const [preset, setPreset] = useState<FilmViewPreset>('lucas-coord');
    const [selectedCoachId, setSelectedCoachId] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Compteurs rapides pour les onglets de vue
    const counts = useMemo(() => {
        let lucasCoord = 0;
        let allCoord = 0;
        let lucasAll = 0;
        for (const f of films) {
            if (isLucasCoordinated(f)) lucasCoord++;
            if (isAnyCucCoordinated(f)) allCoord++;
            if (isLucasInvolved(f)) lucasAll++;
        }
        return {
            lucasCoord,
            allCoord,
            lucasAll,
            total: films.length,
        };
    }, [films]);

    const filteredFilms = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();

        return films.filter((f) => {
            // 1. Filtre par preset de coordination / réalisation
            if (preset === 'lucas-coord' && !isLucasCoordinated(f)) return false;
            if (preset === 'all-coord' && !isAnyCucCoordinated(f)) return false;
            if (preset === 'lucas-all' && !isLucasInvolved(f)) return false;

            // 2. Filtre ciblé par coach (« qui a bossé dans quoi »)
            if (selectedCoachId !== 'all' && !isCoachInvolved(f, selectedCoachId)) {
                return false;
            }

            // 3. Filtre de format / catégorie
            if (categoryFilter !== 'all' && f.category !== categoryFilter) {
                return false;
            }

            // 4. Recherche plein texte
            if (term) {
                const matchTitle = f.title.toLowerCase().includes(term);
                const matchDirector = f.director && f.director.toLowerCase().includes(term);
                const matchYear = f.year && f.year.includes(term);
                const matchStunts = f.stuntRoles && f.stuntRoles.toLowerCase().includes(term);
                const matchDoubles =
                    f.doubledActors &&
                    f.doubledActors.some((a) => a.toLowerCase().includes(term));
                const matchRoles =
                    f.cuc_team_roles &&
                    Object.values(f.cuc_team_roles).some((r) => r.toLowerCase().includes(term));

                if (
                    !matchTitle &&
                    !matchDirector &&
                    !matchYear &&
                    !matchStunts &&
                    !matchDoubles &&
                    !matchRoles
                ) {
                    return false;
                }
            }

            return true;
        });
    }, [films, preset, selectedCoachId, categoryFilter, searchTerm]);

    const {
        visibleItems: visibleFilms,
        visibleCount: visibleFilmCount,
        total: totalFilms,
        loadMore: loadMoreFilms,
    } = useProgressiveList(filteredFilms, {
        step: 24,
        initial: 24,
        resetKey: `${preset}|${selectedCoachId}|${categoryFilter}|${searchTerm}`,
    });

    return {
        preset,
        setPreset,
        selectedCoachId,
        setSelectedCoachId,
        searchTerm,
        setSearchTerm,
        categoryFilter,
        setCategoryFilter,
        counts,
        filteredFilms,
        visibleFilms,
        visibleFilmCount,
        totalFilms,
        loadMoreFilms,
    };
}
