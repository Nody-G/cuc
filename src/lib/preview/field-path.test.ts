import { setFieldValue } from './field-path';

/**
 * Garde-fous de l'écriture par chemin (édition en place → brouillon).
 *
 * Ce qui est verrouillé :
 *   1. la valeur arrive au bon endroit, les frères sont préservés ;
 *   2. l'entrée n'est JAMAIS mutée (React ne verrait pas le changement) ;
 *   3. les branches non traversées gardent leur référence (aucun rendu inutile) ;
 *   4. un tableau n'est copié que si un index est visé ;
 *   5. un chemin vide ne crée aucune structure.
 */
describe('setFieldValue', () => {
    it('écrit une valeur imbriquée en préservant les frères', () => {
        const page = {
            slug: '/',
            hero: { title: 'Ancien titre', subtitle: 'Sous-titre' },
            sections_data: { about: { title: 'Titre section', tag: 'Tag' } },
        };

        const next = setFieldValue(page, 'sections_data.about.title', 'Nouveau titre');

        expect(next.sections_data.about.title).toBe('Nouveau titre');
        expect(next.sections_data.about.tag).toBe('Tag');
        expect(next.hero.title).toBe('Ancien titre');
        expect(next.slug).toBe('/');
    });

    it('ne mute jamais l’entrée', () => {
        const page = { hero: { title: 'Ancien' } };
        const next = setFieldValue(page, 'hero.title', 'Nouveau');

        expect(page.hero.title).toBe('Ancien');
        expect(next).not.toBe(page);
        expect(next.hero).not.toBe(page.hero);
    });

    it('préserve la référence des branches non traversées', () => {
        const page = {
            hero: { title: 'Titre' },
            sections_data: { about: { title: 'Section' } },
        };
        const next = setFieldValue(page, 'hero.title', 'Titre modifié');

        expect(next.hero).not.toBe(page.hero);
        expect(next.sections_data).toBe(page.sections_data);
    });

    it('écrit dans un tableau uniquement lorsqu’un index est visé', () => {
        const page = {
            sections_data: {
                faq: { items: [{ question: 'Q1' }, { question: 'Q2' }] },
            },
        };

        const next = setFieldValue(page, 'sections_data.faq.items.1.question', 'Q2 modifiée');

        expect(next.sections_data.faq.items[1].question).toBe('Q2 modifiée');
        expect(next.sections_data.faq.items[0].question).toBe('Q1');
        expect(page.sections_data.faq.items[1].question).toBe('Q2');
    });

    it('crée les objets intermédiaires manquants, jamais un chemin vide', () => {
        const created = setFieldValue({}, 'sections_data.about.title', 'Titre');
        expect(created).toEqual({ sections_data: { about: { title: 'Titre' } } });

        const root = { hero: { title: 'Titre' } };
        expect(setFieldValue(root, '', 'ignoré')).toBe(root);
        expect(setFieldValue(root, '   ', 'ignoré')).toBe(root);
    });
});
