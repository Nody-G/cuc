'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TabType } from '../../CockpitApp';
import { buildCommands, type CommandCategory, type CommandItem } from './command-definitions';
import { MAX_RECENTS, readRecents, writeRecents } from './command-recents';
import { scoreCommands } from './command-search';

export interface UseCommandPaletteArgs {
    isOpen: boolean;
    onClose: () => void;
    switchTab?: (tab: TabType) => void;
    onSelectTab?: (tab: TabType) => void;
    onOpenBackupModal?: () => void;
    onOpenBackup?: () => void;
    onOpenHealthModal?: () => void;
    onOpenHealth?: () => void;
    /** Ref de l'input de recherche (créée par la façade — jamais rendue par le hook). */
    inputRef: React.RefObject<HTMLInputElement | null>;
    /** Ref de la liste des commandes (défilement vers l'élément actif). */
    listRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * État et interactions de la palette de commandes : recherche floue, historique
 * des commandes récentes (repli `localStorage`), navigation clavier (flèches,
 * Home/End, Entrée, Échap), scroll automatique et piège de focus.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) — le catalogue vit dans
 * `command-definitions.ts`, le scoring dans `command-search.ts`.
 */
export function useCommandPalette({
    isOpen,
    onClose,
    switchTab,
    onSelectTab,
    onOpenBackupModal,
    onOpenBackup,
    onOpenHealthModal,
    onOpenHealth,
    inputRef,
    listRef,
}: UseCommandPaletteArgs) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentIds, setRecentIds] = useState<string[]>([]);
    const [recentsLoaded, setRecentsLoaded] = useState(false);

    // Hydratation de l'historique des commandes récentes : ajustement pendant le
    // rendu (pattern React officiel) au lieu d'un effet, pour éviter un rendu en
    // cascade. La lecture localStorage n'a lieu qu'à la première ouverture.
    if (isOpen && !recentsLoaded) {
        setRecentsLoaded(true);
        setRecentIds(readRecents());
    }

    const handleClose = useCallback(() => {
        setQuery('');
        setSelectedIndex(0);
        onClose();
    }, [onClose]);

    const selectTab = useCallback(
        (tab: TabType) => {
            (switchTab || onSelectTab)?.(tab);
        },
        [switchTab, onSelectTab]
    );
    const openBackup = useCallback(() => {
        (onOpenBackupModal || onOpenBackup)?.();
    }, [onOpenBackupModal, onOpenBackup]);
    const openHealth = useCallback(() => {
        (onOpenHealthModal || onOpenHealth)?.();
    }, [onOpenHealthModal, onOpenHealth]);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen, inputRef]);

    const commands: CommandItem[] = useMemo(
        () => buildCommands({ selectTab, openBackup, openHealth }),
        [selectTab, openBackup, openHealth]
    );

    const commandById = useMemo(() => {
        const map = new Map<string, CommandItem>();
        commands.forEach((c) => map.set(c.id, c));
        return map;
    }, [commands]);

    const recentCommands = useMemo(
        () =>
            recentIds
                .map((id) => commandById.get(id))
                .filter((c): c is CommandItem => Boolean(c)),
        [recentIds, commandById]
    );

    const filteredCommands = useMemo(() => scoreCommands(commands, query), [commands, query]);

    const activeIndex =
        filteredCommands.length > 0 ? Math.min(selectedIndex, filteredCommands.length - 1) : 0;

    const rememberCommand = useCallback((id: string) => {
        setRecentIds((prev) => {
            const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX_RECENTS);
            writeRecents(next);
            return next;
        });
    }, []);

    const runCommand = useCallback(
        (command: CommandItem) => {
            rememberCommand(command.id);
            command.action();
            handleClose();
        },
        [rememberCommand, handleClose]
    );

    // Défilement automatique vers l'élément actif
    useEffect(() => {
        if (!isOpen) return;
        const container = listRef.current;
        if (!container) return;
        const active = container.querySelector<HTMLElement>('[data-active="true"]');
        active?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex, isOpen, filteredCommands.length, listRef]);

    // Clavier
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (filteredCommands.length === 0) {
            if (e.key === 'Escape') {
                e.preventDefault();
                handleClose();
            }
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Home') {
            e.preventDefault();
            setSelectedIndex(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            setSelectedIndex(filteredCommands.length - 1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const target = filteredCommands[activeIndex];
            if (target) runCommand(target.command);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleClose();
        }
    };

    // Regroupement par catégorie (uniquement hors recherche)
    const grouped = useMemo(() => {
        const order: CommandCategory[] = ['Navigation', 'Actions Rapides', 'Outils Système'];
        return order
            .map((category) => ({
                category,
                items: filteredCommands.filter((s) => s.command.category === category),
            }))
            .filter((g) => g.items.length > 0);
    }, [filteredCommands]);

    // Index global pour la navigation clavier (aligné sur filteredCommands)
    const indexOfId = useMemo(() => {
        const map = new Map<string, number>();
        filteredCommands.forEach((s, i) => map.set(s.command.id, i));
        return map;
    }, [filteredCommands]);

    const showRecents = !query.trim() && recentCommands.length > 0;
    const showGrouped = !query.trim();

    return {
        query,
        setQuery,
        setSelectedIndex,
        handleClose,
        handleKeyDown,
        runCommand,
        filteredCommands,
        recentCommands,
        activeIndex,
        grouped,
        indexOfId,
        showRecents,
        showGrouped,
    };
}
