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
    selectPreviewField,
    subscribePreviewEdit,
    type PreviewEditState,
    type PreviewSelection,
} from '@/lib/preview/preview-edit';
import { collectEditableFields, nextEditableField } from '@/lib/preview/field-navigation';
import {
    buildInlineEditorTypography,
    fieldChipLabel,
    readEditorTypography,
    type InlineEditorTypography,
} from '@/lib/preview/inline-style';

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
    /** Typographie de l'élément édité : la saisie se fond dans le rendu réel. */
    typography: InlineEditorTypography;
    /** Étiquette du champ (`about.title`) : on voit toujours ce qu'on édite. */
    chip: string;
    /** Repli affiché quand le champ est vidé (ce que la page rendra alors). */
    placeholder: string;
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
    }, [post]);

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

    const { layout, selection, value, typography, chip, placeholder } = overlay;
    const isTextarea = selection.kind === 'textarea';
    const hint = isTextarea
        ? 'Ctrl+Entrée valider · Tab champ suivant · Échap annuler'
        : 'Entrée valider · Tab champ suivant · Échap annuler';

    // La typographie vient de l'élément édité : la saisie se superpose au rendu
    // réel sans le trahir (mêmes police, corps, graisse, casse, alignement).
    const fieldStyle = typography as CSSProperties;

    return (
        <div
            data-cuc-edit-overlay=""
            style={{
                position: 'fixed',
                left: layout.left,
                top: layout.top,
                width: Math.max(layout.width, 180),
                zIndex: 2147483000,
            }}
        >
            <div className="mb-1.5 inline-flex items-center gap-2 bg-black/90 border border-[#FFE500]/60 px-2 py-1 font-mono text-[10px] uppercase tracking-wider">
                <span className="text-[#FFE500]">{chip}</span>
                <span className="text-zinc-500">{selection.kind}</span>
            </div>

            <div className="relative border-2 border-[#FFE500] bg-[#0D0D12]/95 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
                {isTextarea ? (
                    <textarea
                        ref={(node) => {
                            inputRef.current = node;
                        }}
                        defaultValue={value}
                        placeholder={placeholder}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        rows={3}
                        style={fieldStyle}
                        className="block min-h-[4.5rem] w-full"
                    />
                ) : (
                    <input
                        ref={(node) => {
                            inputRef.current = node;
                        }}
                        defaultValue={value}
                        placeholder={placeholder}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        style={fieldStyle}
                        className="block w-full"
                    />
                )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {value.length === 0 && (
                    <span className="inline-flex bg-[#FFE500]/15 border border-[#FFE500]/50 text-[10px] font-mono text-[#FFE500] px-2 py-1">
                        vide → repli traduit affiché
                    </span>
                )}
                <span className="inline-flex bg-black/85 border border-white/15 text-[10px] font-mono text-zinc-300 px-2 py-1">
                    {hint}
                </span>
            </div>
        </div>
    );
};
