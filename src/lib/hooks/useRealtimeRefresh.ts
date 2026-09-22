'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { subscribeTable } from '@/lib/supabase/realtime';

/**
 * Abonnement Supabase Realtime de CONFORT pour un composant client.
 *
 * Principe (doctrine `realtime.ts`) : Realtime est un confort — synchronisation
 * instantanée Cockpit → Vitrine — jamais une dépendance dure. En cas d'échec,
 * le contenu initial (fallback ou dernier état chargé) reste affiché.
 *
 * Centralise le patron « composant live sans Realtime » relevé par l'audit :
 *   1. UN canal PARTAGÉ par client (`subscribeTable`) : toutes les tables de la
 *      page tiennent sur le même WebSocket, quel que soit le nombre de hooks ;
 *   2. `refresh` capturé par référence : la souscription ne se recrée JAMAIS
 *      à chaque rendu (fini les re-subscriptions involontaires) ;
 *   3. anti-rebond des rafales d'événements (une écriture Cockpit peut émettre
 *      plusieurs `postgres_changes` consécutifs) ;
 *   4. nettoyage systématique du canal et du minuteur au démontage.
 *
 * @param tables  Tables `site_*` dont une écriture doit rafraîchir le composant.
 * @param refresh Fonction de rechargement (peut être recréée à chaque rendu).
 * @param debounceMs Anti-rebond, 250 ms par défaut.
 */
export function useRealtimeRefresh(
    tables: readonly string[],
    refresh: () => void,
    debounceMs = 250
): void {
    const refreshRef = useRef(refresh);

    // Mise à jour de la référence APRÈS le rendu (jamais pendant — React Compiler).
    useEffect(() => {
        refreshRef.current = refresh;
    });

    const tablesKey = tables.join(',');

    useEffect(() => {
        const tableList = tablesKey.split(',').filter(Boolean);
        if (tableList.length === 0) return;

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
}

export default useRealtimeRefresh;
