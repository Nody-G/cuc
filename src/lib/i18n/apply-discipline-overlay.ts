import type { Discipline } from '@/types';

/**
 * ==============================================================================
 * Fusion de l'overlay EN d'une discipline (entité `discipline`)
 * ==============================================================================
 * Les 10 disciplines du référentiel vivent dans `site_disciplines` (repli
 * `CUC_DISCIPLINES`, `src/data/disciplines.ts`) : intitulé, description longue,
 * contexte de tournage et équipements sont des DONNÉES, pas de la copie
 * d'interface. L'anglais arrive par `site_translations`
 * (`entity = 'discipline'`, `entity_id` = identifiant de la discipline).
 *
 * Règles : aucune invention (seules les clés présentes écrasent le FR), repli
 * silencieux si l'overlay manque, et un tableau vide ne remplace jamais la
 * liste française.
 */
export function applyDisciplineOverlay(
    discipline: Discipline,
    overlay?: Record<string, unknown> | null
): Discipline {
    if (!overlay) return discipline;

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
        ...discipline,
        name: pickString(overlay.name, discipline.name) as string,
        shortDesc: pickString(overlay.shortDesc, discipline.shortDesc) as string,
        fullDesc: pickString(overlay.fullDesc, discipline.fullDesc) as string,
        cinemaContext: pickString(overlay.cinemaContext, discipline.cinemaContext) as string,
        equipment: pickArray(overlay.equipment, discipline.equipment) as string[],
    };
}

/** Applique les overlays à une liste de disciplines, indexées par identifiant. */
export function applyDisciplineOverlays(
    disciplines: Discipline[],
    overlays?: Record<string, Record<string, unknown>> | null
): Discipline[] {
    if (!overlays) return disciplines;
    return disciplines.map((discipline) =>
        applyDisciplineOverlay(discipline, overlays[discipline.id])
    );
}
