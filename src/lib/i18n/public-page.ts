import { notFound } from 'next/navigation';
import type { SitePageContent } from '@/lib/data/site-service';
import { getLocalizedPageContent } from './server';
import type { Locale } from './entities';

/**
 * ==============================================================================
 * CUC — Porte de diffusion publique : une page non publiée répond 404
 * ==============================================================================
 * Même source que [`getLocalizedPageContent()`](./server.ts) — l'accueil et les
 * 14 layouts de route passent ici, ce qui garantit une décision **unique** :
 *
 *  - **page publiée** → contenu servi (avec l'overlay de langue) ;
 *  - **page définitivement non publiée** (`is_published = false`) → `notFound()` :
 *    vrai 404 HTTP, hors sitemap, hors index — plus de page « 200 avec avis » ;
 *  - **lecture impossible** (Supabase indisponible) → la copie **certifiée** du
 *    code reste servie (repli de `getLocalizedPageContent`), jamais un 404 sur
 *    une panne de lecture : l'incident ne doit pas ressembler à une dépublication ;
 *  - **page absente** → `null`, la route garde son repli client certifié.
 *
 * L'aperçu du Cockpit ne passe PAS par cette porte : il vit sur sa route dédiée
 * (`/preview/...`, gardée par la session admin) et appelle directement
 * `getLocalizedPageContent` — c'est ce qui permet à la vitrine de répondre 404
 * sans casser l'édition d'un brouillon.
 */
export async function getPublicPageContent(
    slug: string,
    locale: Locale = 'fr'
): Promise<SitePageContent | null> {
    const page = await getLocalizedPageContent(slug, locale);
    if (page?.is_published === false) notFound();
    return page;
}
