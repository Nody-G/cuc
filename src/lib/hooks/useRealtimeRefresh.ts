'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createSafeChannel, removeSafeChannel } from '@/lib/supabase/realtime';

/**
 * Abonnement Supabase Realtime de CONFORT pour un composant client.
 *
 * Principe (doctrine `realtime.ts`) : Realtime est un confort — synchronisation
 * instantanée Cockpit → Vitrine — jamais une dépendance dure. En cas d'échec,
 * le contenu initial (fallback ou dernier état chargé) reste affiché.
 *
 * Centralise le patron « composant live sans Realtime » relevé par l'audit :
 *   1. UN canal par composant (même pour plusieurs tables), nom à suffixe
 *      unique garanti par [`createSafeChannel`](src/lib/supabase/realtime.ts:46) ;
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

        const channel = createSafeChannel(
            supabase,
            `realtime:${tableList.join('+')}`,
            (ch) => {
                let current = ch;
                for (const table of tableList) {
                    current = current.on(
                        'postgres_changes',
                        { event: '*', schema: 'public', table },
                        schedule
                    );
                }
                return current;
            }
        );

        return () => {
            if (timer) clearTimeout(timer);
            removeSafeChannel(supabase, channel);
        };
    }, [tablesKey, debounceMs]);
}

export default useRealtimeRefresh;
