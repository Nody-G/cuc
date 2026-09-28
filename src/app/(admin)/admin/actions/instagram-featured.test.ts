import { importReelViaMetaAction } from './instagram-featured';
import { getFeaturedInstagramReels } from '@/lib/data/site/settings';
import { DEFAULT_FEATURED_REELS } from '@/data/instagram-reels';

describe('instagram-featured actions & persistence', () => {
    it('importReelViaMetaAction renvoie une erreur pour une URL invalide', async () => {
        const res = await importReelViaMetaAction('https://invalid-url.com');
        expect(res.success).toBe(false);
        expect(res.error).toContain('Lien Instagram invalide');
    });

    it('importReelViaMetaAction résout un Reel présent dans le catalogue CUC', async () => {
        const res = await importReelViaMetaAction('https://www.instagram.com/reel/DQmgL2IjN-8/');
        expect(res.success).toBe(true);
        expect(res.reel).toBeDefined();
        expect(res.reel?.shortcode).toBe('DQmgL2IjN-8');
        expect(res.reel?.isFeatured).toBe(true);
        expect(res.reel?.views).toBe(92707771);
    });

    it('getFeaturedInstagramReels renvoie DEFAULT_FEATURED_REELS par défaut', async () => {
        const reels = await getFeaturedInstagramReels();
        expect(Array.isArray(reels)).toBe(true);
        expect(reels.length).toBeGreaterThanOrEqual(6);
        expect(reels[0].shortcode).toBe(DEFAULT_FEATURED_REELS[0].shortcode);
    });
});
