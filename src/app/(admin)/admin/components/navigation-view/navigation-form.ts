import type {
    NavChildItem,
    NavItem,
    NavItemType,
    NavigationStructure,
} from '@/data/navigation';

export const TYPE_LABELS: Record<NavItemType, string> = {
    link: 'Lien simple',
    dropdown: 'Menu déroulant',
    external: 'Lien externe',
};

const reindex = (items: NavItem[]): NavItem[] =>
    items.map((item, idx) => ({ ...item, order: idx + 1 }));

/** Entrées triées par ordre d'affichage. */
export const sortedItems = (structure: NavigationStructure): NavItem[] =>
    [...structure.items].sort((a, b) => a.order - b.order);

/** Sous-entrées d'un item triées par ordre d'affichage. */
export const sortedChildren = (item: NavItem): NavChildItem[] =>
    [...(item.children || [])].sort((a, b) => a.order - b.order);

/** Déplace une entrée ; `null` si le déplacement est hors limites. */
export function moveItemIn(
    structure: NavigationStructure,
    index: number,
    direction: -1 | 1
): NavigationStructure | null {
    const items = sortedItems(structure);
    const target = index + direction;
    if (target < 0 || target >= items.length) return null;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    return { ...structure, items: reindex(next) };
}

export function updateItemIn(
    structure: NavigationStructure,
    id: string,
    updates: Partial<NavItem>
): NavigationStructure {
    return {
        ...structure,
        items: structure.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    };
}

export function removeItemIn(structure: NavigationStructure, id: string): NavigationStructure {
    return {
        ...structure,
        items: reindex(structure.items.filter((item) => item.id !== id)),
    };
}

/** Ajoute une entrée vierge et retourne son identifiant (pour dépliage). */
export function addItemTo(
    structure: NavigationStructure
): { structure: NavigationStructure; itemId: string } {
    const itemId = `nav-${Date.now()}`;
    return {
        structure: {
            ...structure,
            items: reindex([
                ...structure.items,
                {
                    id: itemId,
                    label: 'Nouvelle entrée',
                    href: '/',
                    type: 'link',
                    order: 999,
                    is_visible: true,
                },
            ]),
        },
        itemId,
    };
}

export function updateChildIn(
    structure: NavigationStructure,
    parentId: string,
    childId: string,
    updates: Partial<NavChildItem>
): NavigationStructure {
    return {
        ...structure,
        items: structure.items.map((item) =>
            item.id === parentId
                ? {
                    ...item,
                    children: (item.children || []).map((child) =>
                        child.id === childId ? { ...child, ...updates } : child
                    ),
                }
                : item
        ),
    };
}

/** Déplace une sous-entrée ; `null` si hors limites ou item parent absent. */
export function moveChildIn(
    structure: NavigationStructure,
    parentId: string,
    index: number,
    direction: -1 | 1
): NavigationStructure | null {
    const parent = structure.items.find((item) => item.id === parentId);
    if (!parent) return null;
    const children = sortedChildren(parent);
    const target = index + direction;
    if (target < 0 || target >= children.length) return null;
    [children[index], children[target]] = [children[target], children[index]];
    return {
        ...structure,
        items: structure.items.map((item) =>
            item.id === parentId
                ? { ...item, children: children.map((child, idx) => ({ ...child, order: idx + 1 })) }
                : item
        ),
    };
}

export function removeChildIn(
    structure: NavigationStructure,
    parentId: string,
    childId: string
): NavigationStructure {
    return {
        ...structure,
        items: structure.items.map((item) =>
            item.id === parentId
                ? {
                    ...item,
                    children: (item.children || [])
                        .filter((child) => child.id !== childId)
                        .map((child, idx) => ({ ...child, order: idx + 1 })),
                }
                : item
        ),
    };
}

/** Ajoute une sous-entrée vierge ; `null` si l'item parent est absent. */
export function addChildTo(
    structure: NavigationStructure,
    parentId: string
): NavigationStructure | null {
    const parent = structure.items.find((item) => item.id === parentId);
    if (!parent) return null;
    const children = parent.children || [];
    return {
        ...structure,
        items: structure.items.map((item) =>
            item.id === parentId
                ? {
                    ...item,
                    children: [
                        ...children,
                        {
                            id: `child-${Date.now()}`,
                            label: 'Nouvelle sous-entrée',
                            description: '',
                            href: '/',
                            order: children.length + 1,
                            is_visible: true,
                        },
                    ],
                }
                : item
        ),
    };
}
