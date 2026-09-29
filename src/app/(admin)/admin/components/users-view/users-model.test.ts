/**
 * Tests de la logique pure de la vue « Comptes & Accès ».
 *
 * Aucun import de `vitest` : `globals: true` est activé dans
 * `vitest.config.mts` (convention du dépôt, cf. `vitest.setup.mts`).
 */

import {
    COCKPIT_ROLES,
    evaluateAccountRemoval,
    evaluateRoleChange,
    isCockpitRole,
    isUserManagerRole,
    normalizeCockpitEmail,
    roleDescriptor,
    ROLE_CATALOG,
} from './users-model';

describe('normalizeCockpitEmail', () => {
    it('complète un identifiant nu en @cuc.fr', () => {
        expect(normalizeCockpitEmail('lucas')).toBe('lucas@cuc.fr');
    });

    it('nettoie espaces et majuscules', () => {
        expect(normalizeCockpitEmail('  Lucas.Dollfus@CUC.fr ')).toBe('lucas.dollfus@cuc.fr');
    });

    it('conserve une adresse déjà qualifiée', () => {
        expect(normalizeCockpitEmail('contact@example.org')).toBe('contact@example.org');
    });

    it('renvoie une chaîne vide sur entrée vide', () => {
        expect(normalizeCockpitEmail('   ')).toBe('');
    });
});

describe('catalogue de rôles', () => {
    it('couvre exactement les rôles Cockpit', () => {
        expect(ROLE_CATALOG.map((descriptor) => descriptor.value).sort()).toEqual(
            [...COCKPIT_ROLES].sort(),
        );
    });

    it('ne contient aucun doublon', () => {
        const values = ROLE_CATALOG.map((descriptor) => descriptor.value);
        expect(new Set(values).size).toBe(values.length);
    });

    it('reconnaît les rôles valides', () => {
        expect(isCockpitRole('coach')).toBe(true);
        expect(isCockpitRole('root')).toBe(false);
    });

    it('réserve la gestion des comptes à la Direction', () => {
        expect(isUserManagerRole('admin')).toBe(true);
        expect(isUserManagerRole('directeur')).toBe(true);
        expect(isUserManagerRole('secretaire')).toBe(false);
        expect(isUserManagerRole(null)).toBe(false);
    });

    it('retombe proprement sur un rôle inconnu', () => {
        expect(roleDescriptor('inconnu').label).toBe('inconnu');
    });
});

describe('evaluateRoleChange', () => {
    it('autorise un no-op', () => {
        const decision = evaluateRoleChange({
            actorId: 'a',
            targetId: 'b',
            targetRole: 'coach',
            nextRole: 'coach',
            managerCount: 2,
        });
        expect(decision.allowed).toBe(true);
    });

    it('interdit l’auto-rétrogradation', () => {
        const decision = evaluateRoleChange({
            actorId: 'a',
            targetId: 'a',
            targetRole: 'admin',
            nextRole: 'coach',
            managerCount: 3,
        });
        expect(decision.allowed).toBe(false);
    });

    it('interdit de retirer le dernier compte de direction', () => {
        const decision = evaluateRoleChange({
            actorId: 'a',
            targetId: 'b',
            targetRole: 'directeur',
            nextRole: 'secretaire',
            managerCount: 1,
        });
        expect(decision.allowed).toBe(false);
    });

    it('autorise la rétrogradation quand un autre dirigeant subsiste', () => {
        const decision = evaluateRoleChange({
            actorId: 'a',
            targetId: 'b',
            targetRole: 'directeur',
            nextRole: 'secretaire',
            managerCount: 2,
        });
        expect(decision.allowed).toBe(true);
    });

    it('autorise la promotion d’un rôle non dirigeant', () => {
        const decision = evaluateRoleChange({
            actorId: 'a',
            targetId: 'b',
            targetRole: 'coach',
            nextRole: 'directeur',
            managerCount: 1,
        });
        expect(decision.allowed).toBe(true);
    });
});

describe('evaluateAccountRemoval', () => {
    it('interdit de s’auto-supprimer', () => {
        const decision = evaluateAccountRemoval({
            actorId: 'a',
            targetId: 'a',
            targetRole: 'coach',
            remainingManagerCount: 5,
        });
        expect(decision.allowed).toBe(false);
    });

    it('interdit de supprimer le dernier dirigeant', () => {
        const decision = evaluateAccountRemoval({
            actorId: 'a',
            targetId: 'b',
            targetRole: 'directeur',
            remainingManagerCount: 0,
        });
        expect(decision.allowed).toBe(false);
    });

    it('autorise la suppression d’un non-dirigeant', () => {
        const decision = evaluateAccountRemoval({
            actorId: 'a',
            targetId: 'b',
            targetRole: 'coach',
            remainingManagerCount: 2,
        });
        expect(decision.allowed).toBe(true);
    });
});
