import { defineRouting } from 'next-intl/routing';

/**
 * Routage i18n du site vitrine CUC.
 *
 * - `fr` : locale par défaut, servie SANS préfixe d'URL (aucune régression SEO).
 * - `en` : servie sous `/en/...`.
 */
export const routing = defineRouting({
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    localePrefix: 'as-needed',
});

export type AppLocale = (typeof routing.locales)[number];
