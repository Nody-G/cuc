/**
 * ==============================================================================
 * CUC — Rétention de l'historique des révisions de pages (domaine)
 * ==============================================================================
 * `site_page_revisions` est la seule table de la vitrine qui grossit toute seule :
 * chaque enregistrement d'une page y dépose un instantané complet
 * (`recordPageRevision`, serveur), et rien ne plafonne ce volume. La mesure et
 * l'application de cette règle vivent dans `npm run audit:revisions`.
 *
 * La règle de rétention vit ici, pure et testable, pour que le script qui
 * l'applique (`scripts/audit_page_revisions.mjs`) ne porte que des lectures et
 * des suppressions :
 *
 *  - **par page** : on garde les `keepPerPage` révisions les plus récentes de
 *    chaque page — un seuil global viderait la page la plus éditée ;
 *  - **jalons préservés** : une révision étiquetée (`label`) a été posée
 *    volontairement (avant une refonte, un jalon de publication) : elle survit
 *    quelle que soit son ancienneté ;
 *  - `revision_number` fait foi pour l'ordre (c'est le journal de la page) ;
 *    `created_at` n'est qu'un indice d'ancienneté affiché.
 */

export interface PageRevisionRow {
    id: string;
    page_slug: string;
    revision_number: number;
    label?: string | null;
    created_at?: string | null;
    /** Taille du snapshot en octets (`pg_column_size`), si mesurée. */
    bytes?: number;
}

export interface PageRetentionPlan {
    slug: string;
    total: number;
    kept: number;
    removed: number;
    newest: string | null;
    oldest: string | null;
    /** Octets de snapshots conservés. */
    bytes: number;
    /** Octets de snapshots visés par la purge. */
    removedBytes: number;
    /** Identifiants à supprimer (vide en simulation si rien à purger). */
    removedIds: string[];
}

/** Borne le `keepPerPage` reçu d'une ligne de commande : jamais moins d'une révision gardée. */
export function normalizeKeepPerPage(value: number, fallback = 20): number {
    if (!Number.isFinite(value) || !Number.isInteger(value) || value < 1) return fallback;
    return value;
}

/**
 * Construit le plan de rétention, page par page, sans rien supprimer.
 * Retourne les pages triées par volume décroissant (les plus lourdes d'abord).
 */
export function planRevisionRetention(
    revisions: readonly PageRevisionRow[],
    keepPerPage = 20
): PageRetentionPlan[] {
    const keep = normalizeKeepPerPage(keepPerPage);
    const byPage = new Map<string, PageRevisionRow[]>();

    for (const revision of revisions) {
        const slug = revision.page_slug;
        const list = byPage.get(slug);
        if (list) list.push(revision);
        else byPage.set(slug, [revision]);
    }

    const plan: PageRetentionPlan[] = [];

    for (const [slug, list] of byPage) {
        const ordered = [...list].sort((a, b) => b.revision_number - a.revision_number);
        const kept: PageRevisionRow[] = [];
        const removed: PageRevisionRow[] = [];

        ordered.forEach((revision, index) => {
            const isMilestone = typeof revision.label === 'string' && revision.label.trim().length > 0;
            if (index < keep || isMilestone) kept.push(revision);
            else removed.push(revision);
        });

        plan.push({
            slug,
            total: ordered.length,
            kept: kept.length,
            removed: removed.length,
            newest: ordered[0]?.created_at ?? null,
            oldest: ordered[ordered.length - 1]?.created_at ?? null,
            bytes: kept.reduce((sum, revision) => sum + Number(revision.bytes ?? 0), 0),
            removedBytes: removed.reduce((sum, revision) => sum + Number(revision.bytes ?? 0), 0),
            removedIds: removed.map((revision) => revision.id),
        });
    }

    return plan.sort((a, b) => b.total - a.total);
}

/** Total des révisions visées par la purge, toutes pages confondues. */
export function countPlannedRemovals(plan: readonly PageRetentionPlan[]): number {
    return plan.reduce((sum, page) => sum + page.removed, 0);
}
