'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import {
    DEFAULT_FOOTER,
    type FooterBrand,
    type FooterColumn,
    type FooterLink,
    type FooterStructure,
} from '@/data/navigation';
import { getFooter, upsertFooter } from '@/lib/data/site-service';
import {
    addColumnTo,
    addLegalLinkTo,
    addLinkTo,
    moveColumnIn,
    moveLinkIn,
    removeColumnIn,
    removeLegalLinkIn,
    removeLinkIn,
    sortedColumns,
    sortedLegalLinks,
    updateColumnIn,
    updateLegalLinkIn,
    updateLinkIn,
} from './footer-form';

export interface UseFooterEditorArgs {
    showToast: (msg: string) => void;
}

export interface UseFooterEditorResult {
    structure: FooterStructure;
    columns: FooterColumn[];
    legalLinks: FooterLink[];
    isPublished: boolean;
    isLoading: boolean;
    isPending: boolean;
    expandedColumn: string | null;
    setPublished: (value: boolean) => void;
    updateBrand: (updates: Partial<FooterBrand>) => void;
    moveColumn: (index: number, direction: -1 | 1) => void;
    updateColumn: (id: string, updates: Partial<FooterColumn>) => void;
    removeColumn: (id: string) => void;
    addColumn: () => void;
    toggleColumnExpanded: (id: string) => void;
    updateLink: (columnId: string, linkId: string, updates: Partial<FooterLink>) => void;
    moveLink: (columnId: string, index: number, direction: -1 | 1) => void;
    removeLink: (columnId: string, linkId: string) => void;
    addLink: (columnId: string) => void;
    updateCopyright: (value: string) => void;
    updateLegalLink: (linkId: string, updates: Partial<FooterLink>) => void;
    removeLegalLink: (linkId: string) => void;
    addLegalLink: () => void;
    handleSave: () => void;
    handleReset: () => void;
}

export function useFooterEditor({ showToast }: UseFooterEditorArgs): UseFooterEditorResult {
    const [structure, setStructure] = useState<FooterStructure>(DEFAULT_FOOTER.structure);
    const [isPublished, setIsPublished] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedColumn, setExpandedColumn] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        let cancelled = false;
        getFooter('main')
            .then((footer) => {
                if (cancelled) return;
                setStructure(footer.structure);
                setIsPublished(footer.is_published);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // --- Identité de marque ---

    const updateBrand = useCallback(
        (updates: Partial<FooterBrand>) => {
            setStructure({ ...structure, brand: { ...structure.brand, ...updates } });
        },
        [structure]
    );

    // --- Colonnes ---

    const moveColumn = useCallback(
        (index: number, direction: -1 | 1) => {
            const next = moveColumnIn(structure, index, direction);
            if (next) setStructure(next);
        },
        [structure]
    );

    const updateColumn = useCallback(
        (id: string, updates: Partial<FooterColumn>) => {
            setStructure(updateColumnIn(structure, id, updates));
        },
        [structure]
    );

    const removeColumn = useCallback(
        (id: string) => {
            if (!confirm('Supprimer cette colonne du pied de page ?')) return;
            setStructure(removeColumnIn(structure, id));
        },
        [structure]
    );

    const addColumn = useCallback(() => {
        const { structure: next, columnId } = addColumnTo(structure);
        setStructure(next);
        setExpandedColumn(columnId);
    }, [structure]);

    const toggleColumnExpanded = useCallback((id: string) => {
        setExpandedColumn((prev) => (prev === id ? null : id));
    }, []);

    // --- Liens d'une colonne ---

    const updateLink = useCallback(
        (columnId: string, linkId: string, updates: Partial<FooterLink>) => {
            setStructure(updateLinkIn(structure, columnId, linkId, updates));
        },
        [structure]
    );

    const moveLink = useCallback(
        (columnId: string, index: number, direction: -1 | 1) => {
            const next = moveLinkIn(structure, columnId, index, direction);
            if (next) setStructure(next);
        },
        [structure]
    );

    const removeLink = useCallback(
        (columnId: string, linkId: string) => {
            setStructure(removeLinkIn(structure, columnId, linkId));
        },
        [structure]
    );

    const addLink = useCallback(
        (columnId: string) => {
            const next = addLinkTo(structure, columnId);
            if (next) setStructure(next);
        },
        [structure]
    );

    // --- Liens légaux ---

    const updateCopyright = useCallback(
        (value: string) => {
            setStructure({ ...structure, legal: { ...structure.legal, copyright: value } });
        },
        [structure]
    );

    const updateLegalLink = useCallback(
        (linkId: string, updates: Partial<FooterLink>) => {
            setStructure(updateLegalLinkIn(structure, linkId, updates));
        },
        [structure]
    );

    const removeLegalLink = useCallback(
        (linkId: string) => {
            setStructure(removeLegalLinkIn(structure, linkId));
        },
        [structure]
    );

    const addLegalLink = useCallback(() => {
        setStructure(addLegalLinkTo(structure));
    }, [structure]);

    // --- Persistance ---

    const handleSave = useCallback(() => {
        startTransition(async () => {
            const ok = await upsertFooter(structure, { id: 'main', isPublished });
            showToast(
                ok
                    ? 'Pied de page enregistré — la vitrine est mise à jour en direct.'
                    : 'Échec de l\'enregistrement du pied de page.'
            );
        });
    }, [structure, isPublished, showToast, startTransition]);

    const handleReset = useCallback(() => {
        if (!confirm('Réinitialiser le pied de page aux valeurs par défaut ?')) return;
        setStructure(DEFAULT_FOOTER.structure);
        showToast('Pied de page réinitialisé (pensez à enregistrer).');
    }, [showToast]);

    return {
        structure,
        columns: sortedColumns(structure),
        legalLinks: sortedLegalLinks(structure),
        isPublished,
        isLoading,
        isPending,
        expandedColumn,
        setPublished: setIsPublished,
        updateBrand,
        moveColumn,
        updateColumn,
        removeColumn,
        addColumn,
        toggleColumnExpanded,
        updateLink,
        moveLink,
        removeLink,
        addLink,
        updateCopyright,
        updateLegalLink,
        removeLegalLink,
        addLegalLink,
        handleSave,
        handleReset,
    };
}
