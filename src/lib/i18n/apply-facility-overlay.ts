import type { InfrastructureSpot } from '@/types';

/**
 * ==============================================================================
 * Fusion de l'overlay EN d'une installation du campus (entité `campus_facility`)
 * ==============================================================================
 * Les 9 installations du domaine vivent dans `site_campus_facilities` (repli
 * `CAMPUS_FACILITIES`, `src/data/campus.ts`) : nom, gabarit, description,
 * équipements clés et normes sont des DONNÉES, jamais de la copie d'interface.
 * L'anglais arrive par `site_translations` (entité `campus_facility`,
 * `entity_id` = identifiant de l'installation) et se pose ici, à l'affichage.
 *
 * Règles :
 *   - aucune invention : seules les clés présentes dans l'overlay écrasent le FR ;
 *   - repli silencieux : sans overlay (FR, ou anglais non encore semé),
 *     l'installation reste affichée telle quelle — rien ne casse, aucune chaîne
 *     vide ;
 *   - `features` suit le même contrat que le reste : un tableau vide ne remplace
 *     jamais la liste française.
 */
export function applyFacilityOverlay(
    facility: InfrastructureSpot,
    overlay?: Record<string, unknown> | null
): InfrastructureSpot {
    if (!overlay) return facility;

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
        ...facility,
        name: pickString(overlay.name, facility.name) as string,
        size: pickString(overlay.size, facility.size) as string,
        description: pickString(overlay.description, facility.description) as string,
        specifications: pickString(overlay.specifications, facility.specifications) as string,
        features: pickArray(overlay.features, facility.features) as string[],
    };
}

/** Applique les overlays à une liste d'installations, indexées par identifiant. */
export function applyFacilityOverlays(
    facilities: InfrastructureSpot[],
    overlays?: Record<string, Record<string, unknown>> | null
): InfrastructureSpot[] {
    if (!overlays) return facilities;
    return facilities.map((facility) => applyFacilityOverlay(facility, overlays[facility.id]));
}
