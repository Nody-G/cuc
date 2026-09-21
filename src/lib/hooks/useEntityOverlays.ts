'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/** Référence stable : évite de recréer un objet à chaque rendu. */
const EMPTY_OVERLAYS: Record<string, Record<string, unknown>> = {};

interface OverlayState {
    /** Clé d'origine (`entity|locale`) des données chargées. */
    key: string;
    overlays: Record<string, Record<string, unknown>>;
}

/**
 * ==============================================================================
 * Overlays EN d'une entité (`site_translations`), indexés par `entity_id`
 * ==============================================================================
 * Pour les vues qui chargent déjà leurs lignes côté client (l'annuaire de
 * l'équipe par exemple). La fiche coach, elle, reçoit ses overlays du serveur :
 * le premier rendu y est déjà dans la bonne langue, sans flash.
 *
 * Repli silencieux : en français, si la requête échoue ou tant qu'aucune donnée
 * n'est arrivée, on renvoie `{}` — les fiches FR restent affichées, rien ne
 * casse. Les données ne sont considérées valides que pour la clé courante :
 * changer de locale ou d'entité repart donc d'un état vide sans « fuite ».
 */
export function useEntityOverlays(entity: string) {
    const pathname = usePathname();
    // `next/navigation` (pas `@/i18n/navigation`) : on veut le chemin RÉEL,
    // préfixe `/en` inclus, pour dériver la locale.
    const locale = pathname?.startsWith('/en') ? 'en' : 'fr';
    const key = `${entity}|${locale}`;

    const [state, setState] = useState<OverlayState>({ key: '', overlays: EMPTY_OVERLAYS });

    useEffect(() => {
        if (locale === 'fr' || !entity) return;

        let isMounted = true;
        const supabase = createClient();

        supabase
            .from('site_translations')
            .select('entity_id, payload')
            .eq('entity', entity)
            .eq('locale', locale)
            .eq('is_published', true)
            .then(({ data, error }) => {
                if (error || !data || !isMounted) return;
                setState({
                    key,
                    overlays: Object.fromEntries(
                        (data as { entity_id: string; payload: Record<string, unknown> }[]).map(
                            (row) => [row.entity_id, row.payload ?? {}]
                        )
                    ),
                });
            });

        return () => {
            isMounted = false;
        };
    }, [entity, locale, key]);

    // Seules les données de la clé courante sont servies.
    return state.key === key ? state.overlays : EMPTY_OVERLAYS;
}
