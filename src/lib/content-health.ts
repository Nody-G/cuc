import type {
    SitePageContent,
    SitePartner,
    SiteEvent,
    SiteSettings,
} from '@/lib/data/site-service';
import type {
    NavigationStructure,
    FooterStructure,
    SiteSocialLink,
} from '@/data/navigation';

/**
 * Diagnostic de santé du contenu de la vitrine CUC.
 *
 * Ce module est volontairement **pur** (aucun accès réseau, aucun effet de bord) :
 * il reçoit l'état complet du contenu et retourne une liste d'anomalies
 * exploitables par le Cockpit. Il est donc directement testable sous Vitest.
 *
 * Quatre familles d'anomalies sont détectées :
 *  - `broken-link`   : lien interne pointant vers une route inexistante.
 *  - `missing-image` : image référencée mais absente (URL vide ou fichier local introuvable).
 *  - `orphan`        : contenu publié mais non atteignable depuis la navigation.
 *  - `seo`           : métadonnées manquantes ou trop courtes sur une page publiée.
 */

export type ContentIssueSeverity = 'error' | 'warning' | 'info';

export type ContentIssueKind =
    | 'broken-link'
    | 'missing-image'
    | 'orphan'
    | 'seo';

export interface ContentIssue {
    id: string;
    kind: ContentIssueKind;
    severity: ContentIssueSeverity;
    /** Entité concernée (ex. « Page », « Navigation », « Partenaire »). */
    scope: string;
    /** Libellé lisible de l'élément en cause. */
    label: string;
    /** Description factuelle du problème. */
    message: string;
    /** Valeur fautive (URL, chemin d'image, slug…). */
    value?: string;
    /** Piste de correction concrète. */
    hint?: string;
}

export interface ContentHealthInput {
    pages: SitePageContent[];
    navigation?: NavigationStructure | null;
    footer?: FooterStructure | null;
    socialLinks?: SiteSocialLink[];
    partners?: SitePartner[];
    events?: SiteEvent[];
    settings?: SiteSettings | null;
    /** Chemins de fichiers locaux réellement présents dans `public/`. */
    knownPublicAssets?: string[];
}

export interface ContentHealthReport {
    issues: ContentIssue[];
    counts: Record<ContentIssueKind, number>;
    severityCounts: Record<ContentIssueSeverity, number>;
    /** Score de santé 0–100 (100 = aucun problème). */
    score: number;
    checkedAt: string;
}

const SEVERITY_WEIGHT: Record<ContentIssueSeverity, number> = {
    error: 10,
    warning: 4,
    info: 1,
};

/** Routes statiques connues de l'application (hors pages CMS dynamiques). */
const STATIC_ROUTES = new Set<string>([
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

function isExternalUrl(url: string): boolean {
    return /^(https?:)?\/\//i.test(url) || /^(mailto|tel):/i.test(url);
}

function isAnchorOrQuery(url: string): boolean {
    return url.startsWith('#') || url.startsWith('?');
}

function normalizeInternalPath(url: string): string {
    const withoutHash = url.split('#')[0].split('?')[0];
    if (withoutHash.length > 1 && withoutHash.endsWith('/')) {
        return withoutHash.slice(0, -1);
    }
    return withoutHash || '/';
}

function isPlaceholderImage(url: string): boolean {
    const u = url.trim().toLowerCase();
    return (
        u === '' ||
        u === '#' ||
        u === 'undefined' ||
        u === 'null' ||
        u.includes('placeholder') ||
        u.includes('via.placeholder') ||
        u.includes('example.com')
    );
}

function collectPagePaths(pages: SitePageContent[]): Set<string> {
    const paths = new Set<string>();
    pages.forEach((p) => {
        const slug = p.slug === '/' ? '/' : normalizeInternalPath(p.slug);
        paths.add(slug);
        paths.add(slug === '/' ? '/' : `/${slug.replace(/^\//, '')}`);
    });
    return paths;
}

function collectNavigationPaths(nav?: NavigationStructure | null): Set<string> {
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

function collectFooterPaths(footer?: FooterStructure | null): Set<string> {
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

/**
 * Analyse complète de la santé du contenu.
 */
export function analyzeContentHealth(input: ContentHealthInput): ContentHealthReport {
    const issues: ContentIssue[] = [];
    const {
        pages,
        navigation,
        footer,
        socialLinks = [],
        partners = [],
        events = [],
        settings,
        knownPublicAssets,
    } = input;

    const pagePaths = collectPagePaths(pages);
    const validPaths = new Set<string>([...STATIC_ROUTES, ...pagePaths]);
    const assetSet = knownPublicAssets ? new Set(knownPublicAssets) : null;

    const pushIssue = (issue: Omit<ContentIssue, 'id'>) => {
        issues.push({ ...issue, id: `${issue.kind}:${issue.scope}:${issue.value ?? issue.label}` });
    };

    // ---------------------------------------------------------------------------
    // 1. Liens internes cassés (navigation, footer, CTA de pages)
    // ---------------------------------------------------------------------------
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

    // ---------------------------------------------------------------------------
    // 2. Images manquantes ou non résolues
    // ---------------------------------------------------------------------------
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

    // ---------------------------------------------------------------------------
    // 3. Contenu orphelin (page publiée non atteignable depuis la navigation)
    // ---------------------------------------------------------------------------
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

    // ---------------------------------------------------------------------------
    // 4. Métadonnées SEO manquantes sur les pages publiées
    // ---------------------------------------------------------------------------
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

    // ---------------------------------------------------------------------------
    // Agrégation
    // ---------------------------------------------------------------------------
    const counts: Record<ContentIssueKind, number> = {
        'broken-link': 0,
        'missing-image': 0,
        orphan: 0,
        seo: 0,
    };
    const severityCounts: Record<ContentIssueSeverity, number> = {
        error: 0,
        warning: 0,
        info: 0,
    };

    let penalty = 0;
    issues.forEach((issue) => {
        counts[issue.kind] += 1;
        severityCounts[issue.severity] += 1;
        penalty += SEVERITY_WEIGHT[issue.severity];
    });

    const score = Math.max(0, Math.min(100, 100 - penalty));

    return {
        issues,
        counts,
        severityCounts,
        score,
        checkedAt: new Date().toISOString(),
    };
}
