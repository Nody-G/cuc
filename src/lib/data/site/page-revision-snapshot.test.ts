import {
    buildRevisionLabel,
    buildRevisionSnapshot,
    nextRevisionNumber,
    PAGE_REVISION_FIELDS,
} from './page-revision-snapshot';

/**
 * Garde-fou de l'instantané de révision.
 *
 * Le test central est l'invariant « **tout champ restauré est dans
 * l'instantané** » : il relie la liste utilisée par la restauration à ce que
 * l'écriture produit réellement. C'est exactement l'écart qui rendait les
 * « versions précédentes » fausses (`sections_data` oublié).
 */

const PAGE = {
    title: 'Formation de cascadeur',
    meta_title: 'Formation — CUC',
    meta_description: 'Description courte',
    og_image: 'https://cdn.test/og.jpg',
    hero: { title: 'Campus Univers Cascades' },
    sections: [{ id: 'about' }],
    layout_sections: [{ id: 'hero', order: 0 }],
    sections_data: { about: { title: 'Le campus' } },
    is_published: false,
};

describe('buildRevisionSnapshot', () => {
    it('contient tous les champs que la restauration réapplique', () => {
        const snapshot = buildRevisionSnapshot(PAGE);

        for (const field of PAGE_REVISION_FIELDS) {
            expect(snapshot).toHaveProperty(field);
        }
    });

    it('conserve les textes de sections et la disposition', () => {
        const snapshot = buildRevisionSnapshot(PAGE);

        expect(snapshot.sections_data).toEqual({ about: { title: 'Le campus' } });
        expect(snapshot.layout_sections).toEqual([{ id: 'hero', order: 0 }]);
        expect(snapshot.is_published).toBe(false);
    });

    it('normalise les listes absentes sans inventer de contenu', () => {
        const snapshot = buildRevisionSnapshot({
            title: 'Contact',
            hero: {},
            sections: undefined,
            layout_sections: undefined,
            sections_data: undefined,
            is_published: undefined,
        });

        expect(snapshot.sections).toEqual([]);
        expect(snapshot.layout_sections).toEqual([]);
        expect(snapshot.sections_data).toEqual({});
        expect(snapshot.hero).toEqual({});
        expect(snapshot.is_published).toBe(true);
    });

    it('ne recopie jamais une structure qui n’est pas un tableau', () => {
        const snapshot = buildRevisionSnapshot({
            ...PAGE,
            sections: 'texte' as never,
            layout_sections: null as never,
        });

        expect(snapshot.sections).toEqual([]);
        expect(snapshot.layout_sections).toEqual([]);
    });
});

describe('buildRevisionLabel', () => {
    it('produit un libellé horodaté et lisible', () => {
        expect(buildRevisionLabel(new Date(2026, 8, 24, 13, 4))).toBe(
            'Enregistrement du 24/09/2026 à 13:04'
        );
    });
});

describe('nextRevisionNumber', () => {
    it('incrémente le plus grand numéro existant', () => {
        expect(nextRevisionNumber([1, 2, 3])).toBe(4);
        expect(nextRevisionNumber([7])).toBe(8);
        expect(nextRevisionNumber([])).toBe(1);
    });

    it('ignore les valeurs non numériques et ne retourne jamais moins de 1', () => {
        expect(nextRevisionNumber([Number.NaN, 2])).toBe(3);
        expect(nextRevisionNumber([Number.NEGATIVE_INFINITY])).toBe(1);
    });
});
