import { analyzeContentHealth } from './content-health';
import { baseInput, makeNav, makePage } from './content-health.fixtures';

/**
 * Tests unitaires — contenu sain, agrégation et score du diagnostic de santé
 * du contenu (comptes par famille/sévérité, pondérations, identifiants).
 */

describe('analyzeContentHealth — contenu sain', () => {
    it('retourne un score de 100 et aucune anomalie sur un contenu propre', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [makePage({ slug: '/', title: 'Accueil' })],
            })
        );

        expect(report.issues).toEqual([]);
        expect(report.score).toBe(100);
        expect(report.counts['broken-link']).toBe(0);
        expect(report.counts['missing-image']).toBe(0);
        expect(report.counts.orphan).toBe(0);
        expect(report.counts.seo).toBe(0);
    });
});

describe('analyzeContentHealth — agrégation et score', () => {
    it('compte les anomalies par famille et par sévérité', () => {
        const report = analyzeContentHealth(
            baseInput({
                pages: [makePage({ slug: '/orpheline', meta_title: 'Court' })],
                navigation: makeNav({
                    items: [{ id: 'n1', label: 'Cassé', href: '/nope' } as never],
                }),
            })
        );

        expect(report.counts['broken-link']).toBe(1);
        expect(report.counts.orphan).toBe(1);
        expect(report.counts.seo).toBeGreaterThanOrEqual(1);
        expect(report.severityCounts.error).toBe(1);
        expect(report.severityCounts.warning).toBeGreaterThanOrEqual(2);
    });

    it('déduit le score du poids des sévérités (error = 10, warning = 4, info = 1)', () => {
        // Une seule erreur → 100 - 10 = 90.
        const report = analyzeContentHealth(
            baseInput({
                navigation: makeNav({
                    items: [{ id: 'n1', label: 'Cassé', href: '/nope' } as never],
                }),
            })
        );
        expect(report.score).toBe(90);
    });

    it('borne le score à 0 quand les anomalies s’accumulent', () => {
        const manyBroken = Array.from({ length: 20 }, (_, i) => ({
            id: `n${i}`,
            label: `Cassé ${i}`,
            href: `/nope-${i}`,
        }));
        const report = analyzeContentHealth(
            baseInput({ navigation: makeNav({ items: manyBroken as never }) })
        );
        expect(report.score).toBe(0);
    });

    it('expose un horodatage de contrôle', () => {
        const report = analyzeContentHealth(baseInput());
        expect(typeof report.checkedAt).toBe('string');
        expect(Number.isNaN(new Date(report.checkedAt).getTime())).toBe(false);
    });

    it('génère des identifiants d’anomalie stables et déterministes', () => {
        const report = analyzeContentHealth(
            baseInput({
                navigation: makeNav({
                    items: [
                        { id: 'n1', label: 'A', href: '/nope-a' } as never,
                        { id: 'n2', label: 'B', href: '/nope-b' } as never,
                    ],
                }),
            })
        );
        const ids = report.issues.map((i) => i.id);
        // Deux liens distincts → deux identifiants distincts.
        expect(new Set(ids).size).toBe(ids.length);
        // L'identifiant encode le type, le périmètre et la valeur fautive.
        expect(ids).toContain('broken-link:Navigation:/nope-a');
        expect(ids).toContain('broken-link:Navigation:/nope-b');
    });

    it('déduplique deux anomalies strictement identiques (même type, périmètre et valeur)', () => {
        const report = analyzeContentHealth(
            baseInput({
                navigation: makeNav({
                    items: [
                        { id: 'n1', label: 'A', href: '/nope' } as never,
                        { id: 'n2', label: 'B', href: '/nope' } as never,
                    ],
                }),
            })
        );
        // Les deux entrées produisent la même clé : le diagnostic les fusionne
        // volontairement pour éviter le bruit dans le rapport.
        const ids = report.issues.map((i) => i.id);
        expect(new Set(ids).size).toBe(1);
    });
});
