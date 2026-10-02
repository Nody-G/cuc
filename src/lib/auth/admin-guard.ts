/**
 * Fonctions pures pour la garde d'authentification du Cockpit CUC.
 *
 * Utilisé par le proxy Next.js (`src/proxy.ts`) et le layout serveur
 * (`src/app/(admin)/admin/layout.tsx`).
 * Conforme aux règles SRP (`AGENTS.md` § 1) : logique pure, testable unitairement.
 */

function stripQueryAndHash(path: string): string {
    return path.split('?')[0].split('#')[0];
}

/** Détecte si un chemin cible le Cockpit d'administration. */
export function isAdminPath(pathname: string): boolean {
    const clean = stripQueryAndHash(pathname);
    return clean === '/admin' || clean.startsWith('/admin/');
}

/**
 * Détecte si le chemin fait partie du parcours d'authentification ou récupération
 * (page de connexion, réinitialisation de mot de passe).
 */
export function isAuthFlowPath(pathname: string): boolean {
    const clean = stripQueryAndHash(pathname);
    return (
        clean === '/admin/login' ||
        clean.startsWith('/admin/login/') ||
        clean === '/admin/reset-password' ||
        clean.startsWith('/admin/reset-password/')
    );
}

/** Alias de rétrocompatibilité pour `isAuthFlowPath`. */
export function isAdminLoginPath(pathname: string): boolean {
    return isAuthFlowPath(pathname);
}

/** Détecte si le chemin est une page protégée du Cockpit nécessitant une session active. */
export function isProtectedAdminPath(pathname: string): boolean {
    return isAdminPath(pathname) && !isAuthFlowPath(pathname);
}

/**
 * Construit l'URL de redirection vers la page de connexion,
 * en conservant l'URL cible dans le paramètre `next` si elle est distincte de `/admin`.
 */
export function buildAdminLoginRedirect(
    baseOriginOrUrl: string | URL,
    pathname: string,
    search: string = '',
): URL {
    const redirectUrl = new URL('/admin/login', baseOriginOrUrl);
    const fullPath = `${pathname}${search}`;

    if (fullPath && fullPath !== '/admin' && !isAuthFlowPath(pathname)) {
        redirectUrl.searchParams.set('next', fullPath);
    }

    return redirectUrl;
}

/**
 * Normalise un identifiant de connexion pour les administrateurs du Cockpit.
 * Supporte les alias rapides : `lucas` -> `campusucascades@gmail.com`, `niels` -> `niels.dalery@gmail.com`.
 */
export function normalizeCockpitLoginIdentifier(identifier: string): string {
    const clean = identifier.trim().toLowerCase();
    if (
        clean === 'lucas' ||
        clean === 'lucas.d' ||
        clean === 'lucas.dollfus' ||
        clean === 'lucas-dollfus' ||
        clean === 'lucas.d@campus-universcascades.com'
    ) {
        return 'campusucascades@gmail.com';
    }
    if (clean === 'niels' || clean === 'niels.dalery' || clean === 'niels-dalery') {
        return 'niels.dalery@gmail.com';
    }
    return clean;
}

