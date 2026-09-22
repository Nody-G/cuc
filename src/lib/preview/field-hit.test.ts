import { resolveFieldElement } from './field-hit';

/**
 * Garde-fous de la cible d'édition : un bouton ou un lien dont un libellé
 * unique est annoté doit être éditable sur **toute** sa surface (icône,
 * rembourrage), sans jamais deviner entre plusieurs champs.
 */
function mount(html: string): HTMLElement {
    document.body.innerHTML = html;
    return document.body.firstElementChild as HTMLElement;
}

describe('resolveFieldElement', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('résout le texte annoté cliqué directement', () => {
        const root = mount('<span data-cuc-field="hero.title">Titre</span>');
        expect(resolveFieldElement(root)).toBe(root);
    });

    it('résout l’ancêtre annoté quand on clique un nœud interne', () => {
        const root = mount(
            '<p data-cuc-field="hero.subtitle"><em>Ligne</em></p>'
        );
        const em = root.querySelector('em');
        expect(resolveFieldElement(em)).toBe(root);
    });

    it('résout le libellé unique d’un bouton quand on clique l’icône SVG', () => {
        const root = mount(
            '<button><svg><path /></svg><span data-cuc-field="hero.cta_primary_text">Réserver</span></button>'
        );
        const svg = root.querySelector('svg');
        const label = root.querySelector('[data-cuc-field]');
        expect(resolveFieldElement(svg)).toBe(label);
    });

    it('résout le libellé unique d’un lien (a[href]) sur toute sa surface', () => {
        const root = mount(
            '<a href="/partenaires"><span data-cuc-field="partners.view_all">Voir tout</span><svg /></a>'
        );
        expect(resolveFieldElement(root)).toBe(root.querySelector('[data-cuc-field]'));
    });

    it('accepte un contrôle [role="button"]', () => {
        const root = mount(
            '<div role="button"><span data-cuc-field="list.item.title">Item</span></div>'
        );
        expect(resolveFieldElement(root)).toBe(root.querySelector('[data-cuc-field]'));
    });

    it('ne devine pas une carte-lien à plusieurs champs distincts', () => {
        const root = mount(
            '<a href="/carte"><span data-cuc-field="card.title">T</span><span data-cuc-field="card.year">2026</span></a>'
        );
        expect(resolveFieldElement(root)).toBeNull();
    });

    it('résout un contrôle dont deux annotations portent le même champ', () => {
        const root = mount(
            '<button><span data-cuc-field="cta.text">A</span><span data-cuc-field="cta.text">B</span></button>'
        );
        expect(resolveFieldElement(root)).toBe(root.querySelector('[data-cuc-field]'));
    });

    it('ignore un attribut vide (aucun champ fantôme)', () => {
        const root = mount('<span data-cuc-field="   ">Vide</span>');
        expect(resolveFieldElement(root)).toBeNull();
    });

    it('retourne null hors annotation et hors contrôle', () => {
        const root = mount('<div><span>Texte simple</span></div>');
        expect(resolveFieldElement(root)).toBeNull();
        expect(resolveFieldElement(root.querySelector('span'))).toBeNull();
        expect(resolveFieldElement(null)).toBeNull();
    });

    it('garde le comportement public d’un bouton sans champ', () => {
        const root = mount('<button>Action technique</button>');
        expect(resolveFieldElement(root)).toBeNull();
    });
});
