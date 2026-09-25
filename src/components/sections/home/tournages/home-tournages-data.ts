/**
 * Données et contrats du bloc « tournages » de la page Accueil.
 */

export interface HighlightProject {
    title: string;
    year: string;
    poster: string;
}

/**
 * Données éditables du bloc « tournages » (page Accueil).
 * Toutes les clés sont optionnelles : en leur absence, les valeurs
 * certifiées ci-dessous sont utilisées (zéro régression).
 */
export interface HomeTournagesData {
    badge?: string;
    title?: string;
    subtitle?: string;
    team_tag?: string;
    cta_text?: string;
    cta_link?: string;
    cta_production?: string;
    cta_catalog?: string;
    pillar1_title?: string;
    pillar1_desc?: string;
    pillar2_title?: string;
    pillar2_desc?: string;
    pillar3_title?: string;
    pillar3_desc?: string;
}

export interface HomeVirtualTourData {
    badge?: string;
    title?: string;
    subtitle?: string;
    tag?: string;
    cta_text?: string;
    cta_link?: string;
    installations_cta?: string;
    hud_title?: string;
    hud_hint?: string;
    image_url?: string;
}

/**
 * Sélection éditoriale de longs métrages — vérifiés comme tels (typologie
 * IMDb `movie`, cf. `metadata.title_type` en base). La seule distinction
 * autorisée est reprise ici : aucune étiquette marketing.
 *
 * Source de vérité des affiches : `site_films` (résolution par titre
 * normalisé `creditTitleKey`). La jaquette IMDb ci-dessous n'est qu'un
 * dernier recours d'AFFICHAGE pour une sélection éditoriale pas encore
 * cataloguée — la navigation de repli reste le catalogue complet.
 *
 * Doctrine i18n : titres et années sont des données (noms propres, aucune
 * traduction) ; les rôles d'intervention par production vivent dans
 * `home.tournages.actorRoles` (alignés par index, cf. `FEATURED_PRODUCTIONS`).
 */
export const FEATURED_PRODUCTIONS: HighlightProject[] = [
    {
        title: "L'Amour ouf",
        year: '2024',
        poster: 'https://m.media-amazon.com/images/M/MV5BNjY0NGU4NDMtYWI2ZS00NDE2LWE5MzUtM2UyODUyNmFmN2ZhXkEyXkFqcGc@._V1_.jpg',
    },
    {
        title: 'Nouveaux riches',
        year: '2023',
        poster: 'https://m.media-amazon.com/images/M/MV5BNTNkOTYzZjgtYzE0Yy00NGY1LThjNmQtMjFkMWZiMTNmMmZlXkEyXkFqcGc@._V1_.jpg',
    },
    {
        title: 'Chien 51',
        year: '2025',
        poster: 'https://m.media-amazon.com/images/M/MV5BMzgxMjMyZDUtOTA5Yy00ODYyLWJhMDEtNDBhMDc1YjQwNGE4XkEyXkFqcGc@._V1_.jpg',
    },
    {
        title: 'Le négociateur',
        year: '2023',
        poster: 'https://m.media-amazon.com/images/M/MV5BY2Y2MTViMWItYTgyOS00ZGRhLWE0YzItNzQ3ZmM5MjA1NjE3XkEyXkFqcGc@._V1_.jpg',
    },
];
