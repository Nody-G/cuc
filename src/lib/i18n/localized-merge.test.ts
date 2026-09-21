/**
 * Tests de la fusion FR/EN et de l'édition bilingue du Cockpit.
 *
 * Ces tests verrouillent les invariants sur lesquels repose la vitrine :
 * une traduction ne peut jamais vider une page, un tableau est écrit en bloc
 * (ses ancres viennent du français), et la structure n'est jamais inventée.
 *
 * Aucun import de `vitest` : `globals: true` est activé dans
 * `vitest.config.mts` (convention du dépôt, cf. `vitest.setup.mts`).
 */
import {
    diffTranslation,
    findStaleArrays,
    flattenEditorial,
    hydrateLocalized,
    isEditorialLeaf,
    mergeLocalized,
    sanitizeOverlayPayload,
    translationCoverage,
} from './localized-merge';

/** Contenu de page représentatif : hero, chiffres clés, catalogue à ancres. */
const PAGE = {
    slug: 'stages-cascades-parkour-2',
    title: 'Stages & Initiations',
    meta_title: 'Stages cascades',
    meta_description: 'Description française de la page.',
    og_image: 'https://cdn.example/og.jpg',
    is_published: true,
    updated_at: '2026-09-21T00:00:00.000Z',
    hero: {
        badge: 'STAGES 2026',
        title: 'STAGES & INITIATIONS',
        subtitle: 'Le français reste la source.',
        bg_image: 'https://cdn.example/hero.jpg',
    },
    layout_sections: [{ id: 'hero', name: 'En-tête des Stages', order: 1, is_visible: true }],
    sections: [
        {
            id: 'stat_1',
            title: 'Le campus',
            value: '11 000 m²',
            description: 'Surface totale du site',
        },
    ],
    sections_data: {
        stages_catalogue: {
            badge: 'CATALOGUE DES STAGES',
            items: [
                {
                    id: 'stage_decouverte',
                    title: 'Stage découverte',
                    duration: '12 jours (80 h)',
                    desc: 'Description française du stage découverte.',
                    img: 'https://cdn.example/stage-1.jpg',
                },
            ],
        },
    },
};

/** Contenu EN tel que le formulaire du Cockpit le produit : FR + retouches. */
const EN_EDITED = {
    ...PAGE,
    meta_description: 'English description of the page.',
    hero: { ...PAGE.hero, badge: '2026 WORKSHOPS' },
    sections_data: {
        stages_catalogue: {
            ...PAGE.sections_data.stages_catalogue,
            items: [
                {
                    ...PAGE.sections_data.stages_catalogue.items[0],
                    title: 'Discovery Workshop',
                    desc: '',
                },
            ],
        },
    },
};

describe('mergeLocalized', () => {
    it('fusionne récursivement sans perdre les clés françaises absentes de l’overlay', () => {
        const merged = mergeLocalized(PAGE.hero, { title: 'EN TITLE' });
        expect(merged.title).toBe('EN TITLE');
        expect(merged.subtitle).toBe(PAGE.hero.subtitle);
        expect(merged.bg_image).toBe(PAGE.hero.bg_image);
    });

    it('ne remplace jamais le français par une valeur vide ou blanche', () => {
        const merged = mergeLocalized(PAGE.hero, { title: '', subtitle: '   ' });
        expect(merged.title).toBe(PAGE.hero.title);
        expect(merged.subtitle).toBe(PAGE.hero.subtitle);
    });

    it('remplace un tableau en bloc, ou le conserve s’il est vide', () => {
        const remplace = mergeLocalized(PAGE.sections, [{ id: 'stat_1', title: 'Campus EN' }]);
        expect(remplace).toHaveLength(1);
        expect(remplace[0].title).toBe('Campus EN');

        const conserve = mergeLocalized(PAGE.sections, []);
        expect(conserve).toBe(PAGE.sections);
    });

    it('ignore null et undefined', () => {
        expect(mergeLocalized(PAGE.hero, null)).toBe(PAGE.hero);
        expect(mergeLocalized(PAGE.hero, undefined)).toBe(PAGE.hero);
    });
});

