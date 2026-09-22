/**
 * ==============================================================================
 * CUC — Navigation clavier entre les champs éditables (Mode Studio)
 * ==============================================================================
 * Standard des éditeurs visuels actuels : on passe d'un champ à l'autre au
 * clavier (`Tab` / `Maj+Tab`), dans l'ordre du document, sans quitter la page.
 *
 * Ce module est la seule source de l'ordre de tabulation : il lit les attributs
 * posés par `cucField()` (aucune liste parallèle à maintenir) et ne retient que
 * les natures réellement éditables en place. Un champ sans boîte visible
 * (masqué par la mise en page, onglet inactif) est ignoré — sinon `Tab`
 * enverrait la saisie dans un élément que l'utilisateur ne voit pas.
 */

import {
    CUC_INDEX_ATTRIBUTE,
    resolveFieldKind,
    type CucFieldKind,
    type PreviewFieldSource,
} from './preview-protocol';
import { CUC_FIELD_SELECTOR, resolveFieldTarget } from './field-hit';

/** Natures éditables par saisie texte (mêmes règles que la couche d'édition). */
export const INLINE_NAVIGABLE_KINDS: readonly CucFieldKind[] = ['text', 'textarea', 'link'];

export interface EditableFieldRef {
    /** Chemin canonique reporté au Cockpit. */
    path: string;
    /** Nature déclarée (défaut `text`). */
    kind: CucFieldKind;
    /** Élément porteur de l'attribut. */
    element: HTMLElement;
    /** Source du texte (absente = contenu de page). */
    source?: PreviewFieldSource;
}

function isEditableKind(kind: CucFieldKind): boolean {
    return INLINE_NAVIGABLE_KINDS.includes(kind);
}

/** L'élément est-il réellement affiché (boîte non nulle) ? */
function isVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return rect.width > 1 && rect.height > 1;
}

/**
 * Champs éditables en place, dans l'ordre du document. Les chemins identiques
 * (même champ rendu deux fois, ex. lien dupliqué) ne sont comptés qu'une fois :
 * `Tab` ne doit pas s'arrêter deux fois sur la même valeur.
 */
export function collectEditableFields(root: ParentNode): EditableFieldRef[] {
    const seen = new Set<string>();
    const fields: EditableFieldRef[] = [];

    // Contenu de page, réglages et micro-textes : une seule séquence de
    // tabulation, fidèle à ce que l'utilisateur voit.
    for (const node of root.querySelectorAll<HTMLElement>(CUC_FIELD_SELECTOR)) {
        const target = resolveFieldTarget(node);
        if (!target || seen.has(target.field)) continue;
        if (node.getAttribute(CUC_INDEX_ATTRIBUTE) !== null) continue;

        const kind = resolveFieldKind(node.getAttribute('data-cuc-kind'));
        if (!isEditableKind(kind)) continue;
        if (!isVisible(node)) continue;

        seen.add(target.field);
        fields.push({
            path: target.field,
            kind,
            element: node,
            // Omise pour le contenu de page : forme historique conservée.
            ...(target.source !== 'page' ? { source: target.source } : {}),
        });
    }

    return fields;
}

/**
 * Champ suivant (ou précédent) à partir du champ courant. Le parcours boucle :
 * après le dernier champ on revient au premier, ce qui évite de « sortir » de
 * l'édition par mégarde.
 */
export function nextEditableField(
    fields: readonly EditableFieldRef[],
    currentPath: string | null,
    direction: 1 | -1 = 1
): EditableFieldRef | null {
    if (fields.length === 0) return null;

    const index = currentPath ? fields.findIndex((field) => field.path === currentPath) : -1;
    if (index === -1) return direction === 1 ? fields[0] : fields[fields.length - 1];

    const next = (index + direction + fields.length) % fields.length;
    return fields[next];
}
