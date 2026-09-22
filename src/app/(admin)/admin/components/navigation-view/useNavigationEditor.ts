'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import {
    DEFAULT_NAVIGATION,
    type NavChildItem,
    type NavItem,
    type NavigationStructure,
} from '@/data/navigation';
import { getNavigation, upsertNavigation } from '@/lib/data/site-service';
import {
    addChildTo,
    addItemTo,
    moveChildIn,
    moveItemIn,
    removeChildIn,
    removeItemIn,
    sortedItems,
    updateChildIn,
    updateItemIn,
} from './navigation-form';

export interface UseNavigationEditorArgs {
    showToast: (msg: string) => void;
}

export interface UseNavigationEditorResult {
    structure: NavigationStructure;
    items: NavItem[];
    isPublished: boolean;
    isLoading: boolean;
    isPending: boolean;
    expandedId: string | null;
    setPublished: (value: boolean) => void;
    moveItem: (index: number, direction: -1 | 1) => void;
    updateItem: (id: string, updates: Partial<NavItem>) => void;
    removeItem: (id: string) => void;
    addItem: () => void;
    toggleExpanded: (id: string) => void;
    updateChild: (parentId: string, childId: string, updates: Partial<NavChildItem>) => void;
    moveChild: (parentId: string, index: number, direction: -1 | 1) => void;
    removeChild: (parentId: string, childId: string) => void;
    addChild: (parentId: string) => void;
    updateCta: (updates: Partial<NavigationStructure['cta']>) => void;
    handleSave: () => void;
    handleReset: () => void;
}

export function useNavigationEditor({
    showToast,
}: UseNavigationEditorArgs): UseNavigationEditorResult {
    const [structure, setStructure] = useState<NavigationStructure>(DEFAULT_NAVIGATION.structure);
    const [isPublished, setIsPublished] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        let cancelled = false;
        getNavigation('main')
            .then((nav) => {
                if (cancelled) return;
                setStructure(nav.structure);
                setIsPublished(nav.is_published);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // --- Entrées de premier niveau ---

    const moveItem = useCallback(
        (index: number, direction: -1 | 1) => {
            const next = moveItemIn(structure, index, direction);
            if (next) setStructure(next);
        },
        [structure]
    );

    const updateItem = useCallback(
        (id: string, updates: Partial<NavItem>) => {
            setStructure(updateItemIn(structure, id, updates));
        },
        [structure]
    );

    const removeItem = useCallback(
        (id: string) => {
            if (!confirm('Supprimer cette entrée de navigation ?')) return;
            setStructure(removeItemIn(structure, id));
        },
        [structure]
    );

    const addItem = useCallback(() => {
        const { structure: next, itemId } = addItemTo(structure);
        setStructure(next);
        setExpandedId(itemId);
    }, [structure]);

    const toggleExpanded = useCallback((id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    // --- Sous-entrées (enfants de dropdown) ---

    const updateChild = useCallback(
        (parentId: string, childId: string, updates: Partial<NavChildItem>) => {
            setStructure(updateChildIn(structure, parentId, childId, updates));
        },
        [structure]
    );

    const moveChild = useCallback(
        (parentId: string, index: number, direction: -1 | 1) => {
            const next = moveChildIn(structure, parentId, index, direction);
            if (next) setStructure(next);
        },
        [structure]
    );

    const removeChild = useCallback(
        (parentId: string, childId: string) => {
            setStructure(removeChildIn(structure, parentId, childId));
        },
        [structure]
    );

    const addChild = useCallback(
        (parentId: string) => {
            const next = addChildTo(structure, parentId);
            if (next) setStructure(next);
        },
        [structure]
    );

    // --- CTA principal ---

    const updateCta = useCallback(
        (updates: Partial<NavigationStructure['cta']>) => {
            setStructure({ ...structure, cta: { ...structure.cta, ...updates } });
        },
        [structure]
    );

    // --- Persistance ---

    const handleSave = useCallback(() => {
        startTransition(async () => {
            const ok = await upsertNavigation(structure, { id: 'main', isPublished });
            showToast(
                ok
                    ? 'Navigation enregistrée — la vitrine est mise à jour en direct.'
                    : 'Échec de l\'enregistrement de la navigation.'
            );
        });
    }, [structure, isPublished, showToast, startTransition]);

    const handleReset = useCallback(() => {
        if (!confirm('Réinitialiser la navigation aux valeurs par défaut ?')) return;
        setStructure(DEFAULT_NAVIGATION.structure);
        showToast('Navigation réinitialisée (pensez à enregistrer).');
    }, [showToast]);

    return {
        structure,
        items: sortedItems(structure),
        isPublished,
        isLoading,
        isPending,
        expandedId,
        setPublished: setIsPublished,
        moveItem,
        updateItem,
        removeItem,
        addItem,
        toggleExpanded,
        updateChild,
        moveChild,
        removeChild,
        addChild,
        updateCta,
        handleSave,
        handleReset,
    };
}
