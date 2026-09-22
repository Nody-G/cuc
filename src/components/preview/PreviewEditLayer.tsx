'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
    CUC_INDEX_ATTRIBUTE,
    hasCommitChanged,
    previewMessage,
    type PreviewMessage,
} from '@/lib/preview/preview-protocol';
import {
    clearPreviewSelection,
    getPreviewEditState,
    resolveOverlaySelection,
    subscribePreviewEdit,
    type PreviewEditState,
    type PreviewSelection,
} from '@/lib/preview/preview-edit';

/**
 * ==============================================================================
 * CUC — Couche d'édition en place (Mode Studio, côté vitrine)
 * ==============================================================================
 * Quand le Cockpit est en mode `edit`, le clic sur un élément `[data-cuc-field]`
 * ouvre **sur place** une saisie posée au-dessus de l'élément cible :
 *  - `input` pour `text` et `link`, `textarea` pour `textarea` ;
 *  - Entrée valide (mono-ligne) ; Ctrl/Cmd+Entrée ou clic ailleurs valide
 *    (multi-lignes) ; Échap annule ;
 *  - aucune valeur inchangée n'est transmise (aucun message inutile) ;
 *  - le texte reste brut (sauts de ligne autorisés) : pas de HTML, donc pas de
 *    sanitisation et aucune mise en forme inventée.
 *
 * Primitive volontairement **non destructive** : on ne rend jamais l'élément
 * React `contentEditable` — la réconciliation écraserait le DOM. La saisie est
 * superposée, l'aperçu reste le vrai rendu public.
 *
 * Inerte hors iframe du Cockpit : rien n'est monté, rien n'est écouté.
 */

/** Attribut de surlignage déjà stylé par le pont d'aperçu. */
const ACTIVE_ATTRIBUTE = 'data-cuc-field-active';

interface OverlayLayout {
    left: number;
    top: number;
    width: number;
}

interface OverlayState {
    selection: PreviewSelection;
    layout: OverlayLayout;
    /** Valeur initiale : le contenu de l'élément au moment de l'ouverture. */
    value: string;
    fontSize: string;
    fontFamily: string;
}

/** Champ image : on ne saisit pas de texte, on remplace le média. */
interface MediaState {
    field: string;
    element: HTMLElement;
    layout: OverlayLayout;
}

/** Item de liste : on ne saisit pas de texte, on agit sur la liste. */
interface ListState {
    field: string;
    index: number;
    element: HTMLElement;
    layout: OverlayLayout;
}

function measure(element: HTMLElement): OverlayLayout {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: rect.width };
}

function buildOverlay(selection: PreviewSelection): OverlayState {
    const computed = window.getComputedStyle(selection.element);
    return {
        selection,
        layout: measure(selection.element),
        value: selection.element.textContent ?? '',
        fontSize: computed.fontSize,
        fontFamily: computed.fontFamily,
    };
}

