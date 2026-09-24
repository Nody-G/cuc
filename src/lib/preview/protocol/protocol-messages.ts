/**
 * Modèle de messages du pont d'aperçu : natures de champs, modes, sources,
 * commandes de liste, union des messages v2, rapport d'atteignabilité et forme
 * héritée du bundle antérieur au versionnage.
 */

import type { SitePageContent } from '@/lib/data/site-service';
import { PREVIEW_CHANNEL } from './protocol-channels';

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
    | { channel: typeof PREVIEW_CHANNEL; v: 2; type: 'media-commit'; field: string; url: string }
    | {
        channel: typeof PREVIEW_CHANNEL;
        v: 2;
        type: 'fields-audit';
        /** Diagnostic d'atteignabilité mesuré dans la vitrine (sonde du Mode Studio). */
        payload: PreviewReachabilityReport;
    };

/** Pourquoi un champ annoté échappe au geste d'édition. */
export type PreviewReachabilityReason = 'pointer-events' | 'covered';

/** Un champ annoncé mais non cliquable, tel que la vitrine le mesure. */
export interface PreviewReachabilityIssue {
    /** Chemin canonique (`hero.title`, `sections_data.about.title`, clé de réglage…). */
    path: string;
    /** Nature déclarée (`data-cuc-kind`). */
    kind: string;
    reason: PreviewReachabilityReason;
}

/**
 * Rapport de la sonde d'atteignabilité : ce qui a été **mesuré** (`probed`), ce
 * qui n'a pas pu l'être (`skipped`, hors fenêtre) et ce qui ne répond pas au
 * geste (`issues`). Aucun verdict n'est inventé pour un champ non mesuré.
 */
export interface PreviewReachabilityReport {
    issues: PreviewReachabilityIssue[];
    probed: number;
    skipped: number;
}

/**
 * Forme historique du pont (avant versionnage), encore émise par un bundle de
 * vitrine resté en cache. Reconnue puis **normalisée** en v2.
 */
export type LegacyPreviewMessage =
    | { channel: typeof PREVIEW_CHANNEL; type: 'ready' }
    | { channel: typeof PREVIEW_CHANNEL; type: 'draft'; payload: SitePageContent }
    | { channel: typeof PREVIEW_CHANNEL; type: 'field-focus'; field: string }
    | { channel: typeof PREVIEW_CHANNEL; type: 'field-hover'; field: string | null };
