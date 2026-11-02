/**
 * Équipe (coachs) — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { Instructor } from '@/types';
import { getSupabaseClient } from './client';

async function loadStaticTeam(): Promise<Instructor[]> {
  const mod = await import('@/data/team');
  return mod.CUC_TEAM;
}

/** Colonnes lues sur `site_team` (les optionnelles tolèrent la migration absente). */
interface TeamRow {
  id: string;
  name: string;
  role: string;
  title: string;
  specialties?: string[];
  bio?: string;
  doubled_actors?: string[];
  notable_credits?: string[];
  featured_credits?: string[];
  credits_display_limit?: number;
  external_url?: string;
  avatar_url?: string;
  instagram?: string;
  imdb?: string;
  profile_id?: string | null;
  metadata?: Record<string, unknown>;
}

let teamCache: { data: Instructor[]; expiresAt: number } | null = null;
let inFlightTeam: Promise<Instructor[]> | null = null;
const TEAM_CACHE_TTL_MS = 10_000;

/**
 * Récupère l'équipe d'instructeurs avec déduplication des requêtes simultanées
 * et résolution locale des film_ids à partir de metadata.film_roles (évite de
 * re-télécharger les 1 089 lignes de site_films à chaque appel à getTeam()).
 */
export async function getTeam(): Promise<Instructor[]> {
  if (teamCache && Date.now() < teamCache.expiresAt) {
    return teamCache.data;
  }
  if (inFlightTeam) {
    return inFlightTeam;
  }

  inFlightTeam = (async () => {
    try {
      const supabase = await getSupabaseClient();
      let data: TeamRow[] | null = null;
      let error: { message: string } | null = null;

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
        return await loadStaticTeam();
      }

      const mapped: Instructor[] = data.map((t) => {
        const filmRoles =
          (t.metadata?.film_roles as Record<string, string> | undefined) || {};
        return {
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
          film_ids: Object.keys(filmRoles),
          metadata: t.metadata || {},
        };
      });

      teamCache = { data: mapped, expiresAt: Date.now() + TEAM_CACHE_TTL_MS };
      return mapped;
    } catch {
      return await loadStaticTeam();
    } finally {
      inFlightTeam = null;
    }
  })();

  return inFlightTeam;
}
