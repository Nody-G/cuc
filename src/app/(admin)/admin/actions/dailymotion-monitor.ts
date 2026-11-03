'use server';

export interface DailymotionChannelStats {
    id: string;
    screenname: string;
    username: string;
    avatarUrl: string;
    viewsTotal: number;
    videosTotal: number;
    fansTotal: number;
    url: string;
}

export interface DailymotionVideoStat {
    id: string;
    title: string;
    viewsTotal: number;
    duration: number;
    durationFormatted: string;
    createdTime: number;
    createdDateFormatted: string;
    url: string;
    thumbnailUrl: string;
    allowEmbed: boolean;
}

export interface DailymotionMonitorData {
    success: boolean;
    isAuthenticated: boolean;
    channel?: DailymotionChannelStats;
    videos: DailymotionVideoStat[];
    lastSyncedAt: string;
    error?: string;
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(timestamp: number): string {
    if (!timestamp) return 'Date inconnue';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Action serveur : Récupération des métriques officielles et certifiées de la chaîne
 * Dailymotion @campus-univers-cascades via OAuth 2.0 (Client Credentials).
 */
export async function getDailymotionMonitorAction(): Promise<DailymotionMonitorData> {
    const apiKey = process.env.DAILYMOTION_API_KEY;
    const apiSecret = process.env.DAILYMOTION_API_SECRET;

    let accessToken: string | null = null;

    // 1. Authentification OAuth 2.0 Client Credentials si clés fournies
    if (apiKey && apiSecret) {
        try {
            const tokenRes = await fetch('https://api.dailymotion.com/oauth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: apiKey,
                    client_secret: apiSecret,
                }),
                next: { revalidate: 1800 }, // Cache token 30 min
            });

            if (tokenRes.ok) {
                const tokenData = await tokenRes.json();
                accessToken = tokenData.access_token || null;
            }
        } catch {
            // Repli sur l'API publique ouverte si échec d'authentification
        }
    }

    const authHeaders: HeadersInit = {
        Accept: 'application/json',
        'User-Agent': 'CUC-Cockpit-Monitor/1.0',
    };
    if (accessToken) {
        authHeaders.Authorization = `Bearer ${accessToken}`;
    }

    try {
        // 2. Statistiques globales de la chaîne
        const userRes = await fetch(
            'https://api.dailymotion.com/user/campus-univers-cascades?fields=id,screenname,username,avatar_720_url,views_total,videos_total,fans_total,url',
            { headers: authHeaders, next: { revalidate: 60 } }
        );

        if (!userRes.ok) {
            return {
                success: false,
                isAuthenticated: Boolean(accessToken),
                videos: [],
                lastSyncedAt: new Date().toLocaleTimeString('fr-FR'),
                error: `Erreur API Dailymotion utilisateur (HTTP ${userRes.status})`,
            };
        }

        const userData = await userRes.json();
        const channel: DailymotionChannelStats = {
            id: userData.id || 'xddj5g',
            screenname: userData.screenname || 'Campus Univers Cascades',
            username: userData.username || 'campus-univers-cascades',
            avatarUrl: userData.avatar_720_url || 'https://s1.dmcdn.net/u/1Liyq1gwIX5gpSZ5Y/720x720',
            viewsTotal: Number(userData.views_total) || 0,
            videosTotal: Number(userData.videos_total) || 0,
            fansTotal: Number(userData.fans_total) || 0,
            url: userData.url || 'https://www.dailymotion.com/campus-univers-cascades',
        };

        // 3. Détail et statistiques par vidéo
        const videosRes = await fetch(
            'https://api.dailymotion.com/user/campus-univers-cascades/videos?fields=id,title,views_total,duration,created_time,url,thumbnail_720_url,thumbnail_large_url,allow_embed&limit=100',
            { headers: authHeaders, next: { revalidate: 60 } }
        );

        const videosData = videosRes.ok ? await videosRes.json() : { list: [] };
        const rawList = Array.isArray(videosData.list) ? videosData.list : [];

        const videos: DailymotionVideoStat[] = rawList.map((item: {
            id: string;
            title?: string;
            views_total?: number;
            duration?: number;
            created_time?: number;
            url?: string;
            thumbnail_720_url?: string;
            thumbnail_large_url?: string;
            allow_embed?: boolean;
        }) => ({
            id: item.id,
            title: item.title || 'Reportage CUC',
            viewsTotal: Number(item.views_total) || 0,
            duration: item.duration || 0,
            durationFormatted: formatDuration(item.duration || 0),
            createdTime: item.created_time || 0,
            createdDateFormatted: formatDate(item.created_time || 0),
            url: item.url || `https://www.dailymotion.com/video/${item.id}`,
            thumbnailUrl: item.thumbnail_720_url || item.thumbnail_large_url || '',
            allowEmbed: item.allow_embed ?? true,
        }));

        return {
            success: true,
            isAuthenticated: Boolean(accessToken),
            channel,
            videos,
            lastSyncedAt: new Date().toLocaleTimeString('fr-FR'),
        };
    } catch (err) {
        return {
            success: false,
            isAuthenticated: Boolean(accessToken),
            videos: [],
            lastSyncedAt: new Date().toLocaleTimeString('fr-FR'),
            error: err instanceof Error ? err.message : 'Erreur de connexion Dailymotion.',
        };
    }
}
