'use server';

/**
 * Pages vitrine (contenu, publication, révisions) — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { recordPageRevision } from '@/lib/data/site/page-revision-server';
import { revalidateSite } from './revalidate';
import { logAuditEvent } from './audit';

/**
 * Met à jour ou insère le contenu détaillé d'une page (Hero, sections, emplacements, SEO).
 */

export async function upsertPageContent(slug: string, pageData: {
  title: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  hero: object;
  sections?: unknown[];
  layout_sections?: unknown[];
  sections_data?: object;
  is_published?: boolean;
  /**
   * Horodatage de la version chargée dans l'éditeur. S'il est fourni et que la
   * base porte une version **plus récente**, l'écriture est refusée : deux
   * administrateurs (ou deux onglets) ne doivent pas s'écraser en silence.
   * Le brouillon local de l'éditeur est conservé, il recharge et repart.
   */
  expectedUpdatedAt?: string | null;
}) {
  try {
    const cleanSlug = slug === '/' ? '/' : slug.replace(/^\//, '');
    const adminClient = createAdminClient();

    // Garde de concurrence : tolérance de 2 s (précision et fuseau des
    // horodatages), donc aucun faux positif sur une écriture normale.
    if (pageData.expectedUpdatedAt) {
      const { data: existing } = await adminClient
        .from('site_pages')
        .select('updated_at')
        .eq('slug', cleanSlug)
        .maybeSingle();

      const storedMs = Date.parse(
        ((existing as { updated_at?: string } | null)?.updated_at ?? '') || ''
      );
      const expectedMs = Date.parse(pageData.expectedUpdatedAt);

      if (Number.isFinite(storedMs) && Number.isFinite(expectedMs) && storedMs - expectedMs > 2000) {
        return {
          success: false,
          conflict: true,
          error:
            'Cette page a été modifiée depuis son ouverture (autre onglet ou autre administrateur). Rechargez l’éditeur pour repartir de la dernière version : votre brouillon local est conservé.',
        };
      }
    }

    const { error } = await adminClient
      .from('site_pages')
      .upsert({
        slug: cleanSlug,
        title: pageData.title,
        meta_title: pageData.meta_title,
        meta_description: pageData.meta_description,
        og_image: pageData.og_image,
        hero: pageData.hero,
        sections: pageData.sections || [],
        layout_sections: pageData.layout_sections || [],
        sections_data: pageData.sections_data || {},
        is_published: pageData.is_published ?? true,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    /**
     * Instantané d'historique, déposé **après** l'écriture réussie.
     *
     * C'est le seul écrivain de `site_page_revisions` (`recordPageRevision`,
     * client admin — la policy d'écriture exige un rôle administrateur qu'un
     * client public ne peut pas prouver). Il ne jette jamais : l'enregistrement
     * du contenu est acquis, l'historique est un confort. La mesure de cet
     * historique et sa rétention vivent dans `npm run audit:revisions`.
     */
    const revision = await recordPageRevision(cleanSlug, pageData, {
      status: (pageData.is_published ?? true) ? 'published' : 'archived',
    });

    /**
     * Journal d'audit : un enregistrement de page est une action éditoriale, et
     * c'était **le seul geste du Cockpit qui n'y laissait aucune trace** (constat
     * du 2026-09-24 : `site_audit_logs` vide alors que les pages sont éditées).
     */
    await logAuditEvent(
      'page.save',
      cleanSlug,
      revision.recorded
        ? `révision n°${revision.revisionNumber}`
        : `instantané non enregistré${revision.error ? ` (${revision.error})` : ''}`
    );

    const targetPath = cleanSlug === '/' ? '/' : `/${cleanSlug}`;
    await revalidateSite([targetPath, '/']);
    return { success: true, revision };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Publie ou dépublie une page (workflow brouillon → prévisualisation → publication).
 *
 * - `publish` : rend la page visible sur la vitrine (`is_published = true`).
 * - `unpublish` : repasse la page en brouillon (`is_published = false`), elle
 *   n'est alors plus servie publiquement mais reste éditable dans le Cockpit.
 *
 * L'instantané d'historique est déposé par `upsertPageContent` (seul écrivain de
 * `site_page_revisions`) : ce basculement ne modifie que l'état de publication.
 */
export async function setPagePublishState(
  slug: string,
  publish: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanSlug = slug === '/' ? '/' : slug.replace(/^\//, '');
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_pages')
      .update({
        is_published: publish,
        updated_at: new Date().toISOString(),
      })
      .eq('slug', cleanSlug);

    if (error) throw error;

    await logAuditEvent(publish ? 'page.publish' : 'page.unpublish', cleanSlug);

    const targetPath = cleanSlug === '/' ? '/' : `/${cleanSlug}`;
    await revalidateSite([targetPath, '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Rétablit le contenu d'origine et la disposition par défaut validée d'une page.
 */
export async function resetPageContentToDefault(slug: string) {
  try {
    const cleanSlug = slug === '/' ? '/' : slug.replace(/^\//, '');
    const { DEFAULT_PAGE_CONTENTS } = await import('@/lib/data/site-service');
    const defaultData = DEFAULT_PAGE_CONTENTS[cleanSlug];
    if (!defaultData) {
      throw new Error(`Aucun contenu par défaut trouvé pour le slug "${slug}"`);
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_pages')
      .upsert({
        slug: defaultData.slug,
        title: defaultData.title,
        meta_title: defaultData.meta_title,
        meta_description: defaultData.meta_description,
        og_image: defaultData.og_image,
        hero: defaultData.hero,
        sections: defaultData.sections || [],
        layout_sections: defaultData.layout_sections || [],
        sections_data: defaultData.sections_data || {},
        is_published: defaultData.is_published,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    const targetPath = cleanSlug === '/' ? '/' : `/${cleanSlug}`;
    await revalidateSite([targetPath, '/']);
    return { success: true, defaultData };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur réinitialisation';
    return { success: false, error: message };
  }
}
