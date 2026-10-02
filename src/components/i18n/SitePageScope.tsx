import type { ReactNode } from 'react';
import { getMessages } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/entities';
import type { PublicRouteSlug } from '@/lib/i18n/public-namespaces';
import {
    pickRouteMessages,
    resolveRouteOverlays,
} from '@/lib/i18n/scoped-payload';
import { getPublicPageContent } from '@/lib/i18n/public-page';
import { getEntityOverlays } from '@/lib/i18n/server-entities';
import { PageDataProvider } from './PageDataProvider';
import { ScopedIntlProvider } from './ScopedIntlProvider';

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
 * WS-F / F1 : ce module est aussi le point de portée du **payload i18n** de la
 * route. Le layout n'a sérialisé que la coquille (`SHELL_NAMESPACES`) ; ici, on
 * ajoute le strict sous-ensemble de la route (`ROUTE_NAMESPACES[slug]`), plus ses
 * overlays propres. Le reste n'est jamais inliné.
 *
 * Porte de diffusion : une page définitivement non publiée répond `404` ici même
 * (`getPublicPageContent` → `notFound()`), décision unique côté serveur.
 *
 * SRP : ce module ne fait QUE résoudre les données de la route et les brancher.
 * Le rendu reste dans la vue, la logique d'état dans le hook, les contrats dans
 * `SiteDataProvider` / `public-namespaces`, la sélection dans `scoped-payload`.
 */
export async function SitePageScope({
    slug,
    locale,
    children,
}: {
    /** Slug canonique de la route, sans slash initial (p. ex. `videos-cascadeur`). */
    slug: PublicRouteSlug;
    /** Locale déjà validée par l'appelant (via `hasLocale`). */
    locale: Locale;
    children: ReactNode;
}) {
    const overlayEntities = resolveRouteOverlays(slug);

    const [page, allMessages, ...overlayPairs] = await Promise.all([
        getPublicPageContent(slug, locale),
        getMessages(),
        ...overlayEntities.map(
            async (entity) => [entity, await getEntityOverlays(entity, locale)] as const
        ),
    ]);

    // Seuls les overlays réellement peuplés sont transmis (en FR ils sont vides).
    const routeOverlays = Object.fromEntries(
        overlayPairs.filter(([, value]) => Object.keys(value).length > 0)
    );

    return (
        <ScopedIntlProvider locale={locale} messages={pickRouteMessages(allMessages, slug)}>
            <PageDataProvider page={page} overlays={routeOverlays}>
                {children}
            </PageDataProvider>
        </ScopedIntlProvider>
    );
}
