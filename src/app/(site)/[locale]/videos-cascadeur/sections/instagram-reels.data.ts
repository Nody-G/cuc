/**
 * Données par défaut des vidéos & Reels Instagram du Campus Univers Cascades.
 * Zéro fausse information : chaque vidéo correspond rigoureusement à sa légende et sa miniature réelle.
 */

export interface InstagramReel {
    id: string;
    shortcode: string;
    url: string;
    title: string;
    description: string;
    coverImage: string;
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
    },
    {
        id: 'reel-2',
        shortcode: 'Dc80NYLMv1Y',
        url: 'https://www.instagram.com/reel/Dc80NYLMv1Y/',
        title: 'Concert de PLK au Stade de France',
        description:
            'Concert de PLK au Stade de France 🔥 Expérience de folie avec l’équipe de cascadeurs et performers CUC.',
        coverImage: '/images/reels/Dc80NYLMv1Y.jpg',
    },
    {
        id: 'reel-3',
        shortcode: 'Dcqh0VisRnc',
        url: 'https://www.instagram.com/reel/Dcqh0VisRnc/',
        title: 'Piñata Party 😅',
        description:
            'Piñata Party au campus 😅🥳 Vie du domaine, esprit d’équipe et bonne humeur entre deux entraînements intensifs.',
        coverImage: '/images/reels/Dcqh0VisRnc.jpg',
    },
    {
        id: 'reel-4',
        shortcode: 'DcjNkFxMRm9',
        url: 'https://www.instagram.com/reel/DcjNkFxMRm9/',
        title: 'Just Training 🤝',
        description:
            'Just training 🤝😅 Répétitions chorégraphiques de combat scénique et coordination des axes caméra.',
        coverImage: '/images/reels/DcjNkFxMRm9.jpg',
    },
    {
        id: 'reel-5',
        shortcode: 'DbLJg18Mt7d',
        url: 'https://www.instagram.com/reel/DbLJg18Mt7d/',
        title: 'Moto 1 - Voiture 0 🤭',
        description:
            'Moto 1 - Voiture 0 🤭👌 Cascade d’action mécanique et impact percutant tourné sur les pistes du campus.',
        coverImage: '/images/reels/DbLJg18Mt7d.jpg',
    },
    {
        id: 'reel-6',
        shortcode: 'DZNOYRBsuwv',
        url: 'https://www.instagram.com/reel/DZNOYRBsuwv/',
        title: 'Team CUC — Fight Training ✌️',
        description:
            'Just training ✌️ Session d’entraînement physique et combat au contact avec les membres de la CUC Team.',
        coverImage: '/images/reels/DZNOYRBsuwv.jpg',
    },
];
