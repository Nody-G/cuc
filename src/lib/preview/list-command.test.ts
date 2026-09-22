import { applyListCommand } from './list-command';

/**
 * Garde-fous du moteur de listes (Mode Studio).
 *
 * Interdits verrouillés ici :
 *   1. inventer un item dans une liste vide (forme inconnue) ;
 *   2. vider complètement une liste rendue par la vitrine ;
 *   3. muter l'entrée (React ne verrait pas le changement) ;
 *   4. dupliquer sans identifiant unique (les ancres et clés React casseraient).
 */
const PAGE = {
    sections_data: {
        formules: {
            items: [
                { id: 'decouverte', title: 'Stage découverte' },
                { id: 'pro', title: 'Cursus pro' },
            ],
        },
        vide: { items: [] as { id?: string; title?: string }[] },
    },
};

describe('applyListCommand', () => {
    it('duplique un item juste après sa source, avec un identifiant unique', () => {
        const next = applyListCommand(PAGE, 'sections_data.formules.items', 'duplicate', 0);

        const items = next.sections_data.formules.items;
        expect(items).toHaveLength(3);
        expect(items[0].id).toBe('decouverte');
        expect(items[1].id).toBe('decouverte-copie');
        expect(items[1].title).toBe('Stage découverte');
        expect(items[2].id).toBe('pro');
    });

    it('ajoute en fin de liste en clonant le dernier item connu', () => {
        const next = applyListCommand(PAGE, 'sections_data.formules.items', 'add', -1);
        const items = next.sections_data.formules.items;
        expect(items).toHaveLength(3);
        expect(items[2].title).toBe('Cursus pro');
        expect(items[2].id).toBe('pro-copie');
    });

    it('n’invente jamais un item dans une liste vide', () => {
        const next = applyListCommand(PAGE, 'sections_data.vide.items', 'add', 0);
        expect(next).toBe(PAGE);
        expect(next.sections_data.vide.items).toHaveLength(0);
    });

    it('refuse de vider complètement une liste', () => {
        const single = { sections_data: { bloc: { items: [{ id: 'seul' }] } } };
        expect(applyListCommand(single, 'sections_data.bloc.items', 'remove', 0)).toBe(single);
    });

    it('supprime l’item visé quand la liste en compte plusieurs', () => {
        const next = applyListCommand(PAGE, 'sections_data.formules.items', 'remove', 0);
        const items = next.sections_data.formules.items;
        expect(items).toHaveLength(1);
        expect(items[0].id).toBe('pro');
    });

    it('réordonne dans les bornes, sans effet aux extrémités', () => {
        const up = applyListCommand(PAGE, 'sections_data.formules.items', 'move-up', 1);
        expect(up.sections_data.formules.items.map((item) => item.id)).toEqual([
            'pro',
            'decouverte',
        ]);

        const beyond = applyListCommand(PAGE, 'sections_data.formules.items', 'move-up', 0);
        expect(beyond).toBe(PAGE);

        const beyondDown = applyListCommand(PAGE, 'sections_data.formules.items', 'move-down', 1);
        expect(beyondDown).toBe(PAGE);
    });

    it('ne mute jamais l’entrée et ignore un chemin invalide', () => {
        const next = applyListCommand(PAGE, 'sections_data.formules.items', 'move-down', 0);

        expect(next).not.toBe(PAGE);
        expect(next.sections_data.formules.items[0].id).toBe('pro');
        expect(PAGE.sections_data.formules.items[0].id).toBe('decouverte');

        expect(applyListCommand(PAGE, '', 'add', 0)).toBe(PAGE);
        expect(applyListCommand(PAGE, 'sections_data.inexistant.items', 'add', 0)).toBe(PAGE);
    });
});
