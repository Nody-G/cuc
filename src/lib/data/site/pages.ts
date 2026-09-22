/**
 * Pages vitrine (contenu, slug) — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { getSupabaseClient } from './client';
import { SitePageContent } from './types';

export function normalizeSlug(slug: string): string {
  if (!slug || slug === '/') return '/';
  return slug.replace(/^\//, '');
}

/**
 * Récupère le contenu détaillé de toutes les pages configurées dans le CMS.
 */
export async function getAllPages(): Promise<SitePageContent[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_pages')
      .select('*')
      .order('slug', { ascending: true });

    if (error || !data) return [];
    return data as SitePageContent[];
  } catch {
    return [];
  }
}

/**
 * Récupère le contenu détaillé d'une page spécifique (Hero, sections, SEO).
 */
export async function getPageContent(slug: string): Promise<SitePageContent | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_pages')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;
    return data as SitePageContent;
  } catch {
    return null;
  }
}
