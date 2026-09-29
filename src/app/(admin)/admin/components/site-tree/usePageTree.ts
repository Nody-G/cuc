'use client';

/**
 * Chargement de l'arborescence canonique des pages — couche « Hooks &
 * Orchestration » (`AGENTS.md` § 1).
 *
 * L'écran d'édition ne lit plus `DEFAULT_NAVIGATION` : il lit la navigation
 * **publiée** en base, la seule que voit la vitrine. Sans cela, un menu modifié
 * au Cockpit continuait d'afficher l'ancienne arborescence dans l'éditeur de
 * pages — deux vérités pour une même page.
 */

import { useEffect, useMemo, useState } from 'react';
import type { FooterStructure, NavigationStructure } from '@/data/navigation';
import { getFooter, getNavigation } from '@/lib/data/site-service';
import type { SitePageContent } from '@/lib/data/site-service';
import { buildPageTree, type PageTree } from '@/lib/data/site/page-tree';

export interface PageTreeController {
    tree: PageTree;
    /** `true` tant que la navigation et le pied de page publiés ne sont pas lus. */
    isLoading: boolean;
}

/** Construit l'arbre canonique à partir des pages réellement en base. */
export function usePageTree(pages: readonly SitePageContent[]): PageTreeController {
    const [navigation, setNavigation] = useState<NavigationStructure | null>(null);
    const [footer, setFooter] = useState<FooterStructure | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        Promise.all([getNavigation('main'), getFooter('main')])
            .then(([nav, foot]) => {
                if (cancelled) return;
                setNavigation(nav.structure);
                setFooter(foot.structure);
            })
            .catch(() => {
                // Repli assumé : sans référentiel publié, l'arbre se réduit aux
                // pages hors menu. On ne fabrique aucun emplacement.
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const availableSlugs = useMemo(() => pages.map((page) => page.slug), [pages]);

    const tree = useMemo(
        () => buildPageTree({ navigation, footer, availableSlugs }),
        [navigation, footer, availableSlugs]
    );

    return { tree, isLoading };
}
