/**
 * Tests de la fusion de l'overlay EN des fiches film.
 *
 * Aucun import de `vitest` : `globals: true` est activé dans
 * `vitest.config.mts` (convention du dépôt, cf. `vitest.setup.mts`).
 */
import { applyFilmOverlay, applyFilmOverlays } from './apply-film-overlay';
import type { FilmCredit } from '@/types';

const FILM: FilmCredit = {
    id: 'mon-frere-yves',
    title: 'Mon frère Yves',
    year: '2024',
    category: 'Film',
    director: 'Philippe Lioret',
    stuntRoles: 'Coordination cascades',
    description: 'Description française du film.',
    highlight: false,
    image: '/images/x.jpg',
    tag: '',
    imdbUrl: 'https://www.imdb.com/title/tt0000000/',
    allocineUrl: '',
    trailerUrl: '',
};

describe('applyFilmOverlay', () => {
    it('sans overlay, la fiche française reste intacte', () => {
        expect(applyFilmOverlay(FILM)).toEqual(FILM);
        expect(applyFilmOverlay(FILM, null)).toEqual(FILM);
        expect(applyFilmOverlay(FILM, {})).toEqual(FILM);
    });

    it('applique le synopsis anglais et les rôles cascades', () => {
        const result = applyFilmOverlay(FILM, {
            description: 'An English synopsis.',
            stunt_roles: 'Stunt coordination',
        });

        expect(result.description).toBe('An English synopsis.');
        expect(result.stuntRoles).toBe('Stunt coordination');
    });

    it('ne remplace jamais par une chaîne vide ou un espace', () => {
        const result = applyFilmOverlay(FILM, { description: '   ', stunt_roles: '' });

        expect(result.description).toBe(FILM.description);
        expect(result.stuntRoles).toBe(FILM.stuntRoles);
    });

    it('ne touche ni le titre, ni l’année, ni le réalisateur, ni les liens', () => {
        const result = applyFilmOverlay(FILM, {
            description: 'An English synopsis.',
            title: 'WRONG TITLE',
            year: '1900',
            director: 'WRONG DIRECTOR',
            imdbUrl: 'https://wrong.example/',
        });

        expect(result.title).toBe(FILM.title);
        expect(result.year).toBe(FILM.year);
        expect(result.director).toBe(FILM.director);
        expect(result.imdbUrl).toBe(FILM.imdbUrl);
    });
});

describe('applyFilmOverlays', () => {
    const OTHER: FilmCredit = { ...FILM, id: 'gloria' };

    it('sans overlays, la liste est renvoyée telle quelle (même référence)', () => {
        const films = [FILM, OTHER];
        expect(applyFilmOverlays(films, null)).toBe(films);
    });

    it('n’applique que les fiches présentes dans les overlays', () => {
        const result = applyFilmOverlays([FILM, OTHER], {
            gloria: { description: 'Gloria in English.' },
        });

        expect(result[0]).toEqual(FILM); // aucune clé pour cette fiche
        expect(result[1].description).toBe('Gloria in English.');
    });
});
