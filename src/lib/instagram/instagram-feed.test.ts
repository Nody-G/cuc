import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchLiveInstagramDashboard } from './instagram-feed';

describe('fetchLiveInstagramDashboard', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('renvoie null si la requête Meta API échoue sans cache', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        const dashboard = await fetchLiveInstagramDashboard('test_token', true);
        expect(dashboard).toBeNull();
    });

    it('parse et agrège correctement les données réelles de la Graph API', async () => {
        global.fetch = vi.fn().mockImplementation((url: string | URL | Request) => {
            const urlStr = url.toString();
            if (urlStr.includes('/me?fields=')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        id: 'cuc-123456',
                        username: 'campus.univers.cascades',
                        followers_count: 1120688,
                        follows_count: 1127,
                        media_count: 744,
                    }),
                } as Response);
            }
            if (urlStr.includes('/me/media?fields=')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        data: [
                            {
                                id: 'media_reel_1',
                                caption: 'Cascade au sol combat #stunt',
                                media_type: 'VIDEO',
                                media_url: 'https://example.com/video1.mp4',
                                permalink: 'https://www.instagram.com/reel/DJW5wq0MIzt/',
                                timestamp: '2026-03-20T12:00:00Z',
                                like_count: 12500,
                                comments_count: 320,
                                insights: {
                                    data: [
                                        {
                                            name: 'views',
                                            values: [{ value: 14349507 }],
                                        },
                                    ],
                                },
                            },
                            {
                                id: 'media_photo_1',
                                caption: 'Session shooting photo sur le campus',
                                media_type: 'IMAGE',
                                media_url: 'https://example.com/photo1.jpg',
                                permalink: 'https://www.instagram.com/p/C-photo123/',
                                timestamp: '2026-03-19T10:00:00Z',
                                like_count: 4500,
                                comments_count: 85,
                            },
                        ],
                    }),
                } as Response);
            }
            return Promise.resolve({ ok: false } as Response);
        });

        const dashboard = await fetchLiveInstagramDashboard('valid_token', true);

        expect(dashboard).not.toBeNull();
        if (!dashboard) return;

        expect(dashboard.profile.followersCount).toBe(1120688);
        expect(dashboard.profile.followersFormatted).toBe((1120688).toLocaleString('fr-FR'));
        expect(dashboard.profile.followingCount).toBe(1127);
        expect(dashboard.profile.postsCount).toBe(744);
        expect(dashboard.videoCount).toBeGreaterThanOrEqual(1);
        expect(dashboard.photoCount).toBe(1);

        const video = dashboard.publications.find((p) => p.mediaType === 'VIDEO');
        const photo = dashboard.publications.find((p) => p.mediaType === 'IMAGE');

        expect(video).toBeDefined();
        expect(video?.likesCount).toBe(12500);
        expect(video?.commentsCount).toBe(320);
        expect(video?.views).toBe(14349507);
        expect(video?.viewsFormatted).toBe('14,3 M');

        expect(photo).toBeDefined();
        expect(photo?.likesCount).toBe(4500);
        expect(photo?.commentsCount).toBe(85);
        expect(photo?.views).toBe(0);
    });
});
