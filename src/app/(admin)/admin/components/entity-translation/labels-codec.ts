/**
 * ==============================================================================
 * CUC — Codes de libellés composites (navigation, pied de page)
 * ==============================================================================
 * La navigation et le pied de page ne sont pas des entités à champs plats : ils
 * se traduisent par un dictionnaire `labels` dont les clés encodent l'ancre
 * (`item.id`, `col.id`, `link.id`, `brand.tagline`, `legal.<linkId>`).
 *
 * Ces conventions reproduisent **exactement** les appliers de lecture :
 *   - `applyItemLabels`   (`navigation-labels.ts:43`) ;
 *   - `applyFooterLabels` (`navigation-labels.ts:64`).
 *
 * ------------------------------------------------------------------------------
 * STABILITÉ (piège de l'effet de réalignement)
 * ------------------------------------------------------------------------------
 * Les fonctions d'usine `navigationLabelsCodec()` / `footerLabelsCodec()`
 * renvoient des **constantes de module** : l'identité de l'objet est stable quel
 * que soit le nombre de rendus. Les clés du dictionnaire, elles, dérivent du
 * brouillon passé en argument (`toRow`/`fromRow`), donc le codec lui-même n'est
 * jamais recréé. Un appelant qui composerait son propre codec doit le mémoïser
 * (`useMemo`) — sans quoi l'effet de réalignement de `useEntityTranslation`
 * boucle.
 *
 * Propriété vérifiée : `diffTranslation`/`flattenEditorial` conservent une clé à
 * point comme une clé **littérale** (`labels['brand.tagline']`), pas comme une
 * profondeur : le dictionnaire reste plat dans le payload persisté.
 */

import type { FooterStructure, NavItem, NavigationStructure } from '@/data/navigation';
import type { EntityCodec } from './entity-translation.contract';

/** Ligne d'overlay commune aux deux entités : un unique dictionnaire `labels`. */
export interface LabelsRow {
    labels: Record<string, string>;
}

// ------------------------------------------------------------------------------
// Navigation — clés = `item.id` (et `child.id` des sous-items)
// ------------------------------------------------------------------------------

function collectNavigationLabels(items: readonly NavItem[] | undefined): Record<string, string> {
    const labels: Record<string, string> = {};
    for (const item of items ?? []) {
        if (item.id) labels[item.id] = item.label;
        for (const child of item.children ?? []) {
            if (child.id) labels[child.id] = child.label;
        }
    }
    return labels;
}

const NAVIGATION_LABELS_CODEC: EntityCodec<NavigationStructure, LabelsRow> = {
    entity: 'navigation',
    fields: ['labels'],
    toRow: (draft) => ({ labels: collectNavigationLabels(draft.items) }),
    fromRow: (row, draft) => {
        const labels = row.labels ?? {};
        return {
            ...draft,
            items: (draft.items ?? []).map((item) => ({
                ...item,
                label: labels[item.id] ?? item.label,
                children: item.children
                    ? item.children.map((child) => ({
                        ...child,
                        label: labels[child.id] ?? child.label,
                    }))
                    : item.children,
            })),
        };
    },
};

/** Codec de navigation — constante de module (identité stable garantie). */
export function navigationLabelsCodec(): EntityCodec<NavigationStructure, LabelsRow> {
    return NAVIGATION_LABELS_CODEC;
}

// ------------------------------------------------------------------------------
// Pied de page — `col.id`, `link.id`, `brand.tagline`, `brand.description`,
// `legal.copyright`, `legal.<linkId>`
// ------------------------------------------------------------------------------

function collectFooterLabels(structure: FooterStructure): Record<string, string> {
    const labels: Record<string, string> = {};

    for (const column of structure.columns ?? []) {
        if (column.id) labels[column.id] = column.title;
        for (const link of column.links ?? []) {
            if (link.id) labels[link.id] = link.label;
        }
    }

    if (structure.brand) {
        labels['brand.tagline'] = structure.brand.tagline;
        labels['brand.description'] = structure.brand.description;
    }

    if (structure.legal) {
        labels['legal.copyright'] = structure.legal.copyright;
        for (const link of structure.legal.links ?? []) {
            if (link.id) labels[`legal.${link.id}`] = link.label;
        }
    }

    return labels;
}

const FOOTER_LABELS_CODEC: EntityCodec<FooterStructure, LabelsRow> = {
    entity: 'footer',
    fields: ['labels'],
    toRow: (draft) => ({ labels: collectFooterLabels(draft) }),
    fromRow: (row, draft) => {
        const labels = row.labels ?? {};
        return {
            ...draft,
            columns: (draft.columns ?? []).map((column) => ({
                ...column,
                title: labels[column.id] ?? column.title,
                links: (column.links ?? []).map((link) => ({
                    ...link,
                    label: labels[link.id] ?? link.label,
                })),
            })),
            brand: {
                ...draft.brand,
                tagline: labels['brand.tagline'] ?? draft.brand.tagline,
                description: labels['brand.description'] ?? draft.brand.description,
            },
            legal: {
                ...draft.legal,
                copyright: labels['legal.copyright'] ?? draft.legal.copyright,
                links: (draft.legal.links ?? []).map((link) => ({
                    ...link,
                    // `legal.<id>` fait autorité ; à défaut, on retombe sur l'ancre
                    // nue (compatibilité avec l'ordre de repli de l'applier).
                    label: labels[`legal.${link.id}`] ?? labels[link.id] ?? link.label,
                })),
            },
        };
    },
};

/** Codec de pied de page — constante de module (identité stable garantie). */
export function footerLabelsCodec(): EntityCodec<FooterStructure, LabelsRow> {
    return FOOTER_LABELS_CODEC;
}
