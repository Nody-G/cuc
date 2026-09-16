export interface FilmBanner {
  id: string;
  title: string;
  url: string;
  description: string;
}

export const OFFICIAL_FILM_BANNERS: FilmBanner[] = [
  {
    id: 'banner-lucas-cuc',
    title: 'Bandeau Officiel — Films Coordonnés par Lucas Dollfus & CUC',
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2026/04/Bandeau-Films-Lucas-CUC-bis-scaled.jpg',
    description: 'Productions cinématographiques coordonnées par Lucas Dollfus et la CUC Stunt Team',
  },
  {
    id: 'banner-2023',
    title: 'Affiches Officielles CUC 2023-2024',
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/11/Bandeau-2023-scaled.jpg',
    description: 'Sélection des sorties cinéma avec participation des cascadeurs du CUC',
  },
  {
    id: 'banner-images-films',
    title: 'Stills & Cascades de Tournage',
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2023/03/Bandeau-images-films.png',
    description: 'Photographies de plateau et scènes d\'action coordonnées par le campus',
  },
  {
    id: 'banner-affiches-1',
    title: 'Frise Affiches Cinéma — Série 1',
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Bandes-affiches-film-1-1.png',
    description: 'Historique des collaborations cinéma du Campus Univers Cascades',
  },
  {
    id: 'banner-affiches-3',
    title: 'Frise Affiches Cinéma — Série 2',
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Bandes-affiches-film-3.png',
    description: 'Films français et internationaux avec cascadeurs diplômés du CUC',
  },
  {
    id: 'banner-affiches-4',
    title: 'Frise Affiches Cinéma — Série 3',
    url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Bandes-affiches-film-4.png',
    description: 'Longs-métrages et téléfilms d\'action',
  },
];
