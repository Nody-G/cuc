'use client';

/**
 * ==============================================================================
 * CUC — Actions structurelles de la source FRANÇAISE de la navigation
 * ==============================================================================
 * Réordonnancement, ajout / retrait d'entrées et de sous-entrées, dépliage, CTA
 * et réinitialisation : ces mutations modifient la **source française** (ordre,
 * cibles, publication) et sont donc verrouillées dès que l'édition anglaise est
 * active. Les isoler ici allège `useNavigationEditor` (qui ne garde que le
 * brouillon et l'orchestration bilingue) — même découpage que
 * `useFooterSourceActions` (SRP : `AGENTS.md` § 1-2).
 */

import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { DEFAULT_NAVIGATION, type NavigationStructure } from '@/data/navigation';
import {
    addChildTo,
    addItemTo,
    moveChildIn,
    moveItemIn,
    removeChildIn,
    removeItemIn,
} from './navigation-form';

export interface NavigationSourceActions {
    setPublished: (value: boolean) => void;
    moveItem: (index: number, direction: -1 | 1) => void;
    removeItem: (id: string) => void;
    addItem: () => void;
    toggleExpanded: (id: string) => void;
    expandItem: (id: string) => void;
    moveChild: (parentId: string, index: number, direction: -1 | 1) => void;
    removeChild: (parentId: string, childId: string) => void;
    addChild: (parentId: string) => void;
    updateCta: (updates: Partial<NavigationStructure['cta']>) => void;
    handleReset: () => void;
}

export interface UseNavigationSourceActionsArgs {
    /** Structure source française (brouillon FR). */
    structure: NavigationStructure;
    setStructure: Dispatch<SetStateAction<NavigationStructure>>;
    /** Écriture FR marquant le brouillon modifié (barre de sauvegarde). */
    mutateStructure: (next: NavigationStructure) => void;
    setIsDirty: (value: boolean) => void;
    setIsPublished: (value: boolean) => void;
    setExpandedId: Dispatch<SetStateAction<string | null>>;
    /** Édition anglaise : aucune action structurelle ne doit s'exécuter. */
    isEnglish: boolean;
    showToast: (msg: string) => void;
}

export function useNavigationSourceActions({
    structure,
    setStructure,
    mutateStructure,
    setIsDirty,
    setIsPublished,
    setExpandedId,
    isEnglish,
    showToast,
}: UseNavigationSourceActionsArgs): NavigationSourceActions {
    const setPublished = useCallback(
        (value: boolean) => {
            if (isEnglish) return; // la publication appartient à la source FR
            setIsPublished(value);
            setIsDirty(true);
        },
        [isEnglish, setIsPublished, setIsDirty]
    );

    // --- Entrées de premier niveau ---

    const moveItem = useCallback(
        (index: number, direction: -1 | 1) => {
            if (isEnglish) return; // l'ordre est structurel : français uniquement
            const next = moveItemIn(structure, index, direction);
            if (next) mutateStructure(next);
        },
        [structure, mutateStructure, isEnglish]
    );

    const removeItem = useCallback(
        (id: string) => {
            if (isEnglish) return;
            if (!confirm('Supprimer cette entrée de navigation ?')) return;
            mutateStructure(removeItemIn(structure, id));
        },
        [structure, mutateStructure, isEnglish]
    );

    const addItem = useCallback(() => {
        if (isEnglish) return;
        const { structure: next, itemId } = addItemTo(structure);
        mutateStructure(next);
        setExpandedId(itemId);
    }, [structure, mutateStructure, isEnglish, setExpandedId]);

    const toggleExpanded = useCallback(
        (id: string) => {
            setExpandedId((prev) => (prev === id ? null : id));
        },
        [setExpandedId]
    );

    /** Dépliage ciblé : révèle une page demandée depuis un autre écran. */
    const expandItem = useCallback(
        (id: string) => {
            setExpandedId(id);
        },
        [setExpandedId]
    );

    // --- Sous-entrées (enfants de dropdown) ---

    const moveChild = useCallback(
        (parentId: string, index: number, direction: -1 | 1) => {
            if (isEnglish) return;
            const next = moveChildIn(structure, parentId, index, direction);
            if (next) mutateStructure(next);
        },
        [structure, mutateStructure, isEnglish]
    );

    const removeChild = useCallback(
        (parentId: string, childId: string) => {
            if (isEnglish) return;
            mutateStructure(removeChildIn(structure, parentId, childId));
        },
        [structure, mutateStructure, isEnglish]
    );

    const addChild = useCallback(
        (parentId: string) => {
            if (isEnglish) return;
            const next = addChildTo(structure, parentId);
            if (next) mutateStructure(next);
        },
        [structure, mutateStructure, isEnglish]
    );

    // --- CTA principal (cible verrouillée : non traduisible en EN) ---

    const updateCta = useCallback(
        (updates: Partial<NavigationStructure['cta']>) => {
            if (isEnglish) return;
            mutateStructure({ ...structure, cta: { ...structure.cta, ...updates } });
        },
        [structure, mutateStructure, isEnglish]
    );

    const handleReset = useCallback(() => {
        if (isEnglish) return;
        if (!confirm('Réinitialiser la navigation aux valeurs par défaut ?')) return;
        setStructure(DEFAULT_NAVIGATION.structure);
        setIsDirty(true);
        showToast('Navigation réinitialisée (pensez à enregistrer).');
    }, [isEnglish, setStructure, setIsDirty, showToast]);

    return {
        setPublished,
        moveItem,
        removeItem,
        addItem,
        toggleExpanded,
        expandItem,
        moveChild,
        removeChild,
        addChild,
        updateCta,
        handleReset,
    };
}
