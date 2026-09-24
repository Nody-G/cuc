import { generateReelsCsv } from './instagram-export';
import type { InstagramReelMetric } from '@/types/instagram-monitor';

describe('instagram-export', () => {
    it('génère un contenu CSV valide avec en-têtes et encodage UTF-8 BOM', () => {
        const dummyReels: InstagramReelMetric[] = [
            {
                id: 'reel-1',
                shortcode: 'ABC123xyz',
                url: 'https://www.instagram.com/reel/ABC123xyz/',
                title: 'Cascade "torche humaine"',
                description: 'Superbe cascade avec feu.',
                coverImage: '/img.jpg',
                views: 5200000,
                viewsFormatted: '5,2 M',
                likes: '120 k',
                date: '2024-01-15',
                stuntCategory: 'fire',
            },
        ];

        const csv = generateReelsCsv(dummyReels);
        expect(csv.startsWith('\uFEFF')).toBe(true);
        expect(csv).toContain('"Shortcode";"Titre";"Catégorie";"Vues Exactes"');
        expect(csv).toContain('"ABC123xyz";"Cascade ""torche humaine""";"fire";"5200000";"5,2 M";"120 k"');
    });

    it('gère les champs vides ou indéfinis sans planter', () => {
        const minimalReel: InstagramReelMetric = {
            id: 'reel-2',
            shortcode: 'EMPTY123',
            url: 'https://instagram.com',
            title: 'Test',
            description: '',
            coverImage: '',
            views: 0,
            viewsFormatted: '0',
        };

        const csv = generateReelsCsv([minimalReel]);
        expect(csv).toContain('"EMPTY123";"Test";"general";"0"');
    });
});
