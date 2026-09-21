export interface FilmBanner {
  id: string;
  title: string;
  url: string;
  description: string;
}

/**
 * Bandes d'affiches du CUC — DÉSORMAIS VIDE (décision client).
 *
 * Ces six visuels étaient des **frises composites** fabriquées à partir des
 * affiches de l'ancien site (« Bandes-affiches-film-1/3/4.png », « Bandeau-… »).
 * Le client a demandé leur suppression pour ne plus s'appuyer que sur les
 * **vraies affiches** des films, servies individuellement (voir `filmography.ts`
 * et le catalogue `site_films`).
 *
 * Les fichiers correspondants ont été retirés du Storage, la clé
 * `site_settings.film_banners` est vidée, et la section qui les affichait
 * (`TeamBannersSection`) ne rend plus rien. La structure est conservée pour ne
 * pas casser l'API (`getFilmBanners`) ni le type `FilmBanner`.
 */
export const OFFICIAL_FILM_BANNERS: FilmBanner[] = [];
