import { PROGRAMMES_TV } from '@/data/videos';

/** Titre et sous-titre localisés d'un programme, appariés par `dmId`. */
export interface VideoCopy {
    dmId: string;
    title: string;
    sub: string;
}

export interface MediaItem {
    channel: string;
    label: string;
}

export type VideosProgram = (typeof PROGRAMMES_TV)[number];

/** Visuels et sources vidéo de la page (Supabase Storage). */
export const VIDEOS_MEDIA = {
    heroFallback:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-5-scaled.jpg',
    tf1Poster:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/ReportageBFMTV-Alecoledescascadeurs.jpeg',
    tf1Source:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/reportages/TF1-JT-20h-CUC-reportage-1.mp4',
    france2Poster:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/coeur-de-cascadeurs.jpeg',
    france2Sources: [
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/reportages/20h30-A-LECOLE-DES-CASCADEURS-FRANCE2-VWeb2-1-part1.mp4',
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/reportages/20h30-A-LECOLE-DES-CASCADEURS-FRANCE2-VWeb2-1-part2.mp4',
    ],
} as const;
