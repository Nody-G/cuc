/**
 * Contrats de l'éditeur de réglages : onglets de sections, teintes d'accent et
 * signature du gestionnaire de changement. Module pur (`AGENTS.md` § 1).
 */
import type { SiteSettings } from '@/lib/data/site-service';

export type SettingsSectionId =
    | 'all'
    | 'identity'
    | 'certifs'
    | 'cta'
    | 'emergency'
    | 'contact'
    | 'social';

/** Onglets de filtrage des réglages (filtre d'affichage uniquement). */
export const SETTINGS_SECTIONS: Array<{ id: SettingsSectionId; label: string }> = [
    { id: 'all', label: 'Tous les réglages' },
    { id: 'identity', label: 'Identité & Campus' },
    { id: 'certifs', label: 'Qualiopi & Financements' },
    { id: 'cta', label: 'Actions Vitrine (CTA)' },
    { id: 'emergency', label: 'Alerte Urgence' },
    { id: 'contact', label: 'Standard & Horaires' },
    { id: 'social', label: 'Réseaux Sociaux' },
];

/** Teintes d'accent proposées (pastilles du bloc CTA). */
export const ACCENT_COLORS = [
    { hex: '#FFE500', name: 'Gold CUC' },
    { hex: '#F59E0B', name: 'Ambre' },
    { hex: '#EF4444', name: 'Stunt Red' },
    { hex: '#10B981', name: 'Émeraude' },
    { hex: '#38BDF8', name: 'Sky Blue' },
];

/**
 * Gestionnaire de changement d'un réglage. La valeur est typée sur l'union des
 * valeurs possibles : chaque appel reste vérifié par rapport au champ.
 */
export type SettingsChangeHandler = (
    key: keyof SiteSettings,
    value: SiteSettings[keyof SiteSettings]
) => void;
