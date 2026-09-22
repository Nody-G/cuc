import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { getLocalizedPageContent } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/entities';

/**
 * ==============================================================================
 * Metadata de route localisée — source unique : `site_pages`
 * ==============================================================================
 * Les 14 pages publiques portaient un `export const metadata` FR en dur : le
 * titre d'onglet, la description SEO et l'aperçu de partage restaient donc en
 * français même en mode anglais. Ici, la metadata vient de `site_pages`
 * (`meta_title` / `meta_description`), DÉJÀ traduits en anglais par l'overlay
 * `site_translations` — la même source que le contenu visible.
 *
 * Repli : la copie FR d'origine reste le filet de sécurité (jamais de vide).
 */
export interface RouteMetadataFallback {
    title: string;
    description: string;
}

export async function buildRouteMetadata(options: {
    slug: string;
    locale: string;
    fallback: RouteMetadataFallback;
}): Promise<Metadata> {
    const { slug, locale, fallback } = options;
    const safeLocale: Locale = hasLocale(routing.locales, locale)
        ? (locale as Locale)
        : 'fr';

    const page = await getLocalizedPageContent(slug, safeLocale);
    const title = page?.meta_title || fallback.title;
    const description = page?.meta_description || fallback.description;

    const frPath = `/${slug}`;
    const enPath = `/en/${slug}`;

    /**
     * Page en brouillon : **hors index**. Le contenu n'est déjà plus rendu au
     * public (garde de diffusion), et cette métadonnée ferme le dernier usage
     * possible d'une page non publiée — figurer dans les résultats de recherche.
     * Le retour à `index` est automatique à la republication (même source).
     */
    const isDraft = page?.is_published === false;

    return {
        title,
        description,
        robots: isDraft ? { index: false, follow: false } : undefined,
        alternates: {
            canonical: frPath,
            languages: { fr: frPath, en: enPath },
        },
        openGraph: { title, description },
    };
}
