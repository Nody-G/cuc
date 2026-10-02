import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { hasSupabaseAuthCookie, isPreviewPath } from './lib/preview/preview-guard';
import { buildAdminLoginRedirect, isAdminPath, isProtectedAdminPath } from './lib/auth/admin-guard';

/**
 * Proxy i18n & sécurité (convention Next.js 16 « proxy », anciennement « middleware »).
 *
 * - Détecte la locale pour le site public (cookie → en-tête `Accept-Language` → défaut `fr`).
 * - `localePrefix: 'as-needed'` : `fr` sans préfixe, `en` sous `/en/...`.
 * - Exclut l'API, les assets Next et les fichiers statiques de toute réécriture.
 * - **Garde de statut de l'aperçu** : `/preview...` sans cookie de session
 *   Supabase → vrai `404`, AVANT tout streaming.
 * - **Garde Cockpit `/admin`** : routes protégées sans cookie de session → redirection
 *   307 immédiate vers `/admin/login?next=...` avant tout rendu ou requête serveur.
 *   L'en-tête `x-current-path` est injecté pour le layout serveur (`AdminLayout`).
 */
const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // 1. Garde du Cockpit d'administration (/admin)
    if (isAdminPath(pathname)) {
        const cookieHeader = request.headers.get('cookie');
        const hasSession = hasSupabaseAuthCookie(cookieHeader);

        if (isProtectedAdminPath(pathname) && !hasSession) {
            const redirectUrl = buildAdminLoginRedirect(request.url, pathname, search);
            return NextResponse.redirect(redirectUrl);
        }

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-current-path', pathname);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // 2. Garde de l'aperçu éditeur (/preview)
    if (isPreviewPath(pathname)) {
        const cookieHeader = request.headers.get('cookie');
        if (!hasSupabaseAuthCookie(cookieHeader)) {
            return new NextResponse('Not Found', {
                status: 404,
                headers: { 'content-type': 'text/plain; charset=utf-8' },
            });
        }
    }

    // 3. Routage i18n pour la vitrine publique
    return handleI18nRouting(request);
}

export default proxy;

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

