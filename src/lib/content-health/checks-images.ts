import type {
    SitePageContent,
    SitePartner,
    SiteEvent,
    SiteSettings,
} from '@/lib/data/site-service';
import { isExternalUrl, isPlaceholderImage } from './url-rules';
import type { PushIssue } from './types';

export interface CheckImagesArgs {
    pushIssue: PushIssue;
    pages: SitePageContent[];
    partners: SitePartner[];
    events: SiteEvent[];
    settings?: SiteSettings | null;
    /** Jeu d'assets locaux connus (null = pas de vérification d'existence). */
    assetSet: Set<string> | null;
}

/** 2. Images manquantes ou non résolues. */
export function checkContentImages({
    pushIssue,
    pages,
    partners,
    events,
    settings,
    assetSet,
}: CheckImagesArgs): void {
    const checkImage = (url: string | undefined, scope: string, label: string) => {
        if (!url) return;
        if (isPlaceholderImage(url)) {
            pushIssue({
                kind: 'missing-image',
                severity: 'warning',
                scope,
                label,
                message: 'Image référencée mais vide ou de substitution.',
                value: url,
                hint: 'Sélectionnez un visuel définitif depuis la médiathèque.',
            });
            return;
        }
        if (isExternalUrl(url)) return;

        // Fichier local : vérifier l'existence si la liste des assets est fournie.
        if (assetSet && url.startsWith('/')) {
            const clean = url.split('?')[0].split('#')[0];
            if (!assetSet.has(clean)) {
                pushIssue({
                    kind: 'missing-image',
                    severity: 'error',
                    scope,
                    label,
                    message: `Fichier local introuvable : ${clean}`,
                    value: url,
                    hint: 'Téléversez le fichier dans public/ ou choisissez une autre image.',
                });
            }
        }
    };

    pages.forEach((page) => {
        const pageLabel = page.title || page.slug;
        checkImage(page.og_image, `Page « ${pageLabel} »`, 'Image Open Graph');
        checkImage(page.hero?.bg_image, `Page « ${pageLabel} »`, 'Image de fond du hero');
        page.sections?.forEach((section) => {
            checkImage(section.image, `Page « ${pageLabel} »`, `Section « ${section.title} »`);
        });
    });

    partners.forEach((partner) => {
        checkImage(partner.logo_url, 'Partenaire', partner.name);
    });

    events.forEach((event) => {
        checkImage(event.image_url, 'Événement', event.title);
    });

    checkImage(settings?.logo_url, 'Paramètres', 'Logo du campus');
    checkImage(settings?.favicon_url, 'Paramètres', 'Favicon');
}
