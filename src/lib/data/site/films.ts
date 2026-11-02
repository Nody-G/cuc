/**
 * Catalogue films, célébrités doublées, affiches — extrait de `site-service.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2.
 */

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
let staticDirectorsCache: Map<string, string> | null = null;

async function loadStaticFilmography(): Promise<FilmCredit[]> {
  const mod = await import('@/data/filmography');
  return mod.FILMOGRAPHY_CREDITS;
}

async function getStaticDirectors(): Promise<Map<string, string>> {
  if (!staticDirectorsCache) {
    const credits = await loadStaticFilmography();
    staticDirectorsCache = new Map(
      credits.filter((f) => !!f.director).map((f) => [
        creditTitleKey(f.title),
        f.director as string,
      ])
    );
  }
  return staticDirectorsCache;
}

let filmsCache: { data: FilmCredit[]; expiresAt: number } | null = null;
let inFlightFilms: Promise<FilmCredit[]> | null = null;
const FILMS_CACHE_TTL_MS = 10_000;

/**
 * Récupère la filmographie avec déduplication des requêtes simultanées
 * (évite que HallOfFame + CucFilmsShowcase + useEquipeCascadeursData ne téléchargent
 * chacun les 1 089 films en parallèle au montage de la page).
 */
export async function getFilms(): Promise<FilmCredit[]> {
  if (filmsCache && Date.now() < filmsCache.expiresAt) {
    return filmsCache.data;
  }
  if (inFlightFilms) {
    return inFlightFilms;
  }

  inFlightFilms = (async () => {
    try {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('site_films')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) {
        const { data: settingRow } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'films')
          .maybeSingle();

        if (settingRow && Array.isArray(settingRow.value) && settingRow.value.length > 0) {
          return settingRow.value as FilmCredit[];
        }
        return await loadStaticFilmography();
      }

      const needsDirectorFallback = data.some((f) => !f.director);
      const staticDirectors = needsDirectorFallback ? await getStaticDirectors() : null;
      const mapped = data.map((f) => ({
        id: f.id,
        title: f.title,
        year: f.year || '',
        category: normalizeFilmCategory(f.category),
        director: f.director || staticDirectors?.get(creditTitleKey(f.title)),
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

      filmsCache = { data: mapped, expiresAt: Date.now() + FILMS_CACHE_TTL_MS };
      return mapped;
    } catch {
      return await loadStaticFilmography();
    } finally {
      inFlightFilms = null;
    }
  })();

  return inFlightFilms;
}

/**
 * Récupère les célébrités et comédiens doublés par le CUC.
 * Persisté dans Supabase (site_settings key='celebrities').
 */
export async function getCelebrities(): Promise<DoubledCelebrity[]> {
  try {
    const supabase = await getSupabaseClient();
    const { data: row } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'celebrities')
      .maybeSingle();

    const raw = row?.value;
    const list = Array.isArray(raw)
      ? raw
      : (raw?.list && Array.isArray(raw.list) ? raw.list : null);

    if (list && list.length > 0) {
      return list as DoubledCelebrity[];
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
    const supabase = await getSupabaseClient();
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
