/**
 * ==============================================================================
 * CUC — Attributs de champ éditable (Mode Studio)
 * ==============================================================================
 * Poser un champ éditable en place doit être **trivial et sûr** dans tous les
 * composants de la vitrine :
 *
 *   <h2 {...cucField('sections_data.formules.title')}>{…}</h2>
 *   <span {...cucField(listPath('formules', index, 'step_badge'))}>{…}</span>
 *
 * Règles :
 *  - un chemin indisponible (`null`, `undefined`, vide, index négatif) ne pose
 *    **aucun attribut** : jamais de champ fantôme pointant hors du brouillon ;
 *  - la nature (`data-cuc-kind`) est optionnelle et vaut `text` par défaut ;
 *  - la construction des chemins de listes est centralisée (`itemPath`), car un
 *    index faux écrirait la valeur d'un autre item.
 */

import {
    CUC_FIELD_ATTRIBUTE,
    CUC_KIND_ATTRIBUTE,
    CUC_REACH_ATTRIBUTE,
    type CucFieldKind,
} from './preview-protocol';

export interface CucFieldAttributes {
    [CUC_FIELD_ATTRIBUTE]?: string;
    [CUC_KIND_ATTRIBUTE]?: CucFieldKind;
}

export interface CucReachAttributes {
    [CUC_REACH_ATTRIBUTE]?: string;
}

/**
 * Attributs d'un **calque décoratif qui porte des champs éditables** : en Mode
 * Studio seulement, la couche d'aperçu remonte ce calque au-dessus de ses
 * frères et rend le geste à ses seuls champs annotés. À poser sur le conteneur
 * (jamais sur le champ lui-même), quand un `pointer-events-none` ou un frère
 * plein cadre empêcherait sinon tout clic d'atteindre le texte.
 */
export function cucReach(): CucReachAttributes {
    return { [CUC_REACH_ATTRIBUTE]: '' };
}

/** Attributs d'un champ éditable — aucun si le chemin est indisponible. */
export function cucField(
    path: string | null | undefined,
    kind: CucFieldKind = 'text'
): CucFieldAttributes {
    const clean = typeof path === 'string' ? path.trim() : '';
    if (!clean) return {};
    return {
        [CUC_FIELD_ATTRIBUTE]: clean,
        [CUC_KIND_ATTRIBUTE]: kind,
    };
}

/**
 * Chemin d'un item de liste : `sections_data.<bloc>.items.<index>.<clé>`.
 * Retourne `null` si l'index est invalide (aucun attribut ne sera posé).
 */
export function itemPath(
    block: string,
    index: number,
    key: string
): string | null {
    if (!block || !Number.isInteger(index) || index < 0) return null;
    return `sections_data.${block}.items.${index}.${key}`;
}

/**
 * Index d'un item par identifiant dans une liste issue des données.
 * `-1` si absent : l'appelant garde alors son repli traduit, sans annotation.
 */
export function findItemIndex<T extends { id?: string }>(
    items: readonly T[] | undefined,
    id: string
): number {
    if (!Array.isArray(items)) return -1;
    return items.findIndex((item) => item?.id === id);
}
