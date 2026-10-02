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
    const supabase = await getSupabaseClient();
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
    const supabase = await getSupabaseClient();
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

    const supabase = await getSupabaseClient();
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
    const supabase = await getSupabaseClient();
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
    'layout_sections',
    'sections_data',
    'is_published',
  ];

  const a = before ?? {};
  const b = after ?? {};
  const changes: PageRevisionDiffEntry[] = [];

  for (const field of fields) {
    const beforeValue = (a as Record<string, unknown>)[field as string];
    const afterValue = (b as Record<string, unknown>)[field as string];
    if (JSON.stringify(beforeValue) === JSON.stringify(afterValue)) {
      continue;
    }

    // Décomposition granulaire pour le Hero
    if (
      field === 'hero' &&
      typeof beforeValue === 'object' &&
      typeof afterValue === 'object' &&
      beforeValue !== null &&
      afterValue !== null
    ) {
      const heroA = beforeValue as Record<string, unknown>;
      const heroB = afterValue as Record<string, unknown>;
      const subkeys = Array.from(new Set([...Object.keys(heroA), ...Object.keys(heroB)]));
      let hadSub = false;
      for (const k of subkeys) {
        if (JSON.stringify(heroA[k]) !== JSON.stringify(heroB[k])) {
          changes.push({
            field: `hero.${k}`,
            before: heroA[k],
            after: heroB[k],
          });
          hadSub = true;
        }
      }
      if (hadSub) continue;
    }

    // Décomposition granulaire pour les sections_data
    if (
      field === 'sections_data' &&
      typeof beforeValue === 'object' &&
      typeof afterValue === 'object' &&
      beforeValue !== null &&
      afterValue !== null
    ) {
      const secA = beforeValue as Record<string, Record<string, unknown>>;
      const secB = afterValue as Record<string, Record<string, unknown>>;
      const sectionKeys = Array.from(new Set([...Object.keys(secA), ...Object.keys(secB)]));
      let hadSub = false;
      for (const sk of sectionKeys) {
        const dataA = secA[sk] || {};
        const dataB = secB[sk] || {};
        if (JSON.stringify(dataA) !== JSON.stringify(dataB)) {
          const props = Array.from(new Set([...Object.keys(dataA), ...Object.keys(dataB)]));
          for (const pk of props) {
            if (JSON.stringify(dataA[pk]) !== JSON.stringify(dataB[pk])) {
              changes.push({
                field: `sections_data.${sk}.${pk}`,
                before: dataA[pk],
                after: dataB[pk],
              });
              hadSub = true;
            }
          }
        }
      }
      if (hadSub) continue;
    }

    // Décomposition granulaire pour les sections (chiffres clés / capsules)
    if (
      field === 'sections' &&
      Array.isArray(beforeValue) &&
      Array.isArray(afterValue)
    ) {
      const maxLen = Math.max(beforeValue.length, afterValue.length);
      let hadSub = false;
      for (let i = 0; i < maxLen; i++) {
        const itemA = beforeValue[i] as Record<string, unknown> | undefined;
        const itemB = afterValue[i] as Record<string, unknown> | undefined;
        if (JSON.stringify(itemA) !== JSON.stringify(itemB)) {
          if (itemA && itemB) {
            if (itemA.value !== itemB.value) {
              changes.push({
                field: `sections[${i}].value`,
                before: itemA.value,
                after: itemB.value,
              });
              hadSub = true;
            }
            if (itemA.title !== itemB.title) {
              changes.push({
                field: `sections[${i}].title`,
                before: itemA.title,
                after: itemB.title,
              });
              hadSub = true;
            }
            if (itemA.description !== itemB.description) {
              changes.push({
                field: `sections[${i}].description`,
                before: itemA.description,
                after: itemB.description,
              });
              hadSub = true;
            }
          } else {
            changes.push({
              field: `sections[${i}]`,
              before: itemA,
              after: itemB,
            });
            hadSub = true;
          }
        }
      }
      if (hadSub) continue;
    }

    // Repli standard
    changes.push({ field: field as string, before: beforeValue, after: afterValue });
  }

  return changes;
}
