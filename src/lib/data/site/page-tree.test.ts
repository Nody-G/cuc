/**
 * Tests de l'arborescence canonique des pages — et garde-fous d'identité.
 *
 * Le défaut d'origine : la même page portait trois noms selon l'écran (catalogue
 * « Formation Pro 2 Ans (/formation-de-cascadeur) », menu « FORMATION DE
 * CASCADEUR », pied de page « Formation Pro 2 ans »), et l'éditeur ignorait où
 * elle vivait dans le menu. Ces tests figent la vérité unique : un nom canonique
 * par page, un emplacement réel, et des référentiels qui citent **les mêmes
 * pages**.
 */

import { DEFAULT_FOOTER, DEFAULT_NAVIGATION } from '@/data/navigation';
import { SITE_PAGE_CATALOG, catalogPageLabel, toPageKey } from './page-options';
import {
    buildPageTree,
    collectFooterLabels,
    collectMenuPlacements,
    collectMenuSlugs,
    findPageTreeEntry,
    menuPagesOutsideCatalog,
} from './page-tree';

/** Tous les slugs du catalogue : la vitrine est complète dans ces tests. */
const ALL_SLUGS = SITE_PAGE_CATALOG.map((entry) => toPageKey(entry.value));

function buildDefaultTree() {
    return buildPageTree({
        navigation: DEFAULT_NAVIGATION.structure,
        footer: DEFAULT_FOOTER.structure,
        availableSlugs: ALL_SLUGS,
    });
}

describe('collectMenuPlacements', () => {
    it('situe une entrée de premier niveau', () => {
        const placements = collectMenuPlacements(DEFAULT_NAVIGATION.structure);
        const contact = placements.get('contact-cuc');
        expect(contact?.menuLabel).toBe('CONTACT');
        expect(contact?.menuPath).toBe('CONTACT');
        expect(contact?.position).toBe(10);
    });

    it('situe une sous-page sous son menu déroulant', () => {
        const placements = collectMenuPlacements(DEFAULT_NAVIGATION.structure);
        const formation = placements.get('formation-de-cascadeur');
        expect(formation?.menuPath).toBe('STAGES & FORMATIONS › FORMATION DE CASCADEUR');
        expect(formation?.position).toBe(1);
    });

    it('ignore ce qui n’est pas une page locale', () => {
        const slugs = collectMenuSlugs(DEFAULT_NAVIGATION.structure);
        expect(slugs.has('contact-cuc')).toBe(true);
        expect(slugs.has('visite-virtuelle')).toBe(false);
        // La boutique est un lien externe : aucune page du catalogue.
        expect(slugs.has('campus-universcascades')).toBe(false);
    });

    it('tolère une navigation absente', () => {
        expect(collectMenuSlugs(null).size).toBe(0);
        expect(collectMenuSlugs(undefined).size).toBe(0);
    });
});

describe('collectFooterLabels', () => {
    it('reconnaît la page derrière une ancre de pied de page', () => {
        const labels = collectFooterLabels(DEFAULT_FOOTER.structure);
        expect(labels.get('formation-de-cascadeur')).toBe('Formation Pro 2 ans');
        expect(labels.get('visite-guidee')).toBe('Visite Guidée du Campus');
    });

    it('tolère un pied de page absent', () => {
        expect(collectFooterLabels(null).size).toBe(0);
    });
});

describe('buildPageTree', () => {
    it('rend les entrées de menu dans l’ordre publié, sous-pages incluses', () => {
        const tree = buildDefaultTree();
        const ids = tree.groups.map((group) => group.id);

        expect(ids[0]).toBe('home');
        expect(ids[1]).toBe('campus');
        expect(ids[2]).toBe('formations');

        const formations = tree.groups[2];
        expect(formations.children.map((child) => child.key)).toEqual([
            'formation-de-cascadeur',
            'stages-cascades-parkour-2',
            'stunt-workshop-cuc',
        ]);
    });

    it('affiche le nom canonique et garde le libellé du menu à côté', () => {
        const tree = buildDefaultTree();
        const contact = tree.byKey['contact-cuc'];

        expect(contact.label).toBe('Contact & accès');
        expect(contact.menuLabel).toBe('CONTACT');
        expect(contact.footerLabel).not.toBeNull();
    });

    it('range hors menu les pages que le menu ne cite pas', () => {
        const tree = buildDefaultTree();
        const keys = tree.outsideMenu.map((page) => page.key);

        expect(keys).toContain('visite-virtuelle');
        expect(tree.byKey['visite-virtuelle'].menuPath).toBeNull();
        expect(tree.byKey['visite-virtuelle'].footerLabel).toBe('Visite Virtuelle 360°');
    });

    it('résout une page depuis un slug, dans n’importe quel format', () => {
        const tree = buildDefaultTree();
        expect(findPageTreeEntry(tree, '/contact-cuc')?.label).toBe('Contact & accès');
        expect(findPageTreeEntry(tree, 'contact-cuc#acces')?.label).toBe('Contact & accès');
        expect(findPageTreeEntry(tree, 'page-inconnue')).toBeNull();
    });

    it('signale une page citée par le menu mais absente de la base', () => {
        const tree = buildPageTree({
            navigation: DEFAULT_NAVIGATION.structure,
            footer: null,
            availableSlugs: [],
        });
        expect(tree.byKey['contact-cuc'].inDatabase).toBe(false);
    });
});

describe('Garde-fou — une seule vérité de nommage', () => {
    it('le menu ne cite aucune page hors catalogue éditable', () => {
        const outside = menuPagesOutsideCatalog(buildDefaultTree()).map((page) => page.key);
        expect(
            outside,
            `Pages du menu sans entrée au catalogue (donc non éditables dans le Cockpit) : ${outside.join(', ')}`
        ).toEqual([]);
    });

    it('le nom affiché vient toujours du catalogue, jamais du menu', () => {
        const tree = buildDefaultTree();
        for (const entry of SITE_PAGE_CATALOG) {
            const key = toPageKey(entry.value);
            expect(tree.byKey[key].label).toBe(catalogPageLabel(entry.value));
        }
    });

    it('le pied de page ne cite que des pages connues, avec un libellé non vide', () => {
        const tree = buildDefaultTree();
        const labels = collectFooterLabels(DEFAULT_FOOTER.structure);

        for (const [key, label] of labels) {
            expect(label.trim().length).toBeGreaterThan(0);
            expect(
                tree.byKey[key],
                `Le pied de page cite « ${label} » (/${key}) qui n'existe dans aucune arborescence.`
            ).toBeDefined();
            expect(tree.byKey[key].footerLabel).toBe(label);
        }
    });

    it('aucune page du catalogue ne reste orpheline des deux référentiels', () => {
        const tree = buildDefaultTree();
        const orphans = SITE_PAGE_CATALOG.map((entry) => toPageKey(entry.value)).filter(
            (key) => tree.byKey[key].menuPath === null && tree.byKey[key].footerLabel === null
        );
        expect(orphans).toEqual([]);
    });
});
