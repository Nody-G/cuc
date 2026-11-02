import type { FilmCredit, Instructor } from '@/types';
import { parseCredit } from '@/types';
import {
    DEFAULT_COACH_FILM_SORT,
    buildFeaturedOrder,
    createCoachFilmRoleResolver,
    findRelatedFilms,
    selectCoachFilms,
    selectCoordinatedFilms,
    sortCoachFilms,
} from './coach-films';

/**
 * Garde-fou de la filmographie d'un coach.
 *
 * Le test central est l'invariant qui manquait : **les trois films affichés sous
 * une carte coach sont les trois premiers de sa fiche**. Auparavant la carte
 * filtrait sans tri, donc elle montrait une autre sélection — l'incohérence vue
 * par le visiteur.
 */

const film = (id: string, title: string, year: number, extra: Partial<FilmCredit> = {}) =>
    ({ id, title, year, ...extra }) as unknown as FilmCredit;

const coach = (extra: Partial<Instructor> = {}) =>
    ({ id: 'lucas', name: 'Lucas Dollfus', title: 'Coordinateur cascades', ...extra }) as unknown as Instructor;

const CATALOGUE: FilmCredit[] = [
    film('a', 'Braqueurs', 2015),
    film('b', 'Lupin', 2021),
    film('c', 'Balle perdue', 2020),
    film('d', 'Taxi 5', 2018),
    film('e', 'Le Transporteur', 2002),
];

describe('findRelatedFilms', () => {
    it('retient les liens explicites et l’appariement par titre, année ignorée', () => {
        const member = coach({
            film_ids: ['a'],
            notableCredits: ['Lupin (2021) — Cascadeur', 'Balle perdue — Doublure'],
        });

        const related = findRelatedFilms(CATALOGUE, member);

        expect(related.map((f) => f.id).sort()).toEqual(['a', 'b', 'c']);
    });

    it('retient aussi les films où l’équipe CUC est engagée', () => {
        const member = coach({ id: 'lucas' });
        const catalogue = [film('d', 'Taxi 5', 2018, { cuc_team_involved: ['lucas'] })];

        expect(findRelatedFilms(catalogue, member).map((f) => f.id)).toEqual(['d']);
    });

    it('sans coach, aucune filmographie', () => {
        expect(findRelatedFilms(CATALOGUE, undefined)).toEqual([]);
    });
});

describe('selectCoachFilms — sélecteur partagé carte / fiche', () => {
    const member = coach({
        film_ids: ['a', 'b', 'c', 'd', 'e'],
        featuredCredits: ['Balle perdue — Doublure', 'Taxi 5 — Cascadeur', 'Lupin — Cascadeur'],
    });

    it('place la mise en avant du Cockpit en tête, dans son ordre', () => {
        const sorted = selectCoachFilms(CATALOGUE, member);

        expect(sorted.slice(0, 3).map((f) => f.title)).toEqual([
            'Balle perdue',
            'Taxi 5',
            'Lupin',
        ]);
    });

    it('les 3 de la carte sont exactement les 3 premiers de la fiche', () => {
        const cardList = selectCoachFilms(CATALOGUE, member).slice(0, 3);
        const detailList = sortCoachFilms(
            findRelatedFilms(CATALOGUE, member),
            DEFAULT_COACH_FILM_SORT,
            buildFeaturedOrder(member)
        );

        expect(cardList.map((f) => f.id)).toEqual(detailList.slice(0, 3).map((f) => f.id));
    });

    it('trie le reste par année décroissante, puis laisse le tri du visiteur agir', () => {
        const withoutFeatured = coach({ film_ids: ['a', 'b', 'c'] });

        expect(selectCoachFilms(CATALOGUE, withoutFeatured).map((f) => f.title)).toEqual([
            'Lupin',
            'Balle perdue',
            'Braqueurs',
        ]);
        expect(selectCoachFilms(CATALOGUE, withoutFeatured, 'year-asc').map((f) => f.title)).toEqual(
            ['Braqueurs', 'Balle perdue', 'Lupin']
        );
    });

    it('ne modifie pas le catalogue reçu (copie avant tri)', () => {
        const initial = CATALOGUE.map((f) => f.id);
        selectCoachFilms(CATALOGUE, coach({ film_ids: ['a', 'b'] }), 'title-asc');

        expect(CATALOGUE.map((f) => f.id)).toEqual(initial);
    });
});

