'use client';

import { useEffect } from 'react';
import {
    CUC_FIELD_ATTRIBUTE,
    CUC_FIELD_HOVER_ATTRIBUTE,
    CUC_KIND_ATTRIBUTE,
    isSameOrigin,
    parsePreviewMessage,
    previewMessage,
    resolveFieldKind,
    type PreviewMessage,
    type PreviewMode,
} from '@/lib/preview/preview-protocol';
import { resolveFieldElement, resolveFieldTarget } from '@/lib/preview/field-hit';
import {
    clearPreviewMicrocopy,
    clearPreviewSettings,
    setPreviewDraft,
    setPreviewMicrocopy,
    setPreviewSettings,
} from '@/lib/preview/preview-store';
import {
    clearPreviewSelection,
    selectPreviewField,
    setPreviewEditMode,
} from '@/lib/preview/preview-edit';

/**
 * ==============================================================================
 * CUC — Pont d'aperçu monté sur la vitrine publique
 * ==============================================================================
 * Inerte en navigation normale : ce composant n'agit que si la page est
 * **embarquée** dans l'iframe du Cockpit (`window.parent !== window`).
 *
 * Rôle :
 *  - applique le brouillon poussé par le Cockpit (`draft`) dans le store local,
 *    sans écriture en base ni rechargement ;
 *  - annonce la préparation de l'iframe (`ready`) ;
 *  - rapporte le survol (`field-hover`) et le clic (`field-select`) des éléments
 *    portant `data-cuc-field` — et d'un contrôle (bouton, lien) dont un
 *    **unique** champ est annoté : sa surface entière (rembourrage, icône SVG)
 *    désigne alors son libellé, au lieu de naviguer par accident ;
 *  - expose le mode courant (`inspect` ou `edit`) sur `<html data-cuc-mode>`,
 *    ce qui pilote les affordances de la couche d'édition en place.
 *
 * Sécurité : l'origine est vérifiée à la réception et chaque envoi est adressé
 * explicitement à l'origine du Cockpit — jamais `'*'`.
 */
