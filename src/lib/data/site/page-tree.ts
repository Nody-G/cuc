/**
 * Arborescence canonique des pages vitrine — domaine pur (`AGENTS.md` § 1).
 *
 * Trois référentiels se contredisaient jusqu'ici :
 *
 *  1. le **catalogue** (`SITE_PAGE_CATALOG`) portait le nom de la page, son slug
 *     collé entre parenthèses ;
 *  2. la **navigation publiée** donnait un libellé en casse menu, sans dire à
 *     quelle page il correspondait ni où elle se situait dans l'arborescence ;
 *  3. le **pied de page** citait les mêmes pages sous un troisième libellé.
 *
 * Ce module recompose une seule vérité, et une seule : pour chaque page, son nom
 * canonique lisible, son emplacement réel dans le menu (entrée → menu déroulant →
 * sous-page, dans l'ordre publié) et le libellé que le pied de page lui donne.
 * Aucun React, aucune lecture réseau : les données arrivent en arguments.
 */

import type { FooterStructure, NavigationStructure } from '@/data/navigation';
import { SITE_PAGE_CATALOG, toPageKey } from './page-options';

/** Emplacement d'une page dans le menu principal publié. */
export interface MenuPlacement {
    /** Libellé du menu tel que publié (casse menu). */
    menuLabel: string;
    /** Chemin lisible : « STAGES & FORMATIONS › Formation de cascadeur ». */
    menuPath: string;
    /** Position réelle dans son niveau (1 = premier). */
    position: number;
}

/** Une page, son nom canonique et tout ce qui la situe. */
export interface PageTreeEntry {
    /** Clé de comparaison (slug normalisé). */
    key: string;
    /** Nom canonique lisible, casse normale — seul nom de page affiché. */
    label: string;
    /** Libellé du menu publié, `null` si la page n'y figure pas. */
    menuLabel: string | null;
    /** Chemin dans le menu, `null` si la page n'y figure pas. */
    menuPath: string | null;
    /** Position dans le menu, `0` hors menu. */
    position: number;
    /** La page existe dans le catalogue éditable. */
    inCatalog: boolean;
    /** La page existe réellement en base (`site_pages`). */
    inDatabase: boolean;
    /** Libellé du pied de page citant la page, `null` sinon. */
    footerLabel: string | null;
}

/** Entrée de premier niveau du menu et, le cas échéant, ses sous-pages. */
export interface PageTreeMenuGroup {
    id: string;
    menuLabel: string;
    /** Entrée masquée dans le menu publié. */
    isVisible: boolean;
    /** Lien externe : hors périmètre des pages éditables. */
    isExternal: boolean;
    /** Page liée à l'entrée elle-même (`null` pour un menu déroulant ou un externe). */
    page: PageTreeEntry | null;
    /** Sous-pages du menu déroulant, dans l'ordre publié. */
    children: PageTreeEntry[];
}

/** Modèle consommé par les écrans « Pages du Site » et « Menu du Site ». */
export interface PageTree {
    /** Entrées de menu de premier niveau, dans l'ordre publié. */
    groups: PageTreeMenuGroup[];
    /** Pages éditables que le menu ne cite pas (accès direct, pied de page). */
    outsideMenu: PageTreeEntry[];
    /** Toutes les pages connues, indexées par clé normalisée. */
    byKey: Record<string, PageTreeEntry>;
}

export interface BuildPageTreeInput {
    /** Navigation publiée en base (`site_navigation.structure`). */
    navigation?: NavigationStructure | null;
    /** Pied de page publié (`site_footer.structure`). */
    footer?: FooterStructure | null;
    /** Slugs réellement présents en base (`site_pages`). */
    availableSlugs: readonly string[];
}

/** Clé de page d'un href, ou `null` si le lien ne vise pas une page locale. */
function pageKeyOf(href: string | undefined | null): string | null {
    if (typeof href !== 'string') return null;
    const trimmed = href.trim();
    if (trimmed.length === 0) return null;
    // Un lien absolu ou protocolaire ne désigne aucune page du catalogue.
    if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.startsWith('//')) return null;
    const key = toPageKey(trimmed);
    return key.length > 0 ? key : null;
}

