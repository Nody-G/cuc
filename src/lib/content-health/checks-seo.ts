import type { SitePageContent } from '@/lib/data/site-service';
import type { PushIssue } from './types';

export interface CheckSeoArgs {
    pushIssue: PushIssue;
    pages: SitePageContent[];
}

/** 4. Métadonnées SEO manquantes sur les pages publiées. */
export function checkContentSeo({ pushIssue, pages }: CheckSeoArgs): void {
    pages.forEach((page) => {
        if (!page.is_published) return;
        const pageLabel = page.title || page.slug;

        if (!page.meta_title || page.meta_title.trim().length < 15) {
            pushIssue({
                kind: 'seo',
                severity: 'warning',
                scope: `Page « ${pageLabel} »`,
                label: 'Titre SEO',
                message: 'Titre SEO absent ou trop court (minimum recommandé : 15 caractères).',
                value: page.meta_title,
                hint: 'Renseignez un titre explicite dans l’onglet SEO.',
            });
        } else if (page.meta_title.length > 65) {
            pushIssue({
                kind: 'seo',
                severity: 'info',
                scope: `Page « ${pageLabel} »`,
                label: 'Titre SEO',
                message: `Titre SEO long (${page.meta_title.length} caractères) : risque de troncature dans les résultats.`,
                value: page.meta_title,
                hint: 'Visez 50–60 caractères.',
            });
        }

        if (!page.meta_description || page.meta_description.trim().length < 50) {
            pushIssue({
                kind: 'seo',
                severity: 'warning',
                scope: `Page « ${pageLabel} »`,
                label: 'Méta-description',
                message: 'Méta-description absente ou trop courte (minimum recommandé : 50 caractères).',
                value: page.meta_description,
                hint: 'Rédigez une description factuelle de 120–155 caractères.',
            });
        } else if (page.meta_description.length > 165) {
            pushIssue({
                kind: 'seo',
                severity: 'info',
                scope: `Page « ${pageLabel} »`,
                label: 'Méta-description',
                message: `Méta-description longue (${page.meta_description.length} caractères).`,
                value: page.meta_description,
                hint: 'Visez 120–155 caractères.',
            });
        }

        if (!page.og_image) {
            pushIssue({
                kind: 'seo',
                severity: 'info',
                scope: `Page « ${pageLabel} »`,
                label: 'Image Open Graph',
                message: 'Aucune image de partage définie.',
                hint: 'Ajoutez un visuel 1200×630 px pour les partages sociaux.',
            });
        }
    });
}
