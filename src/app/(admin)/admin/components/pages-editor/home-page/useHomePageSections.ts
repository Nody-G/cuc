'use client';

import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { SitePageContent } from '@/lib/data/site-service';
import { setFieldValue } from '@/lib/preview/field-path';
import { applyListCommand, type ListCommand } from '@/lib/preview/list-command';

export interface UseHomePageSectionsArgs {
    formData: SitePageContent;
    setFormData: Dispatch<SetStateAction<SitePageContent>>;
}

export interface UseHomePageSectionsResult {
    data: Record<string, Record<string, string | undefined> | undefined>;
    updateBlock: (block: string, key: string, value: string) => void;
    /**
     * Écrit un chemin canonique complet (items de liste :
     * `sections_data.<bloc>.<tableau>.<index>.<clé>`). Délègue à la **même**
     * fonction de copie immuable que l'aperçu, donc un seul écrivain de chemin.
     */
    updateField: (path: string, value: string) => void;
    /**
     * Applique une commande de liste (ajouter, supprimer, réordonner,
     * dupliquer) au brouillon actif, via le moteur partagé `applyListCommand`.
     * `seed` est le socle réel d'une liste encore absente (visuels du hero).
     */
    applyList: (
        arrayPath: string,
        command: ListCommand,
        index: number,
        seed?: readonly unknown[],
    ) => void;
}

export function useHomePageSections({
    formData,
    setFormData,
}: UseHomePageSectionsArgs): UseHomePageSectionsResult {
    const data = (formData.sections_data || {}) as Record<
        string,
        Record<string, string | undefined> | undefined
    >;

    /** Met à jour une clé d'un bloc `sections_data` donné. */
    const updateBlock = useCallback(
        (block: string, key: string, value: string) => {
            setFormData((prev) => ({
                ...prev,
                sections_data: {
                    ...(prev.sections_data || {}),
                    [block]: {
                        ...((prev.sections_data || {})[block] || {}),
                        [key]: value,
                    },
                },
            }));
        },
        [setFormData],
    );

    /** Écrit un chemin canonique quelconque (dont items de liste), copie immuable. */
    const updateField = useCallback(
        (path: string, value: string) => {
            setFormData((prev) => setFieldValue(prev, path, value));
        },
        [setFormData],
    );

    /** Commandes de liste : même moteur pur que l'aperçu, aucun état intermédiaire. */
    const applyList = useCallback(
        (arrayPath: string, command: ListCommand, index: number, seed?: readonly unknown[]) => {
            setFormData((prev) => applyListCommand(prev, arrayPath, command, index, seed));
        },
        [setFormData],
    );

    return { data, updateBlock, updateField, applyList };
}
