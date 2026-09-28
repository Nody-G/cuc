/**
 * Service d'accès aux métriques officielles des Reels Instagram via Meta Graph API.
 * Couche « Domaine & Services » (AGENTS.md § 1).
 *
 * Utilise l'endpoint officiel d'insights :
 * GET https://graph.instagram.com/v19.0/{media_id}/insights?metric=views,reach,total_interactions,likes,saved,shares
 * pour obtenir les vues réelles certifiées de chaque publication.
 */

import { formatFollowerCount } from './instagram-service';

export interface ReelMetaLiveInsights {
    views: number;
    viewsFormatted: string;
    likes: string;
    reach?: number;
    saved?: number;
    shares?: number;
}

export interface MediaMetaRecord {
    id: string;
    likeCount?: number;
    caption?: string;
    coverUrl?: string;
    timestamp?: string;
    permalink?: string;
}

interface CachedMediaMap {
    mapping: Map<string, MediaMetaRecord>;
    timestamp: number;
}

let cachedMediaMap: CachedMediaMap | null = null;
const MAP_TTL_MS = 10 * 60 * 1000; // 10 minutes

import { extractInstagramShortcode } from '@/lib/instagram-utils';

/**
 * Extrait le shortcode d'un permalien Instagram (alias réexporté depuis instagram-utils).
 */
export const extractShortcode = extractInstagramShortcode;

/**
 * Récupère et met en cache la cartographie shortcode -> MediaMetaRecord pour le compte CUC.
 */
export async function getAccountMediaMapping(
    accessToken: string,
    forceRefresh = false
): Promise<Map<string, MediaMetaRecord>> {
    const now = Date.now();
    if (!forceRefresh && cachedMediaMap && now - cachedMediaMap.timestamp < MAP_TTL_MS) {
        return cachedMediaMap.mapping;
    }

    const mapping = new Map<string, MediaMetaRecord>();
    const host = accessToken.startsWith('IG') ? 'https://graph.instagram.com' : 'https://graph.facebook.com';
    let url: string | null = `${host}/v19.0/me/media?fields=id,permalink,media_product_type,like_count,caption,thumbnail_url,media_url,timestamp&limit=100&access_token=${accessToken}`;
    let pages = 0;

    try {
        while (url && pages < 10) {
            pages++;
            const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
            if (!res.ok) break;

            const json = (await res.json()) as {
                data?: Array<{
                    id: string;
                    permalink?: string;
                    like_count?: number;
                    caption?: string;
                    thumbnail_url?: string;
                    media_url?: string;
                    timestamp?: string;
                }>;
                paging?: { next?: string };
            };

            for (const item of json.data || []) {
                if (item.permalink) {
                    const shortcode = extractShortcode(item.permalink);
                    if (shortcode) {
                        mapping.set(shortcode, {
                            id: item.id,
                            likeCount: item.like_count,
                            caption: item.caption,
                            coverUrl: item.thumbnail_url || item.media_url,
                            timestamp: item.timestamp,
                            permalink: item.permalink,
                        });
                    }
                }
            }

            url = json.paging?.next || null;
        }

        cachedMediaMap = { mapping, timestamp: now };
    } catch {
        // En cas d'erreur réseau, conserve l'ancien cache si disponible
        if (cachedMediaMap) return cachedMediaMap.mapping;
    }

    return mapping;
}

/**
 * Récupère les insights certifiés d'un média Instagram via son media_id.
 */
export async function fetchMediaInsights(
    mediaId: string,
    accessToken: string
): Promise<ReelMetaLiveInsights | null> {
    const host = accessToken.startsWith('IG') ? 'https://graph.instagram.com' : 'https://graph.facebook.com';
    const url = `${host}/v19.0/${mediaId}/insights?metric=views,reach,total_interactions,likes,saved,shares&access_token=${accessToken}`;

    try {
        const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
        if (!res.ok) return null;

        const json = (await res.json()) as {
            data?: Array<{
                name: string;
                values?: Array<{ value: number }>;
            }>;
        };

        const metricsMap = new Map<string, number>();
        for (const item of json.data || []) {
            const val = item.values?.[0]?.value;
            if (typeof val === 'number') {
                metricsMap.set(item.name, val);
            }
        }

        const views = metricsMap.get('views') ?? 0;
        const likesNum = metricsMap.get('likes') ?? 0;

        return {
            views,
            viewsFormatted: formatFollowerCount(views),
            likes: formatFollowerCount(likesNum),
            reach: metricsMap.get('reach'),
            saved: metricsMap.get('saved'),
            shares: metricsMap.get('shares'),
        };
    } catch {
        return null;
    }
}

/**
 * Récupère les statistiques officielles certifiées d'un Reel identifié par son shortcode.
 */
export async function getOfficialReelMetrics(
    shortcode: string,
    accessToken: string
): Promise<ReelMetaLiveInsights | null> {
    const mapping = await getAccountMediaMapping(accessToken);
    const media = mapping.get(shortcode);
    if (!media) return null;

    return fetchMediaInsights(media.id, accessToken);
}

/**
 * Récupère le détail complet d'un Reel (légende, couverture, vues certifiées, likes)
 * directement depuis l'API officielle Meta Graph.
 */
export async function getOfficialReelDetails(
    shortcode: string,
    accessToken: string
): Promise<{
    shortcode: string;
    title: string;
    description: string;
    coverImage: string;
    views: number;
    viewsFormatted: string;
    likes: string;
    date?: string;
    url: string;
} | null> {
    const mapping = await getAccountMediaMapping(accessToken);
    const media = mapping.get(shortcode);
    if (!media) return null;

    const insights = await fetchMediaInsights(media.id, accessToken);
    const views = insights?.views ?? 0;
    const viewsFormatted = insights?.viewsFormatted ?? '0';
    const likes = insights?.likes || (media.likeCount ? formatFollowerCount(media.likeCount) : '—');

    const rawCaption = media.caption || '';
    const firstLine = rawCaption.split('\n')[0].replace(/#\w+/g, '').trim();
    const title = firstLine.length > 50 ? `${firstLine.slice(0, 47)}…` : firstLine || `Reel CUC #${shortcode}`;
    const date = media.timestamp ? media.timestamp.split('T')[0] : undefined;

    return {
        shortcode,
        title,
        description: rawCaption,
        coverImage: media.coverUrl || `/images/reels/${shortcode}.jpg`,
        views,
        viewsFormatted,
        likes,
        date,
        url: media.permalink || `https://www.instagram.com/reel/${shortcode}/`,
    };
}
