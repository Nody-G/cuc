export interface FilmBanner {
  id: string;
  title: string;
  url: string;
  description: string;
}

// Bandes d'affiches officielles du CUC.
// Les descriptions ont été retirées : seuls les visuels authentiques sont
// présentés, sans commentaire inventé.
export const OFFICIAL_FILM_BANNERS: FilmBanner[] = [
  {
    id: 'banner-lucas-cuc',
    title: 'Bandeau Officiel — Films Coordonnés par Lucas Dollfus & CUC',
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2026/04/Bandeau-Films-Lucas-CUC-bis-scaled.jpg',
    description: '',
  },
  {
    id: 'banner-2023',
    title: 'Affiches Officielles CUC 2023-2024',
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/11/Bandeau-2023-scaled.jpg',
    description: '',
  },
  {
    id: 'banner-images-films',
    title: 'Stills & Cascades de Tournage',
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/03/Bandeau-images-films.png',
    description: '',
  },
  {
    id: 'banner-affiches-1',
    title: 'Frise Affiches Cinéma — Série 1',
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Bandes-affiches-film-1-1.png',
    description: '',
  },
  {
    id: 'banner-affiches-3',
    title: 'Frise Affiches Cinéma — Série 2',
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Bandes-affiches-film-3.png',
    description: '',
  },
  {
    id: 'banner-affiches-4',
    title: 'Frise Affiches Cinéma — Série 3',
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Bandes-affiches-film-4.png',
    description: '',
  },
];