export const PreviewBridgeClient: React.FC = () => {
    useEffect(() => {
        const isEmbedded = typeof window !== 'undefined' && window.parent !== window;
        if (!isEmbedded) return;

        const origin = window.location.origin;
        // Mode courant du canal : lu par le gestionnaire de clic. `inspect` par
        // défaut — un bundle hérité ne connaît que ce comportement.
        let mode: PreviewMode = 'inspect';

        const post = (message: PreviewMessage) => {
            window.parent.postMessage(message, origin);
        };

        const handleMessage = (event: MessageEvent) => {
            if (!isSameOrigin(event.origin, origin)) return;
            const message = parsePreviewMessage(event.data);
            if (!message) return;

            switch (message.type) {
                case 'draft':
                    setPreviewDraft(message.payload);
                    break;
                case 'settings-draft':
                    setPreviewSettings(message.payload);
                    break;
                case 'microcopy-draft':
                    setPreviewMicrocopy(message.payload);
                    break;
                case 'mode': {
                    mode = message.payload;
                    document.documentElement.setAttribute('data-cuc-mode', mode);
                    setPreviewEditMode(mode);
                    break;
                }
                default:
                    // Messages site → Cockpit : sans effet ici.
                    break;
            }
        };

        window.addEventListener('message', handleMessage);

        // Signale au Cockpit que l'iframe est prête à recevoir le brouillon.
        post(previewMessage.ready());

        // --- Repérage des champs éditables ---
        // Cible unique du survol et du clic : le texte annoté (contenu de page,
        // réglage ou micro-texte), ou le contrôle qui le porte (icône et
        // rembourrage compris) — jamais de devinette quand un contrôle contient
        // plusieurs champs (cf. `field-hit`).
        /** Élément réellement désigné par le survol (attribut transitoire). */
        let hovered: HTMLElement | null = null;

        const handleMouseOver = (event: MouseEvent) => {
            const el = resolveFieldElement(event.target);
            if (!el || el === hovered) return;
            const target = resolveFieldTarget(el);
            if (!target) return;
            hovered?.removeAttribute(CUC_FIELD_HOVER_ATTRIBUTE);
            hovered = el;
            el.setAttribute(CUC_FIELD_HOVER_ATTRIBUTE, '');
            post(previewMessage.fieldHover(target.field));
        };

        const handleMouseOut = (event: MouseEvent) => {
            if (!hovered) return;
            // On ne quitte le champ que si la cible suivante est ailleurs :
            // glisser du texte vers l'icône du même bouton le laisse actif.
            if (resolveFieldElement(event.relatedTarget) === hovered) return;
            hovered.removeAttribute(CUC_FIELD_HOVER_ATTRIBUTE);
            hovered = null;
            post(previewMessage.fieldHover(null));
        };

        const handleClick = (event: MouseEvent) => {
            const el = resolveFieldElement(event.target);
            if (!el) return;
            const target = resolveFieldTarget(el);
            if (!target) return;
            // Le clic sélectionne le champ : en mode `edit`, la couche d'édition
            // en place (PreviewEditLayer) prend le relais ; en mode `inspect`, le
            // Cockpit met le focus sur l'input correspondant du formulaire.
            event.preventDefault();
            event.stopPropagation();
            if (mode === 'edit') {
                // La sélection prend le relais visuel : l'encadré actif remplace
                // le surlignage de survol (aucun double contour).
                hovered?.removeAttribute(CUC_FIELD_HOVER_ATTRIBUTE);
                hovered = null;
                selectPreviewField({
                    field: target.field,
                    kind: resolveFieldKind(el.getAttribute(CUC_KIND_ATTRIBUTE)),
                    element: el,
                    ...(target.source !== 'page' ? { source: target.source } : {}),
                });
            } else {
                clearPreviewSelection();
            }
            post(previewMessage.fieldSelect(target.field));
        };

        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('mouseout', handleMouseOut, true);
        document.addEventListener('click', handleClick, true);

        // Style de surlignage injecté uniquement en mode aperçu.
        const style = document.createElement('style');
        style.setAttribute('data-cuc-preview-style', '');
        style.textContent = `
      [${CUC_FIELD_ATTRIBUTE}], [${CUC_FIELD_HOVER_ATTRIBUTE}] {
        transition: outline-color .15s ease, background-color .15s ease;
      }

      /* Inspection : on désigne le champ à ouvrir dans le formulaire ; le
         contrôle entier (bouton, lien) désigne son libellé au survol. */
      html[data-cuc-mode='inspect'] [${CUC_FIELD_ATTRIBUTE}],
      html[data-cuc-mode='inspect'] [${CUC_FIELD_HOVER_ATTRIBUTE}] { cursor: pointer !important; }
      html[data-cuc-mode='inspect'] [${CUC_FIELD_HOVER_ATTRIBUTE}] {
        outline: 2px dashed rgba(255,229,0,.85) !important;
        outline-offset: 3px !important;
        background-color: rgba(255,229,0,.06) !important;
      }

      /* Édition : le survol invite à écrire, chaque nature a son curseur. */
      html[data-cuc-mode='edit'] [${CUC_FIELD_ATTRIBUTE}],
      html[data-cuc-mode='edit'] [${CUC_FIELD_HOVER_ATTRIBUTE}] { cursor: text !important; }
      html[data-cuc-mode='edit'] [${CUC_FIELD_HOVER_ATTRIBUTE}] {
        outline: 1px solid rgba(255,229,0,.55) !important;
        outline-offset: 3px !important;
      }
      html[data-cuc-mode='edit'] [${CUC_FIELD_ATTRIBUTE}][data-cuc-kind='image'],
      html[data-cuc-mode='edit'] [${CUC_FIELD_HOVER_ATTRIBUTE}][data-cuc-kind='image'] { cursor: pointer !important; }
      html[data-cuc-mode='edit'] [${CUC_FIELD_HOVER_ATTRIBUTE}][data-cuc-kind='image'] {
        outline-width: 2px !important;
      }
      html[data-cuc-mode='edit'] [${CUC_FIELD_ATTRIBUTE}][data-cuc-kind='list-item'],
      html[data-cuc-mode='edit'] [${CUC_FIELD_HOVER_ATTRIBUTE}][data-cuc-kind='list-item'] { cursor: pointer !important; }
      html[data-cuc-mode='edit'] [${CUC_FIELD_HOVER_ATTRIBUTE}][data-cuc-kind='list-item'] {
        outline: 2px dashed rgba(255,229,0,.6) !important;
      }

      /* Champ en cours d'édition : encadré plein, jamais confondu avec le survol. */
      [data-cuc-field-active] {
        outline: 2px solid #FFE500 !important;
        outline-offset: 3px !important;
        background-color: rgba(255,229,0,.1) !important;
      }
    `;
        document.head.appendChild(style);

        return () => {
            window.removeEventListener('message', handleMessage);
            document.removeEventListener('mouseover', handleMouseOver, true);
            document.removeEventListener('mouseout', handleMouseOut, true);
            document.removeEventListener('click', handleClick, true);
            hovered?.removeAttribute(CUC_FIELD_HOVER_ATTRIBUTE);
            hovered = null;
            style.remove();
            clearPreviewSelection();
            clearPreviewSettings();
            clearPreviewMicrocopy();
            document.documentElement.removeAttribute('data-cuc-mode');
        };
    }, []);

    return null;
};
