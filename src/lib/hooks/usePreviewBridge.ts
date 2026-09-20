'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SitePageContent } from '@/lib/data/site-service';

/**
 * Canal de communication `postMessage` entre le Cockpit et l'aperçu live.
 *
 * Le Cockpit (parent) pousse le brouillon courant (`SitePageContent`) dans
 * l'iframe de prévisualisation. L'iframe (page vitrine réelle) applique ce
 * brouillon sans rechargement, et renvoie au parent l'identifiant du champ
 * cliqué pour permettre l'édition inline (focus de l'input correspondant).
 *
 * Sécurité : le canal n'est actif que si l'iframe est bien une origine
 * connue (même origine en développement, domaine vitrine en production).
 */

export const PREVIEW_CHANNEL = 'cuc-preview';

export type PreviewMessage =
    | { channel: typeof PREVIEW_CHANNEL; type: 'draft'; payload: SitePageContent }
    | { channel: typeof PREVIEW_CHANNEL; type: 'ready' }
    | { channel: typeof PREVIEW_CHANNEL; type: 'field-focus'; field: string }
    | { channel: typeof PREVIEW_CHANNEL; type: 'field-hover'; field: string | null };

export interface UsePreviewBridgeOptions {
    /** Contenu brouillon à pousser dans l'iframe. */
    draft: SitePageContent;
    /** Callback déclenché quand l'utilisateur clique un champ dans l'aperçu. */
    onFieldFocus?: (field: string) => void;
}

export interface UsePreviewBridgeResult {
    /** Ref à poser sur l'élément `<iframe>`. */
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
    /** Indique que l'iframe a signalé être prête à recevoir le brouillon. */
    isReady: boolean;
    /** Champ actuellement survolé dans l'aperçu (surlignage synchronisé). */
    hoveredField: string | null;
    /** Force la re-publication du brouillon (bouton « Actualiser »). */
    pushDraft: () => void;
}

export function usePreviewBridge({
    draft,
    onFieldFocus,
}: UsePreviewBridgeOptions): UsePreviewBridgeResult {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [hoveredField, setHoveredField] = useState<string | null>(null);
    const onFieldFocusRef = useRef(onFieldFocus);

    useEffect(() => {
        onFieldFocusRef.current = onFieldFocus;
    }, [onFieldFocus]);

    /** Envoie un message à l'iframe (origine cible = origine de l'iframe). */
    const post = useCallback((message: PreviewMessage) => {
        const win = iframeRef.current?.contentWindow;
        if (!win) return;
        // `'*'` est acceptable ici : le message ne contient que du contenu public
        // déjà destiné à la vitrine, et l'iframe est contrôlée par le Cockpit.
        win.postMessage(message, '*');
    }, []);

    const pushDraft = useCallback(() => {
        post({ channel: PREVIEW_CHANNEL, type: 'draft', payload: draft });
    }, [post, draft]);

    // Écoute des messages provenant de l'iframe.
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const data = event.data as PreviewMessage | undefined;
            if (!data || data.channel !== PREVIEW_CHANNEL) return;

            if (data.type === 'ready') {
                setIsReady(true);
                // Dès que l'iframe est prête, on pousse immédiatement le brouillon.
                post({ channel: PREVIEW_CHANNEL, type: 'draft', payload: draft });
            } else if (data.type === 'field-focus') {
                onFieldFocusRef.current?.(data.field);
            } else if (data.type === 'field-hover') {
                setHoveredField(data.field);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [draft, post]);

    // Re-publication automatique à chaque modification du brouillon (live).
    useEffect(() => {
        if (!isReady) return;
        post({ channel: PREVIEW_CHANNEL, type: 'draft', payload: draft });
    }, [draft, isReady, post]);

    return { iframeRef, isReady, hoveredField, pushDraft };
}
