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

/** Visuels de la page (Supabase Storage). */
export const VIDEOS_MEDIA = {
    heroFallback:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/slider-5-scaled.jpg',
} as const;
