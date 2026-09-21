import type { POI } from '@/components/ui/campus-map/campusMap.data';

/**
 * ==============================================================================
 * Fusion de l'overlay EN d'un point du campus (entité `campus_poi`)
 * ==============================================================================
 * Les zones et installations du domaine vivent en base (`site_campus_pois`) :
 * nom, catégorie et description sont des DONNÉES, jamais de la copie
 * d'interface. L'anglais arrive donc par `site_translations` (entité
 * `campus_poi`, `entity_id` = identifiant du POI) et se pose ici, à l'affichage.
 *
 * Règles :
 *   - aucune invention : seules les clés présentes dans l'overlay écrasent le FR ;
 *   - repli silencieux : sans overlay (FR, ou anglais non encore semé), le POI
 *     reste affiché tel quel — rien ne casse, aucune chaîne vide.
 */
export function applyPoiOverlay(
    poi: POI,
    overlay?: Record<string, unknown> | null
): POI {
    if (!overlay) return poi;

    const pickString = (value: unknown, fallback: string | undefined): string | undefined =>
        typeof value === 'string' && value.trim().length > 0 ? value : fallback;

    return {
        ...poi,
        name: pickString(overlay.name, poi.name) as string,
        category: pickString(overlay.category, poi.category) as string,
        description: pickString(overlay.description, poi.description) as string,
    };
}

/** Applique les overlays à une liste de POIs, indexés par identifiant. */
export function applyPoiOverlays(
    pois: POI[],
    overlays?: Record<string, Record<string, unknown>> | null
): POI[] {
    if (!overlays) return pois;
    return pois.map((poi) => applyPoiOverlay(poi, overlays[poi.id]));
}
