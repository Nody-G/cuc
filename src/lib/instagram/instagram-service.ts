/**
 * Service de récupération des métriques Instagram temps réel.
 * Couche « Domaine & Services » (AGENTS.md § 1).
 *
 * Utilise le scraper serveur haute fiabilité (User-Agent officiel facebookexternalhit)
 * avec cache anti-blocage (SWR 2 minutes).
 * Bascule automatiquement sur la Meta Graph API officielle dès que le token de Lucas est configuré.
 */

import type {
    InstagramAccountStat,
    InstagramMetaApiConfig,
    InstagramReelMetric,
    InstagramGrowthMilestone,
    InstagramReelsAggregates,
} from '@/types/instagram-monitor';

interface CachedEntry<T> {
    data: T;
    timestamp: number;
}

const PROFILE_CACHE = new Map<string, CachedEntry<InstagramAccountStat>>();
const REEL_CACHE = new Map<string, CachedEntry<Partial<InstagramReelMetric>>>();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes de cache SWR pour éviter le rate-limiting Meta

/** Convertit une chaîne de followers ('2.2M', '847K', '120,500') en nombre entier. */
export function parseCount(raw: string): number {
    if (!raw) return 0;
    const clean = raw.trim().toUpperCase().replace(/\s+/g, '');
    if (clean.endsWith('M')) {
        const num = parseFloat(clean.replace('M', '').replace(',', '.'));
        return isNaN(num) ? 0 : Math.round(num * 1000000);
    }
    if (clean.endsWith('K')) {
        const num = parseFloat(clean.replace('K', '').replace(',', '.'));
        return isNaN(num) ? 0 : Math.round(num * 1000);
    }
    const num = parseInt(clean.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
}

/** Formate un nombre en affichage court français ('2,2 M', '847 k'). */
export function formatFollowerCount(count: number): string {
    if (count >= 1000000) {
        const val = (count / 1000000).toFixed(1).replace('.', ',');
        return `${val.endsWith(',0') ? val.slice(0, -2) : val} M`;
    }
    if (count >= 1000) {
        const val = (count / 1000).toFixed(count >= 100000 ? 0 : 1).replace('.', ',');
        return `${val.endsWith(',0') ? val.slice(0, -2) : val} k`;
    }
    return count.toLocaleString('fr-FR');
}

/**
 * Récupère le profil d'un compte Instagram.
 */
export async function getInstagramProfile(
    username: string,
    metaConfig?: InstagramMetaApiConfig,
    forceRefresh = false
): Promise<InstagramAccountStat | null> {
    const cleanUsername = username.replace(/^@/, '').trim().toLowerCase();
    const now = Date.now();

    if (!forceRefresh) {
        const cached = PROFILE_CACHE.get(cleanUsername);
        if (cached && now - cached.timestamp < CACHE_TTL_MS) {
            return cached.data;
        }
    }

    // Bascule automatique vers Meta Graph API si configurée
    if (metaConfig?.enabled && metaConfig.accessToken && metaConfig.instagramAccountId) {
        try {
            const url = `https://graph.facebook.com/v19.0/${metaConfig.instagramAccountId}?fields=biography,id,username,followers_count,follows_count,media_count,profile_picture_url&access_token=${metaConfig.accessToken}`;
            const res = await fetch(url, { next: { revalidate: 120 } });
            if (res.ok) {
                const json = await res.json();
                const stat: InstagramAccountStat = {
                    id: json.id || `acc-${cleanUsername}`,
                    username: json.username || cleanUsername,
                    displayName: json.username || cleanUsername,
                    followersCount: json.followers_count || 0,
                    followersFormatted: formatFollowerCount(json.followers_count || 0),
                    followingCount: json.follows_count,
                    postsCount: json.media_count,
                    avatarUrl: json.profile_picture_url,
                    lastUpdated: new Date().toISOString(),
                    isCuc: cleanUsername === 'campus.univers.cascades',
                };
                PROFILE_CACHE.set(cleanUsername, { data: stat, timestamp: now });
                return stat;
            }
        } catch {
            // Repli sur le scraper si l'appel Graph échoue
        }
    }

    // Scraper haute fiabilité via facebookexternalhit
    try {
        const res = await fetch(`https://www.instagram.com/${cleanUsername}/`, {
            headers: {
                'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8',
            },
            cache: 'no-store',
        });
        if (!res.ok) return null;

        const html = await res.text();
        const ogDesc = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)?.[1] || '';
        const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1] || '';
        const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1];

        const followersMatch = ogDesc.match(/^([0-9.,KMBkmb]+)\s+Followers/i);
        const followingMatch = ogDesc.match(/,\s*([0-9.,KMBkmb]+)\s+Following/i);
        const postsMatch = ogDesc.match(/,\s*([0-9.,KMBkmb]+)\s+Posts/i);

        if (!followersMatch) return null;

        const rawFollowers = followersMatch[1];
        const count = parseCount(rawFollowers);

        let cleanTitle = ogTitle.split('•')[0].replace(/\([^)]*\)/g, '').trim();
        if (!cleanTitle) cleanTitle = cleanUsername;

        const stat: InstagramAccountStat = {
            id: `acc-${cleanUsername}`,
            username: cleanUsername,
            displayName: cleanTitle,
            followersCount: count,
            followersFormatted: formatFollowerCount(count),
            followingCount: followingMatch ? parseCount(followingMatch[1]) : undefined,
            postsCount: postsMatch ? parseCount(postsMatch[1]) : undefined,
            avatarUrl: ogImage ? ogImage.replace(/&amp;/g, '&') : undefined,
            isCuc: cleanUsername === 'campus.univers.cascades',
            lastUpdated: new Date().toISOString(),
        };

        PROFILE_CACHE.set(cleanUsername, { data: stat, timestamp: now });
        return stat;
    } catch {
        return null;
    }
}

