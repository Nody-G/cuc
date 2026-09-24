/**
 * Révisions de page (CRUD + diff) — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { getSupabaseClient } from './client';
import { PAGE_REVISION_FIELDS } from './page-revision-snapshot';
import { SitePageContent, SitePageRevision } from './types';

/**
 * Liste l'historique des révisions d'une page, de la plus récente à la plus
 * ancienne. Retourne un tableau vide en cas d'erreur (zéro régression).
 */
export async function getPageRevisions(
  slug: string,
  limit = 50
): Promise<SitePageRevision[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_page_revisions')
      .select('*')
      .eq('page_slug', slug)
      .order('revision_number', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as SitePageRevision[];
  } catch {
    return [];
  }
}

/**
 * Récupère une révision précise par son identifiant.
 */
export async function getPageRevision(id: string): Promise<SitePageRevision | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_page_revisions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return data as SitePageRevision;
  } catch {
    return null;
  }
}

/**
 * Restaure une révision : réapplique son instantané sur `site_pages`.
 *
 * Deux invariants tenus ici :
 *  - **tout champ de l'instantané est réappliqué** (`PAGE_REVISION_FIELDS`) —
 *    `sections_data` et `layout_sections` compris, dont l'oubli rendait la
 *    « version précédente » partiellement fausse : les textes de sections
 *    restaient dans leur état récent ;
 *  - un champ **absent** de l'instantané n'est pas écrit (jamais écrasé par
 *    `undefined`) — une révision antérieure au champ ne l'efface pas.
 *
 * L'écriture de l'état courant n'est plus supposée : c'est
 * `recordPageRevision` (serveur) qui dépose l'instantané à chaque
 * enregistrement, donc une restauration reste elle-même réversible.
 */
export async function restorePageRevision(
  revisionId: string
): Promise<SitePageContent | null> {
  try {
    const revision = await getPageRevision(revisionId);
    if (!revision) return null;

    const supabase = getSupabaseClient();
    const snap = (revision.snapshot ?? {}) as Record<string, unknown>;

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const field of PAGE_REVISION_FIELDS) {
      if (field in snap) patch[field] = snap[field];
    }

    const { data, error } = await supabase
      .from('site_pages')
      .update(patch)
      .eq('slug', revision.page_slug)
      .select('*')
      .maybeSingle();

    if (error || !data) return null;
    return data as SitePageContent;
  } catch {
    return null;
  }
}

/**
 * Supprime une révision de l'historique.
 */
export async function deletePageRevision(id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('site_page_revisions').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Calcule un diff lisible entre deux instantanés de page.
 * Retourne la liste des champs modifiés avec leurs valeurs avant/après.
 */
export interface PageRevisionDiffEntry {
  field: string;
  before: unknown;
  after: unknown;
}

export function diffPageSnapshots(
  before: Partial<SitePageContent> | null | undefined,
  after: Partial<SitePageContent> | null | undefined
): PageRevisionDiffEntry[] {
  const fields: (keyof SitePageContent)[] = [
    'title',
    'meta_title',
    'meta_description',
    'og_image',
    'hero',
    'sections',
    'is_published',
  ];

  const a = before ?? {};
  const b = after ?? {};
  const changes: PageRevisionDiffEntry[] = [];

  for (const field of fields) {
    const beforeValue = (a as Record<string, unknown>)[field as string];
    const afterValue = (b as Record<string, unknown>)[field as string];
    if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
      changes.push({ field: field as string, before: beforeValue, after: afterValue });
    }
  }

  return changes;
}
