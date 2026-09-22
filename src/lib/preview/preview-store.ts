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

/* ------------------------------------------------------------------ *
 * Chrome : surcharges des réglages du site (`site_settings.general`)
 * ------------------------------------------------------------------ */

/**
 * Surcharges locales des réglages, poussées par le Cockpit (`settings-draft`).
 * Elles s'appliquent **par-dessus** les réglages serveur, uniquement dans
 * l'aperçu : la vitrine publique n'en voit jamais rien.
 */
export type PreviewSettingsOverrides = Record<string, string>;

type SettingsListener = (overrides: PreviewSettingsOverrides) => void;

let previewSettings: PreviewSettingsOverrides = {};
const settingsListeners = new Set<SettingsListener>();

export function setPreviewSettings(overrides: PreviewSettingsOverrides): void {
    previewSettings = { ...overrides };
    settingsListeners.forEach((listener) => listener(previewSettings));
}

export function getPreviewSettings(): PreviewSettingsOverrides {
    return previewSettings;
}

export function clearPreviewSettings(): void {
    if (Object.keys(previewSettings).length === 0) return;
    previewSettings = {};
    settingsListeners.forEach((listener) => listener(previewSettings));
}

export function subscribePreviewSettings(listener: SettingsListener): () => void {
    settingsListeners.add(listener);
    return () => {
        settingsListeners.delete(listener);
    };
}

/* ------------------------------------------------------------------ *
 * Chrome : surcharges de micro-textes (catalogue i18n, locale active)
 * ------------------------------------------------------------------ */

/**
 * Surcharges locales de micro-textes, poussées par le Cockpit
 * (`microcopy-draft`) : clés plates (`footer.directLines`) → valeur. Elles sont
 * fusionnées dans le catalogue par la **même** fonction que le serveur
 * (`applyMicrocopyOverlay`), jamais par une fusion réécrite localement.
 */
export type PreviewMicrocopyOverrides = Record<string, string>;

type MicrocopyListener = (overrides: PreviewMicrocopyOverrides) => void;

let previewMicrocopy: PreviewMicrocopyOverrides = {};
const microcopyListeners = new Set<MicrocopyListener>();

export function setPreviewMicrocopy(overrides: PreviewMicrocopyOverrides): void {
    previewMicrocopy = { ...overrides };
    microcopyListeners.forEach((listener) => listener(previewMicrocopy));
}

export function getPreviewMicrocopy(): PreviewMicrocopyOverrides {
    return previewMicrocopy;
}

export function clearPreviewMicrocopy(): void {
    if (Object.keys(previewMicrocopy).length === 0) return;
    previewMicrocopy = {};
    microcopyListeners.forEach((listener) => listener(previewMicrocopy));
}

export function subscribePreviewMicrocopy(listener: MicrocopyListener): () => void {
    microcopyListeners.add(listener);
    return () => {
        microcopyListeners.delete(listener);
    };
}

/** Indique si un brouillon d'aperçu est actuellement actif. */
export function isPreviewActive(): boolean {
    return (
        previewDraft !== null ||
        Object.keys(previewSettings).length > 0 ||
        Object.keys(previewMicrocopy).length > 0
    );
}
