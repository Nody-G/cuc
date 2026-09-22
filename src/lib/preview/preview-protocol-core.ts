/**
 * ==============================================================================
 * CUC — Protocole de communication Cockpit ↔ Aperçu (Mode Studio) — noyau
 * ==============================================================================
 * Canal `postMessage` unique entre le Cockpit (fenêtre parente) et la vitrine
 * réelle chargée dans l'iframe d'aperçu (fenêtre enfant).
 *
 * Ce module porte le **contrat** : constantes (canal, version, attributs),
 * modèle de messages v2, forme héritée et fabriques typées. La lecture
 * défensive vit dans `preview-protocol-parse` ; la façade
 * `preview-protocol` reste le point d'import unique (`@/lib/preview/preview-protocol`).
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

/**
 * Attribut transitoire posé sur l'élément **réellement désigné** par le
 * survol : le texte annoté lui-même, ou le contrôle (bouton, lien) dont la
 * surface entière désigne son unique libellé. Purement visuel : il n'est ni
 * persisté, ni transporté par le protocole.
 */
export const CUC_FIELD_HOVER_ATTRIBUTE = 'data-cuc-field-hover';

/** Attribut d'un texte issu des réglages du site (`site_settings`, clé `general`). */
export const CUC_SETTING_ATTRIBUTE = 'data-cuc-setting';

/** Attribut d'un texte issu du catalogue de micro-textes (surcharge i18n). */
export const CUC_MICRO_ATTRIBUTE = 'data-cuc-micro';

/**
 * Attribut d'un texte issu d'une **entité de la base** (annonces, coachs,
 * films…), portant la référence canonique `table:id:champ` (`entity-ref.ts`).
 */
export const CUC_ENTITY_ATTRIBUTE = 'data-cuc-entity';

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

/**
 * Source d'un texte éditable en place : contenu de page (`data-cuc-field`),
 * réglage du site (`data-cuc-setting`), micro-texte (`data-cuc-micro`) ou
 * entité de la base (`data-cuc-entity`, référence `table:id:champ`).
 * La source décide **où** le Cockpit écrit le commit — jamais un chemin
 * interprété au hasard.
 */
export type PreviewFieldSource = 'page' | 'setting' | 'micro' | 'entity';

/** Commandes de liste, exécutées par le Cockpit sur le brouillon. */
export type PreviewListCommand = 'add' | 'remove' | 'move-up' | 'move-down' | 'duplicate';

/**
 * Messages du protocole v2. Les messages de l'iframe vers le Cockpit et du
 * Cockpit vers l'iframe partagent le même type : chaque côté ignore ce qu'il
 * ne consomme pas.
 */
export type PreviewMessage =
    | { channel: typeof PREVIEW_CHANNEL; v: 2; type: 'ready' }
    | { channel: typeof PREVIEW_CHANNEL; v: 2; type: 'mode'; payload: PreviewMode }
    | { channel: typeof PREVIEW_CHANNEL; v: 2; type: 'draft'; payload: SitePageContent }
    | {
        channel: typeof PREVIEW_CHANNEL;
        v: 2;
        type: 'settings-draft';
        payload: Record<string, string>;
    }
    | {
        channel: typeof PREVIEW_CHANNEL;
        v: 2;
        type: 'microcopy-draft';
        payload: Record<string, string>;
    }
    | {
        channel: typeof PREVIEW_CHANNEL;
        v: 2;
        type: 'entity-draft';
        /** Références `table:id:champ` → valeurs brouillon. */
        payload: Record<string, string>;
    }
    | { channel: typeof PREVIEW_CHANNEL; v: 2; type: 'field-hover'; field: string | null }
    | { channel: typeof PREVIEW_CHANNEL; v: 2; type: 'field-select'; field: string }
    | {
        channel: typeof PREVIEW_CHANNEL;
        v: 2;
        type: 'field-commit';
        /**
         * `source: 'entity'` → référence `table:id:champ` (`entity-ref.ts`) ;
         * sinon chemin de page, clé de réglage ou clé de catalogue.
         */
        field: string;
        value: string;
        /** Absent = contenu de page (bundle antérieur au canal chrome). */
        source?: PreviewFieldSource;
    }
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
    settingsDraft: (payload: Record<string, string>): PreviewMessage => ({
        channel: PREVIEW_CHANNEL,
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'settings-draft',
        payload,
    }),
    microcopyDraft: (payload: Record<string, string>): PreviewMessage => ({
        channel: PREVIEW_CHANNEL,
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'microcopy-draft',
        payload,
    }),
    entityDraft: (payload: Record<string, string>): PreviewMessage => ({
        channel: PREVIEW_CHANNEL,
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'entity-draft',
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
    fieldCommit: (field: string, value: string, source?: PreviewFieldSource): PreviewMessage => ({
        channel: PREVIEW_CHANNEL,
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'field-commit',
        field,
        value,
        // Omise pour le contenu de page : la forme historique reste identique.
        ...(source && source !== 'page' ? { source } : {}),
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
