'use server';

import {
    extractInstagramShortcode,
    decodeInstagramEntities,
} from '@/lib/instagram-utils';

/**
 * Action serveur pour récupérer les métadonnées officielles d'une publication / Reel Instagram.
 * Zéro fausse information : extrait la véritable légende et l'image de couverture.
 */

export interface InstagramMetadataResult {
    success: boolean;
    error?: string;
    data?: {
        shortcode: string;
        url: string;
        title: string;
        description: string;
        coverImage: string;
    };
}

/**
 * Récupère les métadonnées réelles d'un Reel ou Post Instagram.
 */
export async function fetchInstagramMetadata(url: string): Promise<InstagramMetadataResult> {
    const shortcode = extractInstagramShortcode(url);
    if (!shortcode) {
        return {
            success: false,
            error: "Format d'URL Instagram invalide. Exemple : https://www.instagram.com/reel/DJW5wq0MIzt/",
        };
    }

    try {
        const canonicalUrl = `https://www.instagram.com/reel/${shortcode}/`;
        const res = await fetch(canonicalUrl, {
            headers: {
                // User-Agent reconnu par Meta pour renvoyer le HTML OpenGraph prérendu (SSR)
                'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            next: { revalidate: 3600 },
        });

        if (!res.ok) {
            return {
                success: false,
                error: `Impossible de contacter Instagram (HTTP ${res.status}).`,
            };
        }

        const html = await res.text();
        const rawTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1] || '';
        const rawDesc = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)?.[1] || '';
        const coverImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] || '';

        const decodedTitle = decodeInstagramEntities(rawTitle);
        const decodedDesc = decodeInstagramEntities(rawDesc);

        // Extraction de la véritable légende : texte après "on Instagram: \"" ou contenu og:description
        let realCaption = '';
        const captionMatch = decodedTitle.match(/on Instagram:\s*"([\s\S]*)"$/);
        if (captionMatch && captionMatch[1]) {
            realCaption = captionMatch[1].trim();
        } else if (decodedDesc) {
            const descMatch = decodedDesc.match(/:\s*"([\s\S]*)"$/);
            realCaption = descMatch && descMatch[1] ? descMatch[1].trim() : decodedDesc;
        }

        // Déduction d'un titre court à partir de la première ligne ou du début de la légende
        let title = '';
        if (realCaption) {
            const firstLine = realCaption.split('\n')[0].replace(/#\w+/g, '').trim();
            title = firstLine.length > 50 ? `${firstLine.slice(0, 47)}…` : firstLine;
        }
        if (!title) {
            title = `Reel CUC #${shortcode}`;
        }

        return {
            success: true,
            data: {
                shortcode,
                url: canonicalUrl,
                title,
                description: realCaption,
                coverImage: coverImage.replace(/&amp;/g, '&'),
            },
        };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erreur réseau inconnue';
        return {
            success: false,
            error: `Échec de l'extraction Instagram : ${message}`,
        };
    }
}

export interface PublicInstagramFollowersResult {
    success: boolean;
    followersCount: number;
    followersFormatted: string;
    totalVideoViews: number;
    totalVideoViewsFormatted: string;
}

/**
 * Récupère le compteur d'abonnés et les vues certifiées pour le site vitrine.
 * Issu du snapshot persistant Supabase (site_settings key='instagram_feed_snapshot').
 */
export async function getPublicInstagramFollowersAction(): Promise<PublicInstagramFollowersResult> {
    const fallback: PublicInstagramFollowersResult = {
        success: true,
        followersCount: 1120672,
        followersFormatted: '1,1M',
        totalVideoViews: 706828446,
        totalVideoViewsFormatted: '706M',
    };
    try {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const adminClient = createAdminClient();
        const { data: row } = await adminClient
            .from('site_settings')
            .select('value')
            .eq('key', 'instagram_feed_snapshot')
            .maybeSingle();

        if (row?.value) {
            const val = row.value as {
                profile?: { followersCount?: number };
                totalVideoViews?: number;
            };
            const count = val.profile?.followersCount || fallback.followersCount;
            const views = val.totalVideoViews || fallback.totalVideoViews;
            return {
                success: true,
                followersCount: count,
                followersFormatted: count >= 1000000 ? `${(count / 1000000).toFixed(1).replace('.', ',')}M` : count.toLocaleString('fr-FR'),
                totalVideoViews: views,
                totalVideoViewsFormatted: views >= 1000000 ? `${Math.round(views / 1000000)}M` : views.toLocaleString('fr-FR'),
            };
        }
        return fallback;
    } catch {
        return fallback;
    }
}

