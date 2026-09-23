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
