import {
    INTERNAL_LINK_OPTIONS,
    describeLink,
    isExternalLink,
    isKnownInternalLink,
    normalizeLinkValue,
} from './link-options';

/**
 * Le sélecteur de liens s'appuie sur les 15 pages réelles : une page retirée du
 * sélecteur ne doit pas rester proposée comme cible, et un chemin libre ne doit
 * jamais être confondu avec une page connue.
 */
describe('link-options', () => {
    it('propose les 15 pages du sélecteur avec des chemins absolus', () => {
        const pages = INTERNAL_LINK_OPTIONS.filter((option) => option.group === 'page');
        expect(pages).toHaveLength(15);
        expect(pages.map((option) => option.value)).toContain('/visite-guidee');
        expect(pages.map((option) => option.value)).toContain('/');
        expect(pages.every((option) => option.value.startsWith('/'))).toBe(true);
    });

    it('nettoie les libellés du sélecteur (sans le chemin entre parenthèses)', () => {
        const visite = INTERNAL_LINK_OPTIONS.find(
            (option) => option.value === '/visite-guidee'
        );
        expect(visite?.label).toBe('Visite Guidée Campus');
    });

    it('reconnaît une page connue, refuse un chemin inconnu ou vide', () => {
        expect(isKnownInternalLink('/visite-guidee')).toBe(true);
        expect(isKnownInternalLink('  /visite-guidee  ')).toBe(true);
        expect(isKnownInternalLink('/page-inconnue')).toBe(false);
        expect(isKnownInternalLink('')).toBe(false);
        expect(isKnownInternalLink(null)).toBe(false);
    });

    it('propose les intentions de contact réellement consommées par la vitrine', () => {
        const intents = INTERNAL_LINK_OPTIONS.filter((option) => option.group === 'intention');
        const values = intents.map((option) => option.value);
        expect(values).toContain('/contact-cuc?demande=cuc-events');
        expect(values).toContain('/contact-cuc?demande=afdas-artistes-interpretes');
        expect(values).toContain('/contact-cuc?demande=tournage-production');
        expect(isKnownInternalLink('/contact-cuc?demande=cuc-events')).toBe(true);
        expect(describeLink('/contact-cuc?demande=cuc-events')).toBe('Contact → devis CUC Events');
    });

    it('décrit une page, un lien externe, une ancre et une cible vide', () => {
        expect(describeLink('/contact-cuc')).toBe('Contact & Accès');
        expect(describeLink('https://example.com')).toContain('Lien externe');
        expect(describeLink('mailto:contact@campus-universcascades.com')).toContain(
            'Lien externe'
        );
        expect(describeLink('#formulaire')).toBe(
            'Contact → ancre : formulaire de candidature'
        );
        expect(describeLink('')).toBe('Aucune cible');
    });

    it('détecte les cibles hors site sans confondre un chemin interne', () => {
        expect(isExternalLink('tel:+33672849492')).toBe(true);
        expect(isExternalLink('/visite-guidee')).toBe(false);
    });

    it('normalise sans inventer de valeur', () => {
        expect(normalizeLinkValue('  /stages-cascades-parkour-2 ')).toBe(
            '/stages-cascades-parkour-2'
        );
        expect(normalizeLinkValue(undefined)).toBe('');
    });
});
