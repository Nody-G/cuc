import {
    SITE_URL,
    SITE_NAME,
    canonical,
    educationalOrganizationJsonLd,
    websiteJsonLd,
    courseJsonLd,
    videoObjectJsonLd,
} from './seo';

/**
 * Tests unitaires de la couche SEO (Phase 6).
 * Vérifie la construction des URL canoniques et la validité des
 * données structurées schema.org injectées dans le layout racine.
 */
describe('seo — canonical()', () => {
    it('retourne l’URL racine pour "/"', () => {
        expect(canonical('/')).toBe(SITE_URL);
    });

    it('préfixe correctement un chemin sans slash initial', () => {
        expect(canonical('partenaires')).toBe(`${SITE_URL}/partenaires`);
    });

    it('conserve un chemin déjà préfixé', () => {
        expect(canonical('/visite-virtuelle')).toBe(`${SITE_URL}/visite-virtuelle`);
    });
});

describe('seo — educationalOrganizationJsonLd()', () => {
    const jsonLd = educationalOrganizationJsonLd();

    it('déclare le bon type schema.org', () => {
        expect(jsonLd['@context']).toBe('https://schema.org');
        expect(jsonLd['@type']).toBe('EducationalOrganization');
    });

    it('expose le nom et l’URL du site', () => {
        expect(jsonLd.name).toBe(SITE_NAME);
        expect(jsonLd.url).toBe(SITE_URL);
    });

    it('inclut les profils sociaux dans sameAs', () => {
        expect(Array.isArray(jsonLd.sameAs)).toBe(true);
        expect(jsonLd.sameAs.length).toBeGreaterThan(0);
        expect(jsonLd.sameAs).toContain(
            'https://www.youtube.com/@campusuniverscascades'
        );
    });

    it('référence l’organisation via un @id stable', () => {
        expect(jsonLd['@id']).toBe(`${SITE_URL}/#organization`);
    });
});

describe('seo — websiteJsonLd()', () => {
    const jsonLd = websiteJsonLd();

    it('déclare un WebSite relié à l’organisation', () => {
        expect(jsonLd['@type']).toBe('WebSite');
        expect(jsonLd.url).toBe(SITE_URL);
        expect(jsonLd.inLanguage).toBe('fr-FR');
        expect(jsonLd.publisher).toEqual({ '@id': `${SITE_URL}/#organization` });
    });
});

describe('seo — courseJsonLd()', () => {
    it('génère un Course valide avec les paramètres fournis', () => {
        const jsonLd = courseJsonLd({
            name: 'Formation Cascadeur Pro',
            description: 'Formation intensive de cascadeur de cinéma.',
            path: '/formation-de-cascadeur',
        });

        expect(jsonLd['@type']).toBe('Course');
        expect(jsonLd.name).toBe('Formation Cascadeur Pro');
        expect(jsonLd.url).toBe(`${SITE_URL}/formation-de-cascadeur`);
        expect(jsonLd.provider).toEqual({ '@id': `${SITE_URL}/#organization` });
    });

    it('ajoute timeRequired uniquement lorsque duration est fournie', () => {
        const withDuration = courseJsonLd({
            name: 'Stage',
            description: 'Stage découverte.',
            path: '/stages',
            duration: 'P1W',
        });
        expect(withDuration.timeRequired).toBe('P1W');

        const withoutDuration = courseJsonLd({
            name: 'Stage',
            description: 'Stage découverte.',
            path: '/stages',
        });
        expect('timeRequired' in withoutDuration).toBe(false);
    });
});

describe('seo — videoObjectJsonLd()', () => {
    it('génère un VideoObject valide', () => {
        const jsonLd = videoObjectJsonLd({
            name: 'CUC — Reportage TF1',
            description: 'Immersion au cœur du campus.',
            thumbnailUrl: `${SITE_URL}/thumb.jpg`,
            uploadDate: '2026-01-01',
            embedUrl: 'https://www.youtube.com/embed/abc',
        });

        expect(jsonLd['@type']).toBe('VideoObject');
        expect(jsonLd.name).toBe('CUC — Reportage TF1');
        expect(jsonLd.uploadDate).toBe('2026-01-01');
        expect(jsonLd.thumbnailUrl).toEqual([`${SITE_URL}/thumb.jpg`]);
        expect(jsonLd.embedUrl).toBe('https://www.youtube.com/embed/abc');
    });

    it('applique une date de publication par défaut', () => {
        const jsonLd = videoObjectJsonLd({
            name: 'Sans date',
            description: 'Description.',
            thumbnailUrl: `${SITE_URL}/thumb.jpg`,
        });
        expect(jsonLd.uploadDate).toBe('2025-12-01');
        expect('embedUrl' in jsonLd).toBe(false);
    });
});
