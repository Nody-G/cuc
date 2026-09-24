/**
 * ==============================================================================
 * CUC — Écriture d'un instantané de révision (serveur, un seul écrivain)
 * ==============================================================================
 * Constat mesuré (2026-09-24, `npm run audit:revisions`) : `site_page_revisions`
 * était **vide** côté production — aucun code n'appelait `createPageRevision`,
 * et le trigger SQL annoncé (`trg_snapshot_site_page_revision`) n'était pas posé
 * en base. Le panneau « Historique des versions » du Cockpit promettait donc des
 * versions restaurables qui n'existaient pas.
 *
 * Ce module est **le seul écrivain** de cet historique, et il est côté serveur
 * pour une raison précise : la policy d'écriture de `site_page_revisions` exige
 * un rôle administrateur, ce qu'un client public ne peut pas prouver. La
 * fabrique client historique ne pouvait donc rien insérer, même appelée.
 *
 * Doctrine : l'historique est un **confort**, jamais une dépendance dure. Une
 * écriture de contenu ne doit jamais échouer parce que l'instantané a échoué —
 * d'où l'absence totale de propagation d'erreur : on rapporte, on journalise,
 * on continue.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import {
    buildRevisionLabel,
    buildRevisionSnapshot,
    nextRevisionNumber,
    type PageRevisionSnapshot,
    type PageRevisionSource,
} from './page-revision-snapshot';

export interface RecordPageRevisionOptions {
    /** Libellé lisible ; par défaut horodaté (« Enregistrement du … »). */
    label?: string;
    /** Statut de la version déposée : `archived` pour un instantané d'historique. */
    status?: 'draft' | 'published' | 'archived';
    /** Date de référence du libellé (injectable pour les tests). */
    now?: Date;
}

export interface RecordPageRevisionResult {
    recorded: boolean;
    revisionNumber?: number;
    error?: string;
}

/**
 * Dépose un instantané d'une page **après** un enregistrement réussi.
 * Ne jette jamais : retourne `{ recorded: false, error }` en cas d'échec.
 */
export async function recordPageRevision(
    slug: string,
    page: PageRevisionSource,
    options: RecordPageRevisionOptions = {}
): Promise<RecordPageRevisionResult> {
    try {
        const client = createAdminClient();

        const { data: lastRows, error: readError } = await client
            .from('site_page_revisions')
            .select('revision_number')
            .eq('page_slug', slug)
            .order('revision_number', { ascending: false })
            .limit(50);

        if (readError) throw readError;

        const revisionNumber = nextRevisionNumber(
            (lastRows ?? []).map((row) => Number((row as { revision_number?: number }).revision_number))
        );

        const snapshot: PageRevisionSnapshot = buildRevisionSnapshot(page);

        const { error: writeError } = await client.from('site_page_revisions').insert({
            page_slug: slug,
            revision_number: revisionNumber,
            snapshot,
            status: options.status ?? 'archived',
            label: options.label ?? buildRevisionLabel(options.now ?? new Date()),
        });

        if (writeError) throw writeError;

        return { recorded: true, revisionNumber };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        // Visible dans les journaux du serveur : un historique qui ne s'écrit plus
        // doit se remarquer, sans jamais faire échouer l'enregistrement du contenu.
        console.warn(`[revisions] Instantané non enregistré pour « ${slug} » : ${message}`);
        return { recorded: false, error: message };
    }
}
