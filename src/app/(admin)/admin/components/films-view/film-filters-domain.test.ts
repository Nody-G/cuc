/**
 * Aucun import de `vitest` : `globals: true` est activé (`vitest.config.mts`).
 * L'import explicite résolvait une seconde instance du paquet, sans
 * configuration — la suite échouait au chargement, avant tout test.
 */
import type { FilmCredit, Instructor } from '@/types';
import {
    isLucasCoordinated,
    isAnyCucCoordinated,
    isLucasInvolved,
    isCoachInvolved,
    resolveCoordinators,
    resolveFilmTeamRoles,
    LUCAS_DOLLFUS_ID,
} from './film-filters-domain';

const mockFilm = (overrides: Partial<FilmCredit> = {}): FilmCredit => ({
    id: 'film-1',
    title: 'Test Film',
    year: '2024',
    category: 'Film',
    stuntRoles: 'Cascades',
    highlight: false,
    image: '',
    tag: '',
    imdbUrl: '',
    allocineUrl: '',
    trailerUrl: '',
    ...overrides,
});

const mockCoach = (id: string, name: string, title = 'Formateur'): Instructor => ({
    id,
    name,
    role: 'Coach',
    title,
    bio: '',
    avatarUrl: '',
    specialties: [],
    notableCredits: [],
    discipline_ids: [],
});

describe('film-filters-domain', () => {
    it('identifie un film coordonné par Lucas Dollfus via cuc_team_roles', () => {
        const film = mockFilm({
            cuc_team_roles: { [LUCAS_DOLLFUS_ID]: 'Coordinateur des cascades' },
        });
        expect(isLucasCoordinated(film)).toBe(true);
        expect(isAnyCucCoordinated(film)).toBe(true);
        expect(isLucasInvolved(film)).toBe(true);
    });

    it('identifie un film réalisé par Lucas Dollfus', () => {
        const film = mockFilm({
            director: 'Lucas Dollfus',
        });
        expect(isLucasCoordinated(film)).toBe(true);
    });

    it('identifie un film où Lucas est uniquement cascadeur (non coordonnateur)', () => {
        const film = mockFilm({
            cuc_team_involved: [LUCAS_DOLLFUS_ID],
            cuc_team_roles: { [LUCAS_DOLLFUS_ID]: 'Cascadeur' },
        });
        expect(isLucasCoordinated(film)).toBe(false);
        expect(isLucasInvolved(film)).toBe(true);
    });

    it('identifie la coordination par un autre membre CUC', () => {
        const film = mockFilm({
            cuc_team_roles: { 'vincent-bouillon': 'Coordinateur des cascades' },
        });
        expect(isLucasCoordinated(film)).toBe(false);
        expect(isAnyCucCoordinated(film)).toBe(true);
    });

    it('filtre la participation par coach spécifique', () => {
        const film = mockFilm({
            cuc_team_involved: ['franck-blanc'],
        });
        expect(isCoachInvolved(film, 'franck-blanc')).toBe(true);
        expect(isCoachInvolved(film, 'david-nop')).toBe(false);
    });

    it('résout les coordinateurs avec leurs noms', () => {
        const team = [
            mockCoach('lucas-dollfus', 'Lucas Dollfus', 'Fondateur & Coordinateur'),
            mockCoach('vincent-bouillon', 'Vincent Bouillon', 'Coordinateur'),
        ];
        const film = mockFilm({
            cuc_team_roles: {
                'lucas-dollfus': 'Coordinateur des cascades',
                'vincent-bouillon': 'Coordinateur des cascades',
            },
        });
        const coords = resolveCoordinators(film, team);
        expect(coords).toContain('Lucas Dollfus');
        expect(coords).toContain('Vincent Bouillon');
    });

    it('résout la liste précise des rôles de chaque intervenant', () => {
        const team = [
            mockCoach('lucas-dollfus', 'Lucas Dollfus'),
            mockCoach('alan-cueff', 'Alan Cueff'),
        ];
        const film = mockFilm({
            cuc_team_involved: ['lucas-dollfus', 'alan-cueff'],
            cuc_team_roles: {
                'lucas-dollfus': 'Coordinateur des cascades',
                'alan-cueff': 'Doublure de Tomer Sisley',
            },
        });
        const roles = resolveFilmTeamRoles(film, team);
        expect(roles[0].coachName).toBe('Lucas Dollfus');
        expect(roles[0].isCoordinator).toBe(true);
        expect(roles[1].coachName).toBe('Alan Cueff');
        expect(roles[1].isDouble).toBe(true);
    });
});
