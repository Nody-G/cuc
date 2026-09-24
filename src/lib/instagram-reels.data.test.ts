import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { ALL_INSTAGRAM_REELS, DEFAULT_FEATURED_REELS } from '@/data/instagram-reels';

/**
 * Garde non-régression du catalogue Reels.
 *
 * Le catalogue avait accumulé des entrées fabriquées (shortcodes inexistants,
 * couvertures manquantes ou pointant vers un autre Reel) : cette suite empêche
 * leur réintroduction. Elle échoue dès qu'une entrée ne correspond plus à un
 * fichier de couverture réel présent dans le dépôt.
 */
const REELS_DIR = join(process.cwd(), 'public', 'images', 'reels');
const imageShortcodes = new Set(
    readdirSync(REELS_DIR)
        .filter((file) => file.endsWith('.jpg'))
        .map((file) => basename(file, '.jpg')),
);

describe('Catalogue Reels Instagram — cohérence données / couvertures', () => {
    it('chaque Reel pointe vers la couverture qui porte son propre shortcode', () => {
        for (const reel of ALL_INSTAGRAM_REELS) {
            expect(reel.coverImage).toBe(`/images/reels/${reel.shortcode}.jpg`);
        }
    });

    it('chaque couverture référencée existe réellement sur le disque', () => {
        const missing = ALL_INSTAGRAM_REELS.filter(
            (reel) => !imageShortcodes.has(reel.shortcode),
        ).map((reel) => reel.shortcode);
        expect(missing).toEqual([]);
    });

    it('aucune couverture présente dans le dépôt n’est orpheline', () => {
        const referenced = new Set(ALL_INSTAGRAM_REELS.map((reel) => reel.shortcode));
        const orphans = [...imageShortcodes].filter((shortcode) => !referenced.has(shortcode));
        expect(orphans).toEqual([]);
    });

    it('aucun shortcode dupliqué dans le catalogue', () => {
        const shortcodes = ALL_INSTAGRAM_REELS.map((reel) => reel.shortcode);
        expect(new Set(shortcodes).size).toBe(shortcodes.length);
    });

    it('les Reels mis en avant proviennent du catalogue', () => {
        const catalogue = new Set(ALL_INSTAGRAM_REELS.map((reel) => reel.shortcode));
        const notInCatalogue = DEFAULT_FEATURED_REELS.filter(
            (reel) => !catalogue.has(reel.shortcode),
        ).map((reel) => reel.shortcode);
        expect(notInCatalogue).toEqual([]);
    });

    it('chaque URL de Reel est bien un permalien Instagram', () => {
        for (const reel of ALL_INSTAGRAM_REELS) {
            expect(reel.url).toBe(`https://www.instagram.com/reel/${reel.shortcode}/`);
        }
    });

    it('les copies éditoriales FR/EN couvrent exactement les Reels mis en avant', () => {
        const fr = JSON.parse(readFileSync(join(process.cwd(), 'messages', 'fr.json'), 'utf8'));
        const en = JSON.parse(readFileSync(join(process.cwd(), 'messages', 'en.json'), 'utf8'));
        expect(fr.videos.reelsItems).toHaveLength(DEFAULT_FEATURED_REELS.length);
        expect(en.videos.reelsItems).toHaveLength(DEFAULT_FEATURED_REELS.length);
    });

    it('les champs affichés sont toujours renseignés', () => {
        for (const reel of ALL_INSTAGRAM_REELS) {
            expect(reel.title.trim().length).toBeGreaterThan(0);
            expect(reel.views).toBeGreaterThanOrEqual(0);
        }
    });
});
