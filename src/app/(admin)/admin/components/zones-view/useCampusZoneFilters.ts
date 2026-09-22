'use client';

import { useMemo, useState } from 'react';
import { POI } from '@/components/ui/campus-map/campusMap.data';

export interface UseCampusZoneFiltersResult {
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    categories: string[];
    filteredPOIs: POI[];
}

export function useCampusZoneFilters(campusPOIs: POI[]): UseCampusZoneFiltersResult {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = useMemo(
        () => Array.from(new Set(campusPOIs.map((p) => p.category))),
        [campusPOIs],
    );

    const filteredPOIs = useMemo(
        () =>
            campusPOIs
                .filter((p) => (selectedCategory === 'all' ? true : p.category === selectedCategory))
                .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
        [campusPOIs, selectedCategory],
    );

    return { selectedCategory, setSelectedCategory, categories, filteredPOIs };
}
