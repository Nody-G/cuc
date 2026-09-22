/**
 * Réglages du site (settings, annonce active, vidéos, placements 3D) — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { PROGRAMMES_TV, ProgrammeTvItem } from '@/data/videos';
import { getSupabaseClient } from './client';
import { SiteAnnouncement } from './types';
import { SiteSettings } from './types';
import { DEFAULT_SITE_SETTINGS } from './defaults/settings';

/**
 * Récupère les reportages TV et vidéos d'archives du CUC.
 * Persisté dans Supabase (site_settings key='videos').
 */
export async function getVideos(): Promise<ProgrammeTvItem[]> {
  try {
    const supabase = getSupabaseClient();
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
 * Récupère les placements 3D du plan campus (studio de placement).
 * Persisté dans Supabase (site_settings key='campus_placements_3d').
 *
 * Retourne `null` si aucun placement n'a encore été enregistré, afin que
 * l'appelant puisse retomber sur `DEFAULT_FACILITIES` (positions calibrées
 * sur les empreintes OSM réelles) sans écraser la source de vérité.
 */
export async function getCampusPlacements3D(): Promise<Record<string, unknown> | null> {
  try {
    const supabase = getSupabaseClient();
    const { data: row } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'campus_placements_3d')
      .maybeSingle();

    const value = row?.value as { placements?: Record<string, unknown> } | undefined;
    if (value?.placements && typeof value.placements === 'object') {
      return value.placements;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Récupère le bandeau d'alerte / flash info actif (s'il existe).
 */
export async function getActiveAnnouncement(): Promise<SiteAnnouncement | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_announcements')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as SiteAnnouncement;
  } catch {
    return null;
  }
}

/**
 * Récupère les coordonnées et paramètres globaux du site.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'general')
      .maybeSingle();

    if (error || !data?.value) return DEFAULT_SITE_SETTINGS;
    return { ...DEFAULT_SITE_SETTINGS, ...(data.value as SiteSettings) };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