describe('flattenEditorial', () => {
    it('retient les feuilles éditoriales et écarte la structure', () => {
        const leaves = flattenEditorial(PAGE);

        expect(leaves['title']).toBe('Stages & Initiations');
        expect(leaves['hero.badge']).toBe('STAGES 2026');
        expect(leaves['sections[0].value']).toBe('11 000 m²');
        expect(leaves['sections_data.stages_catalogue.items[0].title']).toBe('Stage découverte');
        expect(leaves['sections_data.stages_catalogue.items[0].desc']).toBe(
            'Description française du stage découverte.'
        );

        // Structure, médias, identité et états ne sont jamais traduits.
        expect(leaves['slug']).toBeUndefined();
        expect(leaves['og_image']).toBeUndefined();
        expect(leaves['is_published']).toBeUndefined();
        expect(leaves['updated_at']).toBeUndefined();
        expect(leaves['hero.bg_image']).toBeUndefined();
        expect(leaves['sections[0].id']).toBeUndefined();
        expect(leaves['sections_data.stages_catalogue.items[0].img']).toBeUndefined();
        expect(leaves['layout_sections[0].name']).toBeUndefined();
    });

    it('écarte les valeurs trop courtes, les URL et les nombres purs', () => {
        expect(isEditorialLeaf('ok', 'hero.badge')).toBe(false);
        expect(isEditorialLeaf('https://cdn.example/x.jpg', 'hero.title')).toBe(false);
        expect(isEditorialLeaf('/images/x.jpg', 'hero.title')).toBe(false);
        expect(isEditorialLeaf('100%', 'sections[0].value')).toBe(false);
        expect(isEditorialLeaf('STAGES 2026', 'hero.badge')).toBe(true);
    });
});

describe('diffTranslation', () => {
    it('n’écrit que ce qui diffère du français', () => {
        const payload = diffTranslation(PAGE, EN_EDITED);

        expect(payload.meta_description).toBe('English description of the page.');
        expect(payload).toHaveProperty('hero');
        expect((payload.hero as Record<string, unknown>).badge).toBe('2026 WORKSHOPS');
        expect((payload.hero as Record<string, unknown>).title).toBeUndefined();
        // Ni la structure, ni les médias, ni l'identité de la page.
        expect(payload).not.toHaveProperty('layout_sections');
        expect(payload).not.toHaveProperty('og_image');
        expect(payload).not.toHaveProperty('slug');
        expect(payload).not.toHaveProperty('is_published');
        expect(payload).not.toHaveProperty('sections');
        expect(payload).not.toHaveProperty('title');
    });

    it('écrit le tableau complet, ancres et images reprises du français', () => {
        const payload = diffTranslation(PAGE, EN_EDITED);
        const items = (
            payload.sections_data as Record<string, any>
        ).stages_catalogue.items as Array<Record<string, unknown>>;

        expect(items).toHaveLength(1);
        expect(items[0].id).toBe('stage_decouverte');
        expect(items[0].img).toBe('https://cdn.example/stage-1.jpg');
        expect(items[0].title).toBe('Discovery Workshop');
    });

    it('remet le français quand une feuille d’un item est vidée', () => {
        const payload = diffTranslation(PAGE, EN_EDITED);
        const items = (
            payload.sections_data as Record<string, any>
        ).stages_catalogue.items as Array<Record<string, unknown>>;

        expect(items[0].desc).toBe('Description française du stage découverte.');
    });

    it('ne produit rien quand rien n’a été traduit', () => {
        expect(diffTranslation(PAGE, PAGE)).toEqual({});
        expect(diffTranslation(PAGE, hydrateLocalized(PAGE, {}))).toEqual({});
    });

    it('accepte une feuille nouvelle écrite uniquement en anglais', () => {
        const base = { hero: { badge: '', title: 'STAGES' } };
        const localized = { hero: { badge: '2026 WORKSHOPS', title: 'STAGES' } };
        expect(diffTranslation(base, localized)).toEqual({
            hero: { badge: '2026 WORKSHOPS' },
        });
    });

    it('n’écrit pas une divergence de structure : rien plutôt qu’un tableau tronqué', () => {
        const base = { items: [{ id: 'a' }, { id: 'b' }] };
        const localized = { items: [{ id: 'a', title: 'Only one' }] };
        expect(diffTranslation(base, localized)).toEqual({});
    });

    it('ne traduit jamais un nombre ni un booléen', () => {
        const base = { seats: 20, featured: true };
        const localized = { seats: 30, featured: false };
        expect(diffTranslation(base, localized)).toEqual({});
    });
});

