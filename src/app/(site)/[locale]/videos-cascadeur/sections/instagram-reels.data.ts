/**
 * Données des vidéos & Reels Instagram officiels du Campus Univers Cascades.
 * Zéro badge ni étiquette marketing conformément à la règle stricte du projet.
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
        title: 'Chorégraphie & Combat Rapproché',
        description: 'Enchaînements physiques et synchronisation caméra lors des sessions intensives au campus.',
        coverImage:
            'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/001.jpg',
    },
    {
        id: 'reel-2',
        shortcode: 'DKAFa9dsRVa',
        url: 'https://www.instagram.com/reel/DKAFa9dsRVa/',
        title: 'Chutes & Absorptions',
        description: 'Travail des impacts, réceptions au sol et gestion des trajectoires avec nos cascadeurs pro.',
        coverImage:
            'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/002.jpg',
    },
    {
        id: 'reel-3',
        shortcode: 'DJmOS2tMQpk',
        url: 'https://www.instagram.com/reel/DJmOS2tMQpk/',
        title: 'Défénestration & Hauteur',
        description: 'Sauts en immersion et franchissements spectaculaires sur les infrastructures de la tour CUC.',
        coverImage:
            'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/defenestration.jpg',
    },
];
