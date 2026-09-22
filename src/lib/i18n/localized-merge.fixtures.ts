/**
 * Fixtures des tests de fusion FR/EN : contenu de page représentatif et
 * contenu EN tel que le formulaire bilingue du Cockpit le produit.
 * Isolées de la suite pour rester réutilisables et la garder sous le
 * plafond de 300 lignes (AGENTS.md § 2).
 */

/** Contenu de page représentatif : hero, chiffres clés, catalogue à ancres. */
export const PAGE = {
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
export const EN_EDITED = {
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

/** Items du catalogue stages d'un payload de traduction (accès typé). */
export function catalogueItems(
    payload: Record<string, unknown>
): Array<Record<string, unknown>> {
    const sectionsData = payload.sections_data as {
        stages_catalogue?: { items?: Array<Record<string, unknown>> };
    };
    return sectionsData.stages_catalogue?.items ?? [];
}
