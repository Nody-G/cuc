/**
 * Navigation, pied de page, réseaux — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { DEFAULT_NAVIGATION, DEFAULT_FOOTER, DEFAULT_SOCIAL_LINKS, type SiteNavigation, type NavigationStructure, type SiteFooter, type FooterStructure, type SiteSocialLink } from '@/data/navigation';
import { getSupabaseClient } from './client';

/**
 * Récupère la structure de navigation principale (menu desktop + mobile).
 * Priorité : 1. table `site_navigation`, 2. fallback `DEFAULT_NAVIGATION`.
 */
export async function getNavigation(id: string = 'main'): Promise<SiteNavigation> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_navigation')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .maybeSingle();

    if (error || !data || !data.structure) {
      return DEFAULT_NAVIGATION;
    }

    const structure = data.structure as NavigationStructure;
    if (!structure.items || !Array.isArray(structure.items) || structure.items.length === 0) {
      return DEFAULT_NAVIGATION;
    }

    return {
      id: data.id,
      label: data.label || DEFAULT_NAVIGATION.label,
      structure: {
        items: structure.items,
        cta: structure.cta || DEFAULT_NAVIGATION.structure.cta,
      },
      is_published: data.is_published ?? true,
      updated_at: data.updated_at,
    };
  } catch {
    return DEFAULT_NAVIGATION;
  }
}

/**
 * Récupère la structure du pied de page.
 * Priorité : 1. table `site_footer`, 2. fallback `DEFAULT_FOOTER`.
 */
export async function getFooter(id: string = 'main'): Promise<SiteFooter> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_footer')
      .select('*')
      .eq('id', id)
      .eq('is_published', true)
      .maybeSingle();

    if (error || !data || !data.structure) {
      return DEFAULT_FOOTER;
    }

    const structure = data.structure as FooterStructure;
    if (!structure.columns || !Array.isArray(structure.columns)) {
      return DEFAULT_FOOTER;
    }

    return {
      id: data.id,
      label: data.label || DEFAULT_FOOTER.label,
      structure: {
        columns: structure.columns,
        brand: structure.brand || DEFAULT_FOOTER.structure.brand,
        legal: structure.legal || DEFAULT_FOOTER.structure.legal,
      },
      is_published: data.is_published ?? true,
      updated_at: data.updated_at,
    };
  } catch {
    return DEFAULT_FOOTER;
  }
}

/**
 * Récupère les réseaux sociaux officiels (source unique de vérité).
 * Priorité : 1. table `site_social_links`, 2. fallback `DEFAULT_SOCIAL_LINKS`.
 */
export async function getSocialLinks(): Promise<SiteSocialLink[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_social_links')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_SOCIAL_LINKS;
    }

    return data.map((s) => ({
      id: s.id,
      platform: s.platform,
      label: s.label,
      handle: s.handle || undefined,
      url: s.url,
      display_hint: s.display_hint || undefined,
      brand_color: s.brand_color || undefined,
      order_index: s.order_index ?? 0,
      is_active: s.is_active ?? true,
      show_in_navbar: s.show_in_navbar ?? true,
      show_in_footer: s.show_in_footer ?? true,
      show_in_drawer: s.show_in_drawer ?? true,
    })) as SiteSocialLink[];
  } catch {
    return DEFAULT_SOCIAL_LINKS;
  }
}

/**
 * Écrit (crée ou met à jour) la structure de navigation principale.
 * Réservé au Cockpit (RLS admin). Retourne `true` en cas de succès.
 */
export async function upsertNavigation(
  structure: NavigationStructure,
  options: { id?: string; label?: string; isPublished?: boolean } = {}
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const id = options.id ?? 'main';
    const { error } = await supabase.from('site_navigation').upsert(
      {
        id,
        label: options.label ?? DEFAULT_NAVIGATION.label,
        structure,
        is_published: options.isPublished ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    return !error;
  } catch {
    return false;
  }
}

/**
 * Écrit (crée ou met à jour) la structure du pied de page.
 * Réservé au Cockpit (RLS admin). Retourne `true` en cas de succès.
 */
export async function upsertFooter(
  structure: FooterStructure,
  options: { id?: string; label?: string; isPublished?: boolean } = {}
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const id = options.id ?? 'main';
    const { error } = await supabase.from('site_footer').upsert(
      {
        id,
        label: options.label ?? DEFAULT_FOOTER.label,
        structure,
        is_published: options.isPublished ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    return !error;
  } catch {
    return false;
  }
}

/**
 * Écrit (crée ou met à jour) un réseau social officiel.
 * Réservé au Cockpit (RLS admin). Retourne `true` en cas de succès.
 */
export async function upsertSocialLink(link: SiteSocialLink): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('site_social_links').upsert(
      {
        id: link.id,
        platform: link.platform,
        label: link.label,
        handle: link.handle ?? null,
        url: link.url,
        display_hint: link.display_hint ?? null,
        brand_color: link.brand_color ?? null,
        order_index: link.order_index ?? 0,
        is_active: link.is_active ?? true,
        show_in_navbar: link.show_in_navbar ?? true,
        show_in_footer: link.show_in_footer ?? true,
        show_in_drawer: link.show_in_drawer ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    return !error;
  } catch {
    return false;
  }
}

/**
 * Supprime un réseau social officiel.
 * Réservé au Cockpit (RLS admin). Retourne `true` en cas de succès.
 */
export async function deleteSocialLink(id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('site_social_links').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}


