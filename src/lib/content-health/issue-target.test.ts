import type { ContentIssue } from './types';
import { isFilmScopedIssue, resolveIssueFilmId } from './issue-target';

/**
 * Résolution de la cible d'une anomalie de rôle : le bouton « Corriger » doit
 * ouvrir la fiche du film pour les anomalies « Filmographie », et retomber sur
 * l'onglet « Équipe » pour celles qui n'ont aucun film.
 *
 * Aucun import de `vitest` : `globals: true` est activé (`vitest.config.mts`).
 */

function makeIssue(partial: Pick<ContentIssue, 'scope' | 'value'>): ContentIssue {
    return {
        id: 'issue-test',
        kind: 'incomplete-roles',
        severity: 'warning',
        scope: partial.scope,
        label: 'Nicky Larson',
        message: 'Rôle à préciser.',
        value: partial.value,
    };
}

describe('isFilmScopedIssue / resolveIssueFilmId', () => {
    it('résout l’identifiant de film des 4 valeurs « Filmographie »', () => {
        const filmValues = [
            'nicky-larson:kefi-abrikh:intervenant-inconnu',
            'nicky-larson:kefi-abrikh:role-manquant',
            'nicky-larson:kefi-abrikh:role-inconnu',
            'ad-vitam:vincent-bouillon:doublure-sans-comedien',
        ];

        for (const value of filmValues) {
            const issue = makeIssue({ scope: 'Filmographie', value });
            expect(isFilmScopedIssue(issue)).toBe(true);
            expect(resolveIssueFilmId(issue)).toBe(value.split(':')[0]);
        }
    });

    it('ne parse que le premier segment (le coach et le motif sont ignorés)', () => {
        const issue = makeIssue({
            scope: 'Filmographie',
            value: 'nicky-larson:kefi-abrikh:role-manquant',
        });
        expect(resolveIssueFilmId(issue)).toBe('nicky-larson');
    });

    it('renvoie null pour les 2 valeurs « Équipe » (règles 4 et 5)', () => {
        const teamValues = [
            'kefi-abrikh:coherence-doublures',
            'kefi-abrikh:Tomer Sisley',
        ];

        for (const value of teamValues) {
            const issue = makeIssue({ scope: 'Équipe', value });
            expect(isFilmScopedIssue(issue)).toBe(false);
            expect(resolveIssueFilmId(issue)).toBeNull();
        }
    });

    it('renvoie null sans valeur ou avec un premier segment vide', () => {
        expect(resolveIssueFilmId(makeIssue({ scope: 'Filmographie', value: undefined }))).toBeNull();
        expect(resolveIssueFilmId(makeIssue({ scope: 'Filmographie', value: '   ' }))).toBeNull();
        expect(resolveIssueFilmId(makeIssue({ scope: 'Filmographie', value: ':kefi-abrikh:motif' }))).toBeNull();
    });

    it('résout selon le périmètre (scope), indépendamment de la famille', () => {
        const issue: ContentIssue = {
            ...makeIssue({ scope: 'Filmographie', value: 'nicky-larson:x:y' }),
            kind: 'seo',
        };
        // La résolution ne dépend que du périmètre : le premier segment est
        // toujours l'identifiant visé lorsque `scope === 'Filmographie'`.
        expect(resolveIssueFilmId(issue)).toBe('nicky-larson');
    });
});
