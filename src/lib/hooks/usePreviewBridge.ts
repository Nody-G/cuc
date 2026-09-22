'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SitePageContent } from '@/lib/data/site-service';
import {
    isSameOrigin,
    parsePreviewMessage,
    previewMessage,
    type PreviewListCommand,
    type PreviewMessage,
    type PreviewMode,
} from '@/lib/preview/preview-protocol';

/**
 * ==============================================================================
 * CUC — Liaison Cockpit ↔ Aperçu live (côté Cockpit)
 * ==============================================================================
 * Le Cockpit pousse le brouillon courant (`SitePageContent`) dans l'iframe de
 * prévisualisation. L'iframe — la **vraie page vitrine** — applique ce brouillon
 * sans rechargement ni écriture en base, et renvoie les intentions d'édition :
 * sélection de champ, commit de valeur, commandes de liste, demande de média.
 *
 * Invariants :
 *  - l'origine est vérifiée à la réception et l'envoi est adressé explicitement
 *    à l'origine du Cockpit (jamais `'*'`) ;
 *  - un message inconnu, malformé ou d'une version future est ignoré : le pont
 *    est un confort, jamais une dépendance dure ;
 *  - l'abonnement `message` est stable (refs pour brouillon, mode et callbacks) :
 *    aucune frappe ne recrée l'écouteur, donc aucun message perdu ;
 *  - le parseur normalise la forme héritée du pont (bundle de vitrine en cache
 *    après un déploiement), cf. `preview-protocol.ts`.
 */

export interface UsePreviewBridgeOptions {
    /** Contenu brouillon à pousser dans l'iframe. */
    draft: SitePageContent;
    /** Surcharges de réglages du site (brouillon chrome) poussées dans l'iframe. */
    settings?: Record<string, string>;
    /** Surcharges de micro-textes (locale active) poussées dans l'iframe. */
    microcopy?: Record<string, string>;
    /** Surcharges d'entités (`table:id:champ` → valeur) poussées dans l'iframe. */
    entities?: Record<string, string>;
    /** `inspect` : clic = focus du formulaire. `edit` : clic = édition en place. */
    mode?: PreviewMode;
    /** Champ sélectionné dans l'aperçu (clic). */
    onFieldSelect?: (field: string) => void;
    /** Valeur validée par l'éditeur en place (mode `edit`). */
    onFieldCommit?: (field: string, value: string) => void;
    /** Valeur validée pour un réglage du site (`data-cuc-setting`). */
    onSettingCommit?: (key: string, value: string) => void;
    /** Valeur validée pour un micro-texte (`data-cuc-micro`). */
    onMicrocopyCommit?: (key: string, value: string) => void;
    /** Valeur validée pour une entité (`data-cuc-entity`, référence `table:id:champ`). */
    onEntityCommit?: (ref: string, value: string) => void;
    /** Commande d'ajout / suppression / réordonnancement d'item de liste. */
    onListCommand?: (field: string, command: PreviewListCommand, index: number) => void;
    /** L'iframe demande l'ouverture de la médiathèque pour un champ image. */
    onMediaRequest?: (field: string) => void;
}

export interface UsePreviewBridgeResult {
    /** Ref à poser sur l'élément `<iframe>`. */
    iframeRef: React.RefObject<HTMLIFrameElement | null>;
    /** L'iframe a signalé être prête à recevoir le brouillon. */
    isReady: boolean;
    /** Champ actuellement survolé dans l'aperçu (surlignage synchronisé). */
    hoveredField: string | null;
    /** Champ actuellement sélectionné dans l'aperçu. */
    selectedField: string | null;
    /** Force la re-publication du brouillon (bouton « Actualiser »). */
    pushDraft: () => void;
}

