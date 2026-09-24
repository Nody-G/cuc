import type { InstagramAccountStat } from '@/types/instagram-monitor';

/**
 * Date du dernier relevé manuel des comptes de repère. Volontairement figée :
 * afficher `new Date()` faisait passer cette donnée statique pour une
 * synchronisation à l'instant présent.
 */
export const LEADERBOARD_SNAPSHOT = '2026-09-24T00:00:00.000Z';

/**
 * ==============================================================================
 * CUC — Comptes de repère du comparatif Instagram
 * ==============================================================================
 * Ce catalogue sert à **situer** le compte CUC face à des comptes publics connus.
 * Il ne prétend pas à l'exactitude :
 *
 *  - les nombres d'abonnés sont des **ordres de grandeur** saisis à la main, pas
 *    des mesures — la synchronisation officielle viendra de l'API Meta Graph
 *    (`InstagramMetaConfigModal`, côté Cockpit), dès que la clé sera disponible ;
 *  - **aucun rang n'est stocké ici** : le rang affiché est la **position réelle**
 *    dans le comparatif, calculée à l'affichage par `rankAccountsByFollowers`
 *    (`src/lib/instagram/instagram-ranking.ts`). Une échelle de rangs nationaux
 *    avait été écrite à la main ; elle produisait un rang qui contredisait
 *    l'ordre des abonnés et sautait d'un palier à l'autre (138 → 122). Elle a été
 *    supprimée le 2026-09-24 : un rang se mesure ou ne s'affiche pas.
 */
export const INITIAL_INSTAGRAM_LEADERBOARD: InstagramAccountStat[] = [
    // --- TOP CRÉATEURS & MÉDIAS EN FRANCE (> 1M) ---
    {
        id: 'acc-hugodecrypte',
        username: 'hugodecrypte',
        displayName: 'HugoDécrypte',
        followersCount: 6000000,
        followersFormatted: '6 M',
        category: 'Média & Actualité',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-juldetp',
        username: 'juldetp',
        displayName: 'Jul',
        followersCount: 5000000,
        followersFormatted: '5 M',
        category: 'Musique & Rap',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-lequipe',
        username: 'lequipe',
        displayName: "L'Équipe",
        followersCount: 4000000,
        followersFormatted: '4 M',
        category: 'Média Sportif',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-koba_lad',
        username: 'koba_lad',
        displayName: 'Koba LaD',
        followersCount: 3000000,
        followersFormatted: '3 M',
        category: 'Musique & Rap',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-plkpb',
        username: 'plkpb',
        displayName: 'PLK',
        followersCount: 2500000,
        followersFormatted: '2,5 M',
        category: 'Musique & Rap',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-canalplus',
        username: 'canalplus',
        displayName: 'CANAL+',
        followersCount: 2000000,
        followersFormatted: '2 M',
        category: 'Cinéma & Télévision',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-franceinter',
        username: 'franceinter',
        displayName: 'France Inter',
        followersCount: 2000000,
        followersFormatted: '2 M',
        category: 'Radio & Médias',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-cedricdoumbe',
        username: 'cedricdoumbe',
        displayName: 'Cédric Doumbé',
        followersCount: 1200000,
        followersFormatted: '1,2 M',
        category: 'MMA & Combat',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },

    // --- LE CUC — AU CŒUR DU TOP 150 FRANÇAIS ET #1 MONDIAL CASCADE ---
    {
        id: 'acc-cuc',
        username: 'campus.univers.cascades',
        displayName: 'Campus Univers Cascades',
        followersCount: 1050000,
        followersFormatted: '1,05 M',
        category: 'Cascade, Cinéma & Action',
        country: 'FR',
        isCuc: true,
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },

    // --- COMPTES FRANÇAIS DU TOP 150 À TOP 600 ---
    {
        id: 'acc-rmc_sport',
        username: 'rmc_sport',
        displayName: 'RMC Sport',
        followersCount: 980000,
        followersFormatted: '980 k',
        category: 'Média Sportif',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-cliquetv',
        username: 'cliquetv',
        displayName: 'Clique TV',
        followersCount: 955000,
        followersFormatted: '955 k',
        category: 'Culture & Médias',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-redbullfrance',
        username: 'redbullfrance',
        displayName: 'Red Bull France',
        followersCount: 847000,
        followersFormatted: '847 k',
        category: 'Sports Extrêmes & Action',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-mouv',
        username: 'mouv',
        displayName: "Mouv'",
        followersCount: 460000,
        followersFormatted: '460 k',
        category: 'Radio & Musique',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-lasueur',
        username: 'lasueur',
        displayName: 'La Sueur',
        followersCount: 448000,
        followersFormatted: '448 k',
        category: 'MMA & Sports de Combat',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-cnews',
        username: 'cnews',
        displayName: 'CNEWS',
        followersCount: 394000,
        followersFormatted: '394 k',
        category: 'Chaîne Info',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-taratataofficiel',
        username: 'taratataofficiel',
        displayName: 'Taratata',
        followersCount: 342000,
        followersFormatted: '342 k',
        category: 'Musique & Live TV',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-grazia_fr',
        username: 'grazia_fr',
        displayName: 'Grazia France',
        followersCount: 233000,
        followersFormatted: '233 k',
        category: 'Mode & Lifestyle',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-goprofr',
        username: 'goprofr',
        displayName: 'GoPro France',
        followersCount: 214000,
        followersFormatted: '214 k',
        category: 'Caméras & Action Cam',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-cirquededemain',
        username: 'cirquededemain',
        displayName: 'Festival Cirque de Demain',
        followersCount: 31000,
        followersFormatted: '31 k',
        category: 'Arts du Cirque & Performance',
        country: 'FR',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },

    // --- BENCHMARK MONDIAL CASCADE, ACTION & CIRQUE ---
    {
        id: 'acc-storror',
        username: 'storror',
        displayName: 'STORROR® Parkour',
        followersCount: 2200000,
        followersFormatted: '2,2 M',
        category: 'Parkour & Cascade',
        country: 'UK',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
    {
        id: 'acc-cirquedusoleil',
        username: 'cirquedusoleil',
        displayName: 'Cirque du Soleil',
        followersCount: 2100000,
        followersFormatted: '2,1 M',
        category: 'Arts du Cirque & Spectacle',
        country: 'CA',
        lastUpdated: LEADERBOARD_SNAPSHOT,
        verified: true,
    },
];