describe('hydrateLocalized', () => {
    it('reproduit le contenu anglais attendu, français ailleurs', () => {
        const payload = diffTranslation(PAGE, EN_EDITED);
        const hydrated = hydrateLocalized(PAGE, payload) as typeof PAGE;

        expect(hydrated.meta_description).toBe('English description of the page.');
        expect(hydrated.hero.badge).toBe('2026 WORKSHOPS');
        expect(hydrated.hero.title).toBe(PAGE.hero.title);
        expect(hydrated.layout_sections).toEqual(PAGE.layout_sections);
    });

    it('aller-retour sans perte : hydrater puis diffuser redonne le même payload', () => {
        const payload = diffTranslation(PAGE, EN_EDITED);
        const hydrated = hydrateLocalized(PAGE, payload);
        expect(diffTranslation(PAGE, hydrated)).toEqual(payload);
    });
});

describe('translationCoverage', () => {
    it('compte les feuilles traduites sur les feuilles françaises', () => {
        const payload = diffTranslation(PAGE, EN_EDITED);
        const coverage = translationCoverage(PAGE, payload);

        expect(coverage.total).toBe(13);
        expect(coverage.translated).toBe(3);
        expect(coverage.percent).toBe(23);
        expect(coverage.missing).toContain('hero.title');
        expect(coverage.missing).not.toContain('meta_description');
    });

    it('sans overlay, la couverture est nulle', () => {
        const coverage = translationCoverage(PAGE, {});
        expect(coverage.total).toBe(13);
        expect(coverage.translated).toBe(0);
        expect(coverage.percent).toBe(0);
        expect(coverage.missing).toHaveLength(13);
    });

    it('sans contenu français, la couverture est totale', () => {
        const coverage = translationCoverage({}, {});
        expect(coverage.total).toBe(0);
        expect(coverage.percent).toBe(100);
    });

    it('une traduction identique au français reste comptée comme héritée', () => {
        const coverage = translationCoverage(
            { hero: { title: 'CAMPUS UNIVERS CASCADES' } },
            { hero: { title: 'CAMPUS UNIVERS CASCADES' } }
        );
        expect(coverage.translated).toBe(0);
        expect(coverage.percent).toBe(0);
    });
});

describe('findStaleArrays', () => {
    it('signale un item français ajouté depuis la traduction', () => {
        const base = { items: [{ id: 'a' }, { id: 'b' }] };
        const payload = { items: [{ id: 'a' }] };
        const stale = findStaleArrays(base, payload);

        expect(stale).toHaveLength(1);
        expect(stale[0].path).toBe('.items');
        expect(stale[0].frLength).toBe(2);
        expect(stale[0].enLength).toBe(1);
    });

    it('signale un déplacement d’ancre à longueur égale', () => {
        const stale = findStaleArrays(
            { items: [{ id: 'a' }, { id: 'b' }] },
            { items: [{ id: 'b' }, { id: 'a' }] }
        );
        expect(stale[0].idMismatch).toBe(true);
    });

    it('ne signale rien sur un contenu aligné', () => {
        expect(findStaleArrays(PAGE, diffTranslation(PAGE, EN_EDITED))).toEqual([]);
    });
});

describe('sanitizeOverlayPayload', () => {
    it('retire les racines verrouillées et les clés techniques de premier niveau', () => {
        const clean = sanitizeOverlayPayload({
            slug: 'autre-slug',
            og_image: 'https://cdn.example/other.jpg',
            layout_sections: [{ id: 'hero', name: 'Autre' }],
            is_published: false,
            hero: { title: 'EN TITLE' },
        });

        expect(clean).toEqual({ hero: { title: 'EN TITLE' } });
    });

    it('supprime les chaînes vides et les objets vides', () => {
        const clean = sanitizeOverlayPayload({
            hero: { title: 'EN TITLE', subtitle: '   ', badge: '' },
            sections_data: {},
            meta_description: 'English description.',
        });

        expect(clean).toEqual({
            hero: { title: 'EN TITLE' },
            meta_description: 'English description.',
        });
    });

    it('ne filtre jamais l’intérieur d’un tableau (écrit en bloc)', () => {
        const clean = sanitizeOverlayPayload({
            items: [{ title: 'X', desc: '', id: 'anchor' }],
        });
        expect(clean).toEqual({ items: [{ title: 'X', desc: '', id: 'anchor' }] });
    });

    it('écarte un payload non-objet', () => {
        expect(sanitizeOverlayPayload(null)).toEqual({});
        expect(sanitizeOverlayPayload('texte')).toEqual({});
        expect(sanitizeOverlayPayload(['a'])).toEqual({});
    });
});
