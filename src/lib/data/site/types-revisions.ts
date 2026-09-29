/**
 * Historique de versions des pages (`site_page_revisions`) — contrats.
 *
 * Extrait de `types.ts`, qui dépassait le plafond dur de 300 lignes
 * (`AGENTS.md` § 2). L'extraction a une justification propre : les révisions
 * forment un sujet distinct — un instantané immuable du contenu d'une page, lu,
 * comparé et restauré par le Cockpit — et non un type de contenu comme les
 * autres.
 *
 * `types.ts` ré-exporte ces deux symboles : aucun import existant ne change.
 */

import type { SitePageContent } from './types';

export type PageRevisionStatus = 'draft' | 'published' | 'archived';

/**
 * Un instantané est **immutable** : il conserve ce que la page contenait à un
 * instant donné, jamais un pointeur vers l'état courant. `snapshot` est partiel
 * parce qu'une révision ancienne peut précéder l'apparition d'un champ.
 */
export interface SitePageRevision {
    id: string;
    page_slug: string;
    revision_number: number;
    snapshot: Partial<SitePageContent>;
    status: PageRevisionStatus;
    label: string | null;
    author_id: string | null;
    author_name: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}
