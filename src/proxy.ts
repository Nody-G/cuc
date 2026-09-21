import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

/**
 * Proxy i18n (convention Next.js 16 « proxy », anciennement « middleware »).
 *
 * - Détecte la locale (cookie → en-tête `Accept-Language` → défaut `fr`).
 * - `localePrefix: 'as-needed'` : `fr` sans préfixe (URLs existantes conservées),
 *   `en` sous `/en/...`.
 * - Exclut l'API, le Cockpit (`/admin`), les assets Next et tout fichier statique
 *   (chemin contenant un point), afin de ne jamais réécrire ces routes.
 */
const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
    return handleI18nRouting(request);
}

export default proxy;

export const config = {
    matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
