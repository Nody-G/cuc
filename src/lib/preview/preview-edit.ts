/**
 * ==============================================================================
 * CUC — État d'édition en place de l'aperçu (côté vitrine / iframe)
 * ==============================================================================
 * Module sans React : il porte UNIQUEMENT l'état du Mode Studio vu depuis
 * l'intérieur de l'iframe — le mode courant (`inspect` ou `edit`) et le champ
 * sélectionné (chemin, nature, élément DOM).
 *
 * Le pont (`PreviewBridgeClient`) est le seul à écrire ici ; la couche de rendu
 * (`PreviewEditLayer`) est la seule à lire. Les transitions sont volontairement
 * strictes :
 *   - repasser en `inspect` ferme immédiatement toute sélection (aucun champ ne
 *     reste « actif » quand l'utilisateur n'est plus en édition) ;
 *   - seules les natures texte (`text`, `textarea`, `link`) ont une édition en
 *     place ; `image` et `list-item` sont traités par leurs outils dédiés.
 */

import type { CucFieldKind, PreviewMode } from './preview-protocol';

export interface PreviewSelection {
    /** Chemin canonique du champ (`sections_data.<bloc>.<clé>`, `hero.<clé>`…). */
    field: string;
    /** Nature déclarée par `data-cuc-kind` (défaut `text`). */
    kind: CucFieldKind;
    /** Élément porteur de l'attribut, tel que cliqué dans l'aperçu. */
    element: HTMLElement;
}

export interface PreviewEditState {
    mode: PreviewMode;
    selection: PreviewSelection | null;
}

type Listener = (state: PreviewEditState) => void;

/** Natures éditables directement en place (saisie texte). */
const INLINE_EDITABLE_KINDS: readonly CucFieldKind[] = ['text', 'textarea', 'link'];

let state: PreviewEditState = { mode: 'inspect', selection: null };
const listeners = new Set<Listener>();

function emit(): void {
    for (const listener of listeners) listener(state);
}

export function getPreviewEditState(): PreviewEditState {
    return state;
}

/** Bascule le mode. Repasser en `inspect` ferme toute sélection en cours. */
export function setPreviewEditMode(mode: PreviewMode): void {
    if (state.mode === mode) return;
    state = { mode, selection: mode === 'edit' ? state.selection : null };
    emit();
}

export function selectPreviewField(selection: PreviewSelection): void {
    state = { mode: state.mode, selection };
    emit();
}

export function clearPreviewSelection(): void {
    if (!state.selection) return;
    state = { mode: state.mode, selection: null };
    emit();
}

export function subscribePreviewEdit(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** Une saisie en place n'a de sens que pour les natures texte. */
export function isInlineEditableKind(kind: CucFieldKind): boolean {
    return INLINE_EDITABLE_KINDS.includes(kind);
}

/**
 * Sélection effectivement éditable : mode `edit`, sélection présente, nature
 * compatible. Toute autre combinaison ferme la couche d'édition.
 */
export function resolveOverlaySelection(current: PreviewEditState): PreviewSelection | null {
    if (current.mode !== 'edit' || !current.selection) return null;
    return isInlineEditableKind(current.selection.kind) ? current.selection : null;
}
