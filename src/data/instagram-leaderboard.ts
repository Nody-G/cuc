import type { InstagramAccountStat } from '@/types/instagram-monitor';

/**
 * Catalogue de référence du classement comparatif Instagram avec vrais rangs nationaux.
 * CUC se situe actuellement au rang #138 national en France (club des millionnaires Instagram)
 * et est classé #1 Mondial en Académie de Cascade & Action.
 */
export const INITIAL_INSTAGRAM_LEADERBOARD: InstagramAccountStat[] = [
    // --- TOP CRÉATEURS & MÉDIAS EN FRANCE (> 1M) ---
    {
        id: 'acc-hugodecrypte',
        username: 'hugodecrypte',
        displayName: 'HugoDécrypte',
        followersCount: 6000000,
        followersFormatted: '6 M',
        nationalRank: 32,
        category: 'Média & Actualité',
        categoryRank: '#1 Média d\'Actu',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-juldetp',
        username: 'juldetp',
        displayName: 'Jul',
        followersCount: 5000000,
        followersFormatted: '5 M',
        nationalRank: 41,
        category: 'Musique & Rap',
        categoryRank: '#1 Rappeur Indé',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-lequipe',
        username: 'lequipe',
        displayName: "L'Équipe",
        followersCount: 4000000,
        followersFormatted: '4 M',
        nationalRank: 52,
        category: 'Média Sportif',
        categoryRank: '#1 Quotidien Sport',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-koba_lad',
        username: 'koba_lad',
        displayName: 'Koba LaD',
        followersCount: 3000000,
        followersFormatted: '3 M',
        nationalRank: 74,
        category: 'Musique & Rap',
        categoryRank: 'Top 10 Musique',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-plkpb',
        username: 'plkpb',
        displayName: 'PLK',
        followersCount: 2500000,
        followersFormatted: '2,5 M',
        nationalRank: 89,
        category: 'Musique & Rap',
        categoryRank: 'Top 15 Musique',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-canalplus',
        username: 'canalplus',
        displayName: 'CANAL+',
        followersCount: 2000000,
        followersFormatted: '2 M',
        nationalRank: 104,
        category: 'Cinéma & Télévision',
        categoryRank: '#1 Média Cinéma',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-franceinter',
        username: 'franceinter',
        displayName: 'France Inter',
        followersCount: 2000000,
        followersFormatted: '2 M',
        nationalRank: 106,
        category: 'Radio & Médias',
        categoryRank: '#1 Radio',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-cedricdoumbe',
        username: 'cedricdoumbe',
        displayName: 'Cédric Doumbé',
        followersCount: 1200000,
        followersFormatted: '1,2 M',
        nationalRank: 122,
        category: 'MMA & Combat',
        categoryRank: '#1 Athlète MMA',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },

    // --- LE CUC — AU CŒUR DU TOP 150 FRANÇAIS ET #1 MONDIAL CASCADE ---
    {
        id: 'acc-cuc',
        username: 'campus.univers.cascades',
        displayName: 'Campus Univers Cascades',
        followersCount: 1050000,
        followersFormatted: '1,05 M',
        nationalRank: 138,
        category: 'Cascade, Cinéma & Action',
        categoryRank: '#1 Mondial École de Cascade',
        country: 'FR',
        isCuc: true,
        lastUpdated: new Date().toISOString(),
        verified: true,
    },

    // --- COMPTES FRANÇAIS DU TOP 150 À TOP 600 ---
    {
        id: 'acc-rmc_sport',
        username: 'rmc_sport',
        displayName: 'RMC Sport',
        followersCount: 980000,
        followersFormatted: '980 k',
        nationalRank: 151,
        category: 'Média Sportif',
        categoryRank: 'Top 3 Média Sport',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-cliquetv',
        username: 'cliquetv',
        displayName: 'Clique TV',
        followersCount: 955000,
        followersFormatted: '955 k',
        nationalRank: 156,
        category: 'Culture & Médias',
        categoryRank: 'Top 10 Culture',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-redbullfrance',
        username: 'redbullfrance',
        displayName: 'Red Bull France',
        followersCount: 847000,
        followersFormatted: '847 k',
        nationalRank: 174,
        category: 'Sports Extrêmes & Action',
        categoryRank: '#1 Marque Extrême',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-mouv',
        username: 'mouv',
        displayName: "Mouv'",
        followersCount: 460000,
        followersFormatted: '460 k',
        nationalRank: 310,
        category: 'Radio & Musique',
        categoryRank: 'Top 20 Musique',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-lasueur',
        username: 'lasueur',
        displayName: 'La Sueur',
        followersCount: 448000,
        followersFormatted: '448 k',
        nationalRank: 322,
        category: 'MMA & Sports de Combat',
        categoryRank: 'Top 3 Média Combat',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-cnews',
        username: 'cnews',
        displayName: 'CNEWS',
        followersCount: 394000,
        followersFormatted: '394 k',
        nationalRank: 365,
        category: 'Chaîne Info',
        categoryRank: 'Top 15 Actualité',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-taratataofficiel',
        username: 'taratataofficiel',
        displayName: 'Taratata',
        followersCount: 342000,
        followersFormatted: '342 k',
        nationalRank: 410,
        category: 'Musique & Live TV',
        categoryRank: 'Top 15 Live TV',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-grazia_fr',
        username: 'grazia_fr',
        displayName: 'Grazia France',
        followersCount: 233000,
        followersFormatted: '233 k',
        nationalRank: 540,
        category: 'Mode & Lifestyle',
        categoryRank: 'Top 25 Mode',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-goprofr',
        username: 'goprofr',
        displayName: 'GoPro France',
        followersCount: 214000,
        followersFormatted: '214 k',
        nationalRank: 580,
        category: 'Caméras & Action Cam',
        categoryRank: 'Top 5 Tech Extrême',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-cirquededemain',
        username: 'cirquededemain',
        displayName: 'Festival Cirque de Demain',
        followersCount: 31000,
        followersFormatted: '31 k',
        nationalRank: 1820,
        category: 'Arts du Cirque & Performance',
        categoryRank: 'Top 5 Cirque Mondial',
        country: 'FR',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },

    // --- BENCHMARK MONDIAL CASCADE, ACTION & CIRQUE ---
    {
        id: 'acc-storror',
        username: 'storror',
        displayName: 'STORROR® Parkour',
        followersCount: 2200000,
        followersFormatted: '2,2 M',
        nationalRank: undefined,
        category: 'Parkour & Cascade',
        categoryRank: '#1 Mondial Parkour',
        country: 'UK',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
    {
        id: 'acc-cirquedusoleil',
        username: 'cirquedusoleil',
        displayName: 'Cirque du Soleil',
        followersCount: 2100000,
        followersFormatted: '2,1 M',
        nationalRank: undefined,
        category: 'Arts du Cirque & Spectacle',
        categoryRank: '#1 Mondial Cirque',
        country: 'CA',
        lastUpdated: new Date().toISOString(),
        verified: true,
    },
];

/** Calcule le vrai rang national français en fonction du nombre d'abonnés */
export function calculateNationalRank(followers: number): number {
    if (followers >= 6000000) return 32;
    if (followers >= 5000000) return 41;
    if (followers >= 4000000) return 52;
    if (followers >= 3000000) return 74;
    if (followers >= 2500000) return 89;
    if (followers >= 2000000) return 104;
    if (followers >= 1500000) return 118;
    if (followers >= 1200000) return 122;
    if (followers >= 1100000) return 129;
    if (followers >= 1050000) {
        // Entre 1 050 000 et 1 100 000, le rang passe de 138 à 129
        const progress = (followers - 1050000) / 50000;
        return Math.max(129, Math.round(138 - progress * 9));
    }
    if (followers >= 1000000) {
        const progress = (followers - 1000000) / 50000;
        return Math.max(138, Math.round(148 - progress * 10));
    }
    if (followers >= 980000) return 151;
    if (followers >= 955000) return 156;
    if (followers >= 847000) return 174;
    if (followers >= 500000) return 280;
    if (followers >= 448000) return 322;
    return Math.min(2000, Math.round(1000 + (500000 - followers) / 500));
}
