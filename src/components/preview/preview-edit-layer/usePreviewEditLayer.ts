'use client';

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type KeyboardEvent as ReactKeyboardEvent,
    type RefObject,
} from 'react';
import {
    hasCommitChanged,
    previewMessage,
    type PreviewMessage,
} from '@/lib/preview/preview-protocol';
import {
    clearPreviewSelection,
    getPreviewEditState,
    selectPreviewField,
    subscribePreviewEdit,
} from '@/lib/preview/preview-edit';
import { collectEditableFields, nextEditableField } from '@/lib/preview/field-navigation';
import { applyPreviewEditState, repositionPreviewEdit } from './preview-edit-apply';
import type { ListCommand, ListState, MediaState, OverlayState } from './overlay-model';

export interface UsePreviewEditLayerArgs {
    /** Ref de la saisie affichée par la façade (jamais retournée par le hook). */
    inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
}

export interface UsePreviewEditLayerResult {
    embedded: boolean;
    overlay: OverlayState | null;
    media: MediaState | null;
    list: ListState | null;
    runListCommand: (command: ListCommand) => void;
    requestMediaReplace: () => void;
    handleBlur: () => void;
    handleKeyDown: (event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function usePreviewEditLayer({
    inputRef,
}: UsePreviewEditLayerArgs): UsePreviewEditLayerResult {
    // Rendu serveur et navigation publique : couche strictement inerte.
    const [embedded] = useState<boolean>(
        () => typeof window !== 'undefined' && window.parent !== window
    );
    const [overlay, setOverlay] = useState<OverlayState | null>(null);
    const [media, setMedia] = useState<MediaState | null>(null);
    const [list, setList] = useState<ListState | null>(null);
    const overlayRef = useRef<OverlayState | null>(null);
    const activeElementRef = useRef<HTMLElement | null>(null);
    const cancelledRef = useRef(false);
    /** Vrai pendant un passage au champ suivant : le flou ne doit rien annuler. */
    const navigatingRef = useRef(false);
    /** Vrai quand on arrive au clavier : le curseur se pose en fin de texte. */
    const caretAtEndRef = useRef(false);

    useEffect(() => {
        overlayRef.current = overlay;
    }, [overlay]);

    const post = useCallback((message: PreviewMessage) => {
        window.parent.postMessage(message, window.location.origin);
    }, []);

    const closeOverlay = useCallback(() => {
        // La fermeture passe par le store : un seul chemin de sortie, donc aucun
        // surlignage fantôme ni état résiduel.
        clearPreviewSelection();
    }, []);

    // Applique l'état d'édition à la couche (saisie, remplacement média, liste).
    useEffect(() => {
        if (!embedded) return;
        const ctx = { overlayRef, activeElementRef, cancelledRef, setOverlay, setMedia, setList };
        applyPreviewEditState(getPreviewEditState(), ctx);
        return subscribePreviewEdit((state) => applyPreviewEditState(state, ctx));
    }, [embedded]);

    const isOpen = overlay !== null || media !== null || list !== null;

    // Repositionnement : la saisie suit l'élément au défilement et au
    // redimensionnement ; si l'élément disparaît (re-rendu React), on ferme.
    useEffect(() => {
        if (!embedded || !isOpen) return;

        const reposition = () =>
            repositionPreviewEdit({ overlayRef, activeElementRef, cancelledRef, setOverlay, setMedia, setList });

        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [embedded, isOpen]);

    const overlayField = overlay?.selection.field ?? null;

    // Focus et sélection : clic → tout le texte est sélectionné (on remplace),
    // passage au clavier (Tab) → curseur en fin de texte (on complète).
    useEffect(() => {
        if (!overlayField) return;
        const node = inputRef.current;
        if (!node) return;
        node.focus();

        if (caretAtEndRef.current) {
            caretAtEndRef.current = false;
            const end = node.value.length;
            node.setSelectionRange(end, end);
            return;
        }

        node.select();
    }, [overlayField, inputRef]);

    const commit = useCallback(() => {
        const current = overlayRef.current;
        if (!current) return;
        const node = inputRef.current;
        const next = node ? node.value : current.value;
        if (hasCommitChanged(current.value, next)) {
            post(previewMessage.fieldCommit(current.selection.field, next));
        }
        closeOverlay();
    }, [inputRef, post, closeOverlay]);

    const handleBlur = useCallback(() => {
        // Changement de champ au clavier : la valeur a déjà été validée, le flou
        // ne doit ni la revalider ni fermer la nouvelle sélection.
        if (navigatingRef.current) {
            navigatingRef.current = false;
            return;
        }
        if (cancelledRef.current) {
            cancelledRef.current = false;
            closeOverlay();
            return;
        }
        commit();
    }, [commit, closeOverlay]);

    /** Valide la saisie courante sans fermer la couche (navigation clavier). */
    const flushCurrentValue = useCallback(() => {
        const current = overlayRef.current;
        if (!current) return;
        const node = inputRef.current;
        const next = node ? node.value : current.value;
        if (hasCommitChanged(current.value, next)) {
            post(previewMessage.fieldCommit(current.selection.field, next));
        }
    }, [inputRef, post]);

    const handleKeyDown = useCallback(
        (event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                cancelledRef.current = true;
                closeOverlay();
                return;
            }

            // Standard des éditeurs visuels : Tab enchaîne les champs éditables
            // sans quitter la page — Maj+Tab remonte.
            if (event.key === 'Tab') {
                const current = overlayRef.current;
                if (!current) return;

                event.preventDefault();
                event.stopPropagation();
                flushCurrentValue();

                navigatingRef.current = true;
                caretAtEndRef.current = true;

                const target = nextEditableField(
                    collectEditableFields(document),
                    current.selection.field,
                    event.shiftKey ? -1 : 1
                );

                if (!target) {
                    navigatingRef.current = false;
                    caretAtEndRef.current = false;
                    closeOverlay();
                    return;
                }

                selectPreviewField({
                    field: target.path,
                    kind: target.kind,
                    element: target.element,
                });
                return;
            }

            if (event.key !== 'Enter') return;

            const isTextarea = overlayRef.current?.selection.kind === 'textarea';
            const wantsCommit = isTextarea ? event.ctrlKey || event.metaKey : true;
            if (!wantsCommit) return;

            event.preventDefault();
            event.stopPropagation();
            commit();
        },
        [commit, closeOverlay, flushCurrentValue]
    );

    const runListCommand = useCallback(
        (command: ListCommand) => {
            if (!list) return;
            post(previewMessage.listCommand(list.field, command, list.index));
            closeOverlay();
        },
        [list, post, closeOverlay]
    );

    const requestMediaReplace = useCallback(() => {
        if (!media) return;
        post(previewMessage.mediaRequest(media.field));
        closeOverlay();
    }, [media, post, closeOverlay]);

    return {
        embedded,
        overlay,
        media,
        list,
        runListCommand,
        requestMediaReplace,
        handleBlur,
        handleKeyDown,
    };
}
