'use server';

/**
 * Films — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidateSite } from './revalidate';

/**
 * Met à jour ou insère un film dans la filmographie.
 */
export async function upsertFilm(film: {
  id: string;
  title: string;
  year?: string;
  category?: string;
  director?: string;
  stunt_roles?: string;
  image?: string;
  tag?: string;
  imdb_url?: string;
  allocine_url?: string;
  trailer_url?: string;
  doubled_actors?: string[];
  highlight?: boolean;
  cuc_team_involved?: string[];
  cuc_team_roles?: Record<string, string>;
  metadata?: any;
}) {
  try {
    const adminClient = createAdminClient();
    const mergedMetadata = {
      ...(film.metadata || {}),
      ...(film.cuc_team_roles ? { cuc_team_roles: film.cuc_team_roles } : {}),
    };

    const { error } = await adminClient
      .from('site_films')
      .upsert({
        id: film.id,
        title: film.title,
        year: film.year,
        category: film.category,
        director: film.director,
        stunt_roles: film.stunt_roles,
        image: film.image,
        tag: film.tag,
        imdb_url: film.imdb_url,
        allocine_url: film.allocine_url,
        trailer_url: film.trailer_url,
        doubled_actors: film.doubled_actors,
        highlight: film.highlight,
        cuc_team_involved: film.cuc_team_involved,
        metadata: mergedMetadata,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    // Fallback miroir site_settings (key=films)
    try {
      const { data: row } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'films')
        .maybeSingle();

      const list: any[] = row?.value?.list || [];
      const idx = list.findIndex((f: any) => f.id === film.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...film, updated_at: new Date().toISOString() };
      } else {
        list.push({ ...film, updated_at: new Date().toISOString() });
      }
      await adminClient.from('site_settings').upsert({
        key: 'films',
        value: { list },
        updated_at: new Date().toISOString(),
      });
    } catch {
      // ignore
    }

    await revalidateSite(['/cuc-team-cascadeur', '/equipe-cascadeurs-pro', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Supprime un film de la filmographie.
 */
export async function deleteFilm(id: string) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('site_films')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await revalidateSite(['/cuc-team-cascadeur', '/']);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/* `revalidateTranslationPaths` vit dans `./translations` (domaine des overlays). */
