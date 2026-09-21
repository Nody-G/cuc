/**
 * Tests de la synthèse des rôles CUC affichée sous les jaquettes.
 *
 * Contexte du défaut corrigé : les légendes étaient écrites à la main dans
 * `messages/*.json` (« Cascadeurs CUC (tournage Paris) », « Équipe cascades
 * CUC »). Elles sont désormais dérivées des rôles enregistrés en base, ramenées
 * aux trois rôles canoniques — le rendu textuel étant traduit par
 * `@/lib/i18n/role-labels`.
 *
 * Aucun import de `vitest` : `globals: true` est activé dans
 * `vitest.config.mts` (convention du dépôt, cf. `vitest.setup.mts`).
 */
import { normalizeRole, summarizeFilmRoleSet } from './credit-role';
import { renderRoleSet, type RoleTranslator } from './i18n/role-labels';

/** Traducteur factice : valeurs FR, indépendantes de next-intl. */
const FR: RoleTranslator = (key, values) => {
    switch (key) {
        case 'roleCoordination':
            return 'Coordination';
        case 'roleDouble':
            return 'Doublure';
        case 'roleDoubleOf':
            return `Doublure de ${values?.names ?? ''}`;
        default:
            return 'Cascade';
    }
};

/** Traducteur factice : valeurs EN, pour prouver que le rendu est traduisible. */
const EN: RoleTranslator = (key, values) => {
    switch (key) {
        case 'roleCoordination':
            return 'Coordination';
        case 'roleDouble':
            return 'Stunt double';
        case 'roleDoubleOf':
            return `Stunt double for ${values?.names ?? ''}`;
        default:
            return 'Stunt';
    }
};

describe('summarizeFilmRoleSet', () => {
    it('retient les rôles canoniques, ordonnés par priorité', () => {
        const summary = summarizeFilmRoleSet({
            a: 'Cascadeur',
            b: 'Coordinateur des cascades',
            c: 'Doublure',
        });

        expect(summary.roles).toEqual([
            'Coordinateur des cascades',
            'Doublure',
            'Cascadeur',
        ]);
    });

    it('collecte les comédiens doublés', () => {
        expect(summarizeFilmRoleSet({ a: 'Doublure Keanu Reeves' }).doubledActors).toEqual([
            'Keanu Reeves',
        ]);
    });

    it('ne laisse jamais passer une auto-référence au campus comme un rôle', () => {
        // Valeur héritée encore possible en base : elle est ramenée au rôle réel.
        expect(summarizeFilmRoleSet({ a: 'Cascadeurs CUC (tournage Paris)' }).roles).toEqual([
            'Cascadeur',
        ]);
        expect(summarizeFilmRoleSet({ a: 'Équipe cascades CUC' }).roles).toEqual(['Cascadeur']);
    });

    it('ne produit aucun rôle sans donnée enregistrée', () => {
        expect(summarizeFilmRoleSet(null).roles).toEqual([]);
        expect(summarizeFilmRoleSet({}).roles).toEqual([]);
    });
});

describe('renderRoleSet', () => {
    it('rend la légende en français', () => {
        const summary = summarizeFilmRoleSet({ a: 'Doublure Keanu Reeves', b: 'Cascadeur' });
        expect(renderRoleSet(summary, FR)).toBe('Doublure de Keanu Reeves · Cascade');
    });

    it('rend la même légende en anglais — plus de libellé français sur les pages EN', () => {
        const summary = summarizeFilmRoleSet({ a: 'Doublure Keanu Reeves', b: 'Cascadeur' });
        expect(renderRoleSet(summary, EN)).toBe('Stunt double for Keanu Reeves · Stunt');
    });

    it('rend une chaîne vide sans rôle', () => {
        expect(renderRoleSet(summarizeFilmRoleSet(null), EN)).toBe('');
    });
});

describe('normalizeRole', () => {
    it('ramène toute précision technique aux trois libellés autorisés', () => {
        expect(normalizeRole('Cascadeur & Câblage').roles).toEqual(['Cascadeur']);

        // « Coordinateur des cascades & Action Designer » cumule bien deux rôles
        // réels : coordination et intervention cascade sur le plateau.
        const coord = normalizeRole('Coordinateur des cascades & Action Designer');
        expect(coord.roles).toEqual(['Coordinateur des cascades', 'Cascadeur']);

        expect(normalizeRole('Cascadeur & Doublure Keanu Reeves').label).toBe(
            'Doublure de Keanu Reeves · Cascadeur'
        );
    });

    it('reconnaît « Doublure » capitalisé — forme canonique en base', () => {
        // Régression corrigée : le motif était sensible à la casse et ne
        // reconnaissait pas la forme capitalisée, donc jamais le comédien doublé.
        expect(normalizeRole('Doublure Keanu Reeves').doubledActors).toEqual(['Keanu Reeves']);
        expect(normalizeRole('Doublure de Tomer Sisley').doubledActors).toEqual(['Tomer Sisley']);
        // « Doublure combats » ne nomme personne : aucun comédien inventé.
        expect(normalizeRole('Doublure combats').doubledActors).toEqual([]);
    });
});
