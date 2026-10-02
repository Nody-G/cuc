'use client';

import { useEffect, useRef } from 'react';
import type { FilmCredit } from '@/types';

export interface UsePendingFilmOpenArgs {
    /** Catalogue complet (l'ouverture ne dépend pas du filtre d'affichage). */
    films: FilmCredit[];
    /** Film demandé par un autre onglet, ou `null`. */
    pendingFilmId: string | null;
    /** Ouvre la fiche d'un film dans l'éditeur. */
    openEdit: (film: FilmCredit) => void;
    /** Signale la consommation de la demande (remet `pendingFilmId` à `null`). */
    onHandled: () => void;
}

/**
 * Ouverture différée d'une fiche de film (`AGENTS.md` § 1 — logique extraite de
 * `FilmsView`).
 *
 * À réception d'un `pendingFilmId`, on retrouve le film dans la liste chargée et
 * on appelle `openEdit` **une seule fois** (garde `useRef`), puis on signale la
 * consommation. Si le film n'est pas encore dans la liste, on attend le
 * prochain rendu : aucun état intermédiaire n'est inventé.
 */
export function usePendingFilmOpen({
    films,
    pendingFilmId,
    openEdit,
    onHandled,
}: UsePendingFilmOpenArgs): void {
    /** Dernier identifiant déjà traité ; remis à zéro quand la demande expire. */
    const handledRef = useRef<string | null>(null);

    useEffect(() => {
        if (!pendingFilmId) {
            handledRef.current = null;
            return;
        }
        if (handledRef.current === pendingFilmId) return;

        const film = films.find((candidate) => candidate.id === pendingFilmId);
        if (!film) return;

        handledRef.current = pendingFilmId;
        openEdit(film);
        onHandled();
    }, [films, pendingFilmId, openEdit, onHandled]);
}
