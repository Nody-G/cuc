'use client';

import { useEffect } from 'react';
import { PREVIEW_CHANNEL, type PreviewMessage } from '@/lib/hooks/usePreviewBridge';
import { setPreviewDraft } from '@/lib/preview/preview-store';

/**
 * Pont de prévisualisation monté sur la vitrine publique.
 *
 * Ce composant est inerte en navigation normale : il ne fait qu'écouter les
 * messages `postMessage` émis par le Cockpit. Lorsqu'il reçoit un brouillon,
 * il l'injecte dans le store de prévisualisation (consommé par
 * `usePageDynamicContent`) et active le mode édition inline :
 *
 * - survol d'un élément `[data-cuc-field]` → surlignage + message `field-hover`
 * - clic sur un élément `[data-cuc-field]` → message `field-focus` (le Cockpit
 *   fait défiler et met le focus sur l'input correspondant)
 *
 * Aucune donnée n'est écrite en base : l'aperçu est purement local.
 */
export const PreviewBridgeClient: React.FC = () => {
    useEffect(() => {
        // Sécurité : n'activer le pont que si la page est bien embarquée dans une
        // iframe (donc pilotée par le Cockpit).
        const isEmbedded = typeof window !== 'undefined' && window.parent !== window;
        if (!isEmbedded) return;

        const post = (message: PreviewMessage) => {
            window.parent.postMessage(message, '*');
        };

        const handleMessage = (event: MessageEvent) => {
            const data = event.data as PreviewMessage | undefined;
            if (!data || data.channel !== PREVIEW_CHANNEL) return;
            if (data.type === 'draft') {
                setPreviewDraft(data.payload);
            }
        };

        window.addEventListener('message', handleMessage);

        // Signale au Cockpit que l'iframe est prête à recevoir le brouillon.
        post({ channel: PREVIEW_CHANNEL, type: 'ready' });

        // --- Édition inline : surlignage et focus des champs éditables ---
        const findField = (target: EventTarget | null): HTMLElement | null => {
            if (!(target instanceof HTMLElement)) return null;
            return target.closest<HTMLElement>('[data-cuc-field]');
        };

        const handleMouseOver = (event: MouseEvent) => {
            const el = findField(event.target);
            if (!el) return;
            const field = el.getAttribute('data-cuc-field');
            if (field) post({ channel: PREVIEW_CHANNEL, type: 'field-hover', field });
        };

        const handleMouseOut = (event: MouseEvent) => {
            const el = findField(event.target);
            if (!el) return;
            post({ channel: PREVIEW_CHANNEL, type: 'field-hover', field: null });
        };

        const handleClick = (event: MouseEvent) => {
            const el = findField(event.target);
            if (!el) return;
            const field = el.getAttribute('data-cuc-field');
            if (!field) return;
            // Empêche la navigation : le clic sert à sélectionner le champ à éditer.
            event.preventDefault();
            event.stopPropagation();
            post({ channel: PREVIEW_CHANNEL, type: 'field-focus', field });
        };

        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('mouseout', handleMouseOut, true);
        document.addEventListener('click', handleClick, true);

        // Style de surlignage injecté uniquement en mode aperçu.
        const style = document.createElement('style');
        style.setAttribute('data-cuc-preview-style', '');
        style.textContent = `
      [data-cuc-field] { cursor: pointer !important; transition: outline-color .15s ease, background-color .15s ease; }
      [data-cuc-field]:hover { outline: 2px dashed rgba(255,229,0,.85) !important; outline-offset: 3px !important; background-color: rgba(255,229,0,.06) !important; }
      [data-cuc-field-active] { outline: 2px solid #FFE500 !important; outline-offset: 3px !important; background-color: rgba(255,229,0,.1) !important; }
    `;
        document.head.appendChild(style);

        return () => {
            window.removeEventListener('message', handleMessage);
            document.removeEventListener('mouseover', handleMouseOver, true);
            document.removeEventListener('mouseout', handleMouseOut, true);
            document.removeEventListener('click', handleClick, true);
            style.remove();
        };
    }, []);

    return null;
};
