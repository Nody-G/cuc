import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { hasSupabaseAuthCookie, isPreviewPath } from './lib/preview/preview-guard';

/**
 * Proxy i18n (convention Next.js 16 « proxy », anciennement « middleware »).
 *
 * - Détecte la locale (cookie → en-tête `Accept-Language` → défaut `fr`).
 * - `localePrefix: 'as-needed'` : `fr` sans préfixe (URLs existantes conservées),
 *   `en` sous `/en/...`.
 * - Exclut l'API, le Cockpit (`/admin`), les assets Next et tout fichier statique
 *   (chemin contenant un point), afin de ne jamais réécrire ces routes.
 * - **Garde de statut de l'aperçu** : `/preview...` sans cookie de session
 *   Supabase → vrai `404`, AVANT tout streaming (un `notFound()` rendu dans la
 *   page arriverait après l'envoi du shell et laisserait un `200`). Le rôle est
 *   revérifié au rendu (`checkIsAdmin()`), qui reste la frontière de sécurité.
 */
const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
    if (isPreviewPath(request.nextUrl.pathname)) {
        const cookieHeader = request.headers.get('cookie');
        if (!hasSupabaseAuthCookie(cookieHeader)) {
            return new NextResponse('Not Found', {
                status: 404,
                headers: { 'content-type': 'text/plain; charset=utf-8' },
            });
        }
    }

    return handleI18nRouting(request);
}

export default proxy;

export const config = {
    matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
