/**
 * ==============================================================================
 * CUC — Fusion FR/EN et édition bilingue : façade (source de vérité unique)
 * ==============================================================================
 * Ce module est la **seule** source de vérité pour trois choses :
 *
 *   1. la FUSION d'un overlay de traduction sur le contenu français
 *      (`mergeLocalized`) — utilisée par le serveur (`lib/i18n/server.ts`), par
 *      le client (`hooks/usePageDynamicContent.ts`) et par le Cockpit ;
 *   2. la définition de la SURFACE TRADUISIBLE (`flattenEditorial`) — mêmes
 *      règles d'exclusion que `scripts/audit_i18n_completeness.mjs`, afin que
 *      l'indicateur de couverture du Cockpit et l'audit disent la même chose ;
 *   3. la PRODUCTION de l'overlay à écrire (`diffTranslation`) — jamais de
 *      valeur vide, tableaux toujours complets.
 *
 * L'implémentation vit dans les modules voisins — chargés des deux côtés de la
 * frontière serveur/client, sans jamais importer `next/cache`, `next/headers`
 * ni React :
 *   - `localized-merge-types.ts`     : types et constantes partagés ;
 *   - `localized-merge-core.ts`      : `mergeLocalized`, `hydrateLocalized` ;
 *   - `localized-merge-editorial.ts` : surface traduisible (feuilles, chemins) ;
 *   - `localized-merge-diff.ts`      : production de l'overlay à écrire ;
 *   - `localized-merge-audit.ts`     : couverture, tableaux désalignés, nettoyage.
 *
 * ------------------------------------------------------------------------------
 * Invariants de fusion (hérités du serveur, verrouillés par les tests)
 * ------------------------------------------------------------------------------
 *   - objet : fusion récursive clé par clé ;
 *   - tableau NON VIDE : **remplacé en bloc**. Un tableau de traduction doit donc
 *     être complet (ancres `id`, images, ordres recopiés du français) : un
 *     tableau partiel casserait une ancre ou un `src` ;
 *   - tableau vide, chaîne vide (ou blanche), `null` : ignorés → le français
 *     reste la source. Une traduction ne peut jamais vider une page ;
 *   - scalaire : remplace la base.
 */

export { hydrateLocalized, mergeLocalized } from './localized-merge-core';
export { flattenEditorial, isEditorialLeaf, isTechnicalKey } from './localized-merge-editorial';
export { diffTranslation } from './localized-merge-diff';
export {
    findStaleArrays,
    sanitizeOverlayPayload,
    translationCoverage,
} from './localized-merge-audit';
export {
    PAGE_LOCKED_ROOTS,
    type LocaleCode,
    type OverlayOptions,
    type StaleArray,
    type TranslationCoverage,
} from './localized-merge-types';
