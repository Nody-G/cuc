/**
 * ==============================================================================
 * CUC — Cible d'édition sous le curseur (Mode Studio)
 * ==============================================================================
 * Le survol et le clic doivent désigner **le même** champ, même quand la
 * surface interactive dépasse l'annotation :
 *
 *  - l'annotation est posée sur le texte (`<span data-cuc-field>`) mais la
 *    surface cliquable est le bouton ou le lien qui l'entoure — rembourrage,
 *    icône, chevron. Cliquer à côté du libellé ne doit pas faire naviguer :
 *    le contrôle porte **un seul** champ, c'est lui qui est visé ;
 *  - une carte-lien qui porte **plusieurs** champs reste ambiguë : on ne
 *    devine pas (aucun champ fantôme, aucune écriture au mauvais endroit) —
 *    elle garde son comportement public ;
 *  - les icônes sont des nœuds SVG (`SVGElement`), pas des `HTMLElement` :
 *    la cible est donc un `Element`, sinon un clic sur un chevron serait
 *    ignoré et déclencherait la navigation.
 *
 * Fonction pure, sans React : la seule vérité est le DOM.
 */

import { CUC_FIELD_ATTRIBUTE } from './preview-protocol';

/** Contrôles interactifs : toute leur surface désigne leur libellé. */
const CONTROL_SELECTOR = 'a[href], button, [role="button"]';

/** Chemin réellement porté par un élément (jamais un attribut vide). */
function fieldPathOf(element: Element): string | null {
    const path = element.getAttribute(CUC_FIELD_ATTRIBUTE);
    const clean = path?.trim() ?? '';
    return clean.length > 0 ? clean : null;
}

/**
 * Élément porteur du champ visé par `target`, ou `null` si le geste doit
 * garder son comportement public (navigation, modale, action).
 */
export function resolveFieldElement(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof Element)) return null;

    // 1. Cas nominal : la cible (ou un ancêtre) porte l'annotation.
    const annotated = target.closest<HTMLElement>(`[${CUC_FIELD_ATTRIBUTE}]`);
    if (annotated) return fieldPathOf(annotated) ? annotated : null;

    // 2. Contrôle interactif : un unique champ descendant → le rembourrage et
    //    les icônes désignent ce libellé, sans jamais deviner entre plusieurs.
    const control = target.closest<HTMLElement>(CONTROL_SELECTOR);
    if (!control) return null;

    const candidates = [...control.querySelectorAll<HTMLElement>(`[${CUC_FIELD_ATTRIBUTE}]`)]
        .filter((element) => fieldPathOf(element) !== null);
    if (candidates.length === 0) return null;

    const paths = new Set(candidates.map((element) => fieldPathOf(element)));
    if (paths.size !== 1) return null;

    return candidates[0];
}
