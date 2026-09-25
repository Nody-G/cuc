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
        case 'roleAssistantCoordination':
            return 'Assistant coordination';
        case 'roleRiggingCoordination':
            return 'Coordination rigging';
        case 'roleRigger':
            return 'Rigger';
        case 'roleMechanicalStunt':
            return 'Cascade mécanique';
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
        case 'roleAssistantCoordination':
            return 'Assistant coordination';
        case 'roleRiggingCoordination':
            return 'Rigging coordination';
        case 'roleRigger':
            return 'Stunt rigger';
        case 'roleMechanicalStunt':
            return 'Mechanical stunt';
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
            d: 'Assistant coordinateur des cascades',
            e: 'Coordinateur de rigging',
            f: 'Rigger',
            g: 'Cascadeur mécanique',
        });

        expect(summary.roles).toEqual([
            'Coordinateur des cascades',
            'Assistant coordinateur des cascades',
            'Coordinateur de rigging',
            'Rigger',
            'Cascadeur mécanique',
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
    it('associe action director, action designer, fight arranger et fight choreographer à Coordinateur des cascades', () => {
        expect(normalizeRole('action director').roles).toEqual(['Coordinateur des cascades']);
        expect(normalizeRole('Action Designer').roles).toEqual(['Coordinateur des cascades']);
        expect(normalizeRole('fight arranger').roles).toEqual(['Coordinateur des cascades']);
        expect(normalizeRole('fight choreographer').roles).toEqual(['Coordinateur des cascades']);
        expect(normalizeRole('Coordinateur des cascades & Action Designer').roles).toEqual([
            'Coordinateur des cascades',
        ]);
    });

    it('associe assistant fight choreographer et assistant stunt coordinator à Assistant coordinateur des cascades', () => {
        expect(normalizeRole('assistant stunt coordinator').roles).toEqual([
            'Assistant coordinateur des cascades',
        ]);
        expect(normalizeRole('assistant fight choreographer').roles).toEqual([
            'Assistant coordinateur des cascades',
        ]);
        expect(normalizeRole('Assistant régleur').roles).toEqual([
            'Assistant coordinateur des cascades',
        ]);
    });

    it('associe human torch et fire stunt à Cascadeur', () => {
        expect(normalizeRole('human torch').roles).toEqual(['Cascadeur']);
        expect(normalizeRole('fire stunt').roles).toEqual(['Cascadeur']);
    });

    it('gère les catégories Coordinateur de rigging, Rigger et Cascadeur mécanique', () => {
        expect(normalizeRole('stunt rigging coordinator').roles).toEqual([
            'Coordinateur de rigging',
        ]);
        expect(normalizeRole('Coordinateur de rigging').roles).toEqual([
            'Coordinateur de rigging',
        ]);
        expect(normalizeRole('stunt rigger').roles).toEqual(['Rigger']);
        expect(normalizeRole('stunt driver').roles).toEqual(['Cascadeur mécanique']);
        expect(normalizeRole('precision driver').roles).toEqual(['Cascadeur mécanique']);
    });

    it('reconnaît « Doublure » capitalisé — forme canonique en base', () => {
        expect(normalizeRole('Doublure Keanu Reeves').doubledActors).toEqual(['Keanu Reeves']);
        expect(normalizeRole('Doublure de Tomer Sisley').doubledActors).toEqual(['Tomer Sisley']);
        // « Doublure combats » ne nomme personne : aucun comédien inventé.
        expect(normalizeRole('Doublure combats').doubledActors).toEqual([]);
    });
});
