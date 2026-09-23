import { createAdminClient, hasServiceRoleKey } from '@/lib/supabase/admin';
import { normalizeSlug, type SitePageContent } from '@/lib/data/site-service';
import { mergeLocalized } from './localized-merge';
import { getLocalizedPageContent } from './server';
import type { Locale } from './entities';

/**
 * ==============================================================================
 * CUC — Lecture d'une page pour l'APERÇU éditeur (brouillon compris)
 * ==============================================================================
 * La route `/preview/...` est gardée par la session admin : elle doit voir le
 * brouillon tel qu'il est, même après le passage de `site_pages` sous RLS
 * (`FOR SELECT USING (is_published = true)`) — c'est précisément le but.
 *
 * - lecture de la ligne via le **client service role** (jamais exposé au client) ;
 * - overlay EN lu SANS filtre de publication : l'éditeur voit la traduction en
 *   cours, publiée ou non ;
 * - aucune mise en cache : un aperçu doit refléter la dernière écriture ;
 * - repli sûr si la clé de service est absente : comportement pré-RLS
 *   (`getLocalizedPageContent`), jamais une page vide.
 */
export async function getPreviewPageContent(
    slug: string,
    locale: Locale = 'fr'
): Promise<SitePageContent | null> {
    const cleanSlug = normalizeSlug(slug);

    if (!hasServiceRoleKey()) {
        return getLocalizedPageContent(cleanSlug, locale);
    }

    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('site_pages')
            .select('*')
            .eq('slug', cleanSlug)
            .maybeSingle();

        if (error || !data) return getLocalizedPageContent(cleanSlug, locale);

        const base = data as SitePageContent;
        if (locale === 'fr') return base;

        const { data: overlayRow } = await supabase
            .from('site_translations')
            .select('payload')
            .eq('entity', 'page')
            .eq('entity_id', cleanSlug)
            .eq('locale', locale)
            .maybeSingle();

        const overlay = (overlayRow?.payload as Record<string, unknown> | null) ?? null;
        return overlay ? mergeLocalized(base, overlay) : base;
    } catch {
        return getLocalizedPageContent(cleanSlug, locale);
    }
}