export const PreviewEditLayer: React.FC = () => {
    // Rendu serveur et navigation publique : couche strictement inerte.
    const [embedded] = useState<boolean>(
        () => typeof window !== 'undefined' && window.parent !== window
    );
    const [overlay, setOverlay] = useState<OverlayState | null>(null);
    const [media, setMedia] = useState<MediaState | null>(null);
    const [list, setList] = useState<ListState | null>(null);
    const overlayRef = useRef<OverlayState | null>(null);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
    const activeElementRef = useRef<HTMLElement | null>(null);
    const cancelledRef = useRef(false);

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

    // Applique l'état d'édition : sélection éditable → saisie posée sur l'élément ;
    // toute autre combinaison ferme la couche.
    useEffect(() => {
        if (!embedded) return;

        const apply = (state: PreviewEditState) => {
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
        };

        apply(getPreviewEditState());
        return subscribePreviewEdit(apply);
    }, [embedded]);

    const isOpen = overlay !== null || media !== null || list !== null;

    // Repositionnement : la saisie suit l'élément au défilement et au
    // redimensionnement ; si l'élément disparaît (re-rendu React), on ferme.
    useEffect(() => {
        if (!embedded || !isOpen) return;

        const reposition = () => {
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
        };

        window.addEventListener('scroll', reposition, true);
        window.addEventListener('resize', reposition);
        return () => {
            window.removeEventListener('scroll', reposition, true);
            window.removeEventListener('resize', reposition);
        };
    }, [embedded, isOpen]);

    const overlayField = overlay?.selection.field ?? null;

    // Focus et sélection du texte : on édite exactement ce qui est affiché.
    useEffect(() => {
        if (!overlayField) return;
        const node = inputRef.current;
        if (!node) return;
        node.focus();
        node.select();
    }, [overlayField]);

    const commit = useCallback(() => {
        const current = overlayRef.current;
        if (!current) return;
        const node = inputRef.current;
        const next = node ? node.value : current.value;
        if (hasCommitChanged(current.value, next)) {
            post(previewMessage.fieldCommit(current.selection.field, next));
        }
        closeOverlay();
    }, [post, closeOverlay]);

    const handleBlur = useCallback(() => {
        if (cancelledRef.current) {
            cancelledRef.current = false;
            closeOverlay();
            return;
        }
        commit();
    }, [commit, closeOverlay]);

    const handleKeyDown = useCallback(
        (event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                cancelledRef.current = true;
                closeOverlay();
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
        [commit, closeOverlay]
    );

    if (!embedded || (!overlay && !media && !list)) return null;

    if (list) {
        const listCommandButton = (
            label: string,
            command: 'add' | 'remove' | 'move-up' | 'move-down' | 'duplicate'
        ) => (
            <button
                key={command}
                type="button"
                title={label}
                onClick={() => {
                    post(previewMessage.listCommand(list.field, command, list.index));
                    closeOverlay();
                }}
                className="bg-[#FFE500] text-black font-mono-tech text-[11px] font-bold px-2.5 py-1.5 border border-black/40 hover:opacity-90 transition-opacity"
            >
                {label}
            </button>
        );

        return (
            <div
                data-cuc-list-overlay=""
                style={{
                    position: 'fixed',
                    left: list.layout.left,
                    top: list.layout.top,
                    zIndex: 2147483000,
                }}
                className="flex items-center gap-1 bg-black/85 p-1"
            >
                {listCommandButton('Monter', 'move-up')}
                {listCommandButton('Descendre', 'move-down')}
                {listCommandButton('Dupliquer', 'duplicate')}
                {listCommandButton('Ajouter', 'add')}
                {listCommandButton('Supprimer', 'remove')}
            </div>
        );
    }

    if (media) {
        return (
            <div
                data-cuc-media-overlay=""
                style={{
                    position: 'fixed',
                    left: media.layout.left,
                    top: media.layout.top,
                    maxWidth: media.layout.width,
                    zIndex: 2147483000,
                }}
            >
                <button
                    type="button"
                    onClick={() => {
                        post(previewMessage.mediaRequest(media.field));
                        closeOverlay();
                    }}
                    className="w-full bg-[#FFE500] text-black font-mono-tech text-[11px] font-bold uppercase tracking-wider px-3 py-2 border-2 border-black/40 hover:opacity-90 transition-opacity"
                >
                    Remplacer l’image
                </button>
            </div>
        );
    }

    if (!overlay) return null;

    const { layout, selection, value, fontSize, fontFamily } = overlay;
    const isTextarea = selection.kind === 'textarea';
    const hint = isTextarea
        ? 'Ctrl+Entrée ou clic ailleurs pour valider · Échap pour annuler'
        : 'Entrée pour valider · Échap pour annuler';

    const fieldStyle: CSSProperties = { fontSize, fontFamily };

    return (
        <div
            data-cuc-edit-overlay=""
            style={{
                position: 'fixed',
                left: layout.left,
                top: layout.top,
                width: Math.max(layout.width, 160),
                zIndex: 2147483000,
            }}
        >
            {isTextarea ? (
                <textarea
                    ref={(node) => {
                        inputRef.current = node;
                    }}
                    defaultValue={value}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    rows={3}
                    style={fieldStyle}
                    className="w-full bg-[#0D0D12] text-white border-2 border-[#FFE500] outline-none px-2 py-1 leading-snug resize-y"
                />
            ) : (
                <input
                    ref={(node) => {
                        inputRef.current = node;
                    }}
                    defaultValue={value}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    style={fieldStyle}
                    className="w-full bg-[#0D0D12] text-white border-2 border-[#FFE500] outline-none px-2 py-1"
                />
            )}
            <div className="mt-1 inline-flex bg-black/85 border border-white/15 text-[11px] font-mono text-zinc-300 px-2 py-1">
                {hint}
            </div>
        </div>
    );
};
