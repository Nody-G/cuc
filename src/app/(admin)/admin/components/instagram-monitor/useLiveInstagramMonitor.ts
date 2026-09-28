'use client';

import React from 'react';
import {
    getLiveInstagramDashboardAction,
    fetchMoreLiveInstagramPublicationsAction,
} from '@/app/(admin)/admin/actions/instagram-monitor';
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
    totalAccountPosts: number;
    nextCursor: string | null;
    isLoadingMoreBatch: boolean;
    autoRefresh: boolean;
    toggleAutoRefresh: () => void;
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
    handleLoadNextBatch: () => Promise<void>;
    hasMore: boolean;
    handleLoadMore: () => void;
    remainingCount: number;
}

const PAGE_SIZE = 24;
const AUTO_REFRESH_INTERVAL_MS = 30000;

export function useLiveInstagramMonitor(
    showToast: (msg: string) => void,
    featuredShortcodes?: Set<string>
): UseLiveInstagramMonitorResult {
    const [profile, setProfile] = React.useState<InstagramAccountStat | null>(null);
    const [publications, setPublications] = React.useState<InstagramReelMetric[]>([]);
    const [totalVideoViews, setTotalVideoViews] = React.useState(0);
    const [videoCount, setVideoCount] = React.useState(0);
    const [photoCount, setPhotoCount] = React.useState(0);
    const [totalAccountPosts, setTotalAccountPosts] = React.useState(744);
    const [nextCursor, setNextCursor] = React.useState<string | null>(null);
    const [isLoadingMoreBatch, setIsLoadingMoreBatch] = React.useState(false);
    const [autoRefresh, setAutoRefresh] = React.useState(true);
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
                setTotalAccountPosts(res.data.totalAccountPosts || 744);
                setLastSyncedAt(res.data.lastSyncedAt);

                setPublications((prev) => {
                    // Si on a déjà chargé des publications supplémentaires antérieures, fusionner intelligemment
                    if (prev.length > res.data!.publications.length) {
                        const updatedMap = new Map(res.data!.publications.map((p) => [p.id, p]));
                        const merged = prev.map((oldItem) => updatedMap.get(oldItem.id) || oldItem);
                        const views = merged
                            .filter((p) => p.mediaType === 'VIDEO')
                            .reduce((sum, p) => sum + (p.views || 0), 0);
                        setTotalVideoViews(views);
                        setVideoCount(merged.filter((p) => p.mediaType === 'VIDEO').length);
                        setPhotoCount(merged.filter((p) => p.mediaType !== 'VIDEO').length);
                        return merged;
                    }

                    // Premier chargement ou rafraîchissement normal
                    setTotalVideoViews(res.data!.totalVideoViews);
                    setVideoCount(res.data!.videoCount);
                    setPhotoCount(res.data!.photoCount);
                    setNextCursor(res.data!.nextCursor);
                    return res.data!.publications;
                });
            } else if (res.error && !forceRefresh) {
                showToast(`Erreur Instagram : ${res.error}`);
            }
        },
        [showToast]
    );

    // Chargement initial
    React.useEffect(() => {
        let isMounted = true;
        loadData(false).finally(() => {
            if (isMounted) setIsLoading(false);
        });
        return () => {
            isMounted = false;
        };
    }, [loadData]);

    // Surveillance temps réel automatique toutes les 30s (en arrière-plan silencieux)
    React.useEffect(() => {
        if (!autoRefresh) return;

        const intervalId = setInterval(() => {
            // Protège les quotas Meta & Supabase si Lucas change d'onglet
            if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
                return;
            }
            loadData(true);
        }, AUTO_REFRESH_INTERVAL_MS);

        return () => clearInterval(intervalId);
    }, [autoRefresh, loadData]);

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

    const handleLoadNextBatch = async () => {
        if (!nextCursor || isLoadingMoreBatch) return;
        setIsLoadingMoreBatch(true);
        try {
            const res = await fetchMoreLiveInstagramPublicationsAction(nextCursor);
            if (res.success && res.publications) {
                setPublications((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id));
                    const newItems = res.publications!.filter((p) => !existingIds.has(p.id));
                    const combined = [...prev, ...newItems];
                    const newViews = combined
                        .filter((p) => p.mediaType === 'VIDEO')
                        .reduce((sum, p) => sum + (p.views || 0), 0);
                    setTotalVideoViews(newViews);
                    setVideoCount(combined.filter((p) => p.mediaType === 'VIDEO').length);
                    setPhotoCount(combined.filter((p) => p.mediaType !== 'VIDEO').length);
                    return combined;
                });
                setNextCursor(res.nextCursor || null);
                showToast(`${res.publications.length} publications antérieures chargées.`);
            } else {
                showToast(res.error || 'Erreur lors du chargement.');
            }
        } finally {
            setIsLoadingMoreBatch(false);
        }
    };

    const toggleAutoRefresh = () => {
        setAutoRefresh((prev) => {
            const next = !prev;
            showToast(next ? 'Actualisation temps réel activée (30s).' : 'Actualisation temps réel en pause.');
            return next;
        });
    };

    return {
        profile,
        publications: sorted,
        displayedPublications,
        totalVideoViews,
        videoCount,
        photoCount,
        totalAccountPosts,
        nextCursor,
        isLoadingMoreBatch,
        autoRefresh,
        toggleAutoRefresh,
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
        handleLoadNextBatch,
        hasMore,
        handleLoadMore,
        remainingCount,
    };
}

