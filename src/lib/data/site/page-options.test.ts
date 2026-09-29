/**
 * Tests des options de pages et de la structure de blocs.
 */

import { DEFAULT_NAVIGATION } from '@/data/navigation';
import {
    BLOCK_STRUCTURE_PAGES,
    buildPageGroups,
    collectMenuSlugs,
    readsBlockStructure,
    toPageKey,
} from './page-options';

describe('toPageKey', () => {
    it('normalise racine, ancre et origine', () => {
        expect(toPageKey('/')).toBe('/');
        expect(toPageKey('/contact-cuc')).toBe('contact-cuc');
        expect(toPageKey('/contact-cuc#campus-map-hub')).toBe('contact-cuc');
        expect(toPageKey('https://campus.test/videos-cascadeur?x=1')).toBe('videos-cascadeur');
    });
});

describe('readsBlockStructure', () => {
    it('reconnaît les pages dont la vitrine lit layout_sections', () => {
        expect(readsBlockStructure('/')).toBe(true);
        expect(readsBlockStructure('visite-guidee')).toBe(true);
    });

    it('rejette une page sans lecture de blocs', () => {
        expect(readsBlockStructure('formation-de-cascadeur')).toBe(false);
        expect(BLOCK_STRUCTURE_PAGES).not.toContain('formation-de-cascadeur');
    });
});

describe('collectMenuSlugs', () => {
    it('collecte les liens et sous-liens du menu principal', () => {
        const slugs = collectMenuSlugs(DEFAULT_NAVIGATION);
        expect(slugs.has('contact-cuc')).toBe(true);
        expect(slugs.has('visite-guidee')).toBe(true);
        // Sous-lien de menu déroulant
        expect(slugs.has('spectacles-cascadeurs-yamakasi')).toBe(true);
    });

    it('tolère une navigation absente', () => {
        expect(collectMenuSlugs(null).size).toBe(0);
        expect(collectMenuSlugs(undefined).size).toBe(0);
    });
});

describe('buildPageGroups', () => {
    const menuSlugs = collectMenuSlugs(DEFAULT_NAVIGATION);

    it('sépare les pages du menu des pages hors menu', () => {
        // `visite-virtuelle` n'est pas citée par la navigation principale
        // (elle vit dans le pied de page) : elle doit donc tomber « hors menu ».
        const groups = buildPageGroups({
            availableSlugs: ['/', 'contact-cuc', 'visite-virtuelle'],
            menuSlugs,
        });
        const menuGroup = groups.find((g) => g.id === 'menu');
        const otherGroup = groups.find((g) => g.id === 'other');
        expect(menuGroup?.options.map((o) => o.value)).toEqual(['/', 'contact-cuc']);
        expect(otherGroup?.options.map((o) => o.value)).toEqual(['visite-virtuelle']);
    });

    it('ne propose jamais une page absente de la base', () => {
        const groups = buildPageGroups({ availableSlugs: ['/'], menuSlugs });
        const values = groups.flatMap((g) => g.options.map((o) => o.value));
        expect(values).toEqual(['/']);
    });

    it('accepte un slug d’URL avec slash initial', () => {
        const groups = buildPageGroups({ availableSlugs: ['/contact-cuc'], menuSlugs });
        expect(groups[0].options[0].value).toBe('contact-cuc');
    });
});
