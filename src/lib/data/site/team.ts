/**
 * Équipe (coachs) — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { CUC_TEAM } from '@/data/team';
import { Instructor } from '@/types';
import { getSupabaseClient } from './client';

/**
 * Récupère l'équipe d'instructeurs.
 */
export async function getTeam(): Promise<Instructor[]> {
  try {
    const supabase = getSupabaseClient();
    // `featured_credits` et `credits_display_limit` sont optionnelles : si la
    // migration n'a pas encore été appliquée, on retombe sur un select de base
    // pour ne jamais casser l'affichage public.
    let data: any[] | null = null;
    let error: any = null;

    const extended = await supabase
      .from('site_team')
      .select('*, featured_credits, credits_display_limit')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (extended.error) {
      const fallback = await supabase
        .from('site_team')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });
      data = fallback.data;
      error = fallback.error;
    } else {
      data = extended.data;
      error = extended.error;
    }

    if (error || !data || data.length === 0) {
      return CUC_TEAM;
    }

    // Récupération des correspondances de films pour relier les cascades certifiées
    const teamFilmsMap: Record<string, string[]> = {};
    try {
      const { data: filmsData } = await supabase
        .from('site_films')
        .select('id, cuc_team_involved')
        .eq('is_published', true);

      if (filmsData) {
        for (const f of filmsData) {
          if (Array.isArray(f.cuc_team_involved)) {
            for (const memberId of f.cuc_team_involved) {
              if (!teamFilmsMap[memberId]) teamFilmsMap[memberId] = [];
              teamFilmsMap[memberId].push(f.id);
            }
          }
        }
      }
    } catch {
      // Ignorer si échec
    }

    return data.map((t) => ({
      id: t.id,
      name: t.name,
      role: t.role,
      title: t.title,
      specialties: t.specialties || [],
      bio: t.bio || '',
      doubledActors: t.doubled_actors,
      notableCredits: t.notable_credits || [],
      featuredCredits: t.featured_credits || [],
      creditsDisplayLimit:
        typeof t.credits_display_limit === 'number' && t.credits_display_limit > 0
          ? t.credits_display_limit
          : 8,
      externalUrl: t.external_url,
      avatarUrl: t.avatar_url,
      instagram: t.instagram,
      imdb: t.imdb,
      profile_id: t.profile_id || null,
      film_ids: teamFilmsMap[t.id] || [],
      metadata: t.metadata || {},
    }));
  } catch {
    return CUC_TEAM;
  }
}
