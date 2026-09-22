'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PROGRAMMES_TV } from '@/data/videos';
import { getVideos } from '@/lib/data/site-service';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import {
    VIDEOS_MEDIA,
    type MediaItem,
    type VideoCopy,
    type VideosProgram,
} from './videos-copy';

export interface VideosHeroCopy {
    badge: string;
    meta: string;
    title: string;
    subtitle: string;
    bg: string;
}

export interface VideosLabels {
    breadcrumbHome: string;
    breadcrumbCurrent: string;
    heroImageAlt: string;
    heroMeta: string;
    tabTf1: string;
    tabFrance2: string;
    videoFallback: string;
    tf1Title: string;
    tf1Desc: string;
    france2Title: string;
    france2Desc: string;
    broadcastBadge: string;
    docusBadge: string;
    docusTitle: string;
    docusHint: string;
    mediaTag: string;
    mediaTitle: string;
    mediaIntro: string;
    socialInstagram: string;
    socialTiktok: string;
    closeTitle: string;
}

export interface SelectedDmVideo {
    id: string;
    title: string;
}

export interface UseVideosPageResult {
    hero: VideosHeroCopy;
    labels: VideosLabels;
    activeVideo: 'tf1' | 'france2';
    setActiveVideo: (video: 'tf1' | 'france2') => void;
    selectedDmVideo: SelectedDmVideo | null;
    openDmVideo: (video: SelectedDmVideo) => void;
    closeDmVideo: () => void;
    localizedPrograms: VideosProgram[];
    mediaItems: MediaItem[];
}

export function useVideosPage(): UseVideosPageResult {
    const t = useTranslations('videos');
    const [activeVideo, setActiveVideo] = React.useState<'tf1' | 'france2'>('tf1');
    const [selectedDmVideo, setSelectedDmVideo] = React.useState<SelectedDmVideo | null>(null);
    const [tvPrograms, setTvPrograms] = React.useState(PROGRAMMES_TV);
    const { content } = usePageDynamicContent('videos-cascadeur');
    const videoCopy = t.raw('programs') as VideoCopy[];
    const mediaItems = t.raw('mediaItems') as MediaItem[];

    /** Recharge les programmes TV (état initial + synchronisation Realtime). */
    const loadVideos = React.useCallback(() => {
        getVideos().then(setTvPrograms);
    }, []);

    React.useEffect(() => {
        loadVideos();
    }, [loadVideos]);

    // Synchronisation Realtime Cockpit → Vitrine (clé `videos` de site_settings).
    useRealtimeRefresh(['site_settings'], loadVideos);

    /**
     * Ancres `#tf1` / `#france2` (copie certifiée des CTA) : sélectionnent l'onglet
     * reportage correspondant, comme `#plan-3d-campus` le fait sur la visite virtuelle.
     */
    React.useEffect(() => {
        const handleHash = () => {
            const hash = window.location.hash;
            if (hash === '#tf1') setActiveVideo('tf1');
            if (hash === '#france2') setActiveVideo('france2');
        };
        window.addEventListener('hashchange', handleHash);
        const timer = setTimeout(handleHash, 0);
        return () => {
            window.removeEventListener('hashchange', handleHash);
            clearTimeout(timer);
        };
    }, []);

    /**
     * Titres et sous-titres des programmes : les DONNÉES (`site_videos` /
     * `PROGRAMMES_TV`) fournissent `dmId` et l'image, la copie éditoriale vient du
     * catalogue (`videos.programs`). Un `dmId` sans copie retombe sur la donnée.
     */
    const localizedPrograms = React.useMemo(() => {
        const byId = new Map(videoCopy.map((copy) => [copy.dmId, copy]));
        return tvPrograms.map((program) => {
            const copy = byId.get(program.dmId);
            return copy ? { ...program, title: copy.title, sub: copy.sub } : program;
        });
    }, [tvPrograms, videoCopy]);

    const heroBadge = content.hero?.badge || t('heroBadge');
    const heroTitle = content.hero?.title || t('heroTitle');
    const heroSubtitle = content.hero?.subtitle || t('heroSubtitle');
    const heroBg = content.hero?.bg_image || VIDEOS_MEDIA.heroFallback;

    return {
        hero: {
            badge: heroBadge,
            meta: content.hero?.meta || t('heroMeta'),
            title: heroTitle,
            subtitle: heroSubtitle,
            bg: heroBg,
        },
        labels: {
            breadcrumbHome: t('breadcrumbHome'),
            breadcrumbCurrent: t('breadcrumbCurrent'),
            heroImageAlt: t('heroImageAlt'),
            heroMeta: t('heroMeta'),
            tabTf1: t('tabTf1'),
            tabFrance2: t('tabFrance2'),
            videoFallback: t('videoFallback'),
            tf1Title: t('tf1Title'),
            tf1Desc: t('tf1Desc'),
            france2Title: t('france2Title'),
            france2Desc: t('france2Desc'),
            broadcastBadge: t('broadcastBadge'),
            docusBadge: t('docusBadge'),
            docusTitle: t('docusTitle'),
            docusHint: t('docusHint'),
            mediaTag: t('mediaTag'),
            mediaTitle: t('mediaTitle'),
            mediaIntro: t('mediaIntro'),
            socialInstagram: t('socialInstagram'),
            socialTiktok: t('socialTiktok'),
            closeTitle: t('closeTitle'),
        },
        activeVideo,
        setActiveVideo,
        selectedDmVideo,
        openDmVideo: setSelectedDmVideo,
        closeDmVideo: () => setSelectedDmVideo(null),
        localizedPrograms,
        mediaItems,
    };
}
