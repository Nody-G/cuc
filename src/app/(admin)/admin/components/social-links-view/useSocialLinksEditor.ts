'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { DEFAULT_SOCIAL_LINKS, type SiteSocialLink } from '@/data/navigation';
import { getSocialLinks, upsertSocialLink, deleteSocialLink } from '@/lib/data/site-service';
import { createSocialLink, reindexSocialLinks } from './social-links-form';

/**
 * Sauvegarde d'overlay EN exposée par une ligne actuellement en édition
 * anglaise. L'écran s'en sert pour que son bouton principal écrive la
 * traduction, jamais la ligne source française.
 */
export type SocialLinkEnglishSaver = () => Promise<{ success: boolean; error?: string }>;

export interface SocialLinksEditor {
    /** Liste triée par `order_index` (affichage). */
    sorted: SiteSocialLink[];
    isLoading: boolean;
    isPending: boolean;
    update: (id: string, updates: Partial<SiteSocialLink>) => void;
    move: (index: number, direction: -1 | 1) => void;
    addLink: () => void;
    handleSave: () => void;
    handleDelete: (link: SiteSocialLink) => void;
    handleReset: () => void;
    /** Au moins une ligne est en édition anglaise. */
    isEnglishMode: boolean;
    /** Une ligne en anglais enregistre (ou retire) sa sauvegarde d'overlay. */
    registerEnglishSave: (id: string, save: SocialLinkEnglishSaver | null) => void;
}

/**
 * Orchestration de l'éditeur des réseaux sociaux : chargement initial,
 * mutations locales et persistance (`site_social_links`).
 */
export function useSocialLinksEditor(showToast: (msg: string) => void): SocialLinksEditor {
    const [links, setLinks] = useState<SiteSocialLink[]>(DEFAULT_SOCIAL_LINKS);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    /**
     * Lignes en édition anglaise : chacune expose sa sauvegarde d'overlay. La
     * carte reste propriétaire de son overlay (une entité = une ligne
     * `site_translations`) ; l'écran ne fait que relayer le geste principal.
     */
    const [englishSavers, setEnglishSavers] = useState<Map<string, SocialLinkEnglishSaver>>(
        () => new Map()
    );

    const registerEnglishSave = useCallback(
        (id: string, save: SocialLinkEnglishSaver | null) => {
            setEnglishSavers((previous) => {
                const alreadyRegistered = previous.has(id);
                // Aucun changement réel → même référence (pas de rendu superflu).
                if (save ? alreadyRegistered : !alreadyRegistered) return previous;
                const next = new Map(previous);
                if (save) next.set(id, save);
                else next.delete(id);
                return next;
            });
        },
        []
    );

    const isEnglishMode = englishSavers.size > 0;

    useEffect(() => {
        let cancelled = false;
        getSocialLinks()
            .then((data) => {
                if (!cancelled && data.length > 0) setLinks(data);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const sorted = [...links].sort((a, b) => a.order_index - b.order_index);

    const update = (id: string, updates: Partial<SiteSocialLink>) => {
        setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, ...updates } : link)));
    };

    const move = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= sorted.length) return;
        const next = [...sorted];
        [next[index], next[target]] = [next[target], next[index]];
        setLinks(reindexSocialLinks(next));
    };

    const addLink = () => {
        setLinks(reindexSocialLinks([...links, createSocialLink(links)]));
    };

    const handleSave = () => {
        // En anglais, l'action principale enregistre les overlays des lignes en
        // édition et ne touche PAS aux lignes sources françaises.
        if (englishSavers.size > 0) {
            startTransition(async () => {
                const results = await Promise.all(
                    [...englishSavers.values()].map((save) => save())
                );
                const ok = results.every((result) => result.success);
                showToast(
                    ok
                        ? 'Traductions anglaises enregistrées.'
                        : 'Certaines traductions n\'ont pas pu être enregistrées.'
                );
            });
            return;
        }

        startTransition(async () => {
            const results = await Promise.all(sorted.map((link) => upsertSocialLink(link)));
            const ok = results.every(Boolean);
            showToast(
                ok
                    ? 'Réseaux sociaux enregistrés — la vitrine est mise à jour en direct.'
                    : 'Certains réseaux n\'ont pas pu être enregistrés.'
            );
        });
    };

    const handleDelete = (link: SiteSocialLink) => {
        if (!confirm(`Supprimer le réseau « ${link.label} » ?`)) return;
        setLinks((prev) => reindexSocialLinks(prev.filter((l) => l.id !== link.id)));
        startTransition(async () => {
            await deleteSocialLink(link.id);
            showToast(`Réseau « ${link.label} » supprimé.`);
        });
    };

    const handleReset = () => {
        // La source française n'est jamais réinitialisée pendant une traduction.
        if (englishSavers.size > 0) return;
        if (!confirm('Réinitialiser les réseaux sociaux aux valeurs par défaut ?')) return;
        setLinks(DEFAULT_SOCIAL_LINKS);
        showToast('Réseaux sociaux réinitialisés (pensez à enregistrer).');
    };

    return {
        sorted,
        isLoading,
        isPending,
        update,
        move,
        addLink,
        handleSave,
        handleDelete,
        handleReset,
        isEnglishMode,
        registerEnglishSave,
    };
}
