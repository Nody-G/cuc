import type { FilmCredit, Instructor } from '@/types';
import {
    DEFAULT_COACH_FILM_SORT,
    buildFeaturedOrder,
    findRelatedFilms,
    selectCoachFilms,
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
