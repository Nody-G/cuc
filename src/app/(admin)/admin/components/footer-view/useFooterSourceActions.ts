'use client';

/**
 * ==============================================================================
 * CUC — Actions structurelles de la source FRANÇAISE du pied de page
 * ==============================================================================
 * Ces mutations (colonnes, liens, légal, certification, publication, save FR)
 * modifient la **source française** : elles n'ont aucune surface traduisible et
 * sont verrouillées dès que l'édition anglaise est active. Les isoler ici allège
 * `useFooterEditor` (qui ne garde que l'orchestration bilingue) — SRP.
 */

import { useCallback } from 'react';
import type { Dispatch, SetStateAction, TransitionStartFunction } from 'react';
import {
    DEFAULT_FOOTER,
    type FooterCertification,
    type FooterStructure,
} from '@/data/navigation';
import { upsertFooter } from '@/lib/data/site-service';
import {
    addColumnTo,
    addLegalLinkTo,
    addLinkTo,
    moveColumnIn,
    moveLinkIn,
    removeColumnIn,
    removeLegalLinkIn,
    removeLinkIn,
} from './footer-form';

export interface FooterSourceActions {
    setPublished: (value: boolean) => void;
    updateCertification: (updates: Partial<FooterCertification>) => void;
    moveColumn: (index: number, direction: -1 | 1) => void;
    removeColumn: (id: string) => void;
    addColumn: () => void;
    toggleColumnExpanded: (id: string) => void;
    moveLink: (columnId: string, index: number, direction: -1 | 1) => void;
    removeLink: (columnId: string, linkId: string) => void;
    addLink: (columnId: string) => void;
    removeLegalLink: (linkId: string) => void;
    addLegalLink: () => void;
    handleSave: () => void;
    handleReset: () => void;
}

export interface UseFooterSourceActionsArgs {
    structure: FooterStructure;
    setStructure: Dispatch<SetStateAction<FooterStructure>>;
    /** Écriture FR marquant le brouillon modifié (barre de sauvegarde). */
    mutateStructure: (next: FooterStructure) => void;
    isPublished: boolean;
    setIsPublished: (value: boolean) => void;
    setIsDirty: (value: boolean) => void;
    setExpandedColumn: Dispatch<SetStateAction<string | null>>;
    /** Édition anglaise : aucune action structurelle ne doit s'exécuter. */
    isEnglish: boolean;
    showToast: (msg: string) => void;
    startTransition: TransitionStartFunction;
}

export function useFooterSourceActions({
    structure,
    setStructure,
    mutateStructure,
    isPublished,
    setIsPublished,
    setIsDirty,
    setExpandedColumn,
    isEnglish,
    showToast,
    startTransition,
}: UseFooterSourceActionsArgs): FooterSourceActions {
    const setPublished = useCallback(
        (val: boolean) => {
            if (isEnglish) return; // la publication appartient à la source FR
            setIsPublished(val);
            setIsDirty(true);
        },
        [isEnglish, setIsPublished, setIsDirty]
    );

    const updateCertification = useCallback(
        (updates: Partial<FooterCertification>) => {
            if (isEnglish) return;
            const current = structure.certification || DEFAULT_FOOTER.structure.certification!;
            mutateStructure({ ...structure, certification: { ...current, ...updates } });
        },
        [isEnglish, structure, mutateStructure]
    );

    const moveColumn = useCallback(
        (index: number, direction: -1 | 1) => {
            if (isEnglish) return;
            const next = moveColumnIn(structure, index, direction);
            if (next) setStructure(next);
        },
        [isEnglish, structure, setStructure]
    );

    const removeColumn = useCallback(
        (id: string) => {
            if (isEnglish) return;
            if (!confirm('Supprimer cette colonne du pied de page ?')) return;
            setStructure(removeColumnIn(structure, id));
        },
        [isEnglish, structure, setStructure]
    );

    const addColumn = useCallback(() => {
        if (isEnglish) return;
        const { structure: next, columnId } = addColumnTo(structure);
        setStructure(next);
        setExpandedColumn(columnId);
    }, [isEnglish, structure, setStructure, setExpandedColumn]);

    const toggleColumnExpanded = useCallback(
        (id: string) => {
            setExpandedColumn((prev) => (prev === id ? null : id));
        },
        [setExpandedColumn]
    );

    const moveLink = useCallback(
        (columnId: string, index: number, direction: -1 | 1) => {
            if (isEnglish) return;
            const next = moveLinkIn(structure, columnId, index, direction);
            if (next) setStructure(next);
        },
        [isEnglish, structure, setStructure]
    );

    const removeLink = useCallback(
        (columnId: string, linkId: string) => {
            if (isEnglish) return;
            setStructure(removeLinkIn(structure, columnId, linkId));
        },
        [isEnglish, structure, setStructure]
    );

    const addLink = useCallback(
        (columnId: string) => {
            if (isEnglish) return;
            const next = addLinkTo(structure, columnId);
            if (next) setStructure(next);
        },
        [isEnglish, structure, setStructure]
    );

    const removeLegalLink = useCallback(
        (linkId: string) => {
            if (isEnglish) return;
            setStructure(removeLegalLinkIn(structure, linkId));
        },
        [isEnglish, structure, setStructure]
    );

    const addLegalLink = useCallback(() => {
        if (isEnglish) return;
        setStructure(addLegalLinkTo(structure));
    }, [isEnglish, structure, setStructure]);

    const handleSave = useCallback(() => {
        startTransition(async () => {
            const ok = await upsertFooter(structure, { id: 'main', isPublished });
            if (ok) setIsDirty(false);
            showToast(
                ok
                    ? 'Pied de page enregistré — la vitrine est mise à jour en direct.'
                    : 'Échec de l\'enregistrement du pied de page.'
            );
        });
    }, [structure, isPublished, showToast, startTransition, setIsDirty]);

    const handleReset = useCallback(() => {
        if (isEnglish) return;
        if (!confirm('Réinitialiser le pied de page aux valeurs par défaut ?')) return;
        setStructure(DEFAULT_FOOTER.structure);
        setIsDirty(true);
        showToast('Pied de page réinitialisé (pensez à enregistrer).');
    }, [isEnglish, setStructure, setIsDirty, showToast]);

    return {
        setPublished,
        updateCertification,
        moveColumn,
        removeColumn,
        addColumn,
        toggleColumnExpanded,
        moveLink,
        removeLink,
        addLink,
        removeLegalLink,
        addLegalLink,
        handleSave,
        handleReset,
    };
}
