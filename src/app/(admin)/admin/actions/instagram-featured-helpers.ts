import { ALL_INSTAGRAM_REELS, type InstagramReel } from '@/data/instagram-reels';
import type { InstagramReelMetric } from '@/types/instagram-monitor';
import type { OfficialReelDetails } from '@/lib/instagram/instagram-reel-meta';

/**
 * Mappe les éléments enregistrés dans site_settings vers le contrat InstagramReel.
 */
export function mapStoredItemsToReels(
    items: InstagramReelMetric[],
    limit: number
): InstagramReel[] {
    return items.slice(0, limit).map((p, idx) => ({
        id: p.id || `featured-reel-${p.shortcode || idx}`,
        shortcode: p.shortcode,
        url: p.url,
        title: p.title,
        description: p.description,
        coverImage: p.coverImage || (p.shortcode ? `/images/reels/${p.shortcode}.jpg` : ''),
        views: p.views || 0,
        viewsFormatted: p.viewsFormatted || (p.views ? p.views.toLocaleString('fr-FR') : '—'),
        likes: p.likes,
        date: p.date,
        isFeatured: true,
    }));
}

/**
 * Mappe les vidéos reçues en direct de Meta Graph API vers le contrat InstagramReel.
 */
export function mapLiveVideosToReels(
    videoItems: Array<{
        shortcode?: string;
        url?: string;
        title?: string;
        description?: string;
        coverImage?: string;
        views?: number;
        viewsFormatted?: string;
        likes?: string;
        date?: string;
    }>,
    limit: number
): InstagramReel[] {
    return videoItems.slice(0, limit).map((p, idx) => ({
        id: `latest-reel-${p.shortcode || idx}`,
        shortcode: p.shortcode || `reel-${idx}`,
        url: p.url || '',
        title: p.title || '',
        description: p.description || '',
        coverImage: p.coverImage || (p.shortcode ? `/images/reels/${p.shortcode}.jpg` : ''),
        views: p.views || 0,
        viewsFormatted: p.viewsFormatted || (p.views ? p.views.toLocaleString('fr-FR') : '0'),
        likes: p.likes,
        date: p.date,
        isFeatured: true,
    }));
}

/**
 * Résout une liste de shortcodes depuis le catalogue statique officiel CUC.
 */
export function resolveShortcodesFromCatalog(shortcodes: string[]): InstagramReelMetric[] {
    const byShortcode = new Map(ALL_INSTAGRAM_REELS.map((r) => [r.shortcode, r]));
    return shortcodes
        .map((sc) => byShortcode.get(sc))
        .filter((r): r is InstagramReelMetric => Boolean(r));
}

/**
 * Recherche un Reel dans le catalogue statique officiel CUC.
 */
export function findCatalogReel(shortcode: string): InstagramReelMetric | null {
    const catalogEntry = ALL_INSTAGRAM_REELS.find((r) => r.shortcode === shortcode);
    if (!catalogEntry) return null;
    return {
        ...catalogEntry,
        id: catalogEntry.id || `reel-${shortcode}`,
        isFeatured: true,
        lastUpdated: new Date().toISOString(),
    };
}

/**
 * Convertit les détails officiels Meta Graph API en métrique de Reel pour le Cockpit.
 */
export function formatOfficialReelDetails(
    official: OfficialReelDetails,
    shortcode: string
): InstagramReelMetric {
    return {
        id: `reel-${shortcode}`,
        shortcode: official.shortcode,
        url: official.url,
        title: official.title,
        description: official.description,
        coverImage: official.coverImage,
        views: official.views,
        viewsFormatted: official.viewsFormatted,
        likes: official.likes,
        date: official.date,
        isFeatured: true,
        lastUpdated: new Date().toISOString(),
    };
}
