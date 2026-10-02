import type { SitePageContent } from '@/lib/data/site-service';
import type { NavigationStructure, FooterStructure } from '@/data/navigation';
import { SITE_PAGE_CATALOG } from '@/lib/data/site/page-options';
import { isAnchorOrQuery, isExternalUrl, normalizeInternalPath } from './url-rules';

/**
 * Routes statiques **réellement servies** par la vitrine (hors pages CMS
 * dynamiques, ajoutées à la volée par `collectPagePaths`).
 *
 * Source unique de vérité : `SITE_PAGE_CATALOG`
 * (`src/lib/data/site/page-options.ts:32`), l'inventaire canonique des pages.
 * Chaque entrée y possède son dossier de route sous
 * `src/app/(site)/[locale]/<slug>/` et figure au sitemap
 * (`src/app/sitemap.ts:51-71`) ainsi qu'au registre d'aperçu
 * (`src/app/(site)/[locale]/preview/screens.ts:31-47`). Dériver de cette source
 * évite une seconde liste qui re-divergerait : l'ancienne liste codée en dur
 * déclarait `/visite` (aucun dossier `src/app/(site)/[locale]/visite/`) et
 * omettait sept routes réellement servies (`videos-cascadeur`, `visite-guidee`,
 * `visite-virtuelle`, `cuc-events-agence`, `spectacles-cascadeurs-yamakasi`,
 * `animations-airbag-parkour`, `stunt-workshop-cuc`).
 */
export const STATIC_ROUTES: Set<string> = new Set<string>(
    SITE_PAGE_CATALOG.map((entry) => (entry.value === '/' ? '/' : `/${entry.value}`)),
);

export function collectPagePaths(pages: SitePageContent[]): Set<string> {
    const paths = new Set<string>();
    pages.forEach((p) => {
        // `normalizeInternalPath` canonise déjà en chemin absolu : le slug
        // stocké sans slash initial (`site_pages.slug`) et un `href` absolu
        // produisent la même clé, un seul ajout suffit.
        paths.add(p.slug === '/' ? '/' : normalizeInternalPath(p.slug));
    });
    return paths;
}

export function collectNavigationPaths(nav?: NavigationStructure | null): Set<string> {
    const paths = new Set<string>();
    if (!nav) return paths;

    const add = (href?: string) => {
        if (!href || isExternalUrl(href) || isAnchorOrQuery(href)) return;
        paths.add(normalizeInternalPath(href));
    };

    nav.items?.forEach((item) => {
        add(item.href);
        item.children?.forEach((child) => add(child.href));
    });
    add(nav.cta?.href);

    return paths;
}

export function collectFooterPaths(footer?: FooterStructure | null): Set<string> {
    const paths = new Set<string>();
    if (!footer) return paths;

    const add = (href?: string) => {
        if (!href || isExternalUrl(href) || isAnchorOrQuery(href)) return;
        paths.add(normalizeInternalPath(href));
    };

    footer.columns?.forEach((column) => {
        column.links?.forEach((link) => add(link.href));
    });
    footer.legal?.links?.forEach((link) => add(link.href));

    return paths;
}
