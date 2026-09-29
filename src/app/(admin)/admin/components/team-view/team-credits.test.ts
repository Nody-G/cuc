/**
 * Tests du domaine « crédits de formateur » (TeamView).
 *
 * Aucun import de `vitest` : `globals: true` est activé dans la configuration
 * du dépôt. On verrouille ici le mapping des libellés courts, dont l'absence de
 * table dédiée produisait l'affichage « casc. casc. casc. » dans le Cockpit.
 */

import {
    ROLE_OPTIONS,
    ROLE_SHORT_LABELS,
    roleShortLabel,
} from './team-credits';

describe('ROLE_SHORT_LABELS', () => {
    it('couvre exactement les rôles canoniques proposés', () => {
        expect(Object.keys(ROLE_SHORT_LABELS).sort()).toEqual([...ROLE_OPTIONS].sort());
    });

    it('donne un libellé distinct à chaque rôle (fin du « casc. » généralisé)', () => {
        const labels = ROLE_OPTIONS.map((role) => ROLE_SHORT_LABELS[role]);
        expect(new Set(labels).size).toBe(labels.length);
    });

    it('reprend le mapping validé par l’utilisateur', () => {
        expect(ROLE_SHORT_LABELS).toEqual({
            'Cascadeur': 'Casc.',
            'Doublure': 'Doubl.',
            'Coordinateur des cascades': 'Coord.',
            'Assistant coordinateur des cascades': 'Assist.',
            'Coordinateur de rigging': 'Coord. rig.',
            'Rigger': 'Rigg.',
            'Cascadeur mécanique': 'Méca.',
        });
    });
});

describe('roleShortLabel', () => {
    it('renvoie le libellé court connu', () => {
        expect(roleShortLabel('Assistant coordinateur des cascades')).toBe('Assist.');
    });

    it('retombe sur le libellé complet si le rôle est inconnu', () => {
        expect(roleShortLabel('Rôle exotique')).toBe('Rôle exotique');
    });
});
