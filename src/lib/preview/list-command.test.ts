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

    describe('graine d’une liste absente (ex. visuels du hero)', () => {
        const seed = [
            { id: 'campus', url: 'https://cdn.test/1.webp' },
            { id: 'team', url: 'https://cdn.test/4.webp' },
        ];

        it('matérialise la graine réelle puis ajoute un clone en fin de liste', () => {
            const next = applyListCommand(
                { sections_data: {} } as Record<string, unknown>,
                'sections_data.hero.slides',
                'add',
                -1,
                seed
            ) as { sections_data: { hero: { slides: Array<Record<string, string>> } } };

            expect(next.sections_data.hero.slides).toHaveLength(3);
            expect(next.sections_data.hero.slides[0].url).toBe('https://cdn.test/1.webp');
            expect(next.sections_data.hero.slides[1].url).toBe('https://cdn.test/4.webp');
            expect(next.sections_data.hero.slides[2].url).toBe('https://cdn.test/4.webp');
            expect(next.sections_data.hero.slides[2].id).toBe('team-copie');
        });

        it('sans graine, une liste absente reste intacte', () => {
            const root = { sections_data: {} };
            expect(applyListCommand(root, 'sections_data.hero.slides', 'add', -1)).toBe(root);
        });

        it('démarre aussi une liste vide lorsqu’une graine est fournie', () => {
            const root = { sections_data: { hero: { slides: [] as unknown[] } } };
            const next = applyListCommand(
                root,
                'sections_data.hero.slides',
                'add',
                -1,
                seed
            ) as typeof root;

            expect(next.sections_data.hero.slides).toHaveLength(3);
        });
    });
});
