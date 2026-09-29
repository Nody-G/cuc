/**
 * Contrats de l'éditeur de pages vitrine : onglets et sélecteur de page.
 * Module pur (aucun JSX) — `AGENTS.md` § 1-2.
 *
 * Le **catalogue** des pages vit dans `@/lib/data/site/page-options` (source
 * unique, partagée avec la logique de regroupement) ; ce module n'en expose que
 * la projection attendue par l'éditeur.
 */

import { SITE_PAGE_CATALOG } from '@/lib/data/site/page-options';

/** Onglets de l'éditeur de pages. */
export type PageEditorTab = 'layout' | 'content' | 'preview' | 'seo';

/** Pages vitrine éditables — libellés du sélecteur du Cockpit. */
export const SITE_PAGES_OPTIONS = SITE_PAGE_CATALOG.map((choice) => ({
    label: choice.label,
    value: choice.value,
}));

export type { PageChoice, PageChoiceGroup } from '@/lib/data/site/page-options';
