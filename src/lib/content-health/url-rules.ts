export function isExternalUrl(url: string): boolean {
    return /^(https?:)?\/\//i.test(url) || /^(mailto|tel):/i.test(url);
}

export function isAnchorOrQuery(url: string): boolean {
    return url.startsWith('#') || url.startsWith('?');
}

export function normalizeInternalPath(url: string): string {
    const withoutHash = url.split('#')[0].split('?')[0];
    if (withoutHash.length > 1 && withoutHash.endsWith('/')) {
        return withoutHash.slice(0, -1);
    }
    return withoutHash || '/';
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
