'use client';

/**
 * Filtre de recherche et état d'ouverture de l'aide.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : aucune requête réseau,
 * aucun calcul lourd — filtrage en mémoire du contenu statique.
 */

import { useMemo, useState } from 'react';
import { HELP_CONTENT, type HelpGroup } from './help-content';

export interface HelpFilterState {
    query: string;
    setQuery: (value: string) => void;
    /** Groupes filtrés par la recherche (titre, résumé, points, mots-clés). */
    groups: HelpGroup[];
    /** Identifiant du sujet déplié (un seul à la fois). */
    openId: string | null;
    toggle: (id: string) => void;
}

export function useHelpFilter(): HelpFilterState {
    const [query, setQuery] = useState('');
    const [openId, setOpenId] = useState<string | null>(null);

    const groups = useMemo<HelpGroup[]>(() => {
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

    const toggle = (id: string) => setOpenId((current) => (current === id ? null : id));

    return { query, setQuery, groups, openId, toggle };
}
