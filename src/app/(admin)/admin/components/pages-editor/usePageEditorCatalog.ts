'use client';

import { useMemo } from 'react';
import {
    DEFAULT_PAGE_CONTENTS,
    normalizeSlug,
    type SitePageContent,
} from '@/lib/data/site-service';
import { DEFAULT_NAVIGATION } from '@/data/navigation';
import {
    buildPageGroups,
    collectMenuSlugs,
    readsBlockStructure,
    type PageChoiceGroup,
} from '@/lib/data/site/page-options';

export interface PageEditorCatalog {
    /** Pages réellement en base, groupées « au menu » / « hors menu ». */
    pageGroups: PageChoiceGroup[];
    /** Catalogue de blocs de la page — sert à réintégrer un bloc retiré. */
    defaultLayoutSections: NonNullable<SitePageContent['layout_sections']>;
    /** `false` si la vitrine n'applique pas `layout_sections` sur cette page. */
    blockStructureSupported: boolean;
}

/**
 * Contexte de l'éditeur de pages : quelles pages existent, et lesquelles
 * honorent réellement la structure des blocs.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : dérivations pures, aucune
 * requête réseau — la liste des pages vient de ce que la base a renvoyé.
 */
export function usePageEditorCatalog(
    pages: SitePageContent[],
    selectedSlug: string
): PageEditorCatalog {
    const cleanSlug = normalizeSlug(selectedSlug);

    const pageGroups = useMemo(
        () =>
            buildPageGroups({
                availableSlugs: pages.map((page) => page.slug),
                menuSlugs: collectMenuSlugs(DEFAULT_NAVIGATION),
            }),
        [pages]
    );

    return {
        pageGroups,
        defaultLayoutSections: DEFAULT_PAGE_CONTENTS[cleanSlug]?.layout_sections ?? [],
        blockStructureSupported: readsBlockStructure(cleanSlug),
    };
}
