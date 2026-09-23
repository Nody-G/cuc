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
import { INSTAGRAM_REELS, ALL_INSTAGRAM_REELS, type InstagramReel } from './instagram-reels.data';

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
    docusBadge: string;
    docusTitle: string;
    docusHint: string;
    mediaTag: string;
    mediaTitle: string;
    mediaIntro: string;
    socialInstagram: string;
    socialTiktok: string;
    closeTitle: string;
    reelsTitle: string;
    reelsIntro: string;
    reelsPlay: string;
    reelsWatchOnInsta: string;
    reelsPrev: string;
    reelsNext: string;
    reelsExploreMore: string;
    reelsHideExplorer: string;
    reelsExplorerTitle: string;
    reelsExplorerSubtitle: string;
    reelsSortByViews: string;
    reelsSortByDateDesc: string;
    reelsSortByDateAsc: string;
    reelsFilterAll: string;
    reelsFilterMecanique: string;
    reelsFilterCombat: string;
    reelsFilterSpectacle: string;
    reelsFilterCampus: string;
}

export interface SelectedDmVideo {
    id: string;
    title: string;
}

export interface UseVideosPageResult {
    hero: VideosHeroCopy;
    labels: VideosLabels;
    selectedDmVideo: SelectedDmVideo | null;
    openDmVideo: (video: SelectedDmVideo) => void;
    closeDmVideo: () => void;
    localizedPrograms: VideosProgram[];
    mediaItems: MediaItem[];
    localizedReels: InstagramReel[];
    allReels: InstagramReel[];
    selectedReel: InstagramReel | null;
    reelsColumns: number;
    openReel: (reel: InstagramReel) => void;
    closeReel: () => void;
    nextReel: () => void;
    prevReel: () => void;
    hasPrevReel: boolean;
    hasNextReel: boolean;
}

export function useVideosPage(): UseVideosPageResult {
    const t = useTranslations('videos');
    const [selectedDmVideo, setSelectedDmVideo] = React.useState<SelectedDmVideo | null>(null);
    const [selectedReel, setSelectedReel] = React.useState<InstagramReel | null>(null);
    const [tvPrograms, setTvPrograms] = React.useState(PROGRAMMES_TV);
    const { content } = usePageDynamicContent('videos-cascadeur');
    const videoCopy = t.raw('programs') as VideoCopy[];
    const mediaItems = t.raw('mediaItems') as MediaItem[];
    const reelsCopy = (t.raw('reelsItems') as { title: string; description: string }[]) || [];

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

    const dynamicReels = content.sections_data?.reels;
    const isReelsVisible = content.layout_sections
        ? content.layout_sections.find((s) => s.id === 'reels')?.is_visible ?? true
        : true;

    const baseReels: InstagramReel[] = isReelsVisible
        ? Array.isArray(dynamicReels?.items)
            ? (dynamicReels.items as InstagramReel[])
            : INSTAGRAM_REELS
        : [];

    /** Reels Instagram (source dynamique Cockpit ou catalogue initial). */
    const localizedReels = React.useMemo(() => {
        return baseReels.map((reel, idx) => {
            const copy = reelsCopy[idx];
            if (copy && !dynamicReels?.items) {
                return { ...reel, title: copy.title, description: copy.description };
            }
            return reel;
        });
    }, [baseReels, reelsCopy, dynamicReels?.items]);

    const activeReelIndex = selectedReel
        ? localizedReels.findIndex((r) => r.id === selectedReel.id)
        : -1;
    const hasPrevReel = activeReelIndex > 0;
    const hasNextReel = activeReelIndex >= 0 && activeReelIndex < localizedReels.length - 1;

    const prevReel = React.useCallback(() => {
        if (hasPrevReel) setSelectedReel(localizedReels[activeReelIndex - 1]);
    }, [hasPrevReel, activeReelIndex, localizedReels]);

    const nextReel = React.useCallback(() => {
        if (hasNextReel) setSelectedReel(localizedReels[activeReelIndex + 1]);
    }, [hasNextReel, activeReelIndex, localizedReels]);

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
            docusBadge: t('docusBadge'),
            docusTitle: t('docusTitle'),
            docusHint: t('docusHint'),
            mediaTag: t('mediaTag'),
            mediaTitle: t('mediaTitle'),
            mediaIntro: t('mediaIntro'),
            socialInstagram: t('socialInstagram'),
            socialTiktok: t('socialTiktok'),
            closeTitle: t('closeTitle'),
            reelsTitle: dynamicReels?.title || t('reelsTitle'),
            reelsIntro: dynamicReels?.intro || t('reelsIntro'),
            reelsPlay: t('reelsPlay'),
            reelsWatchOnInsta: t('reelsWatchOnInsta'),
            reelsPrev: t('reelsPrev'),
            reelsNext: t('reelsNext'),
            reelsExploreMore: t('reelsExploreMore'),
            reelsHideExplorer: t('reelsHideExplorer'),
            reelsExplorerTitle: t('reelsExplorerTitle'),
            reelsExplorerSubtitle: t('reelsExplorerSubtitle'),
            reelsSortByViews: t('reelsSortByViews'),
            reelsSortByDateDesc: t('reelsSortByDateDesc'),
            reelsSortByDateAsc: t('reelsSortByDateAsc'),
            reelsFilterAll: t('reelsFilterAll'),
            reelsFilterMecanique: t('reelsFilterMecanique'),
            reelsFilterCombat: t('reelsFilterCombat'),
            reelsFilterSpectacle: t('reelsFilterSpectacle'),
            reelsFilterCampus: t('reelsFilterCampus'),
        },
        selectedDmVideo,
        openDmVideo: setSelectedDmVideo,
        closeDmVideo: () => setSelectedDmVideo(null),
        localizedPrograms,
        mediaItems,
        localizedReels,
        allReels: ALL_INSTAGRAM_REELS,
        reelsColumns: typeof dynamicReels?.columns === 'number' ? dynamicReels.columns : 6,
        selectedReel,
        openReel: setSelectedReel,
        closeReel: () => setSelectedReel(null),
        nextReel,
        prevReel,
        hasPrevReel,
        hasNextReel,
    };
}

