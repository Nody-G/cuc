'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DOUBLED_CELEBRITIES } from '@/data/celebrities';
import { getCelebrities } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { buildCelebrityIndex, resolveCelebrityByActorName } from '@/lib/celebrity-match';
import { CelebrityDetailsModal } from '@/components/sections/hall-of-fame/CelebrityDetailsModal';
import type { TeamNameRef } from '@/lib/celebrity-double';
import type { DoubledCelebrity, FilmCredit } from '@/types';
import { CelebritySheetContext, type CelebritySheetController } from './celebrity-sheet-context';

interface CelebritySheetProviderProps {
    /** Annuaire de l'équipe, pour les liens « doublé par » de la fiche. */
    teamMembers: TeamNameRef[];
    /** Films coordonnés par le CUC, liés depuis la fiche. */
    coordinatedFilms: FilmCredit[];
    children: React.ReactNode;
}

/**
 * Orchestration de la fiche comédien ouverte depuis la page Équipe.
 *
 * Un **seul** chargement du catalogue et **une seule** modale par page, partagés
 * par les cartes coach et la fiche détaillée — sans ce regroupement, chaque
 * carte ouvrirait son propre abonnement Realtime et sa propre requête.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : les vues consomment
 * `useCelebritySheet()`, la résolution vit dans `src/lib/celebrity-match.ts`.
 */
export const CelebritySheetProvider: React.FC<CelebritySheetProviderProps> = ({
    teamMembers,
    coordinatedFilms,
    children,
}) => {
    const [celebrities, setCelebrities] = useState<DoubledCelebrity[]>(DOUBLED_CELEBRITIES);
    const [selected, setSelected] = useState<DoubledCelebrity | null>(null);

    /** Le catalogue publié remplace le repli statique dès qu'il est disponible. */
    const loadCelebrities = useCallback(() => {
        getCelebrities().then((list) => {
            if (list && list.length > 0) setCelebrities(list);
        });
    }, []);

    useEffect(() => {
        loadCelebrities();
    }, [loadCelebrities]);

    // Synchronisation Realtime Cockpit → Vitrine (clé `celebrities` de site_settings).
    useRealtimeRefresh(['site_settings'], loadCelebrities);

    const index = useMemo(() => buildCelebrityIndex(celebrities), [celebrities]);

    const resolve = useCallback(
        (name: string) => resolveCelebrityByActorName(name, index),
        [index]
    );

    const openByName = useCallback(
        (name: string) => {
            const celebrity = resolveCelebrityByActorName(name, index);
            if (celebrity) setSelected(celebrity);
        },
        [index]
    );

    const controller = useMemo<CelebritySheetController>(
        () => ({ resolve, openByName }),
        [resolve, openByName]
    );

    return (
        <CelebritySheetContext.Provider value={controller}>
            {children}

            <CelebrityDetailsModal
                celebrity={selected}
                teamMembers={teamMembers}
                coordinatedFilms={coordinatedFilms}
                onClose={() => setSelected(null)}
            />
        </CelebritySheetContext.Provider>
    );
};
