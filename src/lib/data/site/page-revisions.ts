/**
 * Révisions de page (CRUD + diff) — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { getSupabaseClient } from './client';
import { PageRevisionStatus, SitePageContent, SitePageRevision } from './types';

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
 * Crée manuellement une révision (instantané) d'une page.
 * Utile pour marquer un jalon avant une modification importante.
 */
export async function createPageRevision(
  slug: string,
  snapshot: Partial<SitePageContent>,
  options: { label?: string; status?: PageRevisionStatus } = {}
): Promise<SitePageRevision | null> {
  try {
    const supabase = getSupabaseClient();

    const { data: last } = await supabase
      .from('site_page_revisions')
      .select('revision_number')
      .eq('page_slug', slug)
      .order('revision_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextNumber = ((last?.revision_number as number | undefined) ?? 0) + 1;

    const { data: auth } = await supabase.auth.getUser();
    const authorId = auth?.user?.id ?? null;

    const { data, error } = await supabase
      .from('site_page_revisions')
      .insert({
        page_slug: slug,
        revision_number: nextNumber,
        snapshot,
        status: options.status ?? 'draft',
        label: options.label ?? null,
        author_id: authorId,
      })
      .select('*')
      .maybeSingle();

    if (error || !data) return null;
    return data as SitePageRevision;
  } catch {
    return null;
  }
}

/**
 * Restaure une révision : réapplique son instantané sur `site_pages`.
 * L'état courant est automatiquement sauvegardé par le trigger SQL avant
 * l'écriture, ce qui rend la restauration elle-même réversible.
 */
export async function restorePageRevision(
  revisionId: string
): Promise<SitePageContent | null> {
  try {
    const revision = await getPageRevision(revisionId);
    if (!revision) return null;

    const supabase = getSupabaseClient();
    const snap = revision.snapshot ?? {};

    const { data, error } = await supabase
      .from('site_pages')
      .update({
        title: snap.title,
        meta_title: snap.meta_title,
        meta_description: snap.meta_description,
        og_image: snap.og_image,
        hero: snap.hero,
        sections: snap.sections,
        is_published: snap.is_published,
        updated_at: new Date().toISOString(),
      })
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
