/**
 * ==============================================================================
 * CUC — URL d'aperçu live du Cockpit
 * ==============================================================================
 * Depuis le lot « 404 des brouillons », l'aperçu vit sur sa **route dédiée**
 * `/[locale]/preview/<slug>` :
 *
 *  - la vitrine publique peut donc répondre un **vrai 404** pour une page non
 *    publiée (`getPublicPageContent`), sans aucun paramètre d'aperçu ;
 *  - la route d'aperçu est gardée par la **session admin** (`checkIsAdmin()`) et
 *    importe les **mêmes écrans** que les pages publiques (`preview/screens.ts`) :
 *    fidèle par construction, sans page fantôme ;
 *  - le brouillon continue d'arriver par `postMessage` (`PreviewBridgeClient` →
 *    `preview-store` → `usePageDynamicContent`) avec l'édition inline
 *    (`[data-cuc-field]`) : rien ne change pour l'éditeur.
 *
 * Contraintes de routage (cf. `src/i18n/routing.ts` et `src/proxy.ts`) :
 *  - `localePrefix: 'as-needed'` → la locale par défaut (`fr`) est servie
 *    **sans préfixe** : `/preview/formation-de-cascadeur`, jamais `/fr/...` ;
 *  - `en` est servie sous `/en/...` ;
 *  - le matcher du proxy exclut `/admin` : le Cockpit lui-même n'est jamais
 *    réécrit par l'i18n.
 *
 * L'encadrement est autorisé par `X-Frame-Options: SAMEORIGIN` et
 * `frame-ancestors 'self'` (cf. `next.config.ts`).
 */

export const PREVIEW_LOCALES = ['fr', 'en'] as const;
export type PreviewLocale = (typeof PREVIEW_LOCALES)[number];

/** Locale par défaut du site : servie sans préfixe d'URL. */
const DEFAULT_LOCALE: PreviewLocale = 'fr';

/** Normalise un slug éditorial en chemin absolu (garantit un `/` initial). */
export function normalizePreviewSlug(slug: string): string {
    const raw = (slug ?? '').trim();
    if (!raw || raw === '/') return '/';
    const withLeadingSlash = raw.startsWith('/') ? raw : `/${raw}`;
    const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '');
    return withoutTrailingSlash || '/';
}

/** Chemin de la route d'aperçu dédiée correspondant au slug édité. */
export function buildPreviewPath(slug: string, locale: PreviewLocale = DEFAULT_LOCALE): string {
    const normalized = normalizePreviewSlug(slug);
    const base = locale === DEFAULT_LOCALE ? '/preview' : `/${locale}/preview`;
    return normalized === '/' ? base : `${base}${normalized}`;
}

/**
 * URL absolue de l'aperçu. Renvoie une chaîne vide tant que l'origine n'est pas
 * résolue (rendu serveur / premier rendu) : l'iframe n'est alors pas montée, ce
 * qui évite un `src=""` chargeant la page courante.
 *
 * `options.quiet` ajoute `?cuc-preview=1` : la page d'aperçu coupe alors le
 * Realtime (le brouillon arrive déjà par `postMessage`) et met en veille les
 * effets lourds — voir `preview-context.ts`. La vitrine publique, elle, n'est
 * jamais chargée avec ce paramètre.
 */
export function buildPreviewUrl(
    origin: string,
    slug: string,
    locale: PreviewLocale = DEFAULT_LOCALE,
    options: { quiet?: boolean } = {}
): string {
    if (!origin) return '';
    const base = `${origin.replace(/\/+$/, '')}${buildPreviewPath(slug, locale)}`;
    if (!options.quiet) return base;
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}cuc-preview=1`;
}
