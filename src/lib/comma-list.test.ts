/**
 * Tests du domaine « listes séparées par des virgules ».
 *
 * Aucun import de `vitest` : `globals: true` est activé dans
 * `vitest.config.mts` (convention du dépôt).
 */

import { coerceStringList, formatCommaList, parseCommaList } from './comma-list';

describe('parseCommaList', () => {
    it('sépare, nettoie les espaces et supprime les entrées vides', () => {
        expect(parseCommaList('Airbag géant ,  Harnais ,, Nomex ')).toEqual([
            'Airbag géant',
            'Harnais',
            'Nomex',
        ]);
    });

    it('renvoie une liste vide sur une chaîne vide', () => {
        expect(parseCommaList('')).toEqual([]);
    });

    it('conserve le contenu interne d’une entrée', () => {
        expect(parseCommaList('Chute de hauteur (21 m)')).toEqual(['Chute de hauteur (21 m)']);
    });
});

describe('formatCommaList', () => {
    it('rend la forme canonique', () => {
        expect(formatCommaList(['Airbag géant', 'Harnais'])).toBe('Airbag géant, Harnais');
    });

    it('ignore les entrées vides et les espaces superflus', () => {
        expect(formatCommaList(['  Harnais ', '', '  ', 'Nomex'])).toBe('Harnais, Nomex');
    });

    it('tolère null et undefined', () => {
        expect(formatCommaList(null)).toBe('');
        expect(formatCommaList(undefined)).toBe('');
    });

    it('est idempotent (analyse → formatage → analyse)', () => {
        const first = formatCommaList(parseCommaList('a , b ,, c'));
        expect(parseCommaList(first)).toEqual(['a', 'b', 'c']);
    });
});

describe('coerceStringList', () => {
    it('accepte la forme tableau', () => {
        expect(coerceStringList(['a', ' b ', ''])).toEqual(['a', 'b']);
    });

    it('accepte la forme héritée en chaîne', () => {
        expect(coerceStringList('a, b')).toEqual(['a', 'b']);
    });

    it('ignore les types inattendus', () => {
        expect(coerceStringList(null)).toEqual([]);
        expect(coerceStringList(42)).toEqual([]);
        expect(coerceStringList([1, 'ok', null])).toEqual(['ok']);
    });
});
