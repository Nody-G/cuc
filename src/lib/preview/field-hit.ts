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

import {
    CUC_ENTITY_ATTRIBUTE,
    CUC_FIELD_ATTRIBUTE,
    CUC_MICRO_ATTRIBUTE,
    CUC_SETTING_ATTRIBUTE,
    type PreviewFieldSource,
} from './preview-protocol';

/** Contrôles interactifs : toute leur surface désigne leur libellé. */
const CONTROL_SELECTOR = 'a[href], button, [role="button"]';

/**
 * Attributs reconnus, dans l'ordre de priorité. Un nœud ne porte qu'**une**
 * source : chrome (réglages, micro-textes) et entités de la base se résolvent
 * comme le contenu de page.
 */
const FIELD_ATTRIBUTES: ReadonlyArray<{ attribute: string; source: PreviewFieldSource }> = [
    { attribute: CUC_FIELD_ATTRIBUTE, source: 'page' },
    { attribute: CUC_SETTING_ATTRIBUTE, source: 'setting' },
    { attribute: CUC_MICRO_ATTRIBUTE, source: 'micro' },
    { attribute: CUC_ENTITY_ATTRIBUTE, source: 'entity' },
];

/** Sélecteur unique de tous les champs éditables en place. */
export const CUC_FIELD_SELECTOR = FIELD_ATTRIBUTES.map(
    ({ attribute }) => `[${attribute}]`
).join(', ');

export interface ResolvedFieldTarget {
    /** Clé transmise au Cockpit (chemin de page, clé de réglage, clé i18n). */
    field: string;
    /** Où le commit doit être écrit. */
    source: PreviewFieldSource;
    /** Attribut porteur (utile aux diagnostics et aux tests). */
    attribute: string;
}

/** Cible portée par un élément (jamais un attribut vide), ou `null`. */
export function resolveFieldTarget(element: Element): ResolvedFieldTarget | null {
    for (const { attribute, source } of FIELD_ATTRIBUTES) {
        const value = element.getAttribute(attribute)?.trim();
        if (value) return { field: value, source, attribute };
    }
    return null;
}

/**
 * Élément porteur du champ visé par `target`, ou `null` si le geste doit
 * garder son comportement public (navigation, modale, action).
 */
export function resolveFieldElement(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof Element)) return null;

    // 1. Cas nominal : la cible (ou un ancêtre) porte l'annotation.
    const annotated = target.closest<HTMLElement>(CUC_FIELD_SELECTOR);
    if (annotated) return resolveFieldTarget(annotated) ? annotated : null;

    // 2. Contrôle interactif : un unique champ descendant → le rembourrage et
    //    les icônes désignent ce libellé, sans jamais deviner entre plusieurs.
    const control = target.closest<HTMLElement>(CONTROL_SELECTOR);
    if (!control) return null;

    const candidates = [...control.querySelectorAll<HTMLElement>(CUC_FIELD_SELECTOR)].filter(
        (element) => resolveFieldTarget(element) !== null
    );
    if (candidates.length === 0) return null;

    const paths = new Set(candidates.map((element) => resolveFieldTarget(element)?.field));
    if (paths.size !== 1) return null;

    return candidates[0];
}
