/**
 * Composition du brouillon d'une page vitrine : défauts CUC fusionnés avec le
 * contenu en base (`hero` et `sections_data` fusionnés d'un niveau).
 *
 * Couche « Domaine » (`AGENTS.md` § 1) : fonction pure, utilisée pour
 * l'initialisation du formulaire, la référence du diff et le changement de page.
 */
import { DEFAULT_PAGE_CONTENTS, normalizeSlug, type SitePageContent } from '@/lib/data/site-service';

export function composePageDraft(
    slug: string,
    page?: Partial<SitePageContent> | null
): SitePageContent {
    const clean = normalizeSlug(slug);
    const defaultData = DEFAULT_PAGE_CONTENTS[clean] || {};
    const source = page || {};
    return {
        ...defaultData,
        ...source,
        slug: clean,
        hero: { ...(defaultData.hero || {}), ...(source.hero || {}) },
        layout_sections:
            source.layout_sections && source.layout_sections.length > 0
                ? source.layout_sections
                : defaultData.layout_sections || [],
        sections_data: {
            ...(defaultData.sections_data || {}),
            ...(source.sections_data || {}),
        },
    } as SitePageContent;
}
