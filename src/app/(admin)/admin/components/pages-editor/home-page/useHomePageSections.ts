'use client';

import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { SitePageContent } from '@/lib/data/site-service';

export interface UseHomePageSectionsArgs {
    formData: SitePageContent;
    setFormData: Dispatch<SetStateAction<SitePageContent>>;
}

export interface UseHomePageSectionsResult {
    data: Record<string, Record<string, string | undefined> | undefined>;
    updateBlock: (block: string, key: string, value: string) => void;
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

    return { data, updateBlock };
}
