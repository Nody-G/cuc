import {
    MAX_SAMPLES_PER_REQUEST,
    resolveLocale,
    resolveRating,
    sanitizePath,
    shouldSample,
} from './vitals';
import { normalizeVitalsBatch, normalizeVitalsSample } from './vitals-validation';

/**
 * Garde-fou du contrat de télémétrie de performance.
 *
 * Le point sensible n'est pas la collecte mais ce qui est **accepté** : un
 * endpoint public qui enregistre des valeurs douteuses produit un tableau de
 * bord faux, donc inutile — pire, il peut être rempli par n'importe qui.
 */

describe('resolveRating', () => {
    it('applique les seuils publics des Core Web Vitals', () => {
        expect(resolveRating('LCP', 2400)).toBe('good');
        expect(resolveRating('LCP', 2500)).toBe('good');
        expect(resolveRating('LCP', 3000)).toBe('needs-improvement');
        expect(resolveRating('LCP', 4200)).toBe('poor');

        expect(resolveRating('CLS', 0.09)).toBe('good');
        expect(resolveRating('CLS', 0.2)).toBe('needs-improvement');
        expect(resolveRating('CLS', 0.4)).toBe('poor');

        expect(resolveRating('INP', 150)).toBe('good');
        expect(resolveRating('INP', 300)).toBe('needs-improvement');
        expect(resolveRating('INP', 800)).toBe('poor');
    });
});

describe('shouldSample', () => {
    it('échantillonne selon le taux, jamais au hasard du hasard', () => {
        expect(shouldSample(0.01, 0.05)).toBe(true);
        expect(shouldSample(0.5, 0.05)).toBe(false);
        expect(shouldSample(0, 1)).toBe(true);
    });

    it('refuse un taux nul ou absurde et une valeur non exploitable', () => {
        expect(shouldSample(0.01, 0)).toBe(false);
        expect(shouldSample(0.01, Number.NaN)).toBe(false);
        expect(shouldSample(Number.NaN, 0.05)).toBe(false);
        expect(shouldSample(-1, 0.05)).toBe(false);
    });
});

describe('sanitizePath', () => {
    it('retire requête et fragment', () => {
        expect(sanitizePath('/fr/formation-de-cascadeur?utm=1#haut')).toBe(
            '/fr/formation-de-cascadeur'
        );
    });

    it('normalise et borne les chemins inattendus', () => {
        expect(sanitizePath('fr/contact-cuc')).toBe('/fr/contact-cuc');
        expect(sanitizePath('')).toBe('/');
        expect(sanitizePath(undefined)).toBe('/');
        expect(sanitizePath(42)).toBe('/');
        expect(sanitizePath(`/${'a'.repeat(400)}`)).toHaveLength(120);
    });
});

describe('resolveLocale', () => {
    it('ne retient que deux valeurs', () => {
        expect(resolveLocale('/en/partenaires')).toBe('en');
        expect(resolveLocale('/fr')).toBe('fr');
        expect(resolveLocale('/contact-cuc')).toBe('fr');
    });
});

describe('normalizeVitalsSample', () => {
    it('accepte une mesure plausible et recalcule la note', () => {
        const sample = normalizeVitalsSample({
            path: '/fr/formation-de-cascadeur',
            metric: 'LCP',
            value: 1800,
            rating: 'poor', // le client annonce n'importe quoi
        });

        expect(sample).toEqual({
            path: '/fr/formation-de-cascadeur',
            metric: 'LCP',
            value: 1800,
            rating: 'good',
            locale: 'fr',
        });
    });

    it('rejette les mesures douteuses plutôt que de les corriger', () => {
        expect(normalizeVitalsSample(null)).toBeNull();
        expect(normalizeVitalsSample('LCP')).toBeNull();
        expect(normalizeVitalsSample({ metric: 'FID', value: 10 })).toBeNull();
        expect(normalizeVitalsSample({ metric: 'LCP', value: '1800' })).toBeNull();
        expect(normalizeVitalsSample({ metric: 'LCP', value: Number.NaN })).toBeNull();
        expect(normalizeVitalsSample({ metric: 'LCP', value: -5 })).toBeNull();
        expect(normalizeVitalsSample({ metric: 'LCP', value: 600_001 })).toBeNull();
    });
});

describe('normalizeVitalsBatch', () => {
    const valid = { path: '/fr', metric: 'CLS', value: 0.05 };

    it('accepte une charge utile bornée et entièrement valide', () => {
        const batch = normalizeVitalsBatch([valid, { ...valid, metric: 'TTFB', value: 300 }]);

        expect(batch).toHaveLength(2);
        expect(batch?.[1]).toMatchObject({ metric: 'TTFB', rating: 'good' });
    });

    it('refuse un lot vide, trop grand, ou contenant une entrée douteuse', () => {
        expect(normalizeVitalsBatch([])).toBeNull();
        expect(normalizeVitalsBatch('nope')).toBeNull();
        expect(
            normalizeVitalsBatch(Array.from({ length: MAX_SAMPLES_PER_REQUEST + 1 }, () => valid))
        ).toBeNull();
        expect(normalizeVitalsBatch([valid, { metric: 'LCP', value: 'x' }])).toBeNull();
    });
});
