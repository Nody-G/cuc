import { probeFieldReachability, type ReachabilityView } from './field-reachability';

/** Rect visible centré, indépendant de la mise en page jsdom (toutes les boîtes y sont nulles). */
function box(el: Element, rect: Partial<DOMRect> = {}): Element {
    el.getBoundingClientRect = () =>
        ({
            left: 100,
            top: 100,
            width: 200,
            height: 40,
            right: 300,
            bottom: 140,
            x: 100,
            y: 100,
            toJSON: () => ({}),
            ...rect,
        }) as DOMRect;
    return el;
}

/** Vue de test : recouvrement et `pointer-events` pilotés explicitement. */
function view(
    hit: (x: number, y: number) => Element | null = () => null,
    overrides: Partial<ReachabilityView> = {}
): ReachabilityView {
    return {
        innerWidth: 1280,
        innerHeight: 800,
        pointerEventsOf: () => 'auto',
        hitTest: hit,
        ...overrides,
    };
}

/** Le geste tombe toujours sur la cible : aucun recouvrement possible. */
const hits = (target: () => Element | null) => () => target();

describe('probeFieldReachability', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('ne signale rien quand le champ est atteignable', () => {
        document.body.innerHTML = `<div><span data-cuc-field="hero.title">Titre</span></div>`;
        const field = box(document.querySelector('[data-cuc-field]') as Element);

        const report = probeFieldReachability(document.body, view(hits(() => field)));

        expect(report.issues).toEqual([]);
        expect(report.probed).toBe(1);
        expect(report.skipped).toBe(0);
    });

    it('signale un ancêtre décoratif qui coupe le geste', () => {
        document.body.innerHTML = `
            <div data-cuc-reach class="pointer-events-none">
                <span data-cuc-field="hero.hud_location">Hauts-de-France</span>
            </div>`;
        const field = box(document.querySelector('[data-cuc-field]') as Element);

        const report = probeFieldReachability(
            document.body,
            view(hits(() => field), { pointerEventsOf: () => 'none' })
        );

        expect(report.issues).toEqual([
            { path: 'hero.hud_location', kind: 'text', reason: 'pointer-events' },
        ]);
        expect(report.probed).toBe(1);
    });

    it('signale un frère plein cadre qui recouvre le champ', () => {
        document.body.innerHTML = `
            <div>
                <span data-cuc-field="sections_data.virtual_tour.hud_title">Visite 360°</span>
                <a href="/visite-virtuelle">Lien plein cadre</a>
            </div>`;
        box(document.querySelector('[data-cuc-field]') as Element);
        const overlay = document.querySelector('a') as Element;

        const report = probeFieldReachability(document.body, view(hits(() => overlay)));

        expect(report.issues).toEqual([
            { path: 'sections_data.virtual_tour.hud_title', kind: 'text', reason: 'covered' },
        ]);
    });

    it('accepte la désignation par un contrôle qui contient le champ', () => {
        document.body.innerHTML = `
            <a href="https://maps.example">
                <span data-cuc-field="hero.hud_map_label">Le Cateau-Cambrésis (59)</span>
            </a>`;
        box(document.querySelector('[data-cuc-field]') as Element);
        const link = document.querySelector('a') as Element;

        const report = probeFieldReachability(document.body, view(hits(() => link)));

        expect(report.issues).toEqual([]);
    });

    it('ne mesure pas les champs hors fenêtre et le dit', () => {
        document.body.innerHTML = `<span data-cuc-field="hero.title">Titre</span>`;
        box(document.querySelector('[data-cuc-field]') as Element, { top: 900, bottom: 940 });

        const report = probeFieldReachability(document.body, view());

        expect(report.issues).toEqual([]);
        expect(report.probed).toBe(0);
        expect(report.skipped).toBe(1);
    });

    it('mesure aussi le remplacement de média (nature image)', () => {
        document.body.innerHTML = `<div data-cuc-field="hero.bg_image" data-cuc-kind="image">Image</div>`;
        box(document.querySelector('[data-cuc-kind="image"]') as Element);

        const report = probeFieldReachability(
            document.body,
            view(undefined, { pointerEventsOf: () => 'none' })
        );

        expect(report.issues).toEqual([
            { path: 'hero.bg_image', kind: 'image', reason: 'pointer-events' },
        ]);
        expect(report.probed).toBe(1);
    });

    it('ignore les items de liste et les champs sans boîte visible', () => {
        document.body.innerHTML = `
            <div data-cuc-field="sections_data.about.pillars" data-cuc-index="0">Item</div>
            <div data-cuc-field="hero.subtitle" data-cuc-kind="textarea">Masqué par la mise en page</div>`;
        // L'item de liste a une boîte : c'est sa nature (outil dédié) qui l'écarte.
        // La zone de texte, elle, reste sans boîte (mise en page jsdom) : hors mesure.
        box(document.querySelector('[data-cuc-index]') as Element);

        const report = probeFieldReachability(
            document.body,
            view(undefined, { pointerEventsOf: () => 'none' })
        );

        expect(report.issues).toEqual([]);
        expect(report.probed).toBe(0);
    });

    it('ne répète pas deux fois le même chemin et ignore les annotations vides', () => {
        document.body.innerHTML = `
            <span data-cuc-field="hero.title">Titre</span>
            <span data-cuc-field="hero.title">Titre dupliqué</span>
            <span data-cuc-field="   ">Vide</span>`;
        for (const el of document.querySelectorAll('[data-cuc-field]')) box(el);

        const report = probeFieldReachability(document.body, view(undefined, { pointerEventsOf: () => 'none' }));

        expect(report.issues).toHaveLength(1);
        expect(report.issues[0]).toEqual({
            path: 'hero.title',
            kind: 'text',
            reason: 'pointer-events',
        });
        expect(report.probed).toBe(2);
    });
});
