export interface FilmBanner {
  id: string;
  title: string;
  url: string;
  description: string;
}

// Bandes d'affiches du CUC.
// Les descriptions ont été retirées : seuls les visuels authentiques sont
// présentés, sans commentaire inventé.
export const OFFICIAL_FILM_BANNERS: FilmBanner[] = [
  {
    id: 'banner-lucas-cuc',
    title: 'Bandeau — Films Coordonnés par Lucas Dollfus & CUC',
    url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Bandeau-Films-Lucas-CUC-bis-scaled.jpg',
    description: '',
  },
  {
    id: 'banner-2023',
    title: 'Affiches CUC 2023-2024',
    url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Bandeau-2023-scaled.jpg',
    description: '',
  },
  {
    id: 'banner-images-films',
    title: 'Stills & Cascades de Tournage',
    url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Bandeau-images-films.png',
    description: '',
  },
  {
    id: 'banner-affiches-1',
    title: 'Frise Affiches Cinéma — Série 1',
    url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Bandes-affiches-film-1-1.png',
    description: '',
  },
  {
    id: 'banner-affiches-3',
    title: 'Frise Affiches Cinéma — Série 2',
    url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Bandes-affiches-film-3.png',
    description: '',
  },
  {
    id: 'banner-affiches-4',
    title: 'Frise Affiches Cinéma — Série 3',
    url: 'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Bandes-affiches-film-4.png',
    description: '',
  },
];
