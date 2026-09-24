'use client';

/**
 * Orchestration du comparatif d'abonnés Instagram : état, rangs dérivés,
 * filtres et relevés (compte CUC, lot complet, ajout, suppression).
 *
 * Aucun rang n'est stocké ni interpolé : c'était le défaut corrigé le
 * 2026-09-24 — une échelle écrite à la main donnait au CUC un « rang national »
 * qui contredisait l'ordre affiché.
 */

import React from 'react';
import { INITIAL_INSTAGRAM_LEADERBOARD } from '@/data/instagram-leaderboard';
import { calculateGrowthMilestone } from '@/lib/instagram/instagram-service';
import {
    neighbourAbove,
    neighbourBelow,
    rankAccountsByFollowers,
} from '@/lib/instagram/instagram-ranking';
import type {
    InstagramAccountStat,
    InstagramMetaApiConfig,
    LeaderboardFilterMode,
} from '@/types/instagram-monitor';
import {
    refreshAccountAction,
    refreshLeaderboardBatchAction,
} from '@/app/(admin)/admin/actions/instagram-monitor';
import { filterLeaderboard, mergeLeaderboardStats } from './instagram-monitor.model';

export function useInstagramLeaderboard(showToast: (msg: string) => void) {
    const [leaderboard, setLeaderboard] = React.useState<InstagramAccountStat[]>(
        INITIAL_INSTAGRAM_LEADERBOARD
    );
    const [filterMode, setFilterMode] = React.useState<LeaderboardFilterMode>('direct_context');
    const [isRefreshingCuc, setIsRefreshingCuc] = React.useState(false);
    const [isRefreshingLeaderboard, setIsRefreshingLeaderboard] = React.useState(false);
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

    /** Comparatif trié : **rang dérivé de la position**. */
    const rankedLeaderboard = React.useMemo(
        () => rankAccountsByFollowers(leaderboard),
        [leaderboard]
    );

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
    // Jalons de croissance dérivés des abonnés CUC (aucun palier écrit à la main).
    const milestone = React.useMemo(
        () => calculateGrowthMilestone(cucAccount.followersCount),
        [cucAccount.followersCount]
    );

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

    /** Classement filtré selon le mode choisi (les rangs suivent la liste triée). */
    const filteredLeaderboard = React.useMemo(
        () => filterLeaderboard(rankedLeaderboard, filterMode),
        [rankedLeaderboard, filterMode]
    );

    // Rafraîchir le compte CUC seul
    const handleRefreshCuc = async () => {
        setIsRefreshingCuc(true);
        const res = await refreshAccountAction('campus.univers.cascades', metaConfig);
        setIsRefreshingCuc(false);
        const data = res.data;
        if (res.success && data) {
            setLeaderboard((prev) =>
                prev.map((acc) => (acc.isCuc ? { ...data, isCuc: true } : acc))
            );
            setLastSyncTime(new Date().toLocaleTimeString('fr-FR'));
            showToast(
                `Abonnés CUC relevés : ${data.followersFormatted}${isSynced ? ' (API Meta)' : ' (relevé public, clé Meta non configurée)'}`
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

        const { merged, updatedCount } = mergeLeaderboardStats(leaderboard, res.results);

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
        const data = res.data;
        if (res.success && data) {
            setLeaderboard((prev) => [...prev, data]);
            setNewAccountInput('');
            showToast(`@${clean} ajouté au classement (${data.followersFormatted} abonnés) !`);
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
        lastSyncTime,
        isRefreshingCuc,
        isRefreshingLeaderboard,
        newAccountInput,
        setNewAccountInput,
        isMetaModalOpen,
        setIsMetaModalOpen,
        metaConfig,
        handleRefreshCuc,
        handleRefreshLeaderboard,
        handleAddAccount,
        handleRemoveAccount,
        handleSaveMetaConfig,
    };
}
