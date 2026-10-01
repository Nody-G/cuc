'use client';

import { useCallback } from 'react';
import type { EditorLocaleOption } from '../ui';
import type { ChromeDraftState } from './useChromeDraftState';

/** Signaux de brouillon de page lus par la barre d'enregistrement flottante. */
export interface PageEditorDraftSource {
    /** Nombre d'écarts entre le brouillon FR et le contenu enregistré. */
    draftChanges: readonly unknown[];
    /** Traduction EN : état de propreté et abandon des modifications en attente. */
    translation: {
        dirty: boolean;
        revert: () => void;
    };
    /** Abandonne le brouillon français (retour au contenu enregistré). */
    handleRevertAllChanges: () => void;
}

export interface PageEditorDirtyState {
    /** Une page, un chrome ou une traduction attend un enregistrement. */
    isDirty: boolean;
    /** Abandonne simultanément tous les brouillons en cours. */
    discardAll: () => void;
}

/**
 * Agrège les brouillons de l'éditeur de pages (page FR, chrome partagé, traduction
 * EN) en un signal unique pour la barre d'enregistrement, avec un abandon qui
 * remet tout à l'état enregistré.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : aucun état propre, les
 * sources de vérité restent les hooks de brouillon existants.
 */
export function usePageEditorDirtyState(
    draft: PageEditorDraftSource,
    chrome: ChromeDraftState,
    editorLocale: EditorLocaleOption
): PageEditorDirtyState {
    const isDirty =
        draft.draftChanges.length > 0 ||
        draft.translation.dirty ||
        Object.keys(chrome.settings).length > 0 ||
        Object.keys(chrome.microcopy).length > 0 ||
        Object.keys(chrome.entities).length > 0;

    const discardAll = useCallback(() => {
        if (editorLocale === 'en') draft.translation.revert();
        else draft.handleRevertAllChanges();
        chrome.clearSettings();
        chrome.clearMicrocopy();
        chrome.clearEntities();
    }, [draft, chrome, editorLocale]);

    return { isDirty, discardAll };
}
