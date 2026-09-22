'use client';

import { useEffect, useState } from 'react';
import { useSiteData } from '@/components/i18n/SiteDataProvider';
import { createClient } from '@/lib/supabase/client';
import { subscribeTable } from '@/lib/supabase/realtime';
import {
    DEFAULT_NAVIGATION,
    type NavigationStructure,
} from '@/data/navigation';
import { applyItemLabels, currentLocale, fetchLabelOverlay } from './navigation-labels';

/**
 * Hook de lecture de la navigation principale.
 *
 * Doctrine « zéro régression » : l'état initial est TOUJOURS la constante
 * `DEFAULT_NAVIGATION` (identique au rendu historique codé en dur). Si Supabase
 * répond avec une structure valide, on la substitue ; sinon on conserve le
 * fallback. Aucun flash de contenu vide n'est possible.
 *
 * Écoute Supabase Realtime sur `site_navigation` pour refléter immédiatement
 * toute modification faite depuis le Cockpit.
 */
export function useNavigation(id: string = 'main'): NavigationStructure {
    // Données RÉSOLUES SUR LE SERVEUR (FR + EN fusionnés) : quand elles sont
    // présentes, le premier rendu est déjà dans la bonne langue et aucune requête
    // n'est rejouée côté navigateur — c'est ce qui supprime le flash.
    const server = useSiteData()?.navigation ?? null;
    const hasServerData = !!server;

    const [structure, setStructure] = useState<NavigationStructure>(() =>
        server
            ? {
                items: applyItemLabels(server.structure.items ?? [], server.labels),
                cta: server.labels?.cta
                    ? {
                        ...(server.structure.cta || DEFAULT_NAVIGATION.structure.cta),
                        label: server.labels.cta,
                    }
                    : server.structure.cta || DEFAULT_NAVIGATION.structure.cta,
            }
            : DEFAULT_NAVIGATION.structure
    );

    useEffect(() => {
        let cancelled = false;
        const supabase = createClient();

        async function fetchNavigation() {
            // Le serveur a déjà fourni la navigation localisée : on ne rejoue pas
            // la requête (Realtime reste actif pour la fraîcheur).
            if (hasServerData) return;
            try {
                const { data, error } = await supabase
                    .from('site_navigation')
                    .select('structure, is_published')
                    .eq('id', id)
                    .eq('is_published', true)
                    .maybeSingle();

                if (cancelled || error || !data?.structure) return;

                const incoming = data.structure as NavigationStructure;
                if (!incoming.items || !Array.isArray(incoming.items) || incoming.items.length === 0) {
                    return;
                }

                const labels = await fetchLabelOverlay(supabase, 'navigation', id, currentLocale());
                const cta = incoming.cta || DEFAULT_NAVIGATION.structure.cta;

                setStructure({
                    items: applyItemLabels(incoming.items, labels),
                    cta: labels?.cta ? { ...cta, label: labels.cta } : cta,
                });
            } catch {
                /* fallback silencieux : on conserve DEFAULT_NAVIGATION */
            }
        }

        fetchNavigation();

        // Canal à nom unique + garde : évite la collision qui provoquait
        // « cannot add postgres_changes callbacks ... after subscribe() ».
        // Canal partagé par client (cf. `subscribeTable`) : plus un canal par
        // table — la barre de navigation, le pied de page et les réseaux sociaux
        // tiennent sur le même WebSocket.
        const unsubscribeNavigation = subscribeTable(
            supabase,
            { table: 'site_navigation', filter: `id=eq.${id}` },
            (payload) => {
                const row = payload.new as { structure?: NavigationStructure; is_published?: boolean } | null;
                if (!row?.structure || row.is_published === false) {
                    setStructure(DEFAULT_NAVIGATION.structure);
                    return;
                }
                const incoming = row.structure;
                if (!incoming.items || !Array.isArray(incoming.items) || incoming.items.length === 0) {
                    setStructure(DEFAULT_NAVIGATION.structure);
                    return;
                }
                setStructure({
                    items: incoming.items,
                    cta: incoming.cta || DEFAULT_NAVIGATION.structure.cta,
                });
            }
        );

        return () => {
            cancelled = true;
            unsubscribeNavigation();
        };
    }, [id, hasServerData]);

    return structure;
}