function byOrder<T extends { order?: number }>(items: readonly T[]): T[] {
    return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Reconstruit l'emplacement de chaque page citée par le menu, dans l'ordre publié. */
export function collectMenuPlacements(
    navigation: NavigationStructure | null | undefined
): Map<string, MenuPlacement> {
    const placements = new Map<string, MenuPlacement>();

    byOrder(navigation?.items ?? []).forEach((item, itemIndex) => {
        const ownKey = pageKeyOf(item.href);
        if (ownKey && !placements.has(ownKey)) {
            placements.set(ownKey, {
                menuLabel: item.label,
                menuPath: item.label,
                position: item.order ?? itemIndex + 1,
            });
        }

        byOrder(item.children ?? []).forEach((child, childIndex) => {
            const key = pageKeyOf(child.href);
            if (!key || placements.has(key)) return;
            placements.set(key, {
                menuLabel: child.label,
                menuPath: `${item.label} › ${child.label}`,
                position: childIndex + 1,
            });
        });
    });

    return placements;
}

/** Slugs de pages cités par le menu publié (liens et sous-liens). */
export function collectMenuSlugs(
    navigation: NavigationStructure | null | undefined
): Set<string> {
    return new Set(collectMenuPlacements(navigation).keys());
}

/** Premier libellé que le pied de page donne à chaque page citée. */
export function collectFooterLabels(
    footer: FooterStructure | null | undefined
): Map<string, string> {
    const labels = new Map<string, string>();

    for (const column of footer?.columns ?? []) {
        for (const link of column.links ?? []) {
            const key = pageKeyOf(link.href);
            if (key && !labels.has(key)) labels.set(key, link.label);
        }
    }

    for (const link of footer?.legal?.links ?? []) {
        const key = pageKeyOf(link.href);
        if (key && !labels.has(key)) labels.set(key, link.label);
    }

    return labels;
}

function makeEntry(
    key: string,
    available: ReadonlySet<string>,
    placements: ReadonlyMap<string, MenuPlacement>,
    footerLabels: ReadonlyMap<string, string>
): PageTreeEntry {
    const catalogLabel = SITE_PAGE_CATALOG.find(
        (entry) => toPageKey(entry.value) === key
    )?.label;
    const placement = placements.get(key);

    return {
        key,
        // Le nom canonique lisible du catalogue prime ; à défaut, on affiche le
        // libellé du menu plutôt qu'un slug que personne ne lit.
        label: catalogLabel ?? placement?.menuLabel ?? key,
        menuLabel: placement?.menuLabel ?? null,
        menuPath: placement?.menuPath ?? null,
        position: placement?.position ?? 0,
        inCatalog: Boolean(catalogLabel),
        inDatabase: available.has(key),
        footerLabel: footerLabels.get(key) ?? null,
    };
}

/** Reconstruit l'arborescence canonique des pages vitrine. */
export function buildPageTree({
    navigation,
    footer,
    availableSlugs,
}: BuildPageTreeInput): PageTree {
    const available = new Set(availableSlugs.map(toPageKey));
    const placements = collectMenuPlacements(navigation);
    const footerLabels = collectFooterLabels(footer);
    const entry = (key: string) => makeEntry(key, available, placements, footerLabels);

    const groups: PageTreeMenuGroup[] = byOrder(navigation?.items ?? []).map((item) => {
        const isExternal = item.type === 'external';
        const ownKey = pageKeyOf(item.href);
        const children = byOrder(item.children ?? [])
            .map((child) => pageKeyOf(child.href))
            .filter((key): key is string => key !== null)
            .map(entry);

        return {
            id: item.id,
            menuLabel: item.label,
            isVisible: item.is_visible !== false,
            isExternal,
            page: ownKey ? entry(ownKey) : null,
            children,
        };
    });

    const menuKeys = new Set(placements.keys());
    const outsideMenu = SITE_PAGE_CATALOG.filter(
        (choice) => !menuKeys.has(toPageKey(choice.value))
    ).map((choice) => entry(toPageKey(choice.value)));

    const byKey: Record<string, PageTreeEntry> = {};
    for (const group of groups) {
        if (group.page) byKey[group.page.key] = group.page;
        for (const child of group.children) byKey[child.key] = child;
    }
    for (const page of outsideMenu) byKey[page.key] = page;

    return { groups, outsideMenu, byKey };
}

/** Toutes les pages citées par le menu (entrées de premier niveau et sous-pages). */
export function menuPages(tree: PageTree): PageTreeEntry[] {
    return tree.groups
        .flatMap((group) => [group.page, ...group.children])
        .filter((page): page is PageTreeEntry => page !== null);
}

/**
 * Pages citées par le menu mais **absentes du catalogue éditable** : elles
 * s'affichent sur la vitrine sans qu'on puisse en éditer le contenu.
 */
export function menuPagesOutsideCatalog(tree: PageTree): PageTreeEntry[] {
    return menuPages(tree).filter((page) => !page.inCatalog);
}

/** Résout l'entrée d'une page depuis un slug (`null` si inconnue de l'arbre). */
export function findPageTreeEntry(tree: PageTree, slug: string): PageTreeEntry | null {
    return tree.byKey[toPageKey(slug)] ?? null;
}
