'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    canRedoHistory,
    canUndoHistory,
    createDraftHistory,
    pushHistory,
    redoHistory,
    resetHistory,
    undoHistory,
} from '@/lib/preview/draft-history';
import type { SitePageContent } from '@/lib/data/site-service';

export interface UseEditorHistoryResult {
    /** Point d'historisation unique : toute mutation du brouillon passe ici. */
    applyDraftChange: (mutate: (prev: SitePageContent) => SitePageContent) => void;
    handleUndo: () => void;
    handleRedo: () => void;
    historyState: { canUndo: boolean; canRedo: boolean };
    resetDraftHistory: () => void;
}

/**
 * Historique du brouillon (undo / redo) : le Mode Studio édite en mémoire, il
 * doit donc pouvoir revenir en arrière sans réseau. Les raccourcis Ctrl/Cmd+Z,
 * Ctrl/Cmd+Maj+Z et Ctrl+Y sont posés ici — inactifs dans un champ de saisie,
 * où l'undo natif du navigateur reste roi.
 */
export function useEditorHistory(
    activeData: SitePageContent,
    setActiveData: React.Dispatch<React.SetStateAction<SitePageContent>>
): UseEditorHistoryResult {
    const historyRef = useRef(createDraftHistory<SitePageContent>());
    const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
    const activeDataRef = useRef<SitePageContent>(activeData);

    useEffect(() => {
        activeDataRef.current = activeData;
    }, [activeData]);

    const syncHistoryState = useCallback(() => {
        setHistoryState({
            canUndo: canUndoHistory(historyRef.current),
            canRedo: canRedoHistory(historyRef.current),
        });
    }, []);

    const applyDraftChange = useCallback(
        (mutate: (prev: SitePageContent) => SitePageContent) => {
            pushHistory(historyRef.current, activeDataRef.current);
            syncHistoryState();
            setActiveData((prev) => mutate(prev));
        },
        [setActiveData, syncHistoryState]
    );

    const handleUndo = useCallback(() => {
        const previous = undoHistory(historyRef.current, activeDataRef.current);
        if (previous === null) return;
        setActiveData(previous);
        syncHistoryState();
    }, [setActiveData, syncHistoryState]);

    const handleRedo = useCallback(() => {
        const next = redoHistory(historyRef.current, activeDataRef.current);
        if (next === null) return;
        setActiveData(next);
        syncHistoryState();
    }, [setActiveData, syncHistoryState]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!(event.ctrlKey || event.metaKey)) return;
            const target = event.target as HTMLElement | null;
            const tag = target?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;

            const key = event.key.toLowerCase();
            if (key === 'z' && !event.shiftKey) {
                event.preventDefault();
                handleUndo();
            } else if ((key === 'z' && event.shiftKey) || key === 'y') {
                event.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

    const resetDraftHistory = useCallback(() => {
        resetHistory(historyRef.current);
        syncHistoryState();
    }, [syncHistoryState]);

    return { applyDraftChange, handleUndo, handleRedo, historyState, resetDraftHistory };
}
