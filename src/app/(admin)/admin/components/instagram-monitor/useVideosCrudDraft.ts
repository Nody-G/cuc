'use client';

import { useEffect, useState, useTransition } from 'react';
import type { ProgrammeTvItem } from '@/data/videos';
import { getVideos } from '@/lib/data/site-service';
import { updateSiteSettings } from '../../actions';
import { usePersistedDraftDiscard } from '../ui/usePersistedDraftDiscard';

/**
 * ==============================================================================
 * CUC — Brouillon de la liste des vidéos
 * ==============================================================================
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : la gestion d'état de la
 * liste (chargement, mutations, enregistrement, abandon) vit ici, la table et le
 * formulaire d'ajout restent dans `VideosCrudManager` (couche présentation).
 *
 * « Annuler » suit le contrat commun `usePersistedDraftDiscard` : retour à la
 * liste réellement persistée, drapeau de modification éteint.
 */

export interface VideosCrudDraft {
    videos: ProgrammeTvItem[];
    isLoading: boolean;
    isDirty: boolean;
    isPending: boolean;
    addVideo: (item: ProgrammeTvItem) => void;
    updateVideo: (index: number, updates: Partial<ProgrammeTvItem>) => void;
    deleteVideo: (index: number) => void;
    moveVideo: (index: number, direction: -1 | 1) => void;
    handleSave: () => void;
    /** Abandon : retour à la liste persistée (distinct de la suppression d'un item). */
    handleDiscard: () => void;
}

export function useVideosCrudDraft(showToast: (msg: string) => void): VideosCrudDraft {
    const [videos, setVideos] = useState<ProgrammeTvItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDirty, setIsDirty] = useState(false);
    const [isPending, startTransition] = useTransition();

    const { rememberPersisted, discardPersisted } = usePersistedDraftDiscard<ProgrammeTvItem[]>(
        [],
        setVideos,
        () => setIsDirty(false)
    );

    useEffect(() => {
        let cancelled = false;
        getVideos().then((data) => {
            if (cancelled) return;
            const list = data || [];
            setVideos(list);
            rememberPersisted(list);
            setIsLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [rememberPersisted]);

    const addVideo = (item: ProgrammeTvItem) => {
        setVideos((prev) => [item, ...prev]);
        setIsDirty(true);
    };

    const updateVideo = (index: number, updates: Partial<ProgrammeTvItem>) => {
        setVideos((prev) => {
            const copy = [...prev];
            copy[index] = { ...copy[index], ...updates };
            return copy;
        });
        setIsDirty(true);
    };

    const deleteVideo = (index: number) => {
        setVideos((prev) => prev.filter((_, i) => i !== index));
        setIsDirty(true);
    };

    const moveVideo = (index: number, direction: -1 | 1) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= videos.length) return;
        setVideos((prev) => {
            const copy = [...prev];
            const temp = copy[index];
            copy[index] = copy[targetIndex];
            copy[targetIndex] = temp;
            return copy;
        });
        setIsDirty(true);
    };

    const handleSave = () => {
        startTransition(async () => {
            const res = await updateSiteSettings('videos', { list: videos });
            if (res.success) {
                setIsDirty(false);
                rememberPersisted(videos);
                showToast('Vidéos enregistrées et mises à jour en direct sur la page Vidéos !');
            } else {
                showToast(res.error || 'Erreur lors de l’enregistrement.');
            }
        });
    };

    return {
        videos,
        isLoading,
        isDirty,
        isPending,
        addVideo,
        updateVideo,
        deleteVideo,
        moveVideo,
        handleSave,
        handleDiscard: discardPersisted,
    };
}
