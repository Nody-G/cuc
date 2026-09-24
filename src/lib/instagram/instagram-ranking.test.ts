import {
    findComparativeRank,
    neighbourAbove,
    neighbourBelow,
    rankAccountsByFollowers,
} from './instagram-ranking';

/**
 * Garde-fou du classement comparatif.
 *
 * Le défaut corrigé : un rang qui ne correspondait pas à l'ordre affiché, et un
 * rang de tête qui sautait (138 → 122) quand son nombre d'abonnés changeait de
 * palier. Ici, **le rang est la position** — il ne peut plus contredire la liste.
 */

const accounts = [
    { id: 'cuc', username: 'campus.univers.cascades', followersCount: 1_050_000 },
    { id: 'a', username: 'alpha', followersCount: 1_200_000 },
    { id: 'b', username: 'beta', followersCount: 980_000 },
    { id: 'c', username: 'gamma', followersCount: 980_000 },
];

describe('rankAccountsByFollowers', () => {
    it('numérote selon l’ordre réel des abonnés', () => {
        const ranked = rankAccountsByFollowers(accounts);

        expect(ranked.map((r) => r.username)).toEqual([
            'alpha',
            'campus.univers.cascades',
            'beta',
            'gamma',
        ]);
        expect(ranked.map((r) => r.comparativeRank)).toEqual([1, 2, 3, 4]);
    });

    it('départage les égalités de façon stable, jamais selon l’ordre d’entrée', () => {
        const reversed = rankAccountsByFollowers([...accounts].reverse());

        expect(reversed.map((r) => r.id)).toEqual(rankAccountsByFollowers(accounts).map((r) => r.id));
        expect(reversed.find((r) => r.id === 'b')?.comparativeRank).toBe(3);
        expect(reversed.find((r) => r.id === 'c')?.comparativeRank).toBe(4);
    });

    it('ne modifie pas le tableau reçu', () => {
        const original = [...accounts];
        rankAccountsByFollowers(accounts);

        expect(accounts).toEqual(original);
    });

    it('attribue un rang à un compte ajouté, sans toucher aux autres règles', () => {
        const withNewcomer = rankAccountsByFollowers([
            ...accounts,
            { id: 'new', username: 'nouveau', followersCount: 2_000_000 },
        ]);

        expect(withNewcomer[0].username).toBe('nouveau');
        expect(withNewcomer.find((r) => r.id === 'cuc')?.comparativeRank).toBe(3);
    });
});

describe('voisins et écarts', () => {
    const ranked = rankAccountsByFollowers(accounts);

    it('donne le voisin du dessus et l’écart réel', () => {
        const above = neighbourAbove(ranked, 'campus.univers.cascades');

        expect(above.account?.username).toBe('alpha');
        expect(above.delta).toBe(150_000);
    });

    it('donne le voisin du dessous et l’avance réelle', () => {
        const below = neighbourBelow(ranked, 'campus.univers.cascades');

        expect(below.account?.username).toBe('beta');
        expect(below.delta).toBe(70_000);
    });

    it('ne fabrique aucun voisin ni écart en bord de liste', () => {
        expect(neighbourAbove(ranked, 'alpha')).toEqual({ account: null, delta: 0 });
        expect(neighbourBelow(ranked, 'gamma')).toEqual({ account: null, delta: 0 });
        expect(neighbourAbove(ranked, 'inconnu')).toEqual({ account: null, delta: 0 });
    });

    it('ne trouve aucun rang pour un compte absent', () => {
        expect(findComparativeRank(ranked, 'campus.univers.cascades')).toBe(2);
        expect(findComparativeRank(ranked, 'inconnu')).toBeNull();
    });
});
