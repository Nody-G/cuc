/**
 * Sélecteurs médias vitrine (vidéos TV, Reels Instagram mis en avant) —
 * isolés de `settings.ts` pour éviter d'embarquer `instagram-reels.ts` (35 Ko)
 * dans le bundle initial des composants de layout (`AnnouncementBanner`, `Navbar`).
 * Règle SRP : `AGENTS.md` § 1-2 & `.agents/rules/client_bundle_budget.md`.
 */

import { PROGRAMMES_TV, type ProgrammeTvItem } from '@/data/videos';
import {
  DEFAULT_FEATURED_REELS,
  ALL_INSTAGRAM_REELS,
  type InstagramReel,
} from '@/data/instagram-reels';
import { getSupabaseClient } from './client';

/**
 * Récupère les reportages TV et vidéos d'archives du CUC.
 * Persisté dans Supabase (site_settings key='videos').
 */
export async function getVideos(): Promise<ProgrammeTvItem[]> {
  try {
    const supabase = await getSupabaseClient();
    const { data: row } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'videos')
      .maybeSingle();

    if (row?.value?.list && Array.isArray(row.value.list) && row.value.list.length > 0) {
      return row.value.list as ProgrammeTvItem[];
    }
    return PROGRAMMES_TV;
  } catch {
    return PROGRAMMES_TV;
  }
}

/**
 * Récupère les Reels Instagram mis en avant sur le site vitrine.
 * Persisté dans Supabase (site_settings key='instagram_featured_reels').
 * Si non personnalisé, retombe sur les Reels mis en avant par défaut.
 */
export async function getFeaturedInstagramReels(): Promise<InstagramReel[]> {
  try {
    const supabase = await getSupabaseClient();
    const { data: row } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'instagram_featured_reels')
      .maybeSingle();

    const val = row?.value as { items?: InstagramReel[]; shortcodes?: string[] } | undefined;
    if (val?.items && Array.isArray(val.items) && val.items.length > 0) {
      return val.items;
    }
    if (val?.shortcodes && Array.isArray(val.shortcodes) && val.shortcodes.length > 0) {
      const byShortcode = new Map(ALL_INSTAGRAM_REELS.map((r) => [r.shortcode, r]));
      const resolved = val.shortcodes
        .map((sc) => byShortcode.get(sc))
        .filter((r): r is InstagramReel => Boolean(r));
      if (resolved.length > 0) return resolved;
    }
    return DEFAULT_FEATURED_REELS;
  } catch {
    return DEFAULT_FEATURED_REELS;
  }
}
