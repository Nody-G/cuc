'use server';

import type { ProgrammeTvItem } from '@/data/videos';

interface DailymotionVideoResponse {
    id: string;
    title: string;
    description: string;
    thumbnail_720_url?: string;
    thumbnail_large_url?: string;
    duration?: number;
    created_time?: number;
}

interface DailymotionApiResponse {
    list?: DailymotionVideoResponse[];
    total?: number;
}

export interface SyncDailymotionResult {
    success: boolean;
    count: number;
    videos: ProgrammeTvItem[];
    error?: string;
}

/**
 * Action serveur : synchronisation automatique des vidéos publiques de la chaîne
 * Dailymotion officielle du Campus Univers Cascades (@campus-univers-cascades).
 *
 * Utilise l'API publique ouverte de Dailymotion (aucune clé d'authentification requise).
 * Règle SRP : logique isolée des composants UI.
 */
export async function syncDailymotionAction(): Promise<SyncDailymotionResult> {
    try {
        const url = 'https://api.dailymotion.com/user/campus-univers-cascades/videos?fields=id,title,description,thumbnail_720_url,thumbnail_large_url,duration,created_time&limit=100';
        const res = await fetch(url, {
            next: { revalidate: 60 },
            headers: {
                Accept: 'application/json',
                'User-Agent': 'CUC-Vitrine/1.0',
            },
        });

        if (!res.ok) {
            return {
                success: false,
                count: 0,
                videos: [],
                error: `Erreur API Dailymotion (HTTP ${res.status})`,
            };
        }

        const data = (await res.json()) as DailymotionApiResponse;
        if (!data.list || !Array.isArray(data.list) || data.list.length === 0) {
            return {
                success: false,
                count: 0,
                videos: [],
                error: 'Aucune vidéo retournée par la chaîne Dailymotion.',
            };
        }

        const videos: ProgrammeTvItem[] = data.list.map((item) => {
            const cleanTitle = (item.title || 'Reportage CUC').trim().toUpperCase();
            const sub = item.description
                ? item.description.replace(/<[^>]+>/g, '').split(/[.\n]/)[0].trim() || 'Reportage officiel CUC'
                : 'Reportage officiel CUC';

            return {
                dmId: item.id,
                title: cleanTitle,
                sub: sub.length > 70 ? `${sub.slice(0, 67)}...` : sub,
                img: item.thumbnail_720_url || item.thumbnail_large_url || 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/coeur-de-cascadeurs.webp',
            };
        });

        return {
            success: true,
            count: videos.length,
            videos,
        };
    } catch (err) {
        return {
            success: false,
            count: 0,
            videos: [],
            error: err instanceof Error ? err.message : 'Erreur inconnue lors de la synchronisation.',
        };
    }
}
