'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TabType } from '../../CockpitApp';
import type { CockpitNavItem, CockpitNavSection } from './sidebar-types';
import {
    GROUPS_STORAGE_KEY,
    PINS_STORAGE_KEY,
    RAIL_STORAGE_KEY,
    TOGGLE_SIDEBAR_EVENT,
    readRailCollapsed,
    readStringArray,
} from './sidebar-storage';

export interface UseCockpitSidebarArgs {
    navSections: CockpitNavSection[];
    userRole: string;
}

export interface UseCockpitSidebarResult {
    query: string;
    setQuery: (value: string) => void;
    normalizedQuery: string;
    roleLabel: string;
    pins: string[];
    pinnedItems: CockpitNavItem[];
    filteredSections: CockpitNavSection[];
    isRail: boolean;
    isGroupCollapsed: (title: string) => boolean;
    toggleGroup: (title: string) => void;
    togglePin: (id: TabType) => void;
}

export function useCockpitSidebar({
    navSections,
    userRole,
}: UseCockpitSidebarArgs): UseCockpitSidebarResult {
    const [query, setQuery] = useState('');
    // Initialisation paresseuse depuis localStorage : la lecture n'a lieu
    // qu'une fois, côté client, sans effet ni rendu en cascade.
    const [collapsedGroups, setCollapsedGroups] = useState<string[]>(() =>
        readStringArray(GROUPS_STORAGE_KEY)
    );
    const [pins, setPins] = useState<string[]>(() => readStringArray(PINS_STORAGE_KEY));
    const [isRail, setIsRail] = useState<boolean>(() => readRailCollapsed());

    // Repli/dépli piloté par le raccourci clavier global (Ctrl/Cmd+B).
    useEffect(() => {
        const handleToggle = () => setIsRail((prev) => !prev);
        window.addEventListener(TOGGLE_SIDEBAR_EVENT, handleToggle);
        return () => window.removeEventListener(TOGGLE_SIDEBAR_EVENT, handleToggle);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(RAIL_STORAGE_KEY, isRail ? '1' : '0');
    }, [isRail]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(collapsedGroups));
    }, [collapsedGroups]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(PINS_STORAGE_KEY, JSON.stringify(pins));
    }, [pins]);

    const roleLabel =
        userRole === 'directeur'
            ? 'Direction Campus'
            : userRole === 'secretaire'
                ? 'Secrétariat'
                : userRole === 'coach'
                    ? 'Espace Formateur'
                    : 'Admin Vitrine';

    const normalizedQuery = query.trim().toLowerCase();

    // Index plat de toutes les entrées pour la recherche et les épingles.
    const allItems = useMemo(
        () => navSections.flatMap((section) => section.items),
        [navSections],
    );

    const pinnedItems = useMemo(
        () => pins.map((id) => allItems.find((item) => item.id === id)).filter(Boolean) as CockpitNavItem[],
        [pins, allItems],
    );

    const filteredSections = useMemo(() => {
        if (!normalizedQuery) return navSections;
        return navSections
            .map((section) => ({
                ...section,
                items: section.items.filter((item) =>
                    item.label.toLowerCase().includes(normalizedQuery),
                ),
            }))
            .filter((section) => section.items.length > 0);
    }, [navSections, normalizedQuery]);

    const toggleGroup = (title: string) => {
        setCollapsedGroups((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
        );
    };

    const togglePin = (id: TabType) => {
        setPins((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
    };

    const isGroupCollapsed = (title: string) =>
        collapsedGroups.includes(title) && !normalizedQuery;

    return {
        query,
        setQuery,
        normalizedQuery,
        roleLabel,
        pins,
        pinnedItems,
        filteredSections,
        isRail,
        isGroupCollapsed,
        toggleGroup,
        togglePin,
    };
}
