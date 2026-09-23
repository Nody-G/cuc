/**
 * ==============================================================================
 * CUC — Garde de STATUT de l'aperçu éditeur (proxy)
 * ==============================================================================
 * En Cache Components, une route streame un « shell » avant de résoudre la
 * session : un `notFound()` déclenché par `cookies()` dans le layout arrive
 * APRÈS l'envoi des en-têtes — le statut resterait `200` (constaté au test).
 *
 * La garde de statut vit donc dans le **proxy**, avant tout rendu : un visiteur
 * sans session Supabase reçoit un vrai `404`. La vérification du **rôle** reste
 * au rendu (`checkIsAdmin()` dans `preview/layout.tsx`) — c'est la frontière de
 * sécurité ; celle-ci n'est qu'hygiène de statut (un cookie falsifié ne montre
 * rien de plus qu'aujourd'hui : le contenu est refusé au rendu).
 *
 * Fonctions pures : testables sans requête (voir `preview-guard.test.ts`).
 */

/** Vrai pour `/preview...` et `/en/preview...` (localePrefix `as-needed`). */
export function isPreviewPath(pathname: string): boolean {
    return /^\/(?:en\/)?preview(?:\/|$)/.test(pathname);
}

/**
 * Présence d'un cookie de session Supabase (`sb-<ref>-auth-token`, éventuellement
 * découpé en `...auth-token.0`). Aucune lecture réseau : la validité est tranchée
 * au rendu par `checkIsAdmin()`.
 */
export function hasSupabaseAuthCookie(cookieHeader: string | null): boolean {
    if (!cookieHeader) return false;
    return /(?:^|;\s*)sb-[\w.-]*-auth-token/.test(cookieHeader);
}
