'use client';

import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { SitePageContent } from '@/lib/data/site-service';
import { setFieldValue } from '@/lib/preview/field-path';

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

    return { data, updateBlock, updateField };
}
