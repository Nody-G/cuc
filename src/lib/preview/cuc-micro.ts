/**
 * ==============================================================================
 * CUC — Attributs des micro-textes éditables (Mode Studio)
 * ==============================================================================
 * Troisième et dernière famille de `cuc-field` / `cuc-chrome` : un libellé du
 * catalogue i18n (`t('…')`), surchargeable depuis l'aperçu.
 *
 *   <h4 {...cucMicro('footer.directLines')}>{t('directLines')}</h4>
 *
 * La clé est **complète** (namespace compris) : c'est la clé du catalogue, donc
 * celle qu'écrit `updateMicrocopyOverrideField` — aucune traduction parallèle.
 */

import { CUC_MICRO_ATTRIBUTE } from './preview-protocol';

export interface CucMicroAttributes {
    [CUC_MICRO_ATTRIBUTE]?: string;
}

/** Attributs d'un micro-texte — aucun si la clé est vide. */
export function cucMicro(key: string | null | undefined): CucMicroAttributes {
    const clean = typeof key === 'string' ? key.trim() : '';
    if (!clean) return {};
    return { [CUC_MICRO_ATTRIBUTE]: clean };
}
