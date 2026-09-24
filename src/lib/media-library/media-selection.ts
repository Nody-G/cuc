/**
 * Domaine de la sélection de la médiathèque : cibles d'une suppression,
 * résumé lisible, sélection restante et comptage des références.
 * Fonctions pures (`AGENTS.md` § 1-2), testables hors du cycle de vie UI.
 *
 * Correctif du 2026-09-24 : la corbeille du panneau détail passait par
 * `setSelection([detail.path])` puis `handleDelete()` — la fonction lisait la
 * sélection du rendu **précédent**, donc le premier clic ne supprimait rien.
 * Les cibles sont désormais **explicites**.
 */

import { basename } from './media-paths';

/**
 * Chemins réellement visés par une suppression : la cible explicite prime,
 * sinon la sélection courante.
 */
export function resolveDeleteTargets(
    selection: string[],
    explicitPaths?: string[]
): string[] {
    return explicitPaths ?? selection;
}

export interface DeleteSummary {
    count: number;
    /** Trois premiers noms, séparés par des virgules. */
    names: string;
    /** Complément « (+N) » quand la liste est plus longue. */
    suffix: string;
}

/** Résumé lisible d'une suppression, sans surprise de troncature. */
export function summarizeDeleteTargets(targets: string[]): DeleteSummary {
    const count = targets.length;
    const names = targets
        .map((path) => basename(path))
        .slice(0, 3)
        .join(', ');
    const suffix = count > 3 ? ` (+${count - 3})` : '';

    return { count, names, suffix };
}

/** Sélection restante après suppression des chemins visés. */
export function removePaths(selection: string[], removed: string[]): string[] {
    const removedSet = new Set(removed);
    return selection.filter((path) => !removedSet.has(path));
}

/** Nombre de références en base pointant vers les chemins visés. */
export function countReferences(
    targets: string[],
    references: Record<string, string[]> | null
): number {
    if (!references) return 0;
    return targets.reduce((count, path) => count + (references[path]?.length ?? 0), 0);
}