/**
 * Récupère les métriques en direct d'un Reel Instagram spécifique.
 */
export async function getReelLiveMetrics(
    shortcode: string,
    forceRefresh = false
): Promise<{ views?: number; viewsFormatted?: string; likes?: string } | null> {
    const now = Date.now();
    if (!forceRefresh) {
        const cached = REEL_CACHE.get(shortcode);
        if (cached && now - cached.timestamp < CACHE_TTL_MS) {
            return cached.data;
        }
    }

    try {
        const res = await fetch(`https://www.instagram.com/reel/${shortcode}/`, {
            headers: {
                'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
            },
            cache: 'no-store',
        });
        if (!res.ok) return null;

        const html = await res.text();
        const ogDesc = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)?.[1] || '';

        const likesMatch = ogDesc.match(/^([0-9.,KMBkmb]+)\s+likes/i);
        const result: { views?: number; viewsFormatted?: string; likes?: string } = {};

        if (likesMatch) {
            result.likes = likesMatch[1];
        }

        REEL_CACHE.set(shortcode, { data: result, timestamp: now });
        return result;
    } catch {
        return null;
    }
}

/**
 * Calcule les indicateurs du prochain palier d'abonnés CUC.
 *
 * Ne produit **que du mesurable** : palier, position dans le palier et restant.
 * Aucune cadence quotidienne n'est déduite faute de variation observée ; une
 * constante de « +1 420 abonnés / jour » était affichée jusqu'au 2026-09-24,
 * avec une date d'atteinte qui n'avait aucune source.
 */
export function calculateGrowthMilestone(followers: number): InstagramGrowthMilestone {
    const nextTarget = Math.ceil((followers + 1000) / 100000) * 100000;
    const tierFloor = nextTarget - 100000;
    const progressInTier = Math.max(0, followers - tierFloor);
    const progressPercent = Math.min(100, Math.round((progressInTier / 100000) * 100));
    const remainingToTarget = Math.max(0, nextTarget - followers);

    return {
        currentFollowers: followers,
        nextTarget,
        tierFloor,
        progressPercent,
        remainingToTarget,
    };
}

/**
 * Calcule les métriques cumulées sur l'ensemble des Reels CUC.
 *
 * Seuls des cumuls et des moyennes calculés sont renvoyés. Les faux agrégats
 * (`totalLikesEstimated: '3,8 M'`, `avgEngagementRate: 5.4`) ont été supprimés
 * le 2026-09-24 : ils étaient écrits à la main et se présentaient comme mesurés.
 */
export function calculateReelsAggregates(reels: InstagramReelMetric[]): InstagramReelsAggregates {
    const totalViews = reels.reduce((acc, r) => acc + (r.views || 0), 0);
    const avgViewsPerReel = reels.length > 0 ? Math.round(totalViews / reels.length) : 0;
    const sorted = [...reels].sort((a, b) => b.views - a.views);

    return {
        totalViews,
        totalViewsFormatted: formatFollowerCount(totalViews),
        avgViewsPerReel,
        avgViewsFormatted: formatFollowerCount(avgViewsPerReel),
        reelCount: reels.length,
        topReels: sorted.slice(0, 3),
    };
}

