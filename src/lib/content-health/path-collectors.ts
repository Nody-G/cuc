import type { SitePageContent } from '@/lib/data/site-service';
import type { NavigationStructure, FooterStructure } from '@/data/navigation';
import { isAnchorOrQuery, isExternalUrl, normalizeInternalPath } from './url-rules';

/** Routes statiques connues de l'application (hors pages CMS dynamiques). */
export const STATIC_ROUTES = new Set<string>([
    '/',
    '/formation-de-cascadeur',
    '/stages-cascades-parkour-2',
    '/equipe-cascadeurs-pro',
    '/cuc-team-cascadeur',
    '/contact-cuc',
    '/team-building-cascades',
    '/visite',
    '/hall-of-fame',
    '/partenaires',
    '/evenements',
    '/mentions-legales',
    '/politique-de-confidentialite',
    '/cgv',
]);

export function collectPagePaths(pages: SitePageContent[]): Set<string> {
    const paths = new Set<string>();
    pages.forEach((p) => {
        const slug = p.slug === '/' ? '/' : normalizeInternalPath(p.slug);
        paths.add(slug);
        paths.add(slug === '/' ? '/' : `/${slug.replace(/^\//, '')}`);
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
