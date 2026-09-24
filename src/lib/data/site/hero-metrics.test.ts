import { readHeroMetricOverride, writeHeroMetricOverride } from './hero-metrics';

describe('readHeroMetricOverride', () => {
    it('retourne la surcharge présente', () => {
        const metrics = [{ val: 'IMMERSION', label: 'PÉDAGOGIE ACTIVE' }];
        expect(readHeroMetricOverride(metrics, 0)).toEqual({
            val: 'IMMERSION',
            label: 'PÉDAGOGIE ACTIVE',
        });
    });

    it('ne devine rien hors des bornes ni sur une entrée absente', () => {
        expect(readHeroMetricOverride(undefined, 0)).toBeUndefined();
        expect(readHeroMetricOverride([], 0)).toBeUndefined();
        expect(readHeroMetricOverride([{ val: 'A' }], 3)).toBeUndefined();
        expect(readHeroMetricOverride([{ val: 'A' }], -1)).toBeUndefined();
        expect(readHeroMetricOverride([{ val: 'A' }], 1.5)).toBeUndefined();
    });
});

describe('writeHeroMetricOverride', () => {
    it('écrit une clé sans toucher aux autres métriques', () => {
        const metrics = [{ val: 'A', label: 'a' }, { val: 'B', label: 'b' }];
        const next = writeHeroMetricOverride(metrics, 1, 'val', 'B2');

        expect(next[0]).toEqual({ val: 'A', label: 'a' });
        expect(next[1]).toEqual({ val: 'B2', label: 'b' });
        // Copie immuable : la source n'est pas mutée.
        expect(metrics[1]).toEqual({ val: 'B', label: 'b' });
        expect(next).not.toBe(metrics);
    });

    it('comble les positions absentes sans créer de trou de tableau', () => {
        const next = writeHeroMetricOverride([{ val: 'A' }], 2, 'label', 'TROISIÈME');

        expect(next).toHaveLength(3);
        expect(next.every((metric) => metric !== undefined)).toBe(true);
        expect(next[2]).toEqual({ label: 'TROISIÈME' });
        expect(next[0]).toEqual({ val: 'A' });
    });

    it('accepte une liste vide (première surcharge) et un index invalide', () => {
        expect(writeHeroMetricOverride(undefined, 0, 'val', 'X')).toEqual([{ val: 'X' }]);
        expect(writeHeroMetricOverride([{ val: 'A' }], -1, 'val', 'X')).toEqual([{ val: 'A' }]);
    });
});
