import { describe, it, expect } from 'vitest';
import {
    resolveFilmDoublings,
    enrichTeamRoleWithDoubling,
} from './film-doublings-domain';
import type { FilmCredit, Instructor } from '@/types';

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

const mockTeam: Instructor[] = [
    mockCoach('bastien-trouve', 'Bastien Trouvé', 'Cascadeur Professionnel'),
    mockCoach('jerome-gaspard', 'Jérôme Gaspard', 'Coordinateur des cascades'),
];

describe('film-doublings-domain', () => {
    it('résout correctement un format explicite "(doublé par [Cascadeur])"', () => {
        const film = mockFilm({
            id: 'test-film',
            title: 'Test Film',
            doubledActors: ['François Civil (doublé par Bastien Trouvé)'],
        });

        const res = resolveFilmDoublings(film, mockTeam);
        expect(res).toHaveLength(1);
        expect(res[0].actorName).toBe('François Civil');
        expect(res[0].stuntDoubleName).toBe('Bastien Trouvé');
        expect(res[0].note).toBeUndefined();
        expect(res[0].formatted).toBe('François Civil ➔ doublé par Bastien Trouvé');
    });

    it('résout un nom brut de comédien via DOUBLED_CELEBRITIES', () => {
        const film = mockFilm({
            id: 'bagarre',
            title: 'Bagarre',
            year: '2026',
            doubledActors: ['Nassim Lyes'],
            cuc_team_involved: ['bastien-trouve'],
        });

        const res = resolveFilmDoublings(film, mockTeam);
        expect(res).toHaveLength(1);
        expect(res[0].actorName).toBe('Nassim Lyes');
        expect(res[0].stuntDoubleName).toBe('Bastien Trouvé');
        expect(res[0].formatted).toBe('Nassim Lyes ➔ doublé par Bastien Trouvé');
    });

    it('gère correctement les notes sans doublure directe comme (Cascades Action)', () => {
        const film = mockFilm({
            id: 'lamour-ouf',
            title: "L'Amour ouf",
            year: '2024',
            doubledActors: [
                'François Civil (doublé par Bastien Trouvé)',
                'Adèle Exarchopoulos (Cascades Action)',
            ],
            highlight: true,
        });

        const res = resolveFilmDoublings(film, mockTeam);
        expect(res).toHaveLength(2);
        expect(res[0].actorName).toBe('François Civil');
        expect(res[0].stuntDoubleName).toBe('Bastien Trouvé');

        expect(res[1].actorName).toBe('Adèle Exarchopoulos');
        expect(res[1].note).toBe('Cascades Action');
        expect(res[1].formatted).toBe('Adèle Exarchopoulos (Cascades Action)');
    });

    it('enrichit les rôles génériques "Doublure" vers "Doublure de [Acteur]"', () => {
        const film = mockFilm({
            id: 'test',
            title: 'Test',
            doubledActors: ['Nassim Lyes (doublé par Bastien Trouvé)'],
        });

        const doublings = resolveFilmDoublings(film, mockTeam);
        const enriched = enrichTeamRoleWithDoubling('Doublure', 'bastien-trouve', doublings, mockTeam);
        expect(enriched).toBe('Doublure de Nassim Lyes');

        const nonDoubleRole = enrichTeamRoleWithDoubling('Cascadeur', 'bastien-trouve', doublings, mockTeam);
        expect(nonDoubleRole).toBe('Cascadeur');
    });

    it('résout une doublure présente dans cuc_team_roles même si absente de doubledActors', () => {
        const film = mockFilm({
            id: 'test-roles',
            title: 'Test Roles',
            doubledActors: [],
            cuc_team_roles: {
                'jerome-gaspard': 'Doublure de Vincent Cassel',
            },
        });

        const res = resolveFilmDoublings(film, mockTeam);
        expect(res).toHaveLength(1);
        expect(res[0].actorName).toBe('Vincent Cassel');
        expect(res[0].stuntDoubleName).toBe('Jérôme Gaspard');
        expect(res[0].formatted).toBe('Vincent Cassel ➔ doublé par Jérôme Gaspard');
    });
});
