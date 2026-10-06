import { describe, expect, it } from 'vitest';
import {
    buildMediaUsageIndex,
    extractMediaOccurrencesFromRow,
    getRowEntityLabel,
    sortMediaByUsage,
    type MediaUsageLocation,
} from './media-usage';
import type { MediaObject } from '@/app/(admin)/admin/media-shared';

describe('media-usage domain', () => {
    const marker = '/storage/v1/object/public/cuc-vitrine-assets/';

    it('déduit des libellés lisibles selon les tables', () => {
        expect(getRowEntityLabel('site_pages', { title: 'Accueil', slug: 'home' })).toBe('Page "Accueil"');
        expect(getRowEntityLabel('site_pages', { slug: 'stages' })).toBe('Page "stages"');
        expect(getRowEntityLabel('site_team', { name: 'Lucas' })).toBe('Équipe : Lucas');
        expect(getRowEntityLabel('site_films', { title: 'Taxi 5' })).toBe('Film : Taxi 5');
        expect(getRowEntityLabel('site_partners', { name: 'CNC' })).toBe('Partenaire : CNC');
        expect(getRowEntityLabel('site_disciplines', { title: 'Parkour' })).toBe('Discipline : Parkour');
        expect(getRowEntityLabel('site_campus_pois', { title: 'Fosse' })).toBe('Lieu Campus : Fosse');
    });

    it('extrait les occurrences et contextes d\'une ligne récursive', () => {
        const row = {
            slug: 'accueil',
            title: 'Accueil',
            hero: {
                bg_image: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/hero.webp',
            },
            og_image: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/hero.webp',
            sections: [
                {
                    image: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/stage.webp',
                },
            ],
        };

        const occurrences = extractMediaOccurrencesFromRow('site_pages', row, marker);
        expect(occurrences).toHaveLength(3);

        const heroOccurrences = occurrences.filter((o) => o.path === 'media/cuc-visual/hero.webp');
        expect(heroOccurrences).toHaveLength(2);
        expect(heroOccurrences[0].location.label).toBe('Page "Accueil"');
        expect(heroOccurrences[0].location.context).toBe("Bannière d'en-tête (Hero)");
        expect(heroOccurrences[1].location.context).toBe('Partage réseaux (OG)');
    });

    it('construit un index d\'usage avec comptage et déduplication d\'emplacements', () => {
        const occurrences: Array<{ path: string; location: MediaUsageLocation }> = [
            { path: 'img1.webp', location: { table: 'site_pages', label: 'Page "Accueil"', context: 'Hero' } },
            { path: 'img1.webp', location: { table: 'site_pages', label: 'Page "Accueil"', context: 'Hero' } }, // doublon d'emplacement
            { path: 'img1.webp', location: { table: 'site_pages', label: 'Page "Contact"' } },
            { path: 'img2.webp', location: { table: 'site_team', label: 'Équipe : Lucas' } },
        ];

        const index = buildMediaUsageIndex(occurrences);

        expect(index['img1.webp'].count).toBe(3);
        expect(index['img1.webp'].locations).toHaveLength(2);
        expect(index['img2.webp'].count).toBe(1);
    });

    it('trie les médias par nombre d\'utilisations décroissant et croissant', () => {
        const files: MediaObject[] = [
            { name: 'b-orphan.webp', path: 'b-orphan.webp', folder: '', url: '', size: 100, mimetype: 'image/webp', createdAt: null, kind: 'image' },
            { name: 'c-popular.webp', path: 'c-popular.webp', folder: '', url: '', size: 100, mimetype: 'image/webp', createdAt: null, kind: 'image' },
            { name: 'a-single.webp', path: 'a-single.webp', folder: '', url: '', size: 100, mimetype: 'image/webp', createdAt: null, kind: 'image' },
        ];

        const usageIndex = {
            'c-popular.webp': { count: 5, locations: [] },
            'a-single.webp': { count: 1, locations: [] },
            // b-orphan.webp a 0 utilisation
        };

        const sortedDesc = sortMediaByUsage(files, usageIndex, 'desc');
        expect(sortedDesc.map((f) => f.name)).toEqual(['c-popular.webp', 'a-single.webp', 'b-orphan.webp']);

        const sortedAsc = sortMediaByUsage(files, usageIndex, 'asc');
        expect(sortedAsc.map((f) => f.name)).toEqual(['b-orphan.webp', 'a-single.webp', 'c-popular.webp']);
    });
});
