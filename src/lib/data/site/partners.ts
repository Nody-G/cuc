/**
 * Partenaires — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { getSupabaseClient } from './client';
import { SitePartner } from './types';
import { DEFAULT_PARTNERS } from './defaults/partners';

/**
 * Récupère la liste des partenaires (cinéma, institutionnels, marques).
 */
export async function getPartners(): Promise<SitePartner[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_partners')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) return DEFAULT_PARTNERS;
    return data as SitePartner[];
  } catch {
    return DEFAULT_PARTNERS;
  }
}
