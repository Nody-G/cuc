/**
 * ==============================================================================
 * CUC — Protocole de communication Cockpit ↔ Aperçu (Mode Studio)
 * ==============================================================================
 * Canal `postMessage` unique entre le Cockpit (fenêtre parente) et la vitrine
 * réelle chargée dans l'iframe d'aperçu (fenêtre enfant).
 *
 * Pourquoi un protocole versionné :
 *  - les pages publiques sont mises en cache par Next (`cacheLife('max')`, voir
 *    `src/lib/i18n/server.ts`) : juste après un déploiement, l'iframe peut encore
 *    exécuter l'ancien pont. Le parseur accepte donc la forme **héritée** (sans
 *    `v`) et la normalise en v2 — aucune fenêtre de panne pendant une mise en
 *    production ;
 *  - tout message inconnu, malformé ou d'une version future est **ignoré** : le
 *    contenu initial et les replis restent affichés (le pont est un confort,
 *    jamais une dépendance dure).
 *
 * Invariants :
 *  - l'origine est vérifiée des deux côtés (`isSameOrigin`) — plus de `'*'` sur
 *    le canal d'édition ;
 *  - les fabriques `previewMessage.*` empêchent toute construction à la main ;
 *  - aucune donnée n'est écrite en base par ce module : il ne transporte que du
 *    brouillon et des intentions d'édition.
 */

import type { SitePageContent } from '@/lib/data/site-service';

/** Canal unique du pont d'aperçu (valeur historique conservée). */
export const PREVIEW_CHANNEL = 'cuc-preview';

/** Version courante du protocole. */
export const PREVIEW_PROTOCOL_VERSION = 2;

/** Attribut portant le chemin canonique du champ éditable. */
export const CUC_FIELD_ATTRIBUTE = 'data-cuc-field';

/** Attribut portant la nature du champ (choix du widget d'édition). */
export const CUC_KIND_ATTRIBUTE = 'data-cuc-kind';

/** Attribut portant l'index d'un item de liste (`data-cuc-kind="list-item"`). */
export const CUC_INDEX_ATTRIBUTE = 'data-cuc-index';

/* ------------------------------------------------------------------ *
 * Modèle
 * ------------------------------------------------------------------ */

/** Nature d'un champ éditable — pilote le widget d'édition en place. */
export type CucFieldKind = 'text' | 'textarea' | 'image' | 'link' | 'list-item';

export const CUC_FIELD_KINDS: readonly CucFieldKind[] = [
    'text',
    'textarea',
    'image',
    'link',
    'list-item',
];

/** Mode du canal : `inspect` (clic = focus du formulaire) ou `edit` (édition en place). */
export type PreviewMode = 'inspect' | 'edit';

/** Commandes de liste, exécutées par le Cockpit sur le brouillon. */
export type PreviewListCommand = 'add' | 'remove' | 'move-up' | 'move-down' | 'duplicate';

const PREVIEW_MODES: readonly PreviewMode[] = ['inspect', 'edit'];
const PREVIEW_LIST_COMMANDS: readonly PreviewListCommand[] = [
    'add',
    'remove',
    'move-up',
    'move-down',
    'duplicate',
];

/**
 * Messages du protocole v2. Les messages de l'iframe vers le Cockpit et du
 * Cockpit vers l'iframe partagent le même type : chaque côté ignore ce qu'il
 * ne consomme pas.
 */
export type PreviewMessage =
    | { channel: typeof PREVIEW_CHANNEL; v: 2; type: 'ready' }
    | { channel: typeof PREVIEW_CHANNEL; v: 2; type: 'mode'; payload: PreviewMode }
    | { channel: typeof PREVIEW_CHANNEL; v: 2; type: 'draft'; payload: SitePageContent }
    | { channel: typeof PREVIEW_CHANNEL; v: 2; type: 'field-hover'; field: string | null }
    | { channel: typeof PREVIEW_CHANNEL; v: 2; type: 'field-select'; field: string }
    | { channel: typeof PREVIEW_CHANNEL; v: 2; type: 'field-commit'; field: string; value: string }
    | {
        channel: typeof PREVIEW_CHANNEL;
        v: 2;
        type: 'list-command';
        field: string;
        command: PreviewListCommand;
        index: number;
    }
    | { channel: typeof PREVIEW_CHANNEL; v: 2; type: 'media-request'; field: string }
    | { channel: typeof PREVIEW_CHANNEL; v: 2; type: 'media-commit'; field: string; url: string };

/**
 * Forme historique du pont (avant versionnage), encore émise par un bundle de
 * vitrine resté en cache. Reconnue puis **normalisée** en v2.
 */
export type LegacyPreviewMessage =
    | { channel: typeof PREVIEW_CHANNEL; type: 'ready' }
    | { channel: typeof PREVIEW_CHANNEL; type: 'draft'; payload: SitePageContent }
    | { channel: typeof PREVIEW_CHANNEL; type: 'field-focus'; field: string }
    | { channel: typeof PREVIEW_CHANNEL; type: 'field-hover'; field: string | null };

/* ------------------------------------------------------------------ *
 * Fabriques
 * ------------------------------------------------------------------ */

