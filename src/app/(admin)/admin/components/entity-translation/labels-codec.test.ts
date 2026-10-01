/**
 * Tests du domaine « libellés composites » (navigation, pied de page).
 *
 * Les clés doivent reproduire **exactement** les conventions des appliers
 * `applyItemLabels` / `applyFooterLabels` (`navigation-labels.ts`), et les
 * usines doivent renvoyer une identité stable (constante de module) pour ne pas
 * déclencher la boucle de l'effet de réalignement de `useEntityTranslation`.
 */

import { footerLabelsCodec, navigationLabelsCodec } from './labels-codec';
import type { FooterStructure, NavigationStructure } from '@/data/navigation';

const navigation: NavigationStructure = {
    cta: { label: 'Nous contacter', href: '/contact' },
    items: [
        { id: 'home', label: 'ACCUEIL', href: '/', type: 'link', order: 1, is_visible: true },
        {
            id: 'formations',
            label: 'STAGES & FORMATIONS',
            type: 'dropdown',
            order: 2,
            is_visible: true,
            children: [
                {
                    id: 'formation-pro',
                    label: 'FORMATION PRO',
                    href: '/formation-de-cascadeur',
                    order: 1,
                    is_visible: true,
                },
            ],
        },
    ],
};

describe('navigationLabelsCodec', () => {
    it('dérive les clés des `item.id` et `child.id`', () => {
        const row = navigationLabelsCodec().toRow(navigation);
        expect(row.labels).toEqual({
            home: 'ACCUEIL',
            formations: 'STAGES & FORMATIONS',
            'formation-pro': 'FORMATION PRO',
        });
    });

    it('applique les libellés et laisse le français quand la clé manque', () => {
        const next = navigationLabelsCodec().fromRow({ labels: { home: 'HOME' } }, navigation);
        expect(next.items[0].label).toBe('HOME');
        expect(next.items[1].label).toBe('STAGES & FORMATIONS');
        expect(next.items[1].children?.[0].label).toBe('FORMATION PRO');
    });

    it('est une constante de module (identité stable)', () => {
        expect(navigationLabelsCodec()).toBe(navigationLabelsCodec());
    });
});

const footer: FooterStructure = {
    brand: {
        name: 'CAMPUS UNIVERS CASCADES',
        tagline: 'Fondé en 2008 • Plus grande école au monde',
        description: 'Description française',
    },
    columns: [
        {
            id: 'formations',
            title: 'Formations',
            order: 1,
            is_visible: true,
            links: [
                {
                    id: 'formation-pro-2ans',
                    label: 'Formation Pro 2 ans',
                    href: '/formation-de-cascadeur',
                    order: 1,
                    is_visible: true,
                },
            ],
        },
    ],
    legal: {
        copyright: '© CUC',
        links: [
            { id: 'mentions', label: 'Mentions légales', href: '/mentions', order: 1, is_visible: true },
        ],
    },
};

describe('footerLabelsCodec', () => {
    it('dérive les clés col.id, link.id, brand.* et legal.*', () => {
        const row = footerLabelsCodec().toRow(footer);
        expect(row.labels).toEqual({
            formations: 'Formations',
            'formation-pro-2ans': 'Formation Pro 2 ans',
            'brand.tagline': 'Fondé en 2008 • Plus grande école au monde',
            'brand.description': 'Description française',
            'legal.copyright': '© CUC',
            'legal.mentions': 'Mentions légales',
        });
    });

    it('applique les libellés (repli `legal.<id>` puis id nu, français sinon)', () => {
        const next = footerLabelsCodec().fromRow(
            {
                labels: {
                    'brand.tagline': 'Founded in 2008',
                    'legal.copyright': '© CUC EN',
                    'legal.mentions': 'Legal notice',
                },
            },
            footer
        );
        expect(next.brand.tagline).toBe('Founded in 2008');
        expect(next.brand.description).toBe('Description française');
        expect(next.columns[0].title).toBe('Formations');
        expect(next.columns[0].links[0].label).toBe('Formation Pro 2 ans');
        expect(next.legal.copyright).toBe('© CUC EN');
        expect(next.legal.links[0].label).toBe('Legal notice');
    });

    it('est stable et conserve l’ordre de dérivation des clés', () => {
        expect(footerLabelsCodec()).toBe(footerLabelsCodec());
        const first = footerLabelsCodec().toRow(footer).labels;
        const second = footerLabelsCodec().toRow(footer).labels;
        expect(Object.keys(first)).toEqual(Object.keys(second));
    });
});
