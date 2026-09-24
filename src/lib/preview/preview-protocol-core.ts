/**
 * ==============================================================================
 * CUC — Protocole de communication Cockpit ↔ Aperçu (Mode Studio) — noyau
 * ==============================================================================
 * Canal `postMessage` unique entre le Cockpit (fenêtre parente) et la vitrine
 * réelle chargée dans l'iframe d'aperçu (fenêtre enfant).
 *
 * **Façade de ré-export** : le contrat vit dans `preview/protocol/`
 * (`protocol-channels` pour les constantes, `protocol-messages` pour le modèle,
 * `protocol-factories` pour les fabriques). La lecture défensive vit dans
 * `preview-protocol-parse` ; la façade `preview-protocol` reste le point
 * d'import unique (`@/lib/preview/preview-protocol`).
 *
 * Invariants :
 *  - l'origine est vérifiée des deux côtés (`isSameOrigin`) — plus de `'*'` sur
 *    le canal d'édition ;
 *  - les fabriques `previewMessage.*` empêchent toute construction à la main ;
 *  - aucune donnée n'est écrite en base par ce module : il ne transporte que du
 *    brouillon et des intentions d'édition.
 */

export {
    PREVIEW_CHANNEL,
    PREVIEW_PROTOCOL_VERSION,
    CUC_FIELD_ATTRIBUTE,
    CUC_KIND_ATTRIBUTE,
    CUC_INDEX_ATTRIBUTE,
    CUC_FIELD_HOVER_ATTRIBUTE,
    CUC_SETTING_ATTRIBUTE,
    CUC_MICRO_ATTRIBUTE,
    CUC_ENTITY_ATTRIBUTE,
    CUC_REACH_ATTRIBUTE,
} from './protocol/protocol-channels';

export { CUC_FIELD_KINDS } from './protocol/protocol-messages';

export type {
    CucFieldKind,
    PreviewMode,
    PreviewFieldSource,
    PreviewListCommand,
    PreviewMessage,
    PreviewReachabilityReason,
    PreviewReachabilityIssue,
    PreviewReachabilityReport,
    LegacyPreviewMessage,
} from './protocol/protocol-messages';

export { previewMessage } from './protocol/protocol-factories';