/** Fabriques typées — aucune construction manuelle de message. */
export const previewMessage = {
    ready: (): PreviewMessage => ({
        channel: PREVIEW_CHANNEL,
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'ready',
    }),
    mode: (payload: PreviewMode): PreviewMessage => ({
        channel: PREVIEW_CHANNEL,
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'mode',
        payload,
    }),
    draft: (payload: SitePageContent): PreviewMessage => ({
        channel: PREVIEW_CHANNEL,
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'draft',
        payload,
    }),
    fieldHover: (field: string | null): PreviewMessage => ({
        channel: PREVIEW_CHANNEL,
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'field-hover',
        field,
    }),
    fieldSelect: (field: string): PreviewMessage => ({
        channel: PREVIEW_CHANNEL,
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'field-select',
        field,
    }),
    fieldCommit: (field: string, value: string): PreviewMessage => ({
        channel: PREVIEW_CHANNEL,
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'field-commit',
        field,
        value,
    }),
    listCommand: (
        field: string,
        command: PreviewListCommand,
        index: number
    ): PreviewMessage => ({
        channel: PREVIEW_CHANNEL,
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'list-command',
        field,
        command,
        index,
    }),
    mediaRequest: (field: string): PreviewMessage => ({
        channel: PREVIEW_CHANNEL,
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'media-request',
        field,
    }),
    mediaCommit: (field: string, url: string): PreviewMessage => ({
        channel: PREVIEW_CHANNEL,
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'media-commit',
        field,
        url,
    }),
};

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function isPreviewMode(value: unknown): value is PreviewMode {
    return typeof value === 'string' && (PREVIEW_MODES as readonly string[]).includes(value);
}

function isListCommand(value: unknown): value is PreviewListCommand {
    return (
        typeof value === 'string' && (PREVIEW_LIST_COMMANDS as readonly string[]).includes(value)
    );
}

/** Vrai si la valeur est un message v2 strictement valide. */
export function isPreviewMessage(value: unknown): value is PreviewMessage {
    if (!isRecord(value)) return false;
    if (value.channel !== PREVIEW_CHANNEL) return false;
    if (value.v !== PREVIEW_PROTOCOL_VERSION) return false;

    switch (value.type) {
        case 'ready':
            return true;
        case 'mode':
            return isPreviewMode(value.payload);
        case 'draft':
            return isRecord(value.payload);
        case 'field-hover':
            return value.field === null || isNonEmptyString(value.field);
        case 'field-select':
        case 'media-request':
            return isNonEmptyString(value.field);
        case 'field-commit':
            return isNonEmptyString(value.field) && typeof value.value === 'string';
        case 'list-command':
            return (
                isNonEmptyString(value.field) &&
                isListCommand(value.command) &&
                typeof value.index === 'number' &&
                Number.isFinite(value.index)
            );
        case 'media-commit':
            return isNonEmptyString(value.field) && isNonEmptyString(value.url);
        default:
            return false;
    }
}

/** Normalise la forme héritée en message v2 (ou `null` si non reconnue). */
function normalizeLegacyMessage(value: Record<string, unknown>): PreviewMessage | null {
    switch (value.type) {
        case 'ready':
            return previewMessage.ready();
        case 'draft':
            return isRecord(value.payload)
                ? previewMessage.draft(value.payload as unknown as SitePageContent)
                : null;
        case 'field-focus':
            // Un clic en mode inspection (bundle hérité) = sélection de champ en v2.
            return isNonEmptyString(value.field) ? previewMessage.fieldSelect(value.field) : null;
        case 'field-hover':
            if (value.field === null || value.field === undefined) {
                return previewMessage.fieldHover(null);
            }
            return isNonEmptyString(value.field) ? previewMessage.fieldHover(value.field) : null;
        default:
            return null;
    }
}

/**
 * Parse un message entrant : v2 strict, ou forme héritée normalisée.
 * Retourne `null` pour tout message invalide, inconnu ou d'une version future.
 */
export function parsePreviewMessage(value: unknown): PreviewMessage | null {
    if (!isRecord(value) || value.channel !== PREVIEW_CHANNEL) return null;
    if (value.v === PREVIEW_PROTOCOL_VERSION) {
        return isPreviewMessage(value) ? value : null;
    }
    if (value.v === undefined) return normalizeLegacyMessage(value);
    return null;
}

/**
 * Vrai si l'origine de l'événement est bien celle attendue.
 * L'origine `'null'` (iframe sandboxée ou `data:`/`file:`) est toujours refusée.
 */
export function isSameOrigin(origin: string, expectedOrigin: string): boolean {
    if (!origin || !expectedOrigin) return false;
    if (origin === 'null') return false;
    return origin === expectedOrigin;
}

/** Nature d'un champ : inconnue ou absente → `text` (défaut sûr). */
export function resolveFieldKind(value: unknown): CucFieldKind {
    return typeof value === 'string' && (CUC_FIELD_KINDS as readonly string[]).includes(value)
        ? (value as CucFieldKind)
        : 'text';
}

/**
 * Vrai si un commit doit être émis : une valeur inchangée n'écrit rien dans le
 * brouillon (aucun message inutile, aucun rendu inutile).
 */
export function hasCommitChanged(previous: string | null | undefined, next: string): boolean {
    return (previous ?? '') !== next;
}
