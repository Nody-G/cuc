'use client';

import React from 'react';
import type { InstagramReelMetric } from '@/types/instagram-monitor';
import {
    getFeaturedReelsAction,
    saveFeaturedReelsAction,
    syncFeaturedReelsMetaAction,
    importReelViaMetaAction,
} from '@/app/(admin)/admin/actions/instagram-featured';

export interface UseInstagramFeaturedReelsResult {
    featuredReels: InstagramReelMetric[];
    featuredShortcodes: Set<string>;
    isLoading: boolean;
    isSaving: boolean;
    isSyncingMeta: boolean;
    isImporting: boolean;
    importInput: string;
    setImportInput: (val: string) => void;
    handleMoveReel: (index: number, direction: 'up' | 'down') => Promise<void>;
    handleRemoveReel: (index: number) => Promise<void>;
    handleToggleFeatured: (reel: InstagramReelMetric) => Promise<void>;
    handleImportReel: () => Promise<void>;
    handleSyncAllMeta: () => Promise<void>;
}

export function useInstagramFeaturedReels(
    showToast: (msg: string) => void
): UseInstagramFeaturedReelsResult {
    const [featuredReels, setFeaturedReels] = React.useState<InstagramReelMetric[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isSyncingMeta, setIsSyncingMeta] = React.useState(false);
    const [isImporting, setIsImporting] = React.useState(false);
    const [importInput, setImportInput] = React.useState('');

    // Charge les Reels enregistrés au montage
    React.useEffect(() => {
        let isMounted = true;
        getFeaturedReelsAction()
            .then((res) => {
                if (isMounted && res.success) {
                    setFeaturedReels(res.reels);
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });
        return () => {
            isMounted = false;
        };
    }, []);

    const featuredShortcodes = React.useMemo(() => {
        return new Set(featuredReels.map((r) => r.shortcode));
    }, [featuredReels]);

    const persistList = async (newList: InstagramReelMetric[]) => {
        setIsSaving(true);
        setFeaturedReels(newList);
        const res = await saveFeaturedReelsAction(newList);
        setIsSaving(false);
        if (!res.success) {
            showToast(`Erreur d'enregistrement : ${res.error || 'inconnue'}`);
        }
    };

    const handleMoveReel = async (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= featuredReels.length) return;

        const copy = [...featuredReels];
        const item = copy[index];
        copy[index] = copy[targetIndex];
        copy[targetIndex] = item;
        await persistList(copy);
        showToast(`Position mise à jour pour #${item.shortcode}`);
    };

    const handleRemoveReel = async (index: number) => {
        const removed = featuredReels[index];
        const next = featuredReels.filter((_, i) => i !== index);
        await persistList(next);
        showToast(`Reel #${removed.shortcode} retiré de la vitrine.`);
    };

    const handleToggleFeatured = async (reel: InstagramReelMetric) => {
        const exists = featuredReels.some((r) => r.shortcode === reel.shortcode);
        if (exists) {
            const next = featuredReels.filter((r) => r.shortcode !== reel.shortcode);
            await persistList(next);
            showToast(`Reel #${reel.shortcode} retiré de la vitrine.`);
        } else {
            const next = [...featuredReels, { ...reel, isFeatured: true }];
            await persistList(next);
            showToast(`Reel #${reel.shortcode} mis en avant sur la vitrine !`);
        }
    };

    const handleImportReel = async () => {
        const input = importInput.trim();
        if (!input) return;

        setIsImporting(true);
        try {
            const res = await importReelViaMetaAction(input);
            if (res.success && res.reel) {
                const next = [...featuredReels, res.reel];
                await persistList(next);
                setImportInput('');
                showToast(`Reel #${res.reel.shortcode} importé avec succès via Meta API !`);
            } else {
                showToast(res.error || "Impossible d'importer ce Reel.");
            }
        } finally {
            setIsImporting(false);
        }
    };

    const handleSyncAllMeta = async () => {
        if (featuredReels.length === 0) {
            showToast('Aucun Reel mis en avant à synchroniser.');
            return;
        }

        setIsSyncingMeta(true);
        try {
            const res = await syncFeaturedReelsMetaAction(featuredReels);
            if (res.success) {
                setFeaturedReels(res.updatedReels);
                showToast(`Synchronisation réussie : ${res.syncedCount} Reels actualisés via Meta API.`);
            } else {
                showToast(res.error || 'Erreur lors de la synchronisation.');
            }
        } finally {
            setIsSyncingMeta(false);
        }
    };

    return {
        featuredReels,
        featuredShortcodes,
        isLoading,
        isSaving,
        isSyncingMeta,
        isImporting,
        importInput,
        setImportInput,
        handleMoveReel,
        handleRemoveReel,
        handleToggleFeatured,
        handleImportReel,
        handleSyncAllMeta,
    };
}
