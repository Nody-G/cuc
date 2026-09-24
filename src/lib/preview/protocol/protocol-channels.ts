/**
 * Constantes du pont d'aperçu (Mode Studio) : canal `postMessage` unique,
 * version du protocole et attributs d'annotation posés dans la vitrine.
 * Aucune logique — ce module ne porte que le contrat littéral.
 */

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

/**
 * Attribut de **reprise d'atteignabilité** : déclaré sur un calque décoratif
 * (`pointer-events-none`, ou recouvert par un frère plein cadre) qui contient
 * malgré tout des champs éditables — HUD du hero, overlay de la visite 360°,
 * carte tactique du campus. Pendant la seule session de Studio, la couche
 * d'aperçu remonte ce calque au-dessus de ses frères et rend le geste à ses
 * **seuls** champs annotés ; hors Mode Studio, aucune règle ne s'applique et la
 * vitrine publique garde exactement son comportement.
 */
export const CUC_REACH_ATTRIBUTE = 'data-cuc-reach';