describe('selectCoordinatedFilms — vitrine « FILMS COORDONNÉS »', () => {
    const catalogue: FilmCredit[] = [
        film('a', 'Bagarre', 2024, {
            cuc_team_involved: ['lucas'],
            cuc_team_roles: { lucas: 'Coordinateur des cascades & Action Designer' },
        }),
        film('b', 'Nouveaux Riches', 2023, {
            cuc_team_involved: ['lucas'],
            cuc_team_roles: { lucas: 'Coordinateur des cascades' },
        }),
        film('c', 'John Wick : Chapitre 4', 2023, {
            cuc_team_involved: ['lucas'],
            cuc_team_roles: { lucas: 'Cascadeur' },
        }),
        film('d', 'Athena', 2022, { cuc_team_involved: ['jerome'] }),
    ];
    const lucas = coach({ id: 'lucas' });

    it('ne retient que les films coordonnés par le référent', () => {
        expect(selectCoordinatedFilms(catalogue, lucas).map((f) => f.id)).toEqual(['a', 'b']);
    });

    it('exclut un film où le référent n’est que cascadeur', () => {
        expect(selectCoordinatedFilms(catalogue, lucas).map((f) => f.id)).not.toContain('c');
    });

    it('sans référent, aucune vitrine', () => {
        expect(selectCoordinatedFilms(catalogue, undefined)).toEqual([]);
    });
});

describe('createCoachFilmRoleResolver — unification des doublures en Cascadeur', () => {
    const tt = (key: string) => {
        if (key === 'roleCoordination') return 'Coordinateur des cascades';
        if (key === 'roleRigger') return 'Rigger';
        if (key === 'roleMechanicalStunt') return 'Cascadeur mécanique';
        if (key === 'roleAssistantCoordination') return 'Assistant coordinateur des cascades';
        return 'Cascadeur';
    };

    it('unifie un rôle « Doublure » ou « Doublure de X » sous « Cascadeur » et active isCascadeur', () => {
        const vincent = coach({
            id: 'vincent-bouillon',
            title: 'Cascadeur Professionnel',
            notableCredits: ['John Wick : Chapitre 4 (2023) — Doublure de Keanu Reeves'],
        });
        const jw4 = film('jw4', 'John Wick : Chapitre 4', 2023, {
            cuc_team_involved: ['vincent-bouillon'],
            cuc_team_roles: { 'vincent-bouillon': 'Doublure de Keanu Reeves' },
        });
        const resolve = createCoachFilmRoleResolver({
            member: vincent,
            parsedCredits: (vincent.notableCredits || []).map(parseCredit),
            tt,
        });

        const resolved = resolve(jw4);
        expect(resolved.role).toBe('Cascadeur');
        expect(resolved.isCascadeur).toBe(true);
        expect(resolved.isDoublure).toBe(false);
        expect(resolved.isCoord).toBe(false);
    });

    it('préserve Rigger, Cascadeur mécanique et Assistant coordinateur tels quels', () => {
        const franck = coach({
            id: 'franck-blanc',
            title: 'Coach Câblage',
            notableCredits: ['Néro (2025) — Rigger'],
        });
        const nero = film('nero', 'Néro', 2025, {
            cuc_team_involved: ['franck-blanc'],
            cuc_team_roles: { 'franck-blanc': 'Rigger' },
        });
        const resolve = createCoachFilmRoleResolver({
            member: franck,
            parsedCredits: (franck.notableCredits || []).map(parseCredit),
            tt,
        });

        const resolved = resolve(nero);
        expect(resolved.role).toBe('Rigger');
        expect(resolved.isCascadeur).toBe(true);
    });
});
