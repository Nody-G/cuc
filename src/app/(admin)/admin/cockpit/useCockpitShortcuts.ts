'use client';

import React, { useCallback, useEffect } from 'react';
import { resolveTabFromPath, type TabType } from './cockpit-nav';

export interface UseCockpitShortcutsArgs {
    setActiveTab: React.Dispatch<React.SetStateAction<TabType>>;
    isCommandPaletteOpen: boolean;
    setIsCommandPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isShortcutsHelpOpen: boolean;
    setIsShortcutsHelpOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isBackupModalOpen: boolean;
    setIsBackupModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isHealthModalOpen: boolean;
    setIsHealthModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Raccourcis clavier globaux, navigation d'onglets et boutons Précédent/Suivant
 * du navigateur.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : `switchTab` conserve la
 * navigation par `pushState` (deep-linking), les raccourcis ne se déclenchent
 * jamais pendant une saisie, et `Échap` ferme la fenêtre active.
 */
export function useCockpitShortcuts({
    setActiveTab,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isShortcutsHelpOpen,
    setIsShortcutsHelpOpen,
    isBackupModalOpen,
    setIsBackupModalOpen,
    isHealthModalOpen,
    setIsHealthModalOpen,
}: UseCockpitShortcutsArgs) {
    const switchTab = useCallback(
        (tab: TabType) => {
            setActiveTab(tab);
            const targetUrl = tab === 'dashboard' ? '/admin' : `/admin/${tab}`;
            if (window.location.pathname !== targetUrl) {
                window.history.pushState(null, '', targetUrl);
            }
        },
        [setActiveTab]
    );

    useEffect(() => {
        const QUICK_TABS: TabType[] = [
            'dashboard',
            'inquiries',
            'pages',
            'sessions',
            'team',
            'films',
        ];

        const isTypingTarget = (target: EventTarget | null): boolean => {
            const el = target as HTMLElement | null;
            if (!el) return false;
            const tag = el.tagName;
            return (
                tag === 'INPUT' ||
                tag === 'TEXTAREA' ||
                tag === 'SELECT' ||
                el.isContentEditable === true
            );
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const mod = e.ctrlKey || e.metaKey;
            const key = e.key.toLowerCase();

            // Ctrl/Cmd + K : palette de commandes
            if (mod && key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen((prev) => !prev);
                return;
            }

            // Ctrl/Cmd + / : aide des raccourcis
            if (mod && (e.key === '/' || e.key === '?')) {
                e.preventDefault();
                setIsShortcutsHelpOpen((prev) => !prev);
                return;
            }

            // Ctrl/Cmd + B : replier/déplier la navigation latérale
            if (mod && key === 'b' && !e.shiftKey) {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('cuc:cockpit:toggle-sidebar'));
                return;
            }

            // Ctrl/Cmd + Shift + B : sauvegarde / restauration
            if (mod && e.shiftKey && key === 'b') {
                e.preventDefault();
                setIsBackupModalOpen(true);
                return;
            }

            // Ctrl/Cmd + Shift + H : diagnostic système
            if (mod && e.shiftKey && key === 'h') {
                e.preventDefault();
                setIsHealthModalOpen(true);
                return;
            }

            // Alt + 1..6 : navigation rapide entre les onglets principaux
            if (e.altKey && !mod && !e.shiftKey) {
                const digit = Number.parseInt(e.key, 10);
                if (!Number.isNaN(digit) && digit >= 1 && digit <= QUICK_TABS.length) {
                    e.preventDefault();
                    switchTab(QUICK_TABS[digit - 1]);
                    return;
                }
            }

            // Échap : fermer la fenêtre active (hors saisie de texte)
            if (e.key === 'Escape' && !isTypingTarget(e.target)) {
                if (isCommandPaletteOpen) {
                    setIsCommandPaletteOpen(false);
                } else if (isShortcutsHelpOpen) {
                    setIsShortcutsHelpOpen(false);
                } else if (isBackupModalOpen) {
                    setIsBackupModalOpen(false);
                } else if (isHealthModalOpen) {
                    setIsHealthModalOpen(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        isCommandPaletteOpen,
        isShortcutsHelpOpen,
        isBackupModalOpen,
        isHealthModalOpen,
        switchTab,
        setIsCommandPaletteOpen,
        setIsShortcutsHelpOpen,
        setIsBackupModalOpen,
        setIsHealthModalOpen,
    ]);

    // Prise en charge des boutons Précédent/Suivant du navigateur
    useEffect(() => {
        const handlePopState = () => {
            setActiveTab(resolveTabFromPath(window.location.pathname) ?? 'dashboard');
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [setActiveTab]);

    return { switchTab };
}
