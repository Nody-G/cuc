'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isCockpitRoute, subscribeTable } from '@/lib/supabase/realtime';

/**
 * ==============================================================================
 * CUC — Fraîcheur d'un composant client, sans coût proportionnel au trafic
 * ==============================================================================
 * Deux régimes, selon la route :
 *
 *  - **Cockpit** (`/admin/...`) : canal Realtime PARTAGÉ (`subscribeTable`) —
 *    la synchronisation instantanée est ce qu'un éditeur attend de son outil ;
 *  - **Vitrine publique** : **aucun WebSocket**. Le contenu est déjà frais à la
 *    navigation (cache serveur invalidé par tag à l'enregistrement) ; sur place,
 *    le composant se recharge à la **reprise d'onglet** (`focus` /
 *    `visibilitychange`), au plus une fois par demi-minute.
 *
 * Pourquoi ce partage : le nombre de connexions Realtime simultanées est la
 * seule charge qui croît avec le nombre d'onglets ouverts — un visiteur n'a
 * pourtant pas besoin d'une page qui se met à jour toute seule, alors que le
 * quota, lui, est facturé. Un sondage de secours (`pollMs`) reste possible, mais
 * il est **explicitement réservé** aux contenus dont la fraîcheur justifie un
 * aller-retour (bandeau d'annonce d'urgence) et ne tourne que si l'onglet est
 * visible.
 *
 * Realtime demeure un confort, jamais une dépendance : toute exception est
 * absorbée, et le contenu initial reste affiché.
 */

/** Délai minimum entre deux rechargements déclenchés par un retour d'onglet. */
export const VISITOR_RETURN_MIN_INTERVAL_MS = 30_000;

export interface RealtimeRefreshOptions {
    /** Anti-rebond des rafales d'événements du canal partagé (Cockpit). */
    debounceMs?: number;
    /**
     * Sondage de secours sur le chemin public (millisecondes), **onglet visible
     * seulement**. Absent = aucun sondage : le défaut de la vitrine est de ne
     * rien demander.
     */
    pollMs?: number;
}

/**
 * Décide si un retour d'onglet doit recharger les données.
 *
 * Fonction pure, testable sans DOM : `focus` et `visibilitychange` arrivent
 * souvent ensemble, et un aller-retour rapide ne doit pas produire deux
 * rechargements — d'où l'intervalle minimum.
 */
export function shouldRefreshOnReturn(
    lastRefreshAt: number,
    now: number,
    minIntervalMs: number = VISITOR_RETURN_MIN_INTERVAL_MS
): boolean {
    if (!Number.isFinite(lastRefreshAt) || !Number.isFinite(now)) return false;
    return now - lastRefreshAt >= minIntervalMs;
}

/**
 * Abonnement Supabase Realtime de CONFORT pour un composant client (Cockpit),
 * ou rechargement à la reprise d'onglet (vitrine publique).
 *
 * @param tables   Tables `site_*` dont une écriture doit rafraîchir le composant.
 * @param refresh  Fonction de rechargement (peut être recréée à chaque rendu).
 * @param options  Anti-rebond et sondage de secours optionnel.
 */
export function useRealtimeRefresh(
    tables: readonly string[],
    refresh: () => void,
    options: RealtimeRefreshOptions = {}
): void {
    const { debounceMs = 250, pollMs } = options;
    const refreshRef = useRef(refresh);

    // Mise à jour de la référence APRÈS le rendu (jamais pendant — React Compiler).
    useEffect(() => {
        refreshRef.current = refresh;
    });

    const tablesKey = tables.join(',');

    // Régime Cockpit : canal partagé (un seul WebSocket par client).
    useEffect(() => {
        const tableList = tablesKey.split(',').filter(Boolean);
        if (tableList.length === 0) return;
        if (!isCockpitRoute(window.location.pathname)) return;

        const supabase = createClient();
        let timer: ReturnType<typeof setTimeout> | null = null;

        const schedule = () => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                refreshRef.current();
            }, debounceMs);
        };

        // Canal PARTAGÉ par client : toutes les tables écoutées par cette page
        // s'enregistrent sur le même WebSocket (cf. `subscribeTable`).
        const unsubscribers = tableList.map((table) => subscribeTable(supabase, { table }, schedule));

        return () => {
            if (timer) clearTimeout(timer);
            for (const unsubscribe of unsubscribers) unsubscribe();
        };
    }, [tablesKey, debounceMs]);

    // Régime vitrine publique : reprise d'onglet, plus sondage de secours si demandé.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const tableList = tablesKey.split(',').filter(Boolean);
        if (tableList.length === 0) return;
        if (isCockpitRoute(window.location.pathname)) return;

        /** Le montage vient de charger les données : le premier retour attendra. */
        let lastRefreshAt = Date.now();

        const refreshIfDue = (force = false) => {
            const now = Date.now();
            if (!force && !shouldRefreshOnReturn(lastRefreshAt, now)) return;
            lastRefreshAt = now;
            refreshRef.current();
        };

        const handleReturn = () => {
            if (document.visibilityState === 'visible') refreshIfDue();
        };

        window.addEventListener('focus', handleReturn);
        document.addEventListener('visibilitychange', handleReturn);

        const poll = pollMs && Number.isFinite(pollMs) && pollMs > 0 ? pollMs : null;
        const timer = poll
            ? setInterval(() => {
                if (document.visibilityState === 'visible') refreshIfDue(true);
            }, poll)
            : null;

        return () => {
            window.removeEventListener('focus', handleReturn);
            document.removeEventListener('visibilitychange', handleReturn);
            if (timer) clearInterval(timer);
        };
    }, [tablesKey, pollMs]);
}

export default useRealtimeRefresh;
