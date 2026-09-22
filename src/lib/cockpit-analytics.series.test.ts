/**
 * Tests du moteur analytique — conversion des séries en tracé SVG.
 */

import { seriesToPolyline } from './cockpit-analytics';

describe('seriesToPolyline', () => {
    it('retourne une chaîne vide pour une série vide', () => {
        expect(seriesToPolyline([])).toBe('');
    });

    it('produit un point par valeur', () => {
        const polyline = seriesToPolyline([
            { label: 'a', value: 0 },
            { label: 'b', value: 5 },
            { label: 'c', value: 10 },
        ]);
        expect(polyline.split(' ')).toHaveLength(3);
    });

    it('place la valeur maximale en haut du viewBox (y = 0)', () => {
        const polyline = seriesToPolyline([
            { label: 'a', value: 0 },
            { label: 'b', value: 10 },
        ]);
        const [, secondPoint] = polyline.split(' ');
        const y = Number(secondPoint.split(',')[1]);
        expect(y).toBe(0);
    });

    it('ne divise jamais par zéro sur une série plate', () => {
        const polyline = seriesToPolyline([
            { label: 'a', value: 0 },
            { label: 'b', value: 0 },
        ]);
        expect(polyline).not.toContain('NaN');
        expect(polyline).not.toContain('Infinity');
    });
});
