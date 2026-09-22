import { mergeSectionItems } from './usePageSectionData';

/**
 * Garde-fous de la fusion « données de section ↔ repli traduit ».
 *
 * Le contrat : un champ absent des données **garde** le texte traduit, un champ
 * présent le remplace, et aucun item n'est perdu ni inventé.
 */
describe('mergeSectionItems', () => {
    const defaults = [
        { id: 'a', tag: 'TAG A', title: 'Titre A' },
        { id: 'b', tag: 'TAG B', title: 'Titre B' },
    ];

    it('retourne les replis quand aucune donnée n’existe', () => {
        expect(mergeSectionItems(defaults, undefined)).toEqual(defaults);
        expect(mergeSectionItems(defaults, { items: [] })).toEqual(defaults);
    });

    it('remplace champ par champ, en gardant les autres replis', () => {
        const merged = mergeSectionItems(defaults, { items: [{ tag: 'TAG A2' }] });

        expect(merged[0]).toEqual({ id: 'a', tag: 'TAG A2', title: 'Titre A' });
        expect(merged[1]).toEqual(defaults[1]);
    });

    it('conserve les items supplémentaires présents dans les données', () => {
        const merged = mergeSectionItems(defaults, {
            items: [{}, {}, { id: 'c', tag: 'TAG C', title: 'Titre C' }],
        });

        expect(merged).toHaveLength(3);
        expect(merged[2].id).toBe('c');
    });

    it('ne mute ni les replis ni les données', () => {
        const data = { items: [{ tag: 'TAG A2' }] };
        const merged = mergeSectionItems(defaults, data);

        expect(defaults[0].tag).toBe('TAG A');
        expect(data.items[0].tag).toBe('TAG A2');
        expect(merged[0]).not.toBe(defaults[0]);
    });
});