export function usePreviewBridge({
    draft,
    settings = {},
    microcopy = {},
    entities = {},
    mode = 'inspect',
    onFieldSelect,
    onFieldCommit,
    onSettingCommit,
    onMicrocopyCommit,
    onEntityCommit,
    onListCommand,
    onMediaRequest,
}: UsePreviewBridgeOptions): UsePreviewBridgeResult {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [hoveredField, setHoveredField] = useState<string | null>(null);
    const [selectedField, setSelectedField] = useState<string | null>(null);

    // Brouillon, mode et callbacks lus par ref : l'écouteur `message` reste
    // stable, y compris pendant une frappe continue dans un éditeur en place.
    const draftRef = useRef(draft);
    const settingsRef = useRef(settings);
    const microcopyRef = useRef(microcopy);
    const entitiesRef = useRef(entities);
    const modeRef = useRef<PreviewMode>(mode);
    const handlersRef = useRef({
        onFieldSelect,
        onFieldCommit,
        onSettingCommit,
        onMicrocopyCommit,
        onEntityCommit,
        onListCommand,
        onMediaRequest,
    });

    useEffect(() => {
        draftRef.current = draft;
    }, [draft]);

    useEffect(() => {
        settingsRef.current = settings;
    }, [settings]);

    useEffect(() => {
        microcopyRef.current = microcopy;
    }, [microcopy]);

    useEffect(() => {
        entitiesRef.current = entities;
    }, [entities]);

    useEffect(() => {
        modeRef.current = mode;
    }, [mode]);

    useEffect(() => {
        handlersRef.current = {
            onFieldSelect,
            onFieldCommit,
            onSettingCommit,
            onMicrocopyCommit,
            onEntityCommit,
            onListCommand,
            onMediaRequest,
        };
    }, [
        onFieldSelect,
        onFieldCommit,
        onSettingCommit,
        onMicrocopyCommit,
        onEntityCommit,
        onListCommand,
        onMediaRequest,
    ]);

    /** Envoie un message à l'iframe (origine cible = origine du Cockpit). */
    const post = useCallback((message: PreviewMessage) => {
        const win = iframeRef.current?.contentWindow;
        if (!win) return;
        win.postMessage(message, window.location.origin);
    }, []);

    const pushDraft = useCallback(() => {
        post(previewMessage.draft(draftRef.current));
        post(previewMessage.settingsDraft(settingsRef.current));
        post(previewMessage.microcopyDraft(microcopyRef.current));
        post(previewMessage.entityDraft(entitiesRef.current));
    }, [post]);

    // Écoute des messages provenant de l'iframe (abonnement stable).
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (!isSameOrigin(event.origin, window.location.origin)) return;
            const message = parsePreviewMessage(event.data);
            if (!message) return;

            const handlers = handlersRef.current;
            switch (message.type) {
                case 'ready':
                    setIsReady(true);
                    // Handshake : mode, brouillon puis chrome — l'iframe est prête.
                    post(previewMessage.mode(modeRef.current));
                    post(previewMessage.draft(draftRef.current));
                    post(previewMessage.settingsDraft(settingsRef.current));
                    post(previewMessage.microcopyDraft(microcopyRef.current));
                    post(previewMessage.entityDraft(entitiesRef.current));
                    break;
                case 'field-hover':
                    setHoveredField(message.field);
                    break;
                case 'field-select':
                    setSelectedField(message.field);
                    handlers.onFieldSelect?.(message.field);
                    break;
                case 'field-commit':
                    if (message.source === 'setting') {
                        handlers.onSettingCommit?.(message.field, message.value);
                    } else if (message.source === 'micro') {
                        handlers.onMicrocopyCommit?.(message.field, message.value);
                    } else if (message.source === 'entity') {
                        handlers.onEntityCommit?.(message.field, message.value);
                    } else {
                        handlers.onFieldCommit?.(message.field, message.value);
                    }
                    break;
                case 'list-command':
                    handlers.onListCommand?.(message.field, message.command, message.index);
                    break;
                case 'media-request':
                    handlers.onMediaRequest?.(message.field);
                    break;
                case 'mode':
                case 'draft':
                case 'settings-draft':
                case 'microcopy-draft':
                case 'entity-draft':
                case 'media-commit':
                    // Messages Cockpit → iframe : sans effet côté parent.
                    break;
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [post]);

    // Re-publication automatique à chaque modification du brouillon (live).
    useEffect(() => {
        if (!isReady) return;
        post(previewMessage.draft(draft));
    }, [draft, isReady, post]);

    // Chrome : les brouillons de réglages et de micro-textes suivent la même règle (live).
    useEffect(() => {
        if (!isReady) return;
        post(previewMessage.settingsDraft(settings));
    }, [settings, isReady, post]);

    useEffect(() => {
        if (!isReady) return;
        post(previewMessage.microcopyDraft(microcopy));
    }, [microcopy, isReady, post]);

    // Entités : même règle de publication continue.
    useEffect(() => {
        if (!isReady) return;
        post(previewMessage.entityDraft(entities));
    }, [entities, isReady, post]);

    // Propagation du mode : le pont bascule ses affordances d'édition.
    useEffect(() => {
        if (!isReady) return;
        post(previewMessage.mode(mode));
    }, [mode, isReady, post]);

    return { iframeRef, isReady, hoveredField, selectedField, pushDraft };
}
