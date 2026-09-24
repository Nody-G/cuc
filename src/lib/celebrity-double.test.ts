/**
 * Tests du rapprochement « comédien doublé → membre du CUC ».
 *
 * Ce rapprochement alimente l'interconnexion du site : le nom du doubleur
 * devient un lien vers sa fiche coach. Un faux positif propagerait un lien
 * faux — ces cas verrouillent donc l'exactitude du nom, pas seulement sa
 * présence approximative.
 *
 * Aucun import de `vitest` : `globals: true` est activé dans la configuration
 * du dépôt (cf. `src/lib/credit-role.test.ts`).
 */
import { resolveDoubledBy, type TeamNameRef } from './celebrity-double';

const TEAM: TeamNameRef[] = [
    { id: 'vincent-bouillon', name: 'Vincent Bouillon' },
    { id: 'michel-bouis', name: 'Michel Bouis' },
    { id: 'lucas-dollfus', name: 'Lucas Dollfus' },
];

describe('resolveDoubledBy', () => {
    it('reconnaît le membre CUC et isole le préfixe (FR)', () => {
        const parts = resolveDoubledBy('Doublé par Vincent Bouillon', TEAM);

        expect(parts.member).toEqual({ id: 'vincent-bouillon', name: 'Vincent Bouillon' });
        expect(parts.prefix).toBe('Doublé par');
        expect(parts.name).toBe('Vincent Bouillon');
        expect(parts.suffix).toBe('');
    });

    it('reconnaît le membre CUC avec un préfixe anglais', () => {
        const parts = resolveDoubledBy('Doubled by Vincent Bouillon', TEAM);

        expect(parts.member?.id).toBe('vincent-bouillon');
        expect(parts.prefix).toBe('Doubled by');
    });

    it('conserve la ponctuation et la précision qui suivent le nom', () => {
        const parts = resolveDoubledBy('Doublé par Michel Bouis (armes)', TEAM);

        expect(parts.member?.id).toBe('michel-bouis');
        expect(parts.suffix).toBe(' (armes)');
    });

    it('préfère le nom complet le plus long en cas de noms proches', () => {
        const parts = resolveDoubledBy('Doublé par Michel Bouis', [
            { id: 'michel', name: 'Michel' },
            { id: 'michel-bouis', name: 'Michel Bouis' },
        ]);

        expect(parts.member?.id).toBe('michel-bouis');
    });

    it('ne fabrique aucun lien quand le nom est inconnu de l’équipe', () => {
        const parts = resolveDoubledBy('Doublé par un cascadeur extérieur', TEAM);

        expect(parts.member).toBeNull();
        expect(parts.name).toBe('Doublé par un cascadeur extérieur');
    });

    it('renvoie une structure vide pour un texte vide', () => {
        expect(resolveDoubledBy('', TEAM)).toEqual({ prefix: '', member: null, name: '', suffix: '' });
        expect(resolveDoubledBy('   ', TEAM)).toEqual({ prefix: '', member: null, name: '', suffix: '' });
    });

    it('tolère un référentiel d’équipe vide', () => {
        const parts = resolveDoubledBy('Doublé par Vincent Bouillon', []);

        expect(parts.member).toBeNull();
        expect(parts.name).toBe('Doublé par Vincent Bouillon');
    });
});
