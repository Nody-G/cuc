'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { extractInstagramShortcode } from '@/lib/instagram-utils';
import {
    getOfficialReelMetrics,
    getOfficialReelDetails,
} from '@/lib/instagram/instagram-reel-meta';
import { getInstagramMetaConfigAction } from './instagram-monitor';
import { fetchInstagramMetadata } from './instagram';
import {
    DEFAULT_FEATURED_REELS,
    ALL_INSTAGRAM_REELS,
} from '@/data/instagram-reels';
import type { InstagramReelMetric } from '@/types/instagram-monitor';

/**
 * Charge les Reels Instagram mis en avant depuis Supabase (site_settings),
 * avec repli sur la sélection par défaut du catalogue CUC.
 */
export async function getFeaturedReelsAction(): Promise<{
    success: boolean;
    reels: InstagramReelMetric[];
}> {
    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('site_settings')
            .select('value')
            .eq('key', 'instagram_featured_reels')
            .maybeSingle();

        if (error || !data?.value) {
            return {
                success: true,
                reels: DEFAULT_FEATURED_REELS as InstagramReelMetric[],
            };
        }

        const val = data.value as { items?: InstagramReelMetric[]; shortcodes?: string[] };
        if (val.items && Array.isArray(val.items) && val.items.length > 0) {
            return { success: true, reels: val.items };
        }

        if (val.shortcodes && Array.isArray(val.shortcodes) && val.shortcodes.length > 0) {
            const byShortcode = new Map(ALL_INSTAGRAM_REELS.map((r) => [r.shortcode, r]));
            const resolved = val.shortcodes
                .map((sc) => byShortcode.get(sc))
                .filter((r): r is InstagramReelMetric => Boolean(r));
            if (resolved.length > 0) {
                return { success: true, reels: resolved };
            }
        }

        return {
            success: true,
            reels: DEFAULT_FEATURED_REELS as InstagramReelMetric[],
        };
    } catch {
        return {
            success: true,
            reels: DEFAULT_FEATURED_REELS as InstagramReelMetric[],
        };
    }
}

/**
 * Enregistre la sélection des Reels mis en avant dans Supabase (site_settings)
 * et invalide le cache de la vidéothèque publique pour mise à jour immédiate.
 */
export async function saveFeaturedReelsAction(
    reels: InstagramReelMetric[]
): Promise<{ success: boolean; error?: string }> {
    try {
        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('site_settings')
            .upsert({
                key: 'instagram_featured_reels',
                value: {
                    items: reels,
                    shortcodes: reels.map((r) => r.shortcode),
                    updatedAt: new Date().toISOString(),
                },
                updated_at: new Date().toISOString(),
            });

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath('/[locale]/videos-cascadeur');
        revalidatePath('/');
        return { success: true };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Erreur inconnue lors de la sauvegarde.',
        };
    }
}

/**
 * Synchronise les vues certifiées et likes de tous les Reels mis en avant
 * en interrogeant en direct l'API officielle Meta Graph (/insights).
 */
export async function syncFeaturedReelsMetaAction(
    currentReels: InstagramReelMetric[]
): Promise<{
    success: boolean;
    updatedReels: InstagramReelMetric[];
    syncedCount: number;
    error?: string;
}> {
    try {
        const configRes = await getInstagramMetaConfigAction();
        const token = configRes.config.accessToken;

        if (!token) {
            return {
                success: false,
                updatedReels: currentReels,
                syncedCount: 0,
                error: 'Clé Meta Graph API non configurée. Impossible de synchroniser les vues.',
            };
        }

        let syncedCount = 0;
        const updatedReels: InstagramReelMetric[] = [];

        for (const reel of currentReels) {
            const metrics = await getOfficialReelMetrics(reel.shortcode, token);
            if (metrics && metrics.views > 0) {
                syncedCount++;
                updatedReels.push({
                    ...reel,
                    views: metrics.views,
                    viewsFormatted: metrics.viewsFormatted,
                    likes: metrics.likes || reel.likes,
                    lastUpdated: new Date().toISOString(),
                });
            } else {
                updatedReels.push(reel);
            }
        }

        await saveFeaturedReelsAction(updatedReels);

        return {
            success: true,
            updatedReels,
            syncedCount,
        };
    } catch (err) {
        return {
            success: false,
            updatedReels: currentReels,
            syncedCount: 0,
            error: err instanceof Error ? err.message : 'Erreur lors de la synchronisation Meta.',
        };
    }
}

/**
 * Importe un Reel via son lien ou shortcode en utilisant l'API Meta Graph officielle.
 * Récupère le titre, la légende, la couverture et les vues réelles certifiées.
 */
export async function importReelViaMetaAction(
    urlOrShortcode: string
): Promise<{
    success: boolean;
    reel?: InstagramReelMetric;
    error?: string;
}> {
    const shortcode = extractInstagramShortcode(urlOrShortcode);
    if (!shortcode) {
        return {
            success: false,
            error: 'Lien Instagram invalide. Exemple : https://www.instagram.com/reel/DQmgL2IjN-8/',
        };
    }

    // 1. Vérifier si le Reel est déjà répertorié dans le catalogue CUC
    const catalogEntry = ALL_INSTAGRAM_REELS.find((r) => r.shortcode === shortcode);
    if (catalogEntry) {
        const reel: InstagramReelMetric = {
            ...catalogEntry,
            id: catalogEntry.id || `reel-${shortcode}`,
            isFeatured: true,
            lastUpdated: new Date().toISOString(),
        };
        return { success: true, reel };
    }

    try {
        const configRes = await getInstagramMetaConfigAction();
        const token = configRes.config.accessToken;

        // 2. Tenter la récupération certifiée Meta Graph API directe
        if (token) {
            const official = await getOfficialReelDetails(shortcode, token);
            if (official) {
                const reel: InstagramReelMetric = {
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
                return { success: true, reel };
            }
        }

        // 3. Repli : Scraper OpenGraph public
        const metaScrape = await fetchInstagramMetadata(`https://www.instagram.com/reel/${shortcode}/`);
        if (metaScrape.success && metaScrape.data) {
            const reel: InstagramReelMetric = {
                id: `reel-${shortcode}`,
                shortcode,
                url: metaScrape.data.url,
                title: metaScrape.data.title,
                description: metaScrape.data.description,
                coverImage: metaScrape.data.coverImage,
                views: 0,
                viewsFormatted: '0',
                isFeatured: true,
                lastUpdated: new Date().toISOString(),
            };
            return { success: true, reel };
        }

        return {
            success: false,
            error: `Impossible de récupérer le Reel #${shortcode}. Vérifiez que la publication existe et est publique.`,
        };
    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Erreur inconnue lors de l’importation.',
        };
    }
}
