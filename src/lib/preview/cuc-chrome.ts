/**
 * ==============================================================================
 * CUC — Attributs du chrome éditable (Mode Studio)
 * ==============================================================================
 * Miroir de `cuc-field.ts` pour les textes qui ne viennent pas du contenu de
 * page : réglages du site (`site_settings`) et, à terme, micro-textes i18n.
 *
 *   <span {...cucSetting('phone')}>{phone}</span>
 *
 * Un helper (et non une chaîne recopiée) garde une seule orthographe de
 * l'attribut dans toute la vitrine — l'audit des micro-textes s'y appuie pour
 * ne pas confondre une annotation avec un libellé laissé en dur.
 */

import { CUC_SETTING_ATTRIBUTE } from './preview-protocol';

export interface CucSettingAttributes {
    [CUC_SETTING_ATTRIBUTE]?: string;
}

/** Attributs d'un texte de réglage — aucun si la clé est vide. */
export function cucSetting(key: string | null | undefined): CucSettingAttributes {
    const clean = typeof key === 'string' ? key.trim() : '';
    if (!clean) return {};
    return { [CUC_SETTING_ATTRIBUTE]: clean };
}
