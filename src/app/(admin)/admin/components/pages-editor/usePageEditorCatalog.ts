'use client';

import { useMemo } from 'react';
import {
    DEFAULT_PAGE_CONTENTS,
    normalizeSlug,
    type SitePageContent,
} from '@/lib/data/site-service';
import { readsBlockStructure } from '@/lib/data/site/page-options';

export interface PageEditorCatalog {
    /** Catalogue de blocs de la page — sert à réintégrer un bloc retiré. */
    defaultLayoutSections: NonNullable<SitePageContent['layout_sections']>;
    /** `false` si la vitrine n'applique pas `layout_sections` sur cette page. */
    blockStructureSupported: boolean;
}

/**
 * Catalogue de blocs de la page éditée.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : dérivation pure, aucune
 * requête réseau. L'arborescence des pages ne vit plus ici — elle vient de la
 * navigation publiée (`site-tree/usePageTree`) : ce hook ne répond que d'une
 * question, « quels blocs cette page peut-elle réellement porter ».
 */
export function usePageEditorCatalog(selectedSlug: string): PageEditorCatalog {
    const cleanSlug = normalizeSlug(selectedSlug);

    const defaultLayoutSections = useMemo(
        () => DEFAULT_PAGE_CONTENTS[cleanSlug]?.layout_sections ?? [],
        [cleanSlug]
    );

    return {
        defaultLayoutSections,
        blockStructureSupported: readsBlockStructure(cleanSlug),
    };
}
