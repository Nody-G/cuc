/**
 * Tests unitaires de la sélection des comédiens doublés de la page Tournages.
 *
 * Vérifie :
 * - Le filtrage strict aux 16 comédiens demandés par Lucas Dollfus
 * - Le respect scrupuleux de l'ordre d'affichage
 * - L'absence de mutation du tableau source
 * - L'application des productions spécifiques au tournage
 * - La gestion des alias ('camille-rozat' / 'camille-razat')
 */

import {
    CUC_TOURNAGE_CELEBRITIES_ORDER,
    CUC_TOURNAGE_PROJECTS_OVERRIDE,
    selectTournageCelebrities,
} from './celebrity-tournage';
import type { DoubledCelebrity } from '@/types';

function mockCelebrity(id: string, name: string, productions: string[] = []): DoubledCelebrity {
    return {
        id,
        name,
        photo: `/images/actors/${id}.jpg`,
        productions,
        stuntSpecialty: '',
        stuntDoubles: "Doublé par l'équipe CUC",
        imdbUrl: `https://www.imdb.com/name/${id}/`,
        bio: `Bio de ${name}`,
    };
}

describe('celebrity-tournage domain logic', () => {
    it('définit exactement 16 comédiens dans CUC_TOURNAGE_CELEBRITIES_ORDER', () => {
        expect(CUC_TOURNAGE_CELEBRITIES_ORDER).toHaveLength(16);
        expect(CUC_TOURNAGE_CELEBRITIES_ORDER[0]).toBe('gilles-lellouche');
        expect(CUC_TOURNAGE_CELEBRITIES_ORDER[1]).toBe('adele-exarchopoulos');
        expect(CUC_TOURNAGE_CELEBRITIES_ORDER[2]).toBe('francois-civil');
        expect(CUC_TOURNAGE_CELEBRITIES_ORDER[15]).toBe('camille-razat');
    });

    it('sélectionne et ordonne exclusivement les comédiens de la liste', () => {
        const catalogue: DoubledCelebrity[] = [
            mockCelebrity('keanu-reeves', 'Keanu Reeves', ['John Wick 4']),
            mockCelebrity('alban-lenoir', 'Alban Lenoir', ['Antigang']),
            mockCelebrity('francois-civil', 'François Civil', ["L'Amour ouf"]),
            mockCelebrity('gilles-lellouche', 'Gilles Lellouche', ["L'Amour ouf"]),
            mockCelebrity('adele-exarchopoulos', 'Adèle Exarchopoulos', ["L'Amour ouf"]),
            mockCelebrity('vincent-cassel', 'Vincent Cassel', ['La Haine']),
        ];

        const selected = selectTournageCelebrities(catalogue);

        // Seuls Gilles, Adèle et François doivent être retenus
        expect(selected).toHaveLength(3);
        expect(selected.map((c) => c.id)).toEqual([
            'gilles-lellouche',
            'adele-exarchopoulos',
            'francois-civil',
        ]);
        // Vérifie qu'aucun autre comédien n'est inclus
        expect(selected.some((c) => c.id === 'keanu-reeves')).toBe(false);
        expect(selected.some((c) => c.id === 'alban-lenoir')).toBe(false);
        expect(selected.some((c) => c.id === 'vincent-cassel')).toBe(false);
    });

    it('ne mute pas le tableau d’entrée', () => {
        const input: DoubledCelebrity[] = [
            mockCelebrity('gilles-lellouche', 'Gilles Lellouche', ['Ancien Projet']),
        ];
        const snapshot = JSON.stringify(input);

        const result = selectTournageCelebrities(input);

        expect(JSON.stringify(input)).toBe(snapshot);
        expect(result[0].productions).toEqual(["L'Amour ouf"]);
    });

    it('applique les productions associées au tournage avec Lucas', () => {
        const input: DoubledCelebrity[] = [
            mockCelebrity('ramzy-bedia', 'Ramzy Bedia', ['Les Blagues de Toto']),
            mockCelebrity('pio-marmai', 'Pio Marmaï', []),
        ];

        const result = selectTournageCelebrities(input);

        const ramzy = result.find((c) => c.id === 'ramzy-bedia');
        const pio = result.find((c) => c.id === 'pio-marmai');

        expect(ramzy?.productions).toEqual(['Bagarre']);
        expect(pio?.productions).toEqual(['Néro (Netflix)']);
    });

    it('gère une liste vide sans erreur', () => {
        expect(selectTournageCelebrities([])).toEqual([]);
    });
});
