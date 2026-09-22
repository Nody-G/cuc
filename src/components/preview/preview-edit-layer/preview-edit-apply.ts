import type { Dispatch, RefObject, SetStateAction } from 'react';
import { CUC_INDEX_ATTRIBUTE } from '@/lib/preview/preview-protocol';
import {
    clearPreviewSelection,
    resolveOverlaySelection,
    type PreviewEditState,
} from '@/lib/preview/preview-edit';
import {
    ACTIVE_ATTRIBUTE,
    buildOverlay,
    measure,
    type ListState,
    type MediaState,
    type OverlayState,
} from './overlay-model';

/** Contexte partagé des opérations d'état de la couche d'édition. */
export interface PreviewEditContext {
    overlayRef: RefObject<OverlayState | null>;
    activeElementRef: RefObject<HTMLElement | null>;
    cancelledRef: RefObject<boolean>;
    setOverlay: Dispatch<SetStateAction<OverlayState | null>>;
    setMedia: Dispatch<SetStateAction<MediaState | null>>;
    setList: Dispatch<SetStateAction<ListState | null>>;
}

/**
 * Applique l'état d'édition : sélection éditable → saisie posée sur l'élément ;
 * toute autre combinaison ferme la couche.
 */
export function applyPreviewEditState(state: PreviewEditState, ctx: PreviewEditContext): void {
    const { activeElementRef, cancelledRef, setOverlay, setMedia, setList } = ctx;
    const selection = resolveOverlaySelection(state);
    // Champ image : l'édition en place propose de remplacer le média, pas
    // de saisir du texte — l'écriture passe par la médiathèque du Cockpit.
    const mediaSelection =
        state.mode === 'edit' && state.selection?.kind === 'image'
            ? state.selection
            : null;
    const listSelection =
        state.mode === 'edit' && state.selection?.kind === 'list-item'
            ? state.selection
            : null;
    const nextElement =
        selection?.element ?? mediaSelection?.element ?? listSelection?.element ?? null;
    const previous = activeElementRef.current;

    if (previous && previous !== nextElement) {
        previous.removeAttribute(ACTIVE_ATTRIBUTE);
        activeElementRef.current = null;
    }

    if (!selection && !mediaSelection && !listSelection) {
        cancelledRef.current = false;
        setOverlay(null);
        setMedia(null);
        setList(null);
        return;
    }

    if (listSelection) {
        const rawIndex = listSelection.element.getAttribute(CUC_INDEX_ATTRIBUTE);
        const index = rawIndex === null ? -1 : Number.parseInt(rawIndex, 10);
        activeElementRef.current = listSelection.element;
        listSelection.element.setAttribute(ACTIVE_ATTRIBUTE, '');
        setOverlay(null);
        setMedia(null);
        setList({
            field: listSelection.field,
            index: Number.isInteger(index) ? index : -1,
            element: listSelection.element,
            layout: measure(listSelection.element),
        });
        return;
    }

    if (mediaSelection) {
        activeElementRef.current = mediaSelection.element;
        mediaSelection.element.setAttribute(ACTIVE_ATTRIBUTE, '');
        setOverlay(null);
        setList(null);
        setMedia({
            field: mediaSelection.field,
            element: mediaSelection.element,
            layout: measure(mediaSelection.element),
        });
        return;
    }

    if (!selection) return;
    activeElementRef.current = selection.element;
    selection.element.setAttribute(ACTIVE_ATTRIBUTE, '');
    setMedia(null);
    setList(null);
    setOverlay(buildOverlay(selection));
}

/**
 * Repositionnement : la saisie suit l'élément au défilement et au
 * redimensionnement ; si l'élément disparaît (re-rendu React), on ferme.
 */
export function repositionPreviewEdit(ctx: PreviewEditContext): void {
    const { overlayRef, setOverlay, setMedia, setList } = ctx;
    const current = overlayRef.current;
    if (current) {
        const element = current.selection.element;
        if (!element.isConnected) {
            clearPreviewSelection();
            return;
        }
        const layout = measure(element);
        setOverlay((prev) =>
            prev && prev.selection.element === element ? { ...prev, layout } : prev
        );
    }

    setMedia((prev) => {
        if (!prev) return prev;
        if (!prev.element.isConnected) return null;
        return { ...prev, layout: measure(prev.element) };
    });

    setList((prev) => {
        if (!prev) return prev;
        if (!prev.element.isConnected) return null;
        return { ...prev, layout: measure(prev.element) };
    });
}
