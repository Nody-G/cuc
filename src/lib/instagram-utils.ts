/**
 * Utilitaires purs pour le traitement des URLs et données Instagram.
 * Règle SRP : fonctions pures isolées hors des actions serveur.
 */

/**
 * Extrait le shortcode d'un lien Instagram (ex: /reel/XYZ/ ou /p/XYZ/).
 */
export function extractInstagramShortcode(url: string): string | null {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : null;
}

/**
 * Décode les entités HTML courantes renvoyées dans les balises meta Instagram.
 */
export function decodeInstagramEntities(str: string): string {
    if (!str) return '';
    return str
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
            try {
                return String.fromCodePoint(parseInt(hex, 16));
            } catch {
                return '';
            }
        })
        .replace(/&#([0-9]+);/gi, (_, dec) => {
            try {
                return String.fromCodePoint(parseInt(dec, 10));
            } catch {
                return '';
            }
        });
}
