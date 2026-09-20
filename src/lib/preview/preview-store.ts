'use client';

import type { SitePageContent } from '@/lib/data/site-service';

/**
 * Store global minimal de prévisualisation.
 *
 * Lorsque la vitrine est chargée à l'intérieur de l'iframe d'aperçu du Cockpit,
 * ce store reçoit le brouillon courant via `postMessage` et le publie aux
 * abonnés (le hook `usePageDynamicContent`). Cela permet un aperçu live sans
 * rechargement de page ni écriture en base.
 *
 * Hors mode aperçu, le store reste vide et n'a aucun effet : la vitrine
 * publique se comporte exactement comme avant.
 */

type Listener = (content: SitePageContent) => void;

let previewDraft: SitePageContent | null = null;
const listeners = new Set<Listener>();

export function setPreviewDraft(content: SitePageContent): void {
    previewDraft = content;
    listeners.forEach((listener) => listener(content));
}

export function getPreviewDraft(): SitePageContent | null {
    return previewDraft;
}

export function clearPreviewDraft(): void {
    previewDraft = null;
}

export function subscribePreviewDraft(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** Indique si un brouillon d'aperçu est actuellement actif. */
export function isPreviewActive(): boolean {
    return previewDraft !== null;
}
