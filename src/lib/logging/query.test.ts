/**
 * Tests de la normalisation des critères de lecture.
 *
 * Le cas de la virgule n'est pas théorique : PostgREST interprète `,` comme
 * séparateur de la clause `or=(…)`, donc une recherche « table, colonne » faisait
 * échouer la requête — et l'écran affichait une absence de données au lieu d'une
 * erreur.
 */
import {
    DEFAULT_LOG_LIMIT,
    MAX_LOG_LIMIT,
    clampLogLimit,
    clampLogOffset,
    hasActiveLogFilters,
    sanitizeSearchTerm,
} from './query';

describe('sanitizeSearchTerm', () => {
    it('remplace les caractères qui cassent la grammaire PostgREST', () => {
        expect(sanitizeSearchTerm('table, colonne (rls)')).toBe('table colonne rls');
    });

    it('ramène les espaces multiples à un seul', () => {
        expect(sanitizeSearchTerm('  page    save  ')).toBe('page save');
    });

    it('tronque une recherche démesurée', () => {
        expect(sanitizeSearchTerm('a'.repeat(200)).length).toBe(80);
    });

    it('laisse intacte une recherche ordinaire', () => {
        expect(sanitizeSearchTerm('db.rls_denied')).toBe('db.rls_denied');
    });
});

describe('clampLogLimit', () => {
    it('applique la valeur par défaut', () => {
        expect(clampLogLimit(undefined)).toBe(DEFAULT_LOG_LIMIT);
        expect(clampLogLimit(0)).toBe(DEFAULT_LOG_LIMIT);
    });

    it('plafonne une demande excessive', () => {
        expect(clampLogLimit(5000)).toBe(MAX_LOG_LIMIT);
    });

    it('arrondit une valeur fractionnaire', () => {
        expect(clampLogLimit(12.7)).toBe(12);
    });
});

describe('clampLogOffset', () => {
    it('refuse un décalage négatif', () => {
        expect(clampLogOffset(-10)).toBe(0);
        expect(clampLogOffset(undefined)).toBe(0);
    });

    it('conserve un décalage valide', () => {
        expect(clampLogOffset(120.9)).toBe(120);
    });
});

describe('hasActiveLogFilters', () => {
    it('reconnaît l’absence de filtre', () => {
        expect(hasActiveLogFilters({})).toBe(false);
        expect(hasActiveLogFilters({ search: '   ' })).toBe(false);
    });

    it('détecte chaque type de filtre', () => {
        expect(hasActiveLogFilters({ levels: ['error'] })).toBe(true);
        expect(hasActiveLogFilters({ sources: ['email'] })).toBe(true);
        expect(hasActiveLogFilters({ search: 'rls' })).toBe(true);
        expect(hasActiveLogFilters({ since: '2026-09-01T00:00:00.000Z' })).toBe(true);
        expect(hasActiveLogFilters({ target: 'home' })).toBe(true);
    });
});
