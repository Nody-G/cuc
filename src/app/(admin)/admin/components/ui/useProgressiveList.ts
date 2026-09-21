'use client';

import { useCallback, useMemo, useState } from 'react';

/**
 * Rendu progressif de longues listes dans le Cockpit.
 *
 * Objectif performance : ne monter qu'un nombre borné de nœuds DOM au premier
 * rendu, puis étendre la fenêtre à la demande. Évite de peindre des centaines
 * de cartes (candidatures, films, coachs, médias) d'un seul coup, ce qui bloque
 * le thread principal et dégrade l'Interaction to Next Paint (INP).
 *
 * Le hook est volontairement sans dépendance externe : il ne fait que borner
 * `items.slice(0, visibleCount)` et exposer un `loadMore()` idempotent.
 *
 * @param items Liste complète à afficher.
 * @param options.step Taille du pas d'extension (défaut : 24).
 * @param options.initial Nombre d'éléments montés au premier rendu (défaut : `step`).
 * @param options.resetKey Clé de réinitialisation : quand elle change (ex. filtre
 *   de recherche, onglet actif), la fenêtre revient à `initial`. Indispensable
 *   pour ne pas conserver une fenêtre étendue après un changement de filtre.
 */
export interface ProgressiveListOptions {
    step?: number;
    initial?: number;
    resetKey?: string | number;
}

export interface ProgressiveListResult<T> {
    /** Tranche effectivement rendue. */
    visibleItems: T[];
    /** Nombre d'éléments actuellement montés. */
    visibleCount: number;
    /** Total d'éléments dans la liste source. */
    total: number;
    /** `true` s'il reste des éléments non montés. */
    hasMore: boolean;
    /** Étend la fenêtre d'un pas. */
    loadMore: () => void;
    /** Réinitialise la fenêtre à `initial`. */
    reset: () => void;
}

export function useProgressiveList<T>(
    items: T[],
    options: ProgressiveListOptions = {}
): ProgressiveListResult<T> {
    const { step = 24, initial, resetKey } = options;
    const initialCount = initial ?? step;

    const [visibleCount, setVisibleCount] = useState(initialCount);
    const [lastResetKey, setLastResetKey] = useState(resetKey);

    // Réinitialise la fenêtre quand le filtre / l'onglet change.
    // Ajustement pendant le rendu (pattern React officiel) plutôt que dans un
    // effet : évite un rendu en cascade et reste correct en mode strict.
    if (resetKey !== lastResetKey) {
        setLastResetKey(resetKey);
        setVisibleCount(initialCount);
    }

    // Si la liste rétrécit (suppression, filtre), on borne la fenêtre pendant
    // le rendu : la valeur affichée ne dépasse jamais le nombre d'éléments.
    const boundedCount = Math.min(visibleCount, Math.max(initialCount, items.length));

    const loadMore = useCallback(() => {
        setVisibleCount((prev) => Math.min(prev + step, items.length));
    }, [step, items.length]);

    const reset = useCallback(() => setVisibleCount(initialCount), [initialCount]);

    const visibleItems = useMemo(
        () => (boundedCount >= items.length ? items : items.slice(0, boundedCount)),
        [items, boundedCount]
    );

    return {
        visibleItems,
        visibleCount: boundedCount,
        total: items.length,
        hasMore: boundedCount < items.length,
        loadMore,
        reset,
    };
}
