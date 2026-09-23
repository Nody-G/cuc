import { notFound } from 'next/navigation';
import type { SitePageContent } from '@/lib/data/site-service';
import { getLocalizedPageContent } from './server';
import { getPagePublicationState } from './page-publication';
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
 *  - **brouillon masqué par RLS** : sous `FOR SELECT USING (is_published = true)`,
 *    la ligne d'un brouillon est « absente » pour le client public — l'état se
 *    lit alors via le service role (`getPagePublicationState`) et un brouillon
 *    conclu reste un **404**, jamais un repli silencieux ;
 *  - **lecture impossible** (lecture publique ET état indistinguables) → la
 *    copie **certifiée** du code reste servie (repli de
 *    `getLocalizedPageContent`), jamais un 404 sur une panne : l'incident ne
 *    doit pas ressembler à une dépublication ;
 *  - **page absente** → `null`, la route garde son repli client certifié.
 *
 * L'aperçu du Cockpit ne passe PAS par cette porte : il vit sur sa route dédiée
 * (`/preview/...`, gardée par la session admin) et lit le brouillon via
 * `getPreviewPageContent` (client admin) — c'est ce qui permet à la vitrine de
 * répondre 404 sans casser l'édition d'un brouillon.
 */
export async function getPublicPageContent(
    slug: string,
    locale: Locale = 'fr'
): Promise<SitePageContent | null> {
    const page = await getLocalizedPageContent(slug, locale);

    if (page?.is_published === false) notFound();

    if (!page) {
        const state = await getPagePublicationState(slug);
        if (state === 'unpublished') notFound();
    }

    return page;
}
