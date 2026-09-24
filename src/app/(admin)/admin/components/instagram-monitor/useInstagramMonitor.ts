'use client';

import React from 'react';
import { INITIAL_INSTAGRAM_LEADERBOARD } from '@/data/instagram-leaderboard';
import { ALL_INSTAGRAM_REELS } from '@/data/instagram-reels';
import { calculateGrowthMilestone, calculateReelsAggregates } from '@/lib/instagram/instagram-service';
import {
    neighbourAbove,
    neighbourBelow,
    rankAccountsByFollowers,
} from '@/lib/instagram/instagram-ranking';
import type {
    InstagramAccountStat,
    InstagramMetaApiConfig,
    InstagramReelMetric,
    LeaderboardFilterMode,
} from '@/types/instagram-monitor';
import {
    refreshAccountAction,
    refreshLeaderboardBatchAction,
    refreshReelLiveMetricsAction,
} from '@/app/(admin)/admin/actions/instagram-monitor';

export function useInstagramMonitor(showToast: (msg: string) => void) {
    const [leaderboard, setLeaderboard] = React.useState<InstagramAccountStat[]>(INITIAL_INSTAGRAM_LEADERBOARD);
    const [reels, setReels] = React.useState<InstagramReelMetric[]>(ALL_INSTAGRAM_REELS);
    const [filterMode, setFilterMode] = React.useState<LeaderboardFilterMode>('direct_context');
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
    /**
     * Heure du dernier relevé réellement effectué. Vide à l'ouverture : afficher
     * l'heure de montage du composant faisait croire à une synchronisation qui
     * n'avait pas eu lieu (défaut corrigé le 2026-09-24).
     */
    const [lastSyncTime, setLastSyncTime] = React.useState<string>('');

    /**
     * Comparatif trié, **rang dérivé de la position** (`rankAccountsByFollowers`).
     *
     * Aucun rang n'est stocké ni interpolé : c'était le défaut corrigé le
     * 2026-09-24 — une échelle écrite à la main donnait au CUC un « rang national »
     * qui contredisait l'ordre affiché et sautait de 138 à 122 selon le palier
     * d'abonnés, alors que les autres lignes ne bougeaient pas.
     */
    const rankedLeaderboard = React.useMemo(() => rankAccountsByFollowers(leaderboard), [leaderboard]);

    const cucUsername = React.useMemo(
        () => leaderboard.find((a) => a.isCuc)?.username ?? 'campus.univers.cascades',
        [leaderboard]
    );

    const cucAccount = React.useMemo(
        () => rankedLeaderboard.find((a) => a.isCuc) ?? rankedLeaderboard[0],
        [rankedLeaderboard]
    );

    /**
     * Rang du CUC **dans ce comparatif** (et non un rang national, faute de source
     * mesurée) : il devient faux de le présenter autrement.
     */
    const cucNationalRank = cucAccount?.comparativeRank ?? 0;

    /**
     * Vrai seulement quand la clé Meta Graph est configurée : les nombres
     * affichés sont alors synchronisés, sinon ce sont des **repères saisis** et
     * l'interface comme les messages doivent le dire.
     */
    const isSynced = Boolean(metaConfig.enabled && metaConfig.accessToken);

    // Concurrent direct juste au-dessus et poursuivant direct, écarts réels.
    const { aheadAccount, behindAccount, deltaAhead, deltaBehind } = React.useMemo(() => {
        const above = neighbourAbove(rankedLeaderboard, cucUsername);
        const below = neighbourBelow(rankedLeaderboard, cucUsername);
        return {
            aheadAccount: above.account,
            behindAccount: below.account,
            deltaAhead: above.delta,
            deltaBehind: below.delta,
        };
    }, [rankedLeaderboard, cucUsername]);

    // Classement filtré selon le mode choisi (les rangs suivent la liste triée)
    const filteredLeaderboard = React.useMemo(() => {
        if (filterMode === 'top_france') {
            return rankedLeaderboard.filter((a) => a.country === 'FR').slice(0, 15);
        }
        if (filterMode === 'action_stunt') {
            return rankedLeaderboard.filter((a) =>
                a.isCuc ||
                a.category?.includes('Cascade') ||
                a.category?.includes('Parkour') ||
                a.category?.includes('Combat') ||
                a.category?.includes('Extrême') ||
                a.category?.includes('Cirque')
            );
        }
        if (filterMode === 'direct_context') {
            const cucIdx = rankedLeaderboard.findIndex((a) => a.isCuc);
            const start = Math.max(0, cucIdx - 10);
            const end = Math.min(rankedLeaderboard.length, cucIdx + 11);
            return rankedLeaderboard.slice(start, end);
        }
        return rankedLeaderboard;
    }, [rankedLeaderboard, filterMode]);

    // Jalons et métriques cumulées
    const milestone = React.useMemo(() => {
        return calculateGrowthMilestone(cucAccount.followersCount);
    }, [cucAccount.followersCount]);

    const aggregates = React.useMemo(() => {
        return calculateReelsAggregates(reels);
    }, [reels]);

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
            showToast(
                `Abonnés CUC relevés : ${res.data.followersFormatted}${isSynced ? ' (API Meta)' : ' (relevé public, clé Meta non configurée)'}`
            );
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

        // Fusion par pseudo : un compte dont le relevé échoue garde sa ligne
        // précédente au lieu de disparaître du comparatif.
        const fresh = new Map(res.results.map((stat) => [stat.username, stat]));
        const merged = leaderboard.map((account) => fresh.get(account.username) ?? account);
        const updatedCount = fresh.size;

        if (updatedCount > 0) {
            setLeaderboard(merged);
            setLastSyncTime(new Date().toLocaleTimeString('fr-FR'));
            showToast(
                isSynced
                    ? `${updatedCount} compte(s) synchronisé(s) via l’API Meta Graph.`
                    : `${updatedCount} compte(s) relevé(s) publiquement · repères mis à jour (clé Meta non configurée).`
            );
        } else {
            showToast('Aucun relevé n’a abouti : le comparatif affiché est inchangé.');
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
                ? 'Clés Meta Graph API activées : les nombres affichés sont désormais synchronisés.'
                : 'Configuration enregistrée : sans clé Meta active, les nombres restent des repères.'
        );
    };

    return {
        cucAccount,
        cucNationalRank,
        isSynced,
        aheadAccount,
        behindAccount,
        deltaAhead,
        deltaBehind,
        filterMode,
        setFilterMode,
        leaderboard: filteredLeaderboard,
        milestone,
        aggregates,
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
