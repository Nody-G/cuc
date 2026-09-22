import type { SitePageContent } from '@/lib/data/site-service';
import type {
    NavigationStructure,
    FooterStructure,
    SiteSocialLink,
} from '@/data/navigation';
import { collectFooterPaths, collectNavigationPaths } from './path-collectors';
import { normalizeInternalPath, isPlaceholderImage } from './url-rules';
import type { PushIssue } from './types';

export interface CheckOrphansArgs {
    pushIssue: PushIssue;
    pages: SitePageContent[];
    navigation?: NavigationStructure | null;
    footer?: FooterStructure | null;
    socialLinks: SiteSocialLink[];
}

/** 3. Contenu orphelin (page publiée non atteignable) + réseaux sociaux sans URL. */
export function checkContentOrphans({
    pushIssue,
    pages,
    navigation,
    footer,
    socialLinks,
}: CheckOrphansArgs): void {
    const reachable = new Set<string>([
        ...collectNavigationPaths(navigation),
        ...collectFooterPaths(footer),
    ]);

    pages.forEach((page) => {
        if (!page.is_published) return;
        const path = page.slug === '/' ? '/' : normalizeInternalPath(page.slug);
        if (path === '/') return; // La racine est toujours atteignable.
        if (!reachable.has(path)) {
            pushIssue({
                kind: 'orphan',
                severity: 'warning',
                scope: 'Page',
                label: page.title || page.slug,
                message: `Page publiée « ${path} » non référencée dans la navigation ni le pied de page.`,
                value: path,
                hint: 'Ajoutez un lien dans la navigation ou le pied de page, ou repassez la page en brouillon.',
            });
        }
    });

    // Réseaux sociaux déclarés mais sans URL exploitable.
    socialLinks.forEach((link) => {
        if (!link.url || isPlaceholderImage(link.url)) {
            pushIssue({
                kind: 'orphan',
                severity: 'info',
                scope: 'Réseaux sociaux',
                label: link.platform || link.id,
                message: 'Réseau social déclaré sans URL valide.',
                value: link.url,
                hint: 'Renseignez l’URL du profil ou désactivez ce réseau.',
            });
        }
    });
}
