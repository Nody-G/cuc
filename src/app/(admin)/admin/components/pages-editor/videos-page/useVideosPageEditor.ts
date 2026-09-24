'use client';

/**
 * Orchestration de l'éditeur de la page Vidéos : section `reels` du brouillon,
 * import d'un Reel par son lien (légende réelle récupérée côté serveur) et
 * opérations d'ordre/édition/suppression.
 */

import React from 'react';
import type { SitePageContent } from '@/lib/data/site-service';
import type { InstagramReel } from '@/app/(site)/[locale]/videos-cascadeur/sections/instagram-reels.data';
import { fetchInstagramMetadata } from '@/app/(admin)/admin/actions/instagram';
import {
    createReelFromImport,
    moveReel,
    readReelsList,
    readReelsSection,
    removeReel,
    sumReelViews,
    updateReelField,
} from './videos-reels-model';

export interface VideosPageEditorController {
    reelsList: InstagramReel[];
    reelsSection: ReturnType<typeof readReelsSection>;
    totalViews: number;
    newUrl: string;
    setNewUrl: (url: string) => void;
    isImporting: boolean;
    importError: string | null;
    updateReelsSection: (patch: Record<string, unknown>) => void;
    importReel: () => Promise<void>;
    handleRemoveReel: (index: number) => void;
    handleMoveReel: (index: number, direction: 'up' | 'down') => void;
    handleUpdateReelField: <K extends keyof InstagramReel>(
        index: number,
        field: K,
        value: InstagramReel[K]
    ) => void;
}

interface UseVideosPageEditorOptions {
    formData: SitePageContent;
    setFormData: React.Dispatch<React.SetStateAction<SitePageContent>>;
}

export function useVideosPageEditor({
    formData,
    setFormData,
}: UseVideosPageEditorOptions): VideosPageEditorController {
    const [newUrl, setNewUrl] = React.useState('');
    const [isImporting, setIsImporting] = React.useState(false);
    const [importError, setImportError] = React.useState<string | null>(null);

    const reelsSection = readReelsSection(formData);
    const reelsList = readReelsList(formData);

    const updateReelsSection = (patch: Record<string, unknown>) => {
        setFormData((prev) => ({
            ...prev,
            sections_data: {
                ...(prev.sections_data || {}),
                reels: { ...(prev.sections_data?.reels || {}), ...patch },
            },
        }));
    };

    const updateReels = (newItems: InstagramReel[]) => updateReelsSection({ items: newItems });

    const importReel = async () => {
        if (!newUrl.trim()) return;
        setIsImporting(true);
        setImportError(null);

        const res = await fetchInstagramMetadata(newUrl.trim());
        setIsImporting(false);

        if (!res.success || !res.data) {
            setImportError(res.error || "Impossible d'importer ce Reel.");
            return;
        }

        updateReels([...reelsList, createReelFromImport(res.data)]);
        setNewUrl('');
    };

    const handleRemoveReel = (index: number) => {
        updateReels(removeReel(reelsList, index));
    };

    const handleMoveReel = (index: number, direction: 'up' | 'down') => {
        updateReels(moveReel(reelsList, index, direction));
    };

    const handleUpdateReelField = <K extends keyof InstagramReel>(
        index: number,
        field: K,
        value: InstagramReel[K]
    ) => {
        updateReels(updateReelField(reelsList, index, field, value));
    };

    const totalViews = React.useMemo(() => sumReelViews(reelsList), [reelsList]);

    return {
        reelsList,
        reelsSection,
        totalViews,
        newUrl,
        setNewUrl,
        isImporting,
        importError,
        updateReelsSection,
        importReel,
        handleRemoveReel,
        handleMoveReel,
        handleUpdateReelField,
    };
}
