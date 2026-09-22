/**
 * ==============================================================================
 * CUC — Cibles de lien proposées aux éditeurs du Cockpit
 * ==============================================================================
 * Un chemin ne doit plus se **taper** : l'éditeur choisit une page connue dans
 * une liste, et ne saisit du texte que pour le cas réellement libre (lien
 * externe, e-mail, téléphone, ancre).
 *
 * Source unique : `SITE_PAGES_OPTIONS` (les 15 pages vitrine) ; toute page
 * ajoutée au sélecteur apparaît ici sans second référentiel.
 *
 * Module pur (aucun JSX) — `AGENTS.md` § 1.
 */

import { SITE_PAGES_OPTIONS } from './pages-options';

export type LinkOptionGroup = 'page' | 'ancre';

export interface LinkOption {
    value: string;
    label: string;
    group: LinkOptionGroup;
}

/** Ancres réellement posées dans la vitrine (jamais d'identifiant inventé). */
const PAGE_ANCHORS: ReadonlyArray<Omit<LinkOption, 'group'>> = [
    { value: '#formulaire', label: 'Ancre : formulaire de candidature' },
    { value: '#contact-form', label: 'Ancre : formulaire de contact' },
    { value: '#campus-map-hub', label: 'Ancre : carte du campus' },
];

/** Slug éditorial → chemin public (« / », « /visite-guidee »). */
function pageValue(raw: string): string {
    return raw === '/' ? '/' : `/${raw}`;
}

/** Libellé lisible : « Formation Pro 2 Ans (/…) » → « Formation Pro 2 Ans ». */
function pageLabel(raw: string): string {
    return raw.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

export const INTERNAL_LINK_OPTIONS: ReadonlyArray<LinkOption> = [
    ...SITE_PAGES_OPTIONS.map((option) => ({
        value: pageValue(option.value),
        label: pageLabel(option.label),
        group: 'page' as const,
    })),
    ...PAGE_ANCHORS.map((anchor) => ({ ...anchor, group: 'ancre' as const })),
];

/** Nettoie une valeur saisie (espaces compris) sans jamais l'inventer. */
export function normalizeLinkValue(value: string | null | undefined): string {
    return (value ?? '').trim();
}

/** Vrai si la cible est une page ou une ancre connue du site. */
export function isKnownInternalLink(value: string | null | undefined): boolean {
    const clean = normalizeLinkValue(value);
    return clean.length > 0 && INTERNAL_LINK_OPTIONS.some((option) => option.value === clean);
}

/** Vrai pour une cible hors site : http(s), e-mail, téléphone. */
export function isExternalLink(value: string | null | undefined): boolean {
    return /^(?:https?:\/\/|mailto:|tel:)/i.test(normalizeLinkValue(value));
}

/** Description lisible d'une cible, pour l'infobulle et l'accessibilité. */
export function describeLink(value: string | null | undefined): string {
    const clean = normalizeLinkValue(value);
    if (!clean) return 'Aucune cible';
    const known = INTERNAL_LINK_OPTIONS.find((option) => option.value === clean);
    if (known) return known.label;
    if (isExternalLink(clean)) return `Lien externe : ${clean}`;
    if (clean.startsWith('#')) return `Ancre de page : ${clean}`;
    return `Lien personnalisé : ${clean}`;
}
