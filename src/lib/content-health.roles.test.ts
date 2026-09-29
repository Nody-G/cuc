import { analyzeContentHealth } from './content-health';
import {
    baseInput,
    makeCelebrity,
    makeFilm,
    makeMember,
} from './content-health.fixtures';
import { NON_ACTOR_DOUBLED_ENTRIES } from './celebrity-match';

/**
 * Tests de la famille `incomplete-roles` : rôles CUC et doublures restés à
 * préciser. Ces anomalies listent du travail de rédaction — elles ne doivent
 * donc JAMAIS peser sur le score de santé ni être confondues avec une panne.
 *
 * Aucun import de `vitest` : `globals: true` est activé dans la configuration
 * du dépôt (cf. `src/lib/content-health.seo.test.ts`).
 */
const ofKind = (report: ReturnType<typeof analyzeContentHealth>) =>
    report.issues.filter((issue) => issue.kind === 'incomplete-roles');

describe('analyzeContentHealth — rôles et doublures à compléter', () => {
    it('signale un coach cité par un film sans rôle renseigné', () => {
        const report = analyzeContentHealth(
            baseInput({
                films: [
                    makeFilm({
                        id: 'nicky-larson',
                        title: 'Nicky Larson',
                        cuc_team_involved: ['kefi-abrikh'],
                        cuc_team_roles: {},
                    }),
                ],
                team: [makeMember({ id: 'kefi-abrikh', name: 'Kefi Abrikh' })],
            })
        );

        const issues = ofKind(report);
        expect(issues).toHaveLength(1);
        expect(issues[0].severity).toBe('warning');
        expect(issues[0].message).toContain('Rôle inconnu pour Kefi Abrikh');
        expect(issues[0].hint).toContain('Renseignez le rôle CUC');
    });

    it('signale une doublure non nommée et nomme le film', () => {
        const report = analyzeContentHealth(
            baseInput({
                films: [
                    makeFilm({
                        id: 'ad-vitam',
                        title: 'Ad Vitam',
                        cuc_team_involved: ['vincent-bouillon'],
                        cuc_team_roles: { 'vincent-bouillon': 'Doublure' },
                    }),
                ],
                team: [
                    makeMember({
                        id: 'vincent-bouillon',
                        name: 'Vincent Bouillon',
                        doubledActors: ['Tomer Sisley'],
                    }),
                ],
                celebrities: [makeCelebrity({ id: 'tomer-sisley', name: 'Tomer Sisley' })],
            })
        );

        const issues = ofKind(report);
        expect(issues).toHaveLength(1);
        expect(issues[0].severity).toBe('info');
        expect(issues[0].message).toContain('Doublure non nommée pour Vincent Bouillon');
        expect(issues[0].message).toContain('Ad Vitam');
    });

    it('ne signale pas « Doublure combats » (spécialité, pas comédien manquant)', () => {
        const report = analyzeContentHealth(
            baseInput({
                films: [
                    makeFilm({
                        id: 'film-combats',
                        title: 'Film combats',
                        cuc_team_involved: ['coach-test'],
                        cuc_team_roles: { 'coach-test': 'Doublure combats' },
                    }),
                ],
                team: [makeMember({ id: 'coach-test', doubledActors: ['Elie Haddad'] })],
                celebrities: [makeCelebrity({ id: 'elie-haddad', name: 'Elie Haddad' })],
            })
        );

        expect(ofKind(report)).toHaveLength(0);
    });

    it('signale un identifiant de coach inconnu, côté rôle comme côté intervenant', () => {
        const report = analyzeContentHealth(
            baseInput({
                films: [
                    makeFilm({
                        id: 'film-orphelin',
                        title: 'Film orphelin',
                        cuc_team_involved: ['coach-fantome'],
                        cuc_team_roles: { 'autre-fantome': 'Cascadeur' },
                    }),
                ],
                team: [makeMember({ id: 'coach-test' })],
            })
        );

        const issues = ofKind(report);
        expect(issues).toHaveLength(2);
        expect(issues.every((issue) => issue.severity === 'error')).toBe(true);
        expect(issues.map((issue) => issue.value)).toEqual(
            expect.arrayContaining([
                'film-orphelin:coach-fantome:intervenant-inconnu',
                'film-orphelin:autre-fantome:role-inconnu',
            ])
        );
    });

    it('signale une incohérence coach : doublures déclarées sans crédit film', () => {
        const report = analyzeContentHealth(
            baseInput({
                // Le comédien a bien sa fiche : seule l'incohérence de crédits reste.
                team: [
                    makeMember({
                        id: 'teddy-ponceau',
                        name: 'Teddy Ponceau',
                        doubledActors: ['Tomer Sisley'],
                    }),
                ],
                celebrities: [makeCelebrity({ id: 'tomer-sisley', name: 'Tomer Sisley' })],
            })
        );

        const issues = ofKind(report);
        expect(issues).toHaveLength(1);
        expect(issues[0].scope).toBe('Équipe');
        expect(issues[0].message).toContain('aucun crédit de doublure');
    });

    it('signale un comédien doublé sans fiche au catalogue', () => {
        const report = analyzeContentHealth(
            baseInput({
                films: [
                    makeFilm({
                        id: 'film-doublure',
                        title: 'Film doublure',
                        cuc_team_involved: ['coach-test'],
                        cuc_team_roles: { 'coach-test': 'Doublure de Tomer Sisley' },
                    }),
                ],
                team: [
                    makeMember({
                        id: 'coach-test',
                        name: 'Coach de test',
                        doubledActors: ['Tomer Sisley', 'Inconnu Absent'],
                    }),
                ],
                celebrities: [makeCelebrity({ id: 'tomer-sisley', name: 'Tomer Sisley' })],
            })
        );

        const sansFiche = ofKind(report).filter((issue) => issue.value?.endsWith('Inconnu Absent'));
        expect(sansFiche).toHaveLength(1);
        expect(sansFiche[0].message).toContain('sans fiche au catalogue');
    });

    it('ignore les entrées non-comédiens curées (personnages, rôles)', () => {
        const report = analyzeContentHealth(
            baseInput({
                team: [
                    makeMember({
                        id: 'coach-test',
                        doubledActors: [NON_ACTOR_DOUBLED_ENTRIES[0], NON_ACTOR_DOUBLED_ENTRIES[1]],
                    }),
                ],
            })
        );

        expect(ofKind(report)).toHaveLength(0);
    });

    it('ne pèse jamais sur le score de santé', () => {
        const report = analyzeContentHealth(
            baseInput({
                films: [
                    makeFilm({
                        id: 'film-a',
                        title: 'Film A',
                        cuc_team_involved: ['coach-test'],
                        cuc_team_roles: { 'coach-test': 'Doublure' },
                    }),
                ],
                team: [makeMember({ id: 'coach-test', doubledActors: ['Sans Fiche'] })],
            })
        );

        expect(ofKind(report).length).toBeGreaterThan(0);
        expect(report.severityCounts.info + report.severityCounts.warning).toBeGreaterThan(0);
        expect(report.score).toBe(100);
    });
});
