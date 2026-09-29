/**
 * Tests du catalogue de pages et de la structure de blocs.
 */

import {
    BLOCK_STRUCTURE_PAGES,
    SITE_PAGE_CATALOG,
    catalogPageLabel,
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

describe('catalogPageLabel', () => {
    it('retourne le nom canonique, quel que soit le format du slug', () => {
        expect(catalogPageLabel('/contact-cuc')).toBe('Contact & accès');
        expect(catalogPageLabel('contact-cuc#acces')).toBe('Contact & accès');
        expect(catalogPageLabel('/')).toBe('Accueil');
    });

    it('ne fabrique aucun nom pour une page hors catalogue', () => {
        expect(catalogPageLabel('/page-inconnue')).toBeNull();
    });
});

describe('SITE_PAGE_CATALOG', () => {
    it('porte des noms de page lisibles, jamais un slug collé', () => {
        for (const entry of SITE_PAGE_CATALOG) {
            expect(entry.label.trim().length).toBeGreaterThan(0);
            // Le défaut visé : « Formation Pro 2 Ans (/formation-de-cascadeur) ».
            // Une précision entre parenthèses reste légitime, un chemin non.
            expect(entry.label).not.toMatch(/\(\s*\//);
            expect(entry.label).not.toContain('/');
        }
    });

    it('n’a ni doublon de slug, ni doublon de nom', () => {
        const keys = SITE_PAGE_CATALOG.map((entry) => toPageKey(entry.value));
        const labels = SITE_PAGE_CATALOG.map((entry) => entry.label);
        expect(new Set(keys).size).toBe(keys.length);
        expect(new Set(labels).size).toBe(labels.length);
    });
});
