/**
 * ==============================================================================
 * CUC — Attribut d'entité éditable en place (Mode Studio)
 * ==============================================================================
 * Miroir de `cuc-chrome.ts` pour les textes qui vivent dans une **entité de la
 * base** (`site_announcements`, coachs, films…), identifiée par sa référence
 * `table:id:champ` (`entity-ref.ts`) :
 *
 *   <span {...cucEntity('site_announcements', announcement.id, 'title')}>
 *       {title}
 *   </span>
 *
 * Un helper (et non une chaîne recopiée) garde une seule orthographe de
 * l'attribut dans toute la vitrine — l'audit des micro-textes s'y appuie pour
 * ne pas confondre une annotation avec un libellé laissé en dur.
 */

import { entityRef } from './entity-ref';
import { CUC_ENTITY_ATTRIBUTE } from './preview-protocol';

export interface CucEntityAttributes {
    [CUC_ENTITY_ATTRIBUTE]?: string;
}

/** Attributs d'un texte d'entité — aucun si la référence est invalide. */
export function cucEntity(
    table: string | null | undefined,
    id: string | null | undefined,
    field: string | null | undefined
): CucEntityAttributes {
    if (!table || !id || !field) return {};
    const ref = entityRef(table, id, field);
    if (!ref) return {};
    return { [CUC_ENTITY_ATTRIBUTE]: ref };
}
