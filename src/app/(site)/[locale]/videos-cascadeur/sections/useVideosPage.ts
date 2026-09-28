'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PROGRAMMES_TV } from '@/data/videos';
import {
    DEFAULT_FEATURED_REELS,
    type InstagramReel,
    type ReelSortOption,
} from '@/data/instagram-reels';
import { getVideos, getFeaturedInstagramReels } from '@/lib/data/site-service';
import { getLatestInstagramReelsAction } from '@/app/(admin)/admin/actions/instagram-featured';
import { usePageDynamicContent } from '@/lib/hooks/usePageDynamicContent';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import {
    VIDEOS_MEDIA,
    type MediaItem,
    type VideoCopy,
    type VideosProgram,
} from './videos-copy';
import {
    clampReelColumns,
    sumReelsViews,
} from './reels-list';

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
    reelsSeeMore: string;
    reelsSortByFeatured: string;
    reelsSortByViews: string;
    reelsSortByDateDesc: string;
    reelsSortByDateAsc: string;
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
    /** Tranche de Reels réellement rendue dans la grille (pagination incluse). */
    reels: InstagramReel[];
    reelsColumns: number;
    reelsSortBy: ReelSortOption;
    reelsTotalCount: number;
    reelsTotalViews: number;
    reelsRemaining: number;
    reelsHasMore: boolean;
    onChangeReelsSort: (option: ReelSortOption) => void;
    onLoadMoreReels: () => void;
    selectedReel: InstagramReel | null;
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

    /** Recharge les programmes TV (état initial + synchronisation Realtime). */
    const loadVideos = React.useCallback(() => {
        getVideos().then(setTvPrograms);
    }, []);

    React.useEffect(() => {
        loadVideos();
    }, [loadVideos]);

    // Synchronisation Realtime Cockpit → Vitrine (clé `videos` de site_settings).
    useRealtimeRefresh(['site_settings'], loadVideos);

    // --- Section Reels : Mode sélectionnable ('latest' par défaut) et 1 à 3 rangées de 6 colonnes ---
    const reelsSection = content.sections_data?.reels;
    const reelsMode = (reelsSection?.mode === 'curated' ? 'curated' : 'latest') as 'latest' | 'curated';
    const reelsRows = (reelsSection?.rows === 2 ? 2 : reelsSection?.rows === 3 ? 3 : 1) as 1 | 2 | 3;
    const targetCount = reelsRows * 6;

    const [featuredReels, setFeaturedReels] = React.useState<InstagramReel[]>(DEFAULT_FEATURED_REELS);

    /** Recharge les Reels (Meta Graph API en direct + Realtime). */
    const loadFeaturedReels = React.useCallback(() => {
        getLatestInstagramReelsAction(targetCount, reelsMode === 'latest').then((res) => {
            if (res.success && res.reels.length > 0) {
                setFeaturedReels(res.reels);
            } else {
                getFeaturedInstagramReels().then((reels) => setFeaturedReels(reels.slice(0, targetCount)));
            }
        });
    }, [targetCount, reelsMode]);

    React.useEffect(() => {
        loadFeaturedReels();
    }, [loadFeaturedReels]);

    // Synchronisation Realtime Cockpit → Vitrine.
    useRealtimeRefresh(['site_settings'], loadFeaturedReels);

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

    const dynamicReelItems = reelsSection?.items;
    const dynamicItems = React.useMemo<InstagramReel[] | null>(() => {
        return Array.isArray(dynamicReelItems) && dynamicReelItems.length > 0
            ? (dynamicReelItems as InstagramReel[])
            : null;
    }, [dynamicReelItems]);

    const isReelsVisible = content.layout_sections
        ? content.layout_sections.find((s) => s.id === 'reels')?.is_visible ?? true
        : true;

    const reelsColumns = clampReelColumns(
        typeof reelsSection?.columns === 'number' ? reelsSection.columns : 6,
    );

    /**
     * Liste des vidéos affichées :
     * - section masquée → liste vide ;
     * - mode 'curated' avec sélection Cockpit → les targetCount premières ;
     * - mode 'latest' (défaut) → les targetCount dernières vidéos récupérées en direct via Meta API (ou fallback).
     */
    const displayedReels = React.useMemo<InstagramReel[]>(() => {
        if (!isReelsVisible) return [];
        if (reelsMode === 'curated' && dynamicItems && dynamicItems.length > 0) {
            return dynamicItems.slice(0, targetCount);
        }
        const baseFeatured = featuredReels && featuredReels.length > 0 ? featuredReels : DEFAULT_FEATURED_REELS;
        return baseFeatured.slice(0, targetCount);
    }, [isReelsVisible, reelsMode, dynamicItems, featuredReels, targetCount]);

    const reelsTotalViews = React.useMemo(() => sumReelsViews(displayedReels), [displayedReels]);

    // --- Navigation modale : indexée sur les 6 vidéos affichées ----------
    const activeReelIndex = selectedReel
        ? displayedReels.findIndex((reel) => reel.id === selectedReel.id)
        : -1;
    const hasPrevReel = activeReelIndex > 0;
    const hasNextReel = activeReelIndex >= 0 && activeReelIndex < displayedReels.length - 1;

    const prevReel = React.useCallback(() => {
        if (hasPrevReel) setSelectedReel(displayedReels[activeReelIndex - 1]);
    }, [hasPrevReel, activeReelIndex, displayedReels]);

    const nextReel = React.useCallback(() => {
        if (hasNextReel) setSelectedReel(displayedReels[activeReelIndex + 1]);
    }, [hasNextReel, activeReelIndex, displayedReels]);

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
            reelsTitle: reelsSection?.title || t('reelsTitle'),
            reelsIntro: reelsSection?.intro || t('reelsIntro'),
            reelsPlay: t('reelsPlay'),
            reelsWatchOnInsta: t('reelsWatchOnInsta'),
            reelsPrev: t('reelsPrev'),
            reelsNext: t('reelsNext'),
            reelsSeeMore: t('reelsSeeMore'),
            reelsSortByFeatured: t('reelsSortByFeatured'),
            reelsSortByViews: t('reelsSortByViews'),
            reelsSortByDateDesc: t('reelsSortByDateDesc'),
            reelsSortByDateAsc: t('reelsSortByDateAsc'),
        },
        selectedDmVideo,
        openDmVideo: setSelectedDmVideo,
        closeDmVideo: () => setSelectedDmVideo(null),
        localizedPrograms,
        mediaItems,
        reels: displayedReels,
        reelsColumns,
        reelsSortBy: 'featured' as ReelSortOption,
        reelsTotalCount: displayedReels.length,
        reelsTotalViews,
        reelsRemaining: 0,
        reelsHasMore: false,
        onChangeReelsSort: () => {},
        onLoadMoreReels: () => {},
        selectedReel,
        openReel: setSelectedReel,
        closeReel: () => setSelectedReel(null),
        nextReel,
        prevReel,
        hasPrevReel,
        hasNextReel,
    };
}
