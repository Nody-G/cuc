export function isExternalUrl(url: string): boolean {
    return /^(https?:)?\/\//i.test(url) || /^(mailto|tel):/i.test(url);
}

export function isAnchorOrQuery(url: string): boolean {
    return url.startsWith('#') || url.startsWith('?');
}

/**
 * Canonise un chemin interne en chemin **absolu** (`/slug`).
 *
 * Les deux sources réelles divergent sur le slash initial :
 *   - `site_pages.slug` est stocké sans slash (« visite-guidee », « / » pour
 *     la racine) ;
 *   - la navigation et le pied de page écrivent des `href` absolus
 *     (« /visite-guidee »).
 * Sans cette canonicalisation, une même page a deux clés distinctes
 * (« visite-guidee » vs « /visite-guidee ») et n'est jamais reconnue comme
 * atteignable : toutes les pages CMS deviennent faussement orphelines.
 */
export function normalizeInternalPath(url: string): string {
    const withoutHash = url.split('#')[0].split('?')[0];
    const withoutTrailingSlash =
        withoutHash.length > 1 && withoutHash.endsWith('/')
            ? withoutHash.slice(0, -1)
            : withoutHash;
    if (!withoutTrailingSlash) return '/';
    return withoutTrailingSlash.startsWith('/')
        ? withoutTrailingSlash
        : `/${withoutTrailingSlash}`;
}

export function isPlaceholderImage(url: string): boolean {
    const u = url.trim().toLowerCase();
    return (
        u === '' ||
        u === '#' ||
        u === 'undefined' ||
        u === 'null' ||
        u.includes('placeholder') ||
        u.includes('via.placeholder') ||
        u.includes('example.com')
    );
}
