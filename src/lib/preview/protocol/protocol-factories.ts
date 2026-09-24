/**
 * Fabriques typées des messages du pont d'aperçu : **aucune construction
 * manuelle** de message ailleurs dans l'application (`AGENTS.md` § 1).
 */

import type { SitePageContent } from '@/lib/data/site-service';
import { PREVIEW_CHANNEL, PREVIEW_PROTOCOL_VERSION } from './protocol-channels';
import type {
    PreviewFieldSource,
    PreviewListCommand,
    PreviewMessage,
    PreviewMode,
    PreviewReachabilityReport,
} from './protocol-messages';

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
    fieldsAudit: (payload: PreviewReachabilityReport): PreviewMessage => ({
        channel: PREVIEW_CHANNEL,
        v: PREVIEW_PROTOCOL_VERSION,
        type: 'fields-audit',
        payload,
    }),
};
