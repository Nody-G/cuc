import type { SitePageContent } from '@/lib/data/site-service';
import type { NavigationStructure, FooterStructure } from '@/data/navigation';
import { isAnchorOrQuery, isExternalUrl, normalizeInternalPath } from './url-rules';
import type { PushIssue } from './types';

export interface CheckLinksArgs {
    validPaths: Set<string>;
    pushIssue: PushIssue;
    pages: SitePageContent[];
    navigation?: NavigationStructure | null;
    footer?: FooterStructure | null;
}

/** 1. Liens internes cassés (navigation, footer, CTA de pages). */
export function checkContentLinks({
    validPaths,
    pushIssue,
    pages,
    navigation,
    footer,
}: CheckLinksArgs): void {
    const checkLink = (href: string | undefined, scope: string, label: string) => {
        if (!href || isExternalUrl(href) || isAnchorOrQuery(href)) return;
        const path = normalizeInternalPath(href);
        if (!validPaths.has(path)) {
            pushIssue({
                kind: 'broken-link',
                severity: 'error',
                scope,
                label,
                message: `Lien interne « ${href} » sans route correspondante.`,
                value: href,
                hint: 'Corrigez le lien ou créez la page manquante dans l’éditeur de pages.',
            });
        }
    };

    navigation?.items?.forEach((item) => {
        checkLink(item.href, 'Navigation', item.label);
        item.children?.forEach((child) => checkLink(child.href, 'Navigation', child.label));
    });
    if (navigation?.cta) {
        checkLink(navigation.cta.href, 'Navigation (CTA)', navigation.cta.label);
    }

    footer?.columns?.forEach((column) => {
        column.links?.forEach((link) => checkLink(link.href, 'Pied de page', link.label));
    });
    footer?.legal?.links?.forEach((link) => checkLink(link.href, 'Pied de page (légal)', link.label));

    pages.forEach((page) => {
        const pageLabel = page.title || page.slug;
        checkLink(page.hero?.cta_primary_link, `Page « ${pageLabel} »`, page.hero?.cta_primary_text || 'CTA principal');
        checkLink(page.hero?.cta_secondary_link, `Page « ${pageLabel} »`, page.hero?.cta_secondary_text || 'CTA secondaire');
    });
}
