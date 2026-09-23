/**
 * Données par défaut des vidéos & Reels Instagram du Campus Univers Cascades.
 * Zéro fausse information : titres et légendes authentiques issues du compte officiel.
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
        shortcode: 'DJW5wq0MIzt',
        url: 'https://www.instagram.com/reel/DJW5wq0MIzt/',
        title: 'COKA CHICAS — Sortie Cinéma',
        description:
            'COKA CHICAS sort aujourd’hui au cinéma 🎬 Un film de @roxinehelberg avec le trio de choc @fadilycamara | @zoemarchal | @eva.huault.',
        coverImage:
            'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/001.jpg',
    },
    {
        id: 'reel-2',
        shortcode: 'DKAFa9dsRVa',
        url: 'https://www.instagram.com/reel/DKAFa9dsRVa/',
        title: 'Bob Training',
        description:
            'Bob training 🥋 Wait for it... Entraînements techniques et chorégraphies martiales au Campus Univers Cascades.',
        coverImage:
            'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/002.jpg',
    },
    {
        id: 'reel-3',
        shortcode: 'DJmOS2tMQpk',
        url: 'https://www.instagram.com/reel/DJmOS2tMQpk/',
        title: 'Risk Zone — Part I',
        description:
            'RISK ZONE ⚠️ Part I. Cascades physiques, effets et mises en situation sur les installations du campus.',
        coverImage:
            'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/defenestration.jpg',
    },
];
