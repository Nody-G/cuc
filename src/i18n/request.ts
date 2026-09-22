import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { applyMicrocopyOverlay, pickMicrocopyValues } from '@/lib/i18n/microcopy';
import { getMicrocopyOverrides } from '@/lib/i18n/server';

/**
 * Configuration de requête next-intl : résout la locale active et charge les
 * catalogues de messages `messages/<locale>.json`.
 *
 * Les **micro-textes d'interface** sont surchargeables depuis le Cockpit
 * (`site_settings.microcopy_overrides`) : la surcharge est fusionnée ici, ce qui
 * la rend effective pour TOUS les appels `t()` — composants serveur comme
 * clients — sans modifier un seul site d'appel. Aucune valeur vide n'est
 * publiée (`pickMicrocopyValues` filtre) et une lecture en échec laisse le
 * catalogue embarqué intact.
 */
export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

    const baseMessages = (await import(`../../messages/${locale}.json`)).default;
    const overrides = pickMicrocopyValues(await getMicrocopyOverrides(), locale);

    return {
        locale,
        messages:
            Object.keys(overrides).length > 0
                ? applyMicrocopyOverlay(baseMessages, overrides)
                : baseMessages,
    };
});
