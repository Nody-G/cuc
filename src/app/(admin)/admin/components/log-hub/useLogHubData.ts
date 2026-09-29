'use client';

/**
 * Flux du hub Journal — chargement, pagination, rafraîchissement.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1). Trois choix explicites :
 *
 *  - **Aucun canal temps réel.** Le journal se rafraîchit par sondage espacé et
 *    bouton dédié : le budget de connexions Realtime du Cockpit est mesuré par
 *    `npm run audit:budget`, et y brancher un journal bavard le ferait grimper
 *    pour un confort très relatif (`plans/plan-journal-activite-cockpit.md` § 3).
 *  - **L'état de chargement est dérivé**, jamais posé par un `setState`
 *    synchrone dans un effet : la page retenue porte la clé du filtre qui l'a
 *    produite, et « en chargement » signifie simplement que cette clé n'est plus
 *    la clé courante. Aucun rendu en cascade, aucune fenêtre où l'écran affiche
 *    d'anciennes données en se disant à jour.
 *  - **Le refus se distingue du vide.** `refused` remonte tel quel : un écran qui
 *    présenterait « aucune activité » là où la lecture a été refusée mentirait
 *    exactement comme le filtre vide corrigé au § 1.3 du plan.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { listActivityLogs, type ActivityLogPage } from '@/app/(admin)/admin/actions/logs';
import type { ActivityLogEntry } from '@/lib/logging/types';
import { filtersToQuery } from './log-hub-model';
import type { LogHubFilterState } from './log-hub.types';

const PAGE_SIZE = 40;
/** Sondage discret : un journal n'a pas besoin d'une seconde de fraîcheur. */
const POLL_INTERVAL_MS = 60_000;

/** Page retenue, avec la clé du filtre qui l'a produite et son horodatage. */
interface LoadedPage {
    entries: ActivityLogEntry[];
    total: number;
    refused: boolean;
    error: string | null;
    key: string;
    at: number;
}

const EMPTY_PAGE: LoadedPage = {
    entries: [],
    total: 0,
    refused: false,
    error: null,
    key: '',
    at: 0,
};

/** Construit la page retenue — évite de dupliquer la même mise en forme quatre fois. */
function toLoadedPage(result: ActivityLogPage, key: string, at: number): LoadedPage {
    return {
        entries: result.entries,
        total: result.total,
        refused: result.refused,
        error: result.error,
        key,
        at,
    };
}

/** Clé stable des filtres : c'est elle qui déclenche un rechargement. */
function keyOf(filters: LogHubFilterState): string {
    return [
        filters.levels.join(','),
        filters.sources.join(','),
        filters.range,
        filters.search,
    ].join('|');
}

export interface UseLogHubDataResult {
    entries: ActivityLogEntry[];
    total: number;
    loading: boolean;
    refreshing: boolean;
    loadingMore: boolean;
    refused: boolean;
    error: string | null;
    now: number;
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
    hasMore: boolean;
}

export function useLogHubData(filters: LogHubFilterState): UseLogHubDataResult {
    const filterKey = useMemo(() => keyOf(filters), [filters]);
    const [page, setPage] = useState<LoadedPage>(EMPTY_PAGE);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchPage = useCallback(
        (offset: number) => listActivityLogs(filtersToQuery(filters, Date.now(), PAGE_SIZE, offset)),
        [filters],
    );

    // Première page : au montage, puis à chaque changement de filtre. Le drapeau
    // `cancelled` évite qu'une réponse lente écrase le résultat d'un filtre plus
    // récent — le classique « j'ai changé de filtre et la liste est revenue à
    // l'ancienne sélection ».
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            const result = await fetchPage(0);
            if (cancelled) return;
            setPage(toLoadedPage(result, filterKey, Date.now()));
        };
        void run();
        return () => {
            cancelled = true;
        };
    }, [fetchPage, filterKey]);

    // Sondage espacé, uniquement quand l'onglet est visible : un onglet en
    // arrière-plan n'a aucune raison de consommer des requêtes.
    useEffect(() => {
        const timer = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
            void fetchPage(0).then((result) =>
                setPage(toLoadedPage(result, filterKey, Date.now())),
            );
        }, POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [fetchPage, filterKey]);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        const result = await fetchPage(0);
        setPage(toLoadedPage(result, filterKey, Date.now()));
        setRefreshing(false);
    }, [fetchPage, filterKey]);

    const loadedCount = page.entries.length;

    const loadMore = useCallback(async () => {
        setLoadingMore(true);
        const result = await fetchPage(loadedCount);
        setPage((current) => ({
            ...current,
            entries: [...current.entries, ...result.entries],
            total: result.total,
            refused: result.refused,
            error: result.error,
        }));
        setLoadingMore(false);
    }, [fetchPage, loadedCount]);

    return {
        entries: page.entries,
        total: page.total,
        // Dérivé, jamais posé dans un effet : la page affichée n'est pas encore
        // celle du filtre courant.
        loading: page.key !== filterKey,
        refreshing,
        loadingMore,
        refused: page.refused,
        error: page.error,
        now: page.at,
        refresh,
        loadMore,
        hasMore: loadedCount < page.total,
    };
}
