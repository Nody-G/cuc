/**
 * Catalogue films, célébrités doublées, affiches — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

import { FILMOGRAPHY_CREDITS } from '@/data/filmography';
import { DOUBLED_CELEBRITIES } from '@/data/celebrities';
import { OFFICIAL_FILM_BANNERS, FilmBanner } from '@/data/filmBanners';
import { FilmCredit, DoubledCelebrity } from '@/types';
import { normalizeFilmCategory } from '@/lib/film-category';
import { creditTitleKey } from '@/lib/credit-title';
import { getSupabaseClient } from './client';

/**
 * Réalisateurs de référence du catalogue éditorial, indexés par titre normalisé.
 *
 * Repli de lecture : des fiches importées en base n'ont pas de réalisateur. On
 * reprend alors la valeur **vérifiée** du catalogue du dépôt (aucune invention) —
 * sinon le nom du réalisateur manquait sur les jaquettes et dans la fiche film.
 */
const STATIC_DIRECTORS = new Map(
  FILMOGRAPHY_CREDITS.filter((f) => !!f.director).map((f) => [
    creditTitleKey(f.title),
    f.director as string,
  ])
);

/**
 * Récupère la filmographie.
 */
export async function getFilms(): Promise<FilmCredit[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('site_films')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      /**
       * Repli miroir : la clé réelle est `films` (tableau JSON des 63 crédits
       * éditoriaux). L'ancienne clé `filmography_credits` n'existe dans AUCUNE
       * configuration de `site_settings` : ce chemin de repli était mort et
       * retombait systématiquement sur la constante du dépôt.
       */
      const { data: settingRow } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'films')
        .maybeSingle();

      if (settingRow && Array.isArray(settingRow.value) && settingRow.value.length > 0) {
        return settingRow.value as FilmCredit[];
      }
      return FILMOGRAPHY_CREDITS;
    }

    return data.map((f) => ({
      id: f.id,
      title: f.title,
      year: f.year || '',
      // Garde-fou de lecture : tout reliquat de l'ancien vocabulaire marketing
      // en base est converti (ou vidé) — il ne peut donc jamais atteindre l'UI.
      category: normalizeFilmCategory(f.category),
      director: f.director || STATIC_DIRECTORS.get(creditTitleKey(f.title)),
      stuntRoles: f.stunt_roles || '',
      description: f.description || '',
      doubledActors: f.doubled_actors,
      highlight: !!f.highlight,
      image: f.image || '',
      tag: f.tag || '',
      imdbUrl: f.imdb_url || '',
      allocineUrl: f.allocine_url || '',
      trailerUrl: f.trailer_url || '',
      cuc_team_involved: f.cuc_team_involved || [],
      cuc_team_roles: f.metadata?.cuc_team_roles || f.cuc_team_roles || {},
    }));
  } catch {
    return FILMOGRAPHY_CREDITS;
  }
}

/**
 * Récupère les célébrités et comédiens doublés par le CUC.
 * Persisté dans Supabase (site_settings key='celebrities').
 */
export async function getCelebrities(): Promise<DoubledCelebrity[]> {
  try {
    const supabase = getSupabaseClient();
    const { data: row } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'celebrities')
      .maybeSingle();

    if (row?.value?.list && Array.isArray(row.value.list) && row.value.list.length > 0) {
      return row.value.list as DoubledCelebrity[];
    }
    return DOUBLED_CELEBRITIES;
  } catch {
    return DOUBLED_CELEBRITIES;
  }
}

/**
 * Récupère les bannières cinéma panoramiques du CUC.
 * Persisté dans Supabase (site_settings key='film_banners').
 */
export async function getFilmBanners(): Promise<FilmBanner[]> {
  try {
    const supabase = getSupabaseClient();
    const { data: row } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'film_banners')
      .maybeSingle();

    if (row?.value?.list && Array.isArray(row.value.list) && row.value.list.length > 0) {
      return row.value.list as FilmBanner[];
    }
    return OFFICIAL_FILM_BANNERS;
  } catch {
    return OFFICIAL_FILM_BANNERS;
  }
}
