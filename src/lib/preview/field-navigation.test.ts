import { collectEditableFields, nextEditableField } from './field-navigation';

/** jsdom ne calcule pas de mise en page : on simule des boîtes mesurables. */
function stubRect(element: HTMLElement, width = 120, height = 20): HTMLElement {
    element.getBoundingClientRect = () =>
        ({ width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
    return element;
}

function mountDocument(): HTMLElement {
    document.body.innerHTML = '';

    const root = document.createElement('div');
    root.innerHTML = `
        <span data-cuc-field="hero.title">Titre</span>
        <span data-cuc-field="hero.subtitle" data-cuc-kind="textarea">Sous-titre</span>
        <a data-cuc-field="hero.cta_link" data-cuc-kind="link">CTA</a>
        <div data-cuc-field="hero.bg_image" data-cuc-kind="image">
            <img alt="" />
        </div>
        <div data-cuc-field="hero.pillars" data-cuc-index="0">Item de liste</div>
        <span data-cuc-field="hero.title">Titre dupliqué</span>
    `;
    document.body.appendChild(root);

    root.querySelectorAll<HTMLElement>('[data-cuc-field]').forEach((element) => {
        if (element.getAttribute('data-cuc-index') === null) stubRect(element);
        element.getAttribute('data-cuc-index') === null ? stubRect(element) : stubRect(element, 0, 0);
    });

    return root;
}

describe('collectEditableFields', () => {
    it('retient les champs texte, zone de texte et lien, dans l’ordre du document', () => {
        const root = mountDocument();
        expect(collectEditableFields(root).map((field) => field.path)).toEqual([
            'hero.title',
            'hero.subtitle',
            'hero.cta_link',
        ]);
    });

    it('écarte les images, les items de liste et les champs masqués', () => {
        const root = mountDocument();
        const paths = collectEditableFields(root).map((field) => field.path);
        expect(paths).not.toContain('hero.bg_image');
        expect(paths).not.toContain('hero.pillars');
    });

    it('dédoublonne un champ rendu plusieurs fois', () => {
        const root = mountDocument();
        const titles = collectEditableFields(root).filter((field) => field.path === 'hero.title');
        expect(titles).toHaveLength(1);
    });

    it('déclare la nature réelle de chaque champ', () => {
        const root = mountDocument();
        const kinds = collectEditableFields(root).map((field) => field.kind);
        expect(kinds).toEqual(['text', 'textarea', 'link']);
    });

    it('renvoie une liste vide sans champ', () => {
        document.body.innerHTML = '<div>Aucun champ</div>';
        expect(collectEditableFields(document.body)).toEqual([]);
    });
});

describe('nextEditableField', () => {
    const fields = [
        { path: 'a', kind: 'text' as const, element: document.createElement('span') },
        { path: 'b', kind: 'text' as const, element: document.createElement('span') },
        { path: 'c', kind: 'text' as const, element: document.createElement('span') },
    ];

    it('avance dans l’ordre du document', () => {
        expect(nextEditableField(fields, 'a')?.path).toBe('b');
    });

    it('recule avec la direction inverse', () => {
        expect(nextEditableField(fields, 'b', -1)?.path).toBe('a');
    });

    it('boucle aux extrémités', () => {
        expect(nextEditableField(fields, 'c')?.path).toBe('a');
        expect(nextEditableField(fields, 'a', -1)?.path).toBe('c');
    });

    it('entre par le premier champ quand rien n’est sélectionné', () => {
        expect(nextEditableField(fields, null)?.path).toBe('a');
        expect(nextEditableField(fields, null, -1)?.path).toBe('c');
    });

    it('entre par le premier champ si le chemin courant est inconnu', () => {
        expect(nextEditableField(fields, 'inconnu')?.path).toBe('a');
    });

    it('renvoie null sans champ', () => {
        expect(nextEditableField([], 'a')).toBeNull();
    });
});
