/**
 * ==============================================================================
 * CUC — URL d'aperçu live du Cockpit
 * ==============================================================================
 * L'aperçu live encadre la **vraie page publique**, sur la **même origine** que
 * le Cockpit. Pourquoi c'est la seule implémentation correcte :
 *
 *  - chaque page vitrine consomme le brouillon via `postMessage`
 *    (`PreviewBridgeClient` → `preview-store` → `usePageDynamicContent`) et
 *    expose l'édition inline (`[data-cuc-field]`) : l'aperçu est donc fidèle par
 *    construction ;
 *  - une route d'aperçu dédiée qui « rejouerait » les sections ne peut pas
 *    connaître les 15 mises en page : elle finissait par retomber sur les
 *    sections de l'accueil, donnant l'illusion de pages qui n'existent pas.
 *
 * Contraintes de routage (cf. `src/i18n/routing.ts` et `src/proxy.ts`) :
 *  - `localePrefix: 'as-needed'` → la locale par défaut (`fr`) est servie
 *    **sans préfixe** : `/formation-de-cascadeur`, jamais `/fr/...` ;
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

/** Chemin public correspondant au slug édité, pour une locale donnée. */
export function buildPreviewPath(slug: string, locale: PreviewLocale = DEFAULT_LOCALE): string {
    const normalized = normalizePreviewSlug(slug);
    if (locale === DEFAULT_LOCALE) return normalized;
    return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`;
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
