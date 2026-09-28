'use client';

import React from 'react';
import { getLiveInstagramDashboardAction } from '@/app/(admin)/admin/actions/instagram-monitor';
import type {
    InstagramAccountStat,
    InstagramReelMetric,
} from '@/types/instagram-monitor';
import type { MediaTabFilter, MediaSortOption, MediaViewMode } from './InstagramMediaFilterBar';

export interface UseLiveInstagramMonitorResult {
    profile: InstagramAccountStat | null;
    publications: InstagramReelMetric[];
    displayedPublications: InstagramReelMetric[];
    totalVideoViews: number;
    videoCount: number;
    photoCount: number;
    lastSyncedAt: string;
    isLoading: boolean;
    isRefreshing: boolean;
    search: string;
    setSearch: (val: string) => void;
    activeTab: MediaTabFilter;
    setActiveTab: (tab: MediaTabFilter) => void;
    sortOption: MediaSortOption;
    setSortOption: (sort: MediaSortOption) => void;
    viewMode: MediaViewMode;
    setViewMode: (mode: MediaViewMode) => void;
    handleRefresh: () => Promise<void>;
    hasMore: boolean;
    handleLoadMore: () => void;
    remainingCount: number;
}

const PAGE_SIZE = 24;

export function useLiveInstagramMonitor(
    showToast: (msg: string) => void,
    featuredShortcodes?: Set<string>
): UseLiveInstagramMonitorResult {
    const [profile, setProfile] = React.useState<InstagramAccountStat | null>(null);
    const [publications, setPublications] = React.useState<InstagramReelMetric[]>([]);
    const [totalVideoViews, setTotalVideoViews] = React.useState(0);
    const [videoCount, setVideoCount] = React.useState(0);
    const [photoCount, setPhotoCount] = React.useState(0);
    const [lastSyncedAt, setLastSyncedAt] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    const [search, setSearch] = React.useState('');
    const [activeTab, setActiveTab] = React.useState<MediaTabFilter>('all');
    const [sortOption, setSortOption] = React.useState<MediaSortOption>('recent');
    const [viewMode, setViewMode] = React.useState<MediaViewMode>('grid');
    const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

    const loadData = React.useCallback(
        async (forceRefresh = false) => {
            const res = await getLiveInstagramDashboardAction(forceRefresh);
            if (res.success && res.data) {
                setProfile(res.data.profile);
                setPublications(res.data.publications);
                setTotalVideoViews(res.data.totalVideoViews);
                setVideoCount(res.data.videoCount);
                setPhotoCount(res.data.photoCount);
                setLastSyncedAt(res.data.lastSyncedAt);
            } else if (res.error) {
                showToast(`Erreur Instagram : ${res.error}`);
            }
        },
        [showToast]
    );

    React.useEffect(() => {
        let isMounted = true;
        loadData(false).finally(() => {
            if (isMounted) setIsLoading(false);
        });
        return () => {
            isMounted = false;
        };
    }, [loadData]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await loadData(true);
            showToast('Données Instagram actualisées en direct depuis Meta Graph API.');
        } finally {
            setIsRefreshing(false);
        }
    };

    // 1. Filtrage par type de publication, vitrine et recherche
    const filtered = React.useMemo(() => {
        let list = publications;

        if (activeTab === 'video') {
            list = list.filter((p) => p.mediaType === 'VIDEO' || (!p.mediaType && (p.views ?? 0) > 0));
        } else if (activeTab === 'photo') {
            list = list.filter((p) => p.mediaType === 'IMAGE' || p.mediaType === 'CAROUSEL_ALBUM');
        } else if (activeTab === 'featured') {
            list = list.filter((p) => featuredShortcodes?.has(p.shortcode) || p.isFeatured);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.shortcode.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q)
            );
        }

        return list;
    }, [publications, activeTab, search, featuredShortcodes]);

    // 2. Tri dynamique
    const sorted = React.useMemo(() => {
        const list = [...filtered];
        switch (sortOption) {
            case 'recent':
                return list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
            case 'oldest':
                return list.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
            case 'views_desc':
                return list.sort((a, b) => (b.views || 0) - (a.views || 0));
            case 'likes_desc':
                return list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
            case 'comments_desc':
                return list.sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0));
            case 'engagement_desc':
                return list.sort((a, b) => {
                    const engA = a.views && a.views > 0 ? ((a.likesCount || 0) + (a.commentsCount || 0)) / a.views : 0;
                    const engB = b.views && b.views > 0 ? ((b.likesCount || 0) + (b.commentsCount || 0)) / b.views : 0;
                    return engB - engA;
                });
            default:
                return list;
        }
    }, [filtered, sortOption]);

    const displayedPublications = React.useMemo(() => {
        return sorted.slice(0, visibleCount);
    }, [sorted, visibleCount]);

    const hasMore = visibleCount < sorted.length;
    const remainingCount = Math.max(sorted.length - visibleCount, 0);

    const handleLoadMore = () => {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, sorted.length));
    };

    return {
        profile,
        publications: sorted,
        displayedPublications,
        totalVideoViews,
        videoCount,
        photoCount,
        lastSyncedAt,
        isLoading,
        isRefreshing,
        search,
        setSearch: (val) => {
            setSearch(val);
            setVisibleCount(PAGE_SIZE);
        },
        activeTab,
        setActiveTab: (tab) => {
            setActiveTab(tab);
            setVisibleCount(PAGE_SIZE);
        },
        sortOption,
        setSortOption,
        viewMode,
        setViewMode,
        handleRefresh,
        hasMore,
        handleLoadMore,
        remainingCount,
    };
}
