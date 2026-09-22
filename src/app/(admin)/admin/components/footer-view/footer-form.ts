import type { FooterColumn, FooterLink, FooterStructure } from '@/data/navigation';

/** Réindexe les colonnes (ordre séquentiel 1..n). */
export const reindexColumns = (columns: FooterColumn[]): FooterColumn[] =>
    columns.map((column, idx) => ({ ...column, order: idx + 1 }));

/** Colonnes triées par ordre d'affichage. */
export const sortedColumns = (structure: FooterStructure): FooterColumn[] =>
    [...structure.columns].sort((a, b) => a.order - b.order);

/** Liens légaux triés par ordre d'affichage. */
export const sortedLegalLinks = (structure: FooterStructure): FooterLink[] =>
    [...structure.legal.links].sort((a, b) => a.order - b.order);

/** Liens d'une colonne triés par ordre d'affichage. */
export const sortedLinks = (column: FooterColumn): FooterLink[] =>
    [...column.links].sort((a, b) => a.order - b.order);

/** Déplace une colonne ; `null` si le déplacement est hors limites. */
export function moveColumnIn(
    structure: FooterStructure,
    index: number,
    direction: -1 | 1
): FooterStructure | null {
    const columns = sortedColumns(structure);
    const target = index + direction;
    if (target < 0 || target >= columns.length) return null;
    const next = [...columns];
    [next[index], next[target]] = [next[target], next[index]];
    return { ...structure, columns: reindexColumns(next) };
}

export function updateColumnIn(
    structure: FooterStructure,
    id: string,
    updates: Partial<FooterColumn>
): FooterStructure {
    return {
        ...structure,
        columns: structure.columns.map((column) =>
            column.id === id ? { ...column, ...updates } : column
        ),
    };
}

export function removeColumnIn(structure: FooterStructure, id: string): FooterStructure {
    return {
        ...structure,
        columns: reindexColumns(structure.columns.filter((column) => column.id !== id)),
    };
}

/** Ajoute une colonne vierge et retourne son identifiant (pour dépliage). */
export function addColumnTo(
    structure: FooterStructure
): { structure: FooterStructure; columnId: string } {
    const columnId = `col-${Date.now()}`;
    return {
        structure: {
            ...structure,
            columns: reindexColumns([
                ...structure.columns,
                { id: columnId, title: 'Nouvelle colonne', order: 999, is_visible: true, links: [] },
            ]),
        },
        columnId,
    };
}

export function updateLinkIn(
    structure: FooterStructure,
    columnId: string,
    linkId: string,
    updates: Partial<FooterLink>
): FooterStructure {
    return {
        ...structure,
        columns: structure.columns.map((column) =>
            column.id === columnId
                ? {
                    ...column,
                    links: column.links.map((link) =>
                        link.id === linkId ? { ...link, ...updates } : link
                    ),
                }
                : column
        ),
    };
}

/** Déplace un lien dans sa colonne ; `null` si hors limites ou colonne absente. */
export function moveLinkIn(
    structure: FooterStructure,
    columnId: string,
    index: number,
    direction: -1 | 1
): FooterStructure | null {
    const column = structure.columns.find((c) => c.id === columnId);
    if (!column) return null;
    const links = sortedLinks(column);
    const target = index + direction;
    if (target < 0 || target >= links.length) return null;
    [links[index], links[target]] = [links[target], links[index]];
    return {
        ...structure,
        columns: structure.columns.map((c) =>
            c.id === columnId
                ? { ...c, links: links.map((link, idx) => ({ ...link, order: idx + 1 })) }
                : c
        ),
    };
}

export function removeLinkIn(
    structure: FooterStructure,
    columnId: string,
    linkId: string
): FooterStructure {
    return {
        ...structure,
        columns: structure.columns.map((column) =>
            column.id === columnId
                ? {
                    ...column,
                    links: column.links
                        .filter((link) => link.id !== linkId)
                        .map((link, idx) => ({ ...link, order: idx + 1 })),
                }
                : column
        ),
    };
}

/** Ajoute un lien vierge ; `null` si la colonne est absente. */
export function addLinkTo(structure: FooterStructure, columnId: string): FooterStructure | null {
    const column = structure.columns.find((c) => c.id === columnId);
    if (!column) return null;
    return {
        ...structure,
        columns: structure.columns.map((c) =>
            c.id === columnId
                ? {
                    ...c,
                    links: [
                        ...c.links,
                        {
                            id: `link-${Date.now()}`,
                            label: 'Nouveau lien',
                            href: '/',
                            order: c.links.length + 1,
                            is_visible: true,
                        },
                    ],
                }
                : c
        ),
    };
}

export function updateLegalLinkIn(
    structure: FooterStructure,
    linkId: string,
    updates: Partial<FooterLink>
): FooterStructure {
    return {
        ...structure,
        legal: {
            ...structure.legal,
            links: structure.legal.links.map((link) =>
                link.id === linkId ? { ...link, ...updates } : link
            ),
        },
    };
}

export function removeLegalLinkIn(structure: FooterStructure, linkId: string): FooterStructure {
    return {
        ...structure,
        legal: {
            ...structure.legal,
            links: structure.legal.links
                .filter((link) => link.id !== linkId)
                .map((link, idx) => ({ ...link, order: idx + 1 })),
        },
    };
}

/** Ajoute un lien légal vierge (ordre séquentiel en fin de liste). */
export function addLegalLinkTo(structure: FooterStructure): FooterStructure {
    return {
        ...structure,
        legal: {
            ...structure.legal,
            links: [
                ...structure.legal.links,
                {
                    id: `legal-${Date.now()}`,
                    label: 'Nouveau lien légal',
                    href: '/',
                    order: structure.legal.links.length + 1,
                    is_visible: true,
                },
            ],
        },
    };
}
