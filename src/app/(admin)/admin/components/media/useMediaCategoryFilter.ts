'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMediaCategoryOverrides, setMediaCategoryOverride } from '@/app/(admin)/admin/actions';
import {
    inferMediaCategory,
    groupMediaByCategory,
    type MediaCategory,
    type MediaObject,
    type MediaUsageIndex,
} from '@/app/(admin)/admin/media-shared';

export interface UseMediaCategoryFilterArgs {
    files: MediaObject[];
    usageIndex: MediaUsageIndex | null;
    showToast: (msg: string) => void;
}

export function useMediaCategoryFilter({
    files,
    usageIndex,
    showToast,
}: UseMediaCategoryFilterArgs) {
    const [selectedCategory, setSelectedCategory] = useState<MediaCategory | 'all'>('all');
    const [groupByCategory, setGroupByCategory] = useState(false);
    const [overrides, setOverrides] = useState<Record<string, MediaCategory>>({});

    const loadOverrides = useCallback(async () => {
        try {
            const data = await getMediaCategoryOverrides();
            setOverrides(data);
        } catch {
            /* tolérant */
        }
    }, []);

    useEffect(() => {
        void loadOverrides();
    }, [loadOverrides]);

    const getFileCategory = useCallback(
        (file: MediaObject): MediaCategory => {
            const usage = usageIndex ? usageIndex[file.path] : null;
            return inferMediaCategory(file, usage, overrides);
        },
        [overrides, usageIndex]
    );

    const updateCategory = useCallback(
        async (path: string, category: MediaCategory) => {
            setOverrides((prev) => ({ ...prev, [path]: category }));
            try {
                const res = await setMediaCategoryOverride(path, category);
                if (res.success) {
                    showToast('Catégorie mise à jour');
                } else {
                    showToast(res.error || 'Erreur lors de la mise à jour');
                }
            } catch {
                showToast('Erreur lors de la mise à jour');
            }
        },
        [showToast]
    );

    // Comptage des médias par catégorie
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: files.length };
        for (const file of files) {
            const cat = getFileCategory(file);
            counts[cat] = (counts[cat] || 0) + 1;
        }
        return counts;
    }, [files, getFileCategory]);

    // Fichiers filtrés par catégorie
    const categorizedFiles = useMemo(() => {
        if (selectedCategory === 'all') return files;
        return files.filter((file) => getFileCategory(file) === selectedCategory);
    }, [files, getFileCategory, selectedCategory]);

    // Groupement par catégorie
    const groups = useMemo(() => {
        return groupMediaByCategory(files, getFileCategory);
    }, [files, getFileCategory]);

    return {
        selectedCategory,
        setSelectedCategory,
        groupByCategory,
        setGroupByCategory,
        getFileCategory,
        updateCategory,
        categoryCounts,
        categorizedFiles,
        groups,
    };
}
