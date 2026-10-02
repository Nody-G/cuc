import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n/entities';
import { getPublicPageContent } from '@/lib/i18n/public-page';
import { PageDataProvider } from './PageDataProvider';

/**
 * ==============================================================================
 * [Hooks — serveur] Contrat unique « contenu de page fourni par le serveur »
 * ==============================================================================
 * Point de passage PARTAGÉ de toutes les routes non-accueil : il résout la page
 * localisée (FR + overlay EN) via `getPublicPageContent` — lecture déjà mise en
 * cache (`'use cache'` + tags, voir [`server.ts`](../../lib/i18n/server.ts)) —
 * puis l'injecte dans le provider de contexte, qui recopie la coquille résolue
 * par le layout parent (`navigation/footer/social/overlays`).
 *
 * Effet recherché : le premier rendu client reçoit `page` par le serveur, donc
 * [`usePageDynamicContent()`](../../lib/hooks/usePageDynamicContent.ts) prend la
 * voie `hasServerPage` — **aucune lecture `site_pages` par visiteur** et
 * `@supabase/supabase-js` n'est jamais téléchargé sur la route publique.
 *
 * Porte de diffusion : une page définitivement non publiée répond `404` ici même
 * (`getPublicPageContent` → `notFound()`), décision unique côté serveur.
 *
 * SRP : ce module ne fait QUE résoudre la page et la brancher. Le rendu reste
 * dans la vue, la logique d'état dans le hook, le contrat dans `SiteDataProvider`.
 */
export async function SitePageScope({
    slug,
    locale,
    children,
}: {
    /** Slug canonique de la route, sans slash initial (p. ex. `videos-cascadeur`). */
    slug: string;
    /** Locale déjà validée par l'appelant (via `hasLocale`). */
    locale: Locale;
    children: ReactNode;
}) {
    const page = await getPublicPageContent(slug, locale);

    return <PageDataProvider page={page}>{children}</PageDataProvider>;
}
