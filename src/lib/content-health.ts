import { checkContentLinks } from './content-health/checks-links';
import { checkContentImages } from './content-health/checks-images';
import { checkContentOrphans } from './content-health/checks-orphans';
import { checkContentSeo } from './content-health/checks-seo';
import { checkContentRoles } from './content-health/checks-roles';
import { STATIC_ROUTES, collectPagePaths } from './content-health/path-collectors';
import {
    SCORE_EXEMPT_KINDS,
    SEVERITY_WEIGHT,
    type ContentHealthInput,
    type ContentHealthReport,
    type ContentIssue,
    type ContentIssueKind,
    type ContentIssueSeverity,
    type PushIssue,
} from './content-health/types';

export type {
    ContentIssue,
    ContentIssueKind,
    ContentIssueSeverity,
    ContentHealthInput,
    ContentHealthReport,
} from './content-health/types';

/**
 * Diagnostic de santé du contenu de la vitrine CUC.
 *
 * Ce module est volontairement **pur** (aucun accès réseau, aucun effet de bord) :
 * il reçoit l'état complet du contenu et retourne une liste d'anomalies
 * exploitables par le Cockpit. Il est donc directement testable sous Vitest.
 *
 * Cinq familles d'anomalies sont détectées :
 *  - `broken-link`   : lien interne pointant vers une route inexistante.
 *  - `missing-image` : image référencée mais absente (URL vide ou fichier local introuvable).
 *  - `orphan`        : contenu publié mais non atteignable depuis la navigation.
 *  - `seo`           : métadonnées manquantes ou trop courtes sur une page publiée.
 *  - `incomplete-roles` : compléments éditoriaux à saisir (rôles CUC et
 *    doublures). Famille **exemptée du score** (`SCORE_EXEMPT_KINDS`) : elle
 *    liste du travail de rédaction, elle ne signale pas une panne.
 *
 * Implémentation découpée dans `./content-health/**` (règles d'URL, collecte des
 * chemins, vérificateurs par famille).
 */

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
        films = [],
        team = [],
        celebrities = [],
        knownPublicAssets,
    } = input;

    const pagePaths = collectPagePaths(pages);
    const validPaths = new Set<string>([...STATIC_ROUTES, ...pagePaths]);
    const assetSet = knownPublicAssets ? new Set(knownPublicAssets) : null;

    const pushIssue: PushIssue = (issue) => {
        issues.push({ ...issue, id: `${issue.kind}:${issue.scope}:${issue.value ?? issue.label}` });
    };

    checkContentLinks({ validPaths, pushIssue, pages, navigation, footer });
    checkContentImages({ pushIssue, pages, partners, events, settings, assetSet });
    checkContentOrphans({ pushIssue, pages, navigation, footer, socialLinks });
    checkContentSeo({ pushIssue, pages });
    checkContentRoles({ pushIssue, films, team, celebrities });

    // ---------------------------------------------------------------------------
    // Agrégation
    // ---------------------------------------------------------------------------
    const counts: Record<ContentIssueKind, number> = {
        'broken-link': 0,
        'missing-image': 0,
        orphan: 0,
        seo: 0,
        'incomplete-roles': 0,
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
        // Les familles de compléments éditoriaux ne pèsent pas sur le score :
        // une liste de travail à remplir ne dégrade pas la santé de la vitrine.
        if (SCORE_EXEMPT_KINDS.includes(issue.kind)) return;
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
