/**
 * ==============================================================================
 * CUC — Protocole d'aperçu : lecture défensive
 * ==============================================================================
 * Le noyau (`preview-protocol-core`) porte le contrat ; ce module porte la
 * **lecture** : validation stricte de la v2, normalisation de la forme héritée
 * (bundle de vitrine resté en cache CDN — aucune fenêtre de panne), contrôle
 * d'origine et petits résolveurs partagés par le Cockpit et la vitrine.
 *
 * Tout message inconnu, malformé ou d'une version future est **ignoré** : le
 * contenu initial et les replis restent affichés (le pont est un confort,
 * jamais une dépendance dure).
 */

import {
    CUC_FIELD_KINDS,
    PREVIEW_CHANNEL,
    PREVIEW_PROTOCOL_VERSION,
    previewMessage,
    type CucFieldKind,
    type PreviewFieldSource,
    type PreviewListCommand,
    type PreviewMessage,
    type PreviewMode,
    type PreviewReachabilityReport,
} from './preview-protocol-core';
import type { SitePageContent } from '@/lib/data/site-service';
import { isEntityRef } from './entity-ref';

const PREVIEW_MODES: readonly PreviewMode[] = ['inspect', 'edit'];
const PREVIEW_LIST_COMMANDS: readonly PreviewListCommand[] = [
    'add',
    'remove',
    'move-up',
    'move-down',
    'duplicate',
];
const PREVIEW_FIELD_SOURCES: readonly PreviewFieldSource[] = ['page', 'setting', 'micro', 'entity'];

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

function isFieldSource(value: unknown): value is PreviewFieldSource {
    return (
        typeof value === 'string' &&
        (PREVIEW_FIELD_SOURCES as readonly string[]).includes(value)
    );
}

/** Table de chaînes (surcharges de réglages) : jamais de valeur non textuelle. */
function isStringRecord(value: unknown): value is Record<string, string> {
    if (!isRecord(value)) return false;
    return Object.values(value).every((entry) => typeof entry === 'string');
}

/** Rapport d'atteignabilité : forme stricte, aucune entrée libre. */
function isReachabilityReport(value: unknown): value is PreviewReachabilityReport {
    if (!isRecord(value)) return false;
    if (typeof value.probed !== 'number' || !Number.isFinite(value.probed)) return false;
    if (typeof value.skipped !== 'number' || !Number.isFinite(value.skipped)) return false;
    if (!Array.isArray(value.issues)) return false;
    return value.issues.every(
        (issue) =>
            isRecord(issue) &&
            isNonEmptyString(issue.path) &&
            typeof issue.kind === 'string' &&
            (issue.reason === 'pointer-events' || issue.reason === 'covered')
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
        case 'settings-draft':
        case 'microcopy-draft':
        case 'entity-draft':
            return isStringRecord(value.payload);
        case 'field-commit':
            return (
                isNonEmptyString(value.field) &&
                typeof value.value === 'string' &&
                (value.source === undefined || isFieldSource(value.source)) &&
                // Une entité se désigne par sa référence canonique, jamais par un chemin libre.
                (value.source !== 'entity' || isEntityRef(value.field))
            );
        case 'list-command':
            return (
                isNonEmptyString(value.field) &&
                isListCommand(value.command) &&
                typeof value.index === 'number' &&
                Number.isFinite(value.index)
            );
        case 'media-commit':
            return isNonEmptyString(value.field) && isNonEmptyString(value.url);
        case 'fields-audit':
            return isReachabilityReport(value.payload);
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
