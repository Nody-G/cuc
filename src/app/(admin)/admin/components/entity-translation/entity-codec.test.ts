/**
 * Tests du domaine « codes d'entité ».
 *
 * Deux invariants verrouillés ici :
 *   1. la liste blanche EST le contrat de traduction — aucun champ technique
 *      (ancre, média, ordre) ne peut fuiter dans la ligne d'overlay ;
 *   2. le pont `stuntRoles ⇄ stunt_roles` du film fait l'aller-retour sans
 *      perte — sans lui, la traduction des cascades serait écrite puis jamais
 *      relue par `apply-film-overlay.ts`.
 */

import { DISCIPLINE_CODEC, EVENT_CODEC, FILM_CODEC, TEAM_CODEC, ZONE_CODEC } from './entity-codec';
import type { FilmCredit, Instructor } from '@/types';

const teamDraft = {
    id: 'ben',
    name: 'Benjamin',
    role: 'Coach',
    title: 'Responsable cascade',
    bio: 'Bio française',
    specialties: ['Parkour', 'Chute'],
    avatarUrl: '/a.png',
    order_index: 2,
} as unknown as Instructor;

describe('pickCodec — liste blanche', () => {
    it('ne laisse passer aucun champ technique', () => {
        const row = TEAM_CODEC.toRow(teamDraft);
        expect(Object.keys(row).sort()).toEqual(['bio', 'role', 'specialties', 'title']);
        expect(row).not.toHaveProperty('id');
        expect(row).not.toHaveProperty('avatarUrl');
        expect(row).not.toHaveProperty('order_index');
    });

    it('expose la allow-list exacte issue des appliers', () => {
        expect(TEAM_CODEC.fields).toEqual(['role', 'title', 'bio', 'specialties']);
        expect(EVENT_CODEC.fields).toEqual([
            'title',
            'subtitle',
            'badge',
            'description',
            'price_indicator',
            'cta_text',
            'features',
        ]);
        expect(DISCIPLINE_CODEC.fields).toEqual([
            'name',
            'shortDesc',
            'fullDesc',
            'cinemaContext',
            'equipment',
        ]);
        expect(ZONE_CODEC.fields).toEqual(['name', 'category', 'description', 'badge', 'specs']);
    });

    it('fromRow préserve les champs non traduisibles du brouillon', () => {
        const next = TEAM_CODEC.fromRow({ role: 'Head Coach' }, teamDraft);
        expect(next).toEqual({ ...teamDraft, role: 'Head Coach' });
        expect(next.avatarUrl).toBe('/a.png');
        expect(next.id).toBe('ben');
    });
});

describe('FILM_CODEC — pont camelCase ⇄ snake_case', () => {
    const filmDraft = {
        id: 'f1',
        title: 'Film',
        year: '2024',
        category: '',
        stuntRoles: 'Doublure',
        description: 'Synopsis FR',
        highlight: false,
        image: '/p.jpg',
        tag: '',
        imdbUrl: '',
        allocineUrl: '',
        trailerUrl: '',
    } as unknown as FilmCredit;

    it('écrit la colonne source `stunt_roles` (jamais `stuntRoles`)', () => {
        const row = FILM_CODEC.toRow(filmDraft);
        expect(Object.keys(row).sort()).toEqual(['description', 'stunt_roles']);
        expect(row.stunt_roles).toBe('Doublure');
        expect(row).not.toHaveProperty('stuntRoles');
    });

    it('fait l’aller-retour sans perte', () => {
        expect(FILM_CODEC.fromRow(FILM_CODEC.toRow(filmDraft), filmDraft)).toEqual(filmDraft);

        const back = FILM_CODEC.fromRow(
            { description: 'Synopsis EN', stunt_roles: 'Stunt double' },
            filmDraft
        );
        expect(back.description).toBe('Synopsis EN');
        expect(back.stuntRoles).toBe('Stunt double');
    });

    it('préserve les champs non traduisibles (titre, année, ancre)', () => {
        const back = FILM_CODEC.fromRow({ stunt_roles: 'X' }, filmDraft);
        expect(back.title).toBe('Film');
        expect(back.year).toBe('2024');
        expect(back.id).toBe('f1');
    });
});
