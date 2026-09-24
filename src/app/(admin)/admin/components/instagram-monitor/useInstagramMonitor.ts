'use client';

import React from 'react';
import { INITIAL_INSTAGRAM_LEADERBOARD } from '@/data/instagram-leaderboard';
import { ALL_INSTAGRAM_REELS } from '@/data/instagram-reels';
import type {
    InstagramAccountStat,
    InstagramMetaApiConfig,
    InstagramReelMetric,
} from '@/types/instagram-monitor';
import {
    refreshAccountAction,
    refreshLeaderboardBatchAction,
    refreshReelLiveMetricsAction,
} from '@/app/(admin)/admin/actions/instagram-monitor';

export function useInstagramMonitor(showToast: (msg: string) => void) {
    const [leaderboard, setLeaderboard] = React.useState<InstagramAccountStat[]>(INITIAL_INSTAGRAM_LEADERBOARD);
    const [reels, setReels] = React.useState<InstagramReelMetric[]>(ALL_INSTAGRAM_REELS);
    const [isRefreshingCuc, setIsRefreshingCuc] = React.useState(false);
    const [isRefreshingLeaderboard, setIsRefreshingLeaderboard] = React.useState(false);
    const [isRefreshingAllReels, setIsRefreshingAllReels] = React.useState(false);
    const [refreshingReelId, setRefreshingReelId] = React.useState<string | null>(null);
    const [isMetaModalOpen, setIsMetaModalOpen] = React.useState(false);
    const [metaConfig, setMetaConfig] = React.useState<InstagramMetaApiConfig>({
        enabled: false,
        accessToken: '',
        instagramAccountId: '',
    });
    const [newAccountInput, setNewAccountInput] = React.useState('');
    const [lastSyncTime, setLastSyncTime] = React.useState<string>(new Date().toLocaleTimeString('fr-FR'));

    const cucAccount = React.useMemo(() => {
        return leaderboard.find((a) => a.isCuc) || leaderboard[10];
    }, [leaderboard]);

    // Classement trié
    const sortedLeaderboard = React.useMemo(() => {
        return [...leaderboard].sort((a, b) => b.followersCount - a.followersCount);
    }, [leaderboard]);

    const cucRank = React.useMemo(() => {
        return sortedLeaderboard.findIndex((a) => a.isCuc) + 1;
    }, [sortedLeaderboard]);

    // Rafraîchir le compte CUC seul
    const handleRefreshCuc = async () => {
        setIsRefreshingCuc(true);
        const res = await refreshAccountAction('campus.univers.cascades', metaConfig);
        setIsRefreshingCuc(false);
        if (res.success && res.data) {
            setLeaderboard((prev) =>
                prev.map((acc) => (acc.isCuc ? { ...res.data!, isCuc: true } : acc))
            );
            setLastSyncTime(new Date().toLocaleTimeString('fr-FR'));
            showToast(`Abonnés CUC actualisés : ${res.data.followersFormatted}`);
        } else {
            showToast(res.error || 'Erreur lors du rafraîchissement CUC.');
        }
    };

    // Rafraîchir tout le classement
    const handleRefreshLeaderboard = async () => {
        setIsRefreshingLeaderboard(true);
        const usernames = leaderboard.map((a) => a.username);
        const res = await refreshLeaderboardBatchAction(usernames, metaConfig);
        setIsRefreshingLeaderboard(false);
        if (res.success && res.results.length > 0) {
            setLeaderboard(res.results);
            setLastSyncTime(new Date().toLocaleTimeString('fr-FR'));
            showToast(`Classement de ${res.results.length} comptes actualisé en direct !`);
        } else {
            showToast('Erreur lors du rafraîchissement du classement.');
        }
    };

    // Ajouter un compte au classement
    const handleAddAccount = async () => {
        const clean = newAccountInput.replace(/^@/, '').trim().toLowerCase();
        if (!clean) return;
        if (leaderboard.some((a) => a.username === clean)) {
            showToast(`@${clean} figure déjà dans le classement.`);
            return;
        }

        showToast(`Recherche de @${clean}...`);
        const res = await refreshAccountAction(clean, metaConfig);
        if (res.success && res.data) {
            setLeaderboard((prev) => [...prev, res.data!]);
            setNewAccountInput('');
            showToast(`@${clean} ajouté au classement (${res.data.followersFormatted} abonnés) !`);
        } else {
            showToast(res.error || `Impossible d'ajouter @${clean}.`);
        }
    };

    // Supprimer un compte du classement
    const handleRemoveAccount = (username: string) => {
        if (username === 'campus.univers.cascades') {
            showToast('Impossible de supprimer le compte CUC officiel.');
            return;
        }
        setLeaderboard((prev) => prev.filter((a) => a.username !== username));
        showToast(`@${username} retiré du classement.`);
    };

    // Rafraîchir un Reel individuel
    const handleRefreshReel = async (shortcode: string, id: string) => {
        setRefreshingReelId(id);
        const res = await refreshReelLiveMetricsAction(shortcode);
        setRefreshingReelId(null);
        if (res.success && res.data) {
            setReels((prev) =>
                prev.map((r) =>
                    r.id === id
                        ? {
                              ...r,
                              likes: res.data?.likes || r.likes,
                              viewsFormatted: res.data?.viewsFormatted || r.viewsFormatted,
                              lastUpdated: new Date().toISOString(),
                          }
                        : r
                )
            );
            showToast(`Métriques du Reel #${shortcode} actualisées !`);
        } else {
            showToast(res.error || `Erreur d'actualisation du Reel #${shortcode}`);
        }
    };

    // Rafraîchir les 6 premiers Reels phares
    const handleRefreshTopReels = async () => {
        setIsRefreshingAllReels(true);
        let updatedCount = 0;
        const topReels = reels.slice(0, 6);
        for (const r of topReels) {
            const res = await refreshReelLiveMetricsAction(r.shortcode);
            if (res.success && res.data) {
                updatedCount++;
                setReels((prev) =>
                    prev.map((item) =>
                        item.id === r.id
                            ? {
                                  ...item,
                                  likes: res.data?.likes || item.likes,
                                  lastUpdated: new Date().toISOString(),
                              }
                            : item
                    )
                );
            }
        }
        setIsRefreshingAllReels(false);
        showToast(`${updatedCount} Reels phares actualisés en direct !`);
    };

    const handleSaveMetaConfig = (cfg: InstagramMetaApiConfig) => {
        setMetaConfig(cfg);
        setIsMetaModalOpen(false);
        showToast(
            cfg.enabled && cfg.accessToken
                ? 'Clés Meta Graph API activées pour la synchronisation !'
                : 'Configuration Meta API enregistrée (Mode Scraper actif).'
        );
    };

    return {
        cucAccount,
        cucRank,
        leaderboard: sortedLeaderboard,
        reels,
        lastSyncTime,
        isRefreshingCuc,
        isRefreshingLeaderboard,
        isRefreshingAllReels,
        refreshingReelId,
        newAccountInput,
        setNewAccountInput,
        isMetaModalOpen,
        setIsMetaModalOpen,
        metaConfig,
        handleRefreshCuc,
        handleRefreshLeaderboard,
        handleAddAccount,
        handleRemoveAccount,
        handleRefreshReel,
        handleRefreshTopReels,
        handleSaveMetaConfig,
    };
}
