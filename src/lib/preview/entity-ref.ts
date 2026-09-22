/**
 * ==============================================================================
 * CUC — Référence d'entité éditable (Mode Studio)
 * ==============================================================================
 * Les entités de la base (annonces, coachs, films…) ne sont pas des chemins de
 * contenu de page : leur identité est **`table:id:champ`**. Une seule
 * orthographe, partagée par l'annotation (`data-cuc-entity`), le protocole
 * (commit `source: 'entity'`) et l'écriture serveur — jamais une chaîne
 * recollée à la main quelque part.
 *
 * Fonctions pures : aucun accès réseau, aucune connaissance du schéma (la
 * liste blanche des tables/champs vit dans l'action serveur, seul point
 * d'écriture).
 */

/** Séparateur des trois segments (`site_announcements:12:title`). */
export const ENTITY_REF_SEPARATOR = ':';

const SEGMENT = /^[A-Za-z0-9_-]+$/;

export interface EntityRefParts {
    table: string;
    id: string;
    field: string;
}

/** Référence valide ? (trois segments simples, ni vide ni gabarit). */
export function isEntityRef(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    const parts = value.split(ENTITY_REF_SEPARATOR);
    if (parts.length !== 3) return false;
    return parts.every((part) => SEGMENT.test(part));
}

/** Construit la référence canonique — `null` si un segment est invalide. */
export function entityRef(table: string, id: string, field: string): string | null {
    const candidate = [table, id, field].join(ENTITY_REF_SEPARATOR);
    return isEntityRef(candidate) ? candidate : null;
}

/** Décompose une référence valide — `null` sinon. */
export function parseEntityRef(ref: string): EntityRefParts | null {
    if (!isEntityRef(ref)) return null;
    const [table, id, field] = ref.split(ENTITY_REF_SEPARATOR);
    return { table, id, field };
}
