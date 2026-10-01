'use client';

/**
 * Hook d'orchestration de la vue d'Aide & Guide du Cockpit.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : gère l'onglet actif,
 * la recherche globale et l'état déplié des cartes de guide.
 */

import { useMemo, useState } from 'react';
import type { HelpTabId } from './help-content.types';
import { DEFAULT_HELP_TAB } from './help-tabs.config';
import { HELP_CONTENT, type HelpGroup } from './help-content';
import { buildShortcutGroups, type ShortcutGroup } from './shortcuts';

export interface UseHelpViewReturn {
    activeTab: HelpTabId;
    setActiveTab: (tab: HelpTabId) => void;
    query: string;
    setQuery: (q: string) => void;
    filteredGroups: HelpGroup[];
    openTopicId: string | null;
    toggleTopic: (id: string) => void;
    shortcutGroups: ShortcutGroup[];
}

export function useHelpView(): UseHelpViewReturn {
    const [activeTab, setActiveTab] = useState<HelpTabId>(DEFAULT_HELP_TAB);
    const [query, setQuery] = useState('');
    const [openTopicId, setOpenTopicId] = useState<string | null>(null);

    const shortcutGroups = useMemo(() => buildShortcutGroups(), []);

    const filteredGroups = useMemo<HelpGroup[]>(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return HELP_CONTENT;

        return HELP_CONTENT.map((group) => ({
            ...group,
            topics: group.topics.filter((topic) =>
                [topic.title, topic.summary, ...topic.bullets, ...topic.keywords]
                    .join(' ')
                    .toLowerCase()
                    .includes(needle)
            ),
        })).filter((group) => group.topics.length > 0);
    }, [query]);

    const toggleTopic = (id: string) => {
        setOpenTopicId((current) => (current === id ? null : id));
    };

    return {
        activeTab,
        setActiveTab,
        query,
        setQuery,
        filteredGroups,
        openTopicId,
        toggleTopic,
        shortcutGroups,
    };
}
