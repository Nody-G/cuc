'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { PROGRAMMES_TV } from '@/data/videos';
import {
    ALL_INSTAGRAM_REELS,
    DEFAULT_FEATURED_REELS,
    type InstagramReel,
    type ReelSortOption,
} from '@/data/instagram-reels';
import { getVideos } from '@/lib/data/site-service';
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
    initialVisibleCount,
    loadMoreStep,
    mergeReels,
    sortReels,
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
    const [reelsSortBy, setReelsSortBy] = React.useState<ReelSortOption>('featured');
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

    // --- Section Reels : source de vérité unique (état + composition) ---------

    const reelsSection = content.sections_data?.reels;
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
        typeof reelsSection?.columns === 'number' ? reelsSection.columns : undefined,
    );

    /** Copies éditoriales FR/EN des 6 Reels mis en avant (ordre = catalogue i18n). */
    const reelsCopy = React.useMemo(
        () => (t.raw('reelsItems') as { title: string; description: string }[] | undefined) ?? [],
        [t],
    );

    const [visibleCount, setVisibleCount] = React.useState<number>(() =>
        initialVisibleCount(reelsColumns),
    );
    // Ajustement en phase de rendu (motif React) plutôt qu'en effet en cascade.
    const [syncedColumns, setSyncedColumns] = React.useState<number>(reelsColumns);
    if (syncedColumns !== reelsColumns) {
        setSyncedColumns(reelsColumns);
        setVisibleCount((prev) => Math.max(prev, initialVisibleCount(reelsColumns)));
    }

    /**
     * Liste combinée affichée :
     * - section masquée → liste vide (le composant ne rend alors rien) ;
     * - Reels édités dans le Cockpit → uniquement ceux-ci ;
     * - sinon → 6 Reels mis en avant + catalogue complet, dédoublonnés.
     */
    const combinedReels = React.useMemo<InstagramReel[]>(() => {
        if (!isReelsVisible) return [];
        if (dynamicItems) return mergeReels(dynamicItems, []);
        const featured = DEFAULT_FEATURED_REELS.map((reel, index) => {
            const copy = reelsCopy[index];
            return copy ? { ...reel, title: copy.title, description: copy.description } : reel;
        });
        return mergeReels(featured, ALL_INSTAGRAM_REELS);
    }, [isReelsVisible, dynamicItems, reelsCopy]);

    const sortedReels = React.useMemo(
        () => sortReels(combinedReels, reelsSortBy),
        [combinedReels, reelsSortBy],
    );

    const displayedReels = React.useMemo(
        () => sortedReels.slice(0, visibleCount),
        [sortedReels, visibleCount],
    );

    const reelsTotalViews = React.useMemo(() => sumReelsViews(combinedReels), [combinedReels]);

    const handleLoadMoreReels = React.useCallback(() => {
        setVisibleCount((prev) => Math.min(prev + loadMoreStep(reelsColumns), sortedReels.length));
    }, [reelsColumns, sortedReels.length]);

    // --- Navigation modale : indexée sur la MÊME liste que la grille ----------

    const activeReelIndex = selectedReel
        ? sortedReels.findIndex((reel) => reel.id === selectedReel.id)
        : -1;
    const hasPrevReel = activeReelIndex > 0;
    const hasNextReel = activeReelIndex >= 0 && activeReelIndex < sortedReels.length - 1;

    const prevReel = React.useCallback(() => {
        if (hasPrevReel) setSelectedReel(sortedReels[activeReelIndex - 1]);
    }, [hasPrevReel, activeReelIndex, sortedReels]);

    const nextReel = React.useCallback(() => {
        if (hasNextReel) setSelectedReel(sortedReels[activeReelIndex + 1]);
    }, [hasNextReel, activeReelIndex, sortedReels]);

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
        reelsSortBy,
        reelsTotalCount: sortedReels.length,
        reelsTotalViews,
        reelsRemaining: Math.max(sortedReels.length - displayedReels.length, 0),
        reelsHasMore: displayedReels.length < sortedReels.length,
        onChangeReelsSort: setReelsSortBy,
        onLoadMoreReels: handleLoadMoreReels,
        selectedReel,
        openReel: setSelectedReel,
        closeReel: () => setSelectedReel(null),
        nextReel,
        prevReel,
        hasPrevReel,
        hasNextReel,
    };
}
