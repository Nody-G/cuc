import type { PreviewSelection } from '@/lib/preview/preview-edit';
import {
    buildInlineEditorTypography,
    fieldChipLabel,
    readEditorTypography,
    type InlineEditorTypography,
} from '@/lib/preview/inline-style';

/** Attribut de surlignage déjà stylé par le pont d'aperçu. */
export const ACTIVE_ATTRIBUTE = 'data-cuc-field-active';

export interface OverlayLayout {
    left: number;
    top: number;
    width: number;
}

export interface OverlayState {
    selection: PreviewSelection;
    layout: OverlayLayout;
    /** Valeur initiale : le contenu de l'élément au moment de l'ouverture. */
    value: string;
    /** Typographie de l'élément édité : la saisie se fond dans le rendu réel. */
    typography: InlineEditorTypography;
    /** Étiquette du champ (`about.title`) : on voit toujours ce qu'on édite. */
    chip: string;
    /** Repli affiché quand le champ est vidé (ce que la page rendra alors). */
    placeholder: string;
}

/** Champ image : on ne saisit pas de texte, on remplace le média. */
export interface MediaState {
    field: string;
    element: HTMLElement;
    layout: OverlayLayout;
}

/** Item de liste : on ne saisit pas de texte, on agit sur la liste. */
export interface ListState {
    field: string;
    index: number;
    element: HTMLElement;
    layout: OverlayLayout;
}

/** Commande de liste envoyée au Cockpit. */
export type ListCommand = 'add' | 'remove' | 'move-up' | 'move-down' | 'duplicate';

export function measure(element: HTMLElement): OverlayLayout {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: rect.width };
}

export function buildOverlay(selection: PreviewSelection): OverlayState {
    const element = selection.element;
    // Texte réellement rendu (donc repli traduit inclus s'il n'y a pas de donnée) :
    // il sert à la fois de valeur de départ et de repère quand le champ est vidé.
    const rendered = (element.textContent ?? '').trim();

    return {
        selection,
        layout: measure(element),
        value: rendered,
        typography: buildInlineEditorTypography(readEditorTypography(element)),
        chip: fieldChipLabel(selection.field),
        placeholder: rendered,
    };
}
