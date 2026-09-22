/**
 * Événements CUC Events — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { getSupabaseClient } from './client';
import { DEFAULT_EVENTS } from './defaults/events';
import { SiteEvent } from './types';

/**
 * Récupère les prestations CUC Events (team building, shows, airbag).
 */
export async function getEvents(): Promise<SiteEvent[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_events')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) return DEFAULT_EVENTS;
    return data as SiteEvent[];
  } catch {
    return DEFAULT_EVENTS;
  }
}
