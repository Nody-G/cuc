import type { SiteEvent } from '@/lib/data/site-service';

/**
 * ==============================================================================
 * Fusion de l'overlay EN d'un événement (`site_events`, entité `event`)
 * ==============================================================================
 * Même défaut que pour les films : l'entité `event` était traduite dans
 * `site_translations` sans **aucun point de lecture**. `EventsPillarsSection`
 * affichait les lignes `site_events` brutes, donc en français sur les pages
 * anglaises — invisible pour le crawler, ces lignes étant chargées côté
 * navigateur (hors HTML initial).
 *
 * Règles identiques aux autres overlays :
 *   - aucune invention : seules les clés présentes et non vides écrasent le FR ;
 *   - repli silencieux sans overlay (FR, ou anglais non semé) ;
 *   - `features` : un tableau vide ne remplace jamais la liste française, et les
 *     éléments vides sont filtrés ;
 *   - jamais de modification de `id`, `image_url`, `cta_link` ni `order_index`
 *     (identifiants, médias et liens ne sont pas de la copie).
 * ==============================================================================
 */
export function applyEventOverlay(
    event: SiteEvent,
    overlay?: Record<string, unknown> | null
): SiteEvent {
    if (!overlay) return event;

    const pickString = (value: unknown, fallback: string | undefined): string | undefined =>
        typeof value === 'string' && value.trim().length > 0 ? value : fallback;

    const pickArray = (value: unknown, fallback: string[] | undefined): string[] | undefined => {
        if (!Array.isArray(value)) return fallback;
        const items = value.filter(
            (item): item is string => typeof item === 'string' && item.trim().length > 0
        );
        return items.length > 0 ? items : fallback;
    };

    return {
        ...event,
        title: pickString(overlay.title, event.title) as string,
        subtitle: pickString(overlay.subtitle, event.subtitle),
        badge: pickString(overlay.badge, event.badge),
        description: pickString(overlay.description, event.description),
        price_indicator: pickString(overlay.price_indicator, event.price_indicator),
        cta_text: pickString(overlay.cta_text, event.cta_text),
        features: pickArray(overlay.features, event.features),
    };
}

/** Applique les overlays à une liste d'événements, indexés par identifiant. */
export function applyEventOverlays(
    events: SiteEvent[],
    overlays?: Record<string, Record<string, unknown>> | null
): SiteEvent[] {
    if (!overlays) return events;
    return events.map((event) => applyEventOverlay(event, overlays[event.id]));
}
