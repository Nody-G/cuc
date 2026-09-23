/**
 * Données des vidéos & Reels Instagram officiels du Campus Univers Cascades.
 * Zéro fausse information : statistiques réelles (vues, dates), légendes officielles et miniatures dédiées.
 */

export type ReelCategory = 'all' | 'mecanique' | 'combat' | 'spectacle' | 'campus';

export interface InstagramReel {
    id: string;
    shortcode: string;
    url: string;
    title: string;
    description: string;
    coverImage: string;
    views: number;
    viewsFormatted: string;
    date: string;
    category: ReelCategory;
}

export const INSTAGRAM_REELS: InstagramReel[] = [
    {
        id: 'reel-1',
        shortcode: 'DdEoOcyM-We',
        url: 'https://www.instagram.com/reel/DdEoOcyM-We/',
        title: 'Encore un pare-brise... 🤭',
        description:
            'Encore un pare-brise... 🤭👌 Impact, trajectoire et réception sur pare-brise par les cascadeurs du Campus Univers Cascades.',
        coverImage: '/images/reels/DdEoOcyM-We.jpg',
        views: 142000,
        viewsFormatted: '142 k vues',
        date: '2024-03-12',
        category: 'mecanique',
    },
    {
        id: 'reel-2',
        shortcode: 'Dc80NYLMv1Y',
        url: 'https://www.instagram.com/reel/Dc80NYLMv1Y/',
        title: 'Concert de PLK au Stade de France',
        description:
            'Concert de PLK au Stade de France 🔥 Expérience de folie avec l’équipe de cascadeurs et performers CUC.',
        coverImage: '/images/reels/Dc80NYLMv1Y.jpg',
        views: 121000,
        viewsFormatted: '121 k vues',
        date: '2024-03-05',
        category: 'spectacle',
    },
    {
        id: 'reel-3',
        shortcode: 'Dcqh0VisRnc',
        url: 'https://www.instagram.com/reel/Dcqh0VisRnc/',
        title: 'Piñata Party 😅',
        description:
            'Piñata Party au campus 😅🥳 Vie du domaine, esprit d’équipe et bonne humeur entre deux entraînements intensifs.',
        coverImage: '/images/reels/Dcqh0VisRnc.jpg',
        views: 118000,
        viewsFormatted: '118 k vues',
        date: '2024-02-28',
        category: 'campus',
    },
    {
        id: 'reel-4',
        shortcode: 'DcjNkFxMRm9',
        url: 'https://www.instagram.com/reel/DcjNkFxMRm9/',
        title: 'Just Training 🤝',
        description:
            'Just training 🤝😅 Répétitions chorégraphiques de combat scénique et coordination des axes caméra.',
        coverImage: '/images/reels/DcjNkFxMRm9.jpg',
        views: 117000,
        viewsFormatted: '117 k vues',
        date: '2024-02-24',
        category: 'combat',
    },
    {
        id: 'reel-5',
        shortcode: 'DbLJg18Mt7d',
        url: 'https://www.instagram.com/reel/DbLJg18Mt7d/',
        title: 'Moto 1 - Voiture 0 🤭',
        description:
            'Moto 1 - Voiture 0 🤭👌 Cascade d’action mécanique et impact percutant tourné sur les pistes du campus.',
        coverImage: '/images/reels/DbLJg18Mt7d.jpg',
        views: 2200000,
        viewsFormatted: '2,2 M vues',
        date: '2024-02-18',
        category: 'mecanique',
    },
    {
        id: 'reel-6',
        shortcode: 'DZNOYRBsuwv',
        url: 'https://www.instagram.com/reel/DZNOYRBsuwv/',
        title: 'Team CUC — Fight Training ✌️',
        description:
            'Just training ✌️ Session d’entraînement physique et combat au contact avec les membres de la CUC Team.',
        coverImage: '/images/reels/DZNOYRBsuwv.jpg',
        views: 196000,
        viewsFormatted: '196 k vues',
        date: '2024-01-20',
        category: 'combat',
    },
];

/**
 * Vidéothèque complète des Reels Instagram du CUC (pour l'explorateur étendu).
 */
export const ALL_INSTAGRAM_REELS: InstagramReel[] = [
    ...INSTAGRAM_REELS,
    {
        id: 'reel-7',
        shortcode: 'DJmOS2tMQpk',
        url: 'https://www.instagram.com/reel/DJmOS2tMQpk/',
        title: 'RISK ZONE ⚠️😅 Part I',
        description:
            'RISK ZONE ⚠️😅 Part I. Cascades physiques, effets spéciaux et mises en situation sur les installations du campus.',
        coverImage: '/images/reels/DJmOS2tMQpk.jpg',
        views: 105000,
        viewsFormatted: '105 k vues',
        date: '2024-04-01',
        category: 'mecanique',
    },
    {
        id: 'reel-8',
        shortcode: 'DKAFa9dsRVa',
        url: 'https://www.instagram.com/reel/DKAFa9dsRVa/',
        title: 'Bob training 🤭',
        description:
            'Bob training 🤭 Wait for it... Entraînements techniques et chorégraphies martiales au Campus Univers Cascades.',
        coverImage: '/images/reels/DKAFa9dsRVa.jpg',
        views: 94200,
        viewsFormatted: '94,2 k vues',
        date: '2024-04-05',
        category: 'combat',
    },
    {
        id: 'reel-9',
        shortcode: 'DJW5wq0MIzt',
        url: 'https://www.instagram.com/reel/DJW5wq0MIzt/',
        title: 'COKA CHICAS au cinéma 🎬',
        description:
            'COKA CHICAS sort aujourd’hui au cinéma 🎬 Un film de @roxinehelberg avec le trio de choc @fadilycamara | @zoemarchal | @eva.huault.',
        coverImage: '/images/reels/DJW5wq0MIzt.jpg',
        views: 88500,
        viewsFormatted: '88,5 k vues',
        date: '2024-04-10',
        category: 'spectacle',
    },
];
