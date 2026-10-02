import { CANONICAL_ROLE_ORDER } from '@/lib/credit-role';
import {
    ROLE_OPTION_GROUPS,
    filterRoleGroups,
    filterRoleOptions,
    isRecognizedRole,
} from '@/lib/credit-role-options';

/**
 * Options du combobox de rôle : filtrage, regroupement (dérivé de
 * `CANONICAL_ROLE_ORDER`) et détection du repli silencieux de `normalizeRole`.
 *
 * Aucun import de `vitest` : `globals: true` est activé (`vitest.config.mts`).
 */

describe('ROLE_OPTION_GROUPS', () => {
    it('couvre exactement les rôles canoniques, sans doublon ni omission', () => {
        const flat = ROLE_OPTION_GROUPS.flatMap((group) => group.roles);
        expect(flat).toHaveLength(CANONICAL_ROLE_ORDER.length);
        expect(new Set(flat).size).toBe(CANONICAL_ROLE_ORDER.length);
        expect([...flat].sort()).toEqual([...CANONICAL_ROLE_ORDER].sort());
    });

    it('répartit les rôles par groupe dans l’ordre canonique', () => {
        expect(ROLE_OPTION_GROUPS.map((group) => group.label)).toEqual([
            'Coordination',
            'Rigging',
            'Cascade & doublure',
        ]);
        const coordination = ROLE_OPTION_GROUPS.find((g) => g.label === 'Coordination');
        expect(coordination?.roles).toEqual([
            'Coordinateur des cascades',
            'Assistant coordinateur des cascades',
        ]);
    });
});

describe('filterRoleOptions', () => {
    it('renvoie tous les rôles dans l’ordre canonique pour une requête vide', () => {
        expect(filterRoleOptions('')).toEqual(CANONICAL_ROLE_ORDER);
        expect(filterRoleOptions('   ')).toEqual(CANONICAL_ROLE_ORDER);
    });

    it('filtre sur une sous-chaîne, accents et casse ignorés', () => {
        expect(filterRoleOptions('rigg')).toEqual(['Coordinateur de rigging', 'Rigger']);
        expect(filterRoleOptions('MECANIQUE')).toEqual(['Cascadeur mécanique']);
        expect(filterRoleOptions('doublure')).toEqual(['Doublure']);
    });

    it('renvoie une liste vide quand rien ne correspond', () => {
        expect(filterRoleOptions('zzzz')).toEqual([]);
    });
});

describe('filterRoleGroups', () => {
    it('retire les groupes devenus vides', () => {
        const groups = filterRoleGroups('rigg');
        expect(groups.map((group) => group.label)).toEqual(['Rigging']);
        expect(groups[0].roles).toEqual(['Coordinateur de rigging', 'Rigger']);
    });

    it('conserve le regroupement complet pour une requête vide', () => {
        expect(filterRoleGroups('')).toEqual(ROLE_OPTION_GROUPS);
    });
});

describe('isRecognizedRole', () => {
    it('reconnaît les rôles canoniques et les libellés libres composés', () => {
        expect(isRecognizedRole('Coordinateur des cascades')).toBe(true);
        expect(isRecognizedRole('Rigger')).toBe(true);
        expect(isRecognizedRole('Doublure de Tom Cruise')).toBe(true);
        expect(isRecognizedRole('Cascadeur')).toBe(true);
        expect(isRecognizedRole('Human Torch')).toBe(true);
    });

    it('détecte le repli silencieux de normalizeRole sur un libellé inconnu', () => {
        expect(isRecognizedRole('blabla')).toBe(false);
        expect(isRecognizedRole('Rôle maison')).toBe(false);
    });

    it('ne reconnaît jamais une chaîne vide', () => {
        expect(isRecognizedRole('')).toBe(false);
        expect(isRecognizedRole('   ')).toBe(false);
    });
});
