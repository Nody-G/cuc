'use server';

/**
 * Traductions EN (overlays) — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizeOverlayPayload } from '@/lib/i18n/localized-merge';
import { revalidatePath, updateTag } from 'next/cache';
import { buildPreviewPath } from '@/lib/preview/preview-url';

/**
 * Revalide la vitrine après une écriture de traduction.
 *
 * Les lectures publiques posent `cacheTag('site_translations')`
 * (cf. `lib/i18n/server.ts`) : `updateTag` est ici l'API recommandée en Server
 * Action, car l'auteur de la traduction veut relire sa propre écriture — la
 * prochaine requête attend la donnée fraîche au lieu de servir la version
 * périmée. Le chemin public de la locale est revalidé en complément : une
 * traduction anglaise invalide désormais `/en/...`, ce qui manquait.
 */
async function revalidateTranslationPaths(entity: string, entityId: string, locale: string) {
  try {
    updateTag('site_translations');
  } catch {
    // Hors Server Action : le tag reste valide, l'écriture n'est pas perdue.
  }
  if (entity !== 'page') return;
  const path = buildPreviewPath(entityId, locale === 'en' ? 'en' : 'fr');
  revalidatePath(path);
  if (path !== '/') revalidatePath('/');
}

/**
 * Upsert d'une traduction éditoriale (table `site_translations`).
 *
 * `payload` est un overlay JSON partiel fusionné par-dessus la base FR. Il est
 * nettoyé avant écriture : aucune racine verrouillée (`layout_sections`,
 * `og_image`, identité, états), aucune clé technique, aucune valeur vide. Un
 * tableau, en revanche, n'est jamais filtré à l'intérieur : il est écrit en bloc,
 * un item amputé publierait un champ vide sur la vitrine.
 */
export async function upsertSiteTranslation(data: {
  entity: string;
  entity_id: string;
  locale: string;
  payload: Record<string, unknown>;
  is_published?: boolean;
}): Promise<{ success: boolean; error?: string; payload?: Record<string, unknown> }> {
  try {
    const adminClient = createAdminClient();
    const payload = sanitizeOverlayPayload(data.payload);
    const { error } = await adminClient
      .from('site_translations')
      .upsert(
        {
          entity: data.entity,
          entity_id: data.entity_id,
          locale: data.locale,
          payload,
          is_published: data.is_published ?? true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'entity,entity_id,locale' }
      );

    if (error) throw error;
    await revalidateTranslationPaths(data.entity, data.entity_id, data.locale);
    return { success: true, payload };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/** Résultat de lecture d'un overlay de traduction. */
export type SiteTranslationReadResult =
  | {
    success: true;
    payload: Record<string, unknown>;
    isPublished: boolean;
    updatedAt: string | null;
  }
  | { success: false; error: string };

/**
 * Lit l'overlay de traduction d'une entité (payload vide s'il n'existe pas).
 * Le Cockpit s'en sert pour ouvrir un contenu en anglais sans quitter sa page :
 * le français reste la base, cette lecture ne fournit que les surcharges.
 */
export async function getSiteTranslation(
  entity: string,
  entityId: string,
  locale: string
): Promise<SiteTranslationReadResult> {
  try {
    const adminClient = createAdminClient();
    const { data, error } = await adminClient
      .from('site_translations')
      .select('payload, is_published, updated_at')
      .eq('entity', entity)
      .eq('entity_id', entityId)
      .eq('locale', locale)
      .maybeSingle();

    if (error) throw error;

    return {
      success: true,
      payload: (data?.payload ?? {}) as Record<string, unknown>,
      isPublished: (data?.is_published as boolean | undefined) ?? true,
      updatedAt: (data?.updated_at as string | undefined) ?? null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime l'overlay de traduction d'une entité : la vitrine repasse
 * intégralement en français pour ce contenu (retour à la source, jamais du vide).
 */
export async function deleteSiteTranslation(entity: string, entityId: string, locale: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_translations')
      .delete()
      .eq('entity', entity)
      .eq('entity_id', entityId)
      .eq('locale', locale);

    if (error) throw error;
    await revalidateTranslationPaths(entity, entityId, locale);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}
