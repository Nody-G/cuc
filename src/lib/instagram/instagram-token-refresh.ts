/**
 * Service de renouvellement automatique du jeton long-lived Meta Instagram.
 * Couche « Domaine & Services » (AGENTS.md § 1).
 *
 * Utilise l'endpoint officiel :
 * GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token={token}
 * Un jeton rafraîchi est prolongé de 60 jours supplémentaires.
 */

export interface InstagramRefreshResult {
    success: boolean;
    refreshed: boolean;
    accessToken?: string;
    expiresIn?: number;
    error?: string;
}

const TWENTY_DAYS_MS = 20 * 24 * 60 * 60 * 1000;

/**
 * Appelle l'API Meta Graph pour renouveler un token long-lived Instagram.
 */
export async function refreshInstagramToken(token: string): Promise<InstagramRefreshResult> {
    if (!token || !token.startsWith('IG')) {
        return { success: false, refreshed: false, error: 'Token non-Instagram ou vide.' };
    }

    try {
        const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            return {
                success: false,
                refreshed: false,
                error: (errJson as { error?: { message?: string } })?.error?.message || `HTTP ${res.status}`,
            };
        }

        const data = await res.json() as { access_token?: string; expires_in?: number };
        if (!data.access_token) {
            return { success: false, refreshed: false, error: 'Réponse Meta sans access_token.' };
        }

        return {
            success: true,
            refreshed: true,
            accessToken: data.access_token,
            expiresIn: data.expires_in,
        };
    } catch (err) {
        return {
            success: false,
            refreshed: false,
            error: err instanceof Error ? err.message : 'Erreur réseau inconnue.',
        };
    }
}

/**
 * Détermine si le jeton doit être renouvelé (plus de 20 jours depuis la dernière sauvegarde).
 */
export function isTokenRefreshDue(lastUpdatedIso?: string): boolean {
    if (!lastUpdatedIso) return true;
    const last = new Date(lastUpdatedIso).getTime();
    if (isNaN(last)) return true;
    return Date.now() - last > TWENTY_DAYS_MS;
}
