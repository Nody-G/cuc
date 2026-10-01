'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import {
    DEFAULT_FOOTER,
    type FooterBrand,
    type FooterCertification,
    type FooterColumn,
    type FooterLink,
    type FooterStructure,
} from '@/data/navigation';
import { getFooter } from '@/lib/data/site-service';
import type { EditorLocaleOption } from '../ui';
import { useLabelsEditorLocale } from '../entity-translation/useLabelsEditorLocale';
import { footerLabelsCodec, type LabelsRow } from '../entity-translation/labels-codec';
import type { EntityEditorLocale } from '../entity-translation/entity-translation.contract';
import { sortedColumns, sortedLegalLinks, updateColumnIn, updateLegalLinkIn, updateLinkIn } from './footer-form';
import { useFooterSourceActions } from './useFooterSourceActions';

/** Codec de l'overlay `footer` — constante de module (identité stable). */
const FOOTER_CODEC = footerLabelsCodec();

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
    isDirty: boolean;
    expandedColumn: string | null;
    setPublished: (value: boolean) => void;
    updateBrand: (updates: Partial<FooterBrand>) => void;
    updateCertification: (updates: Partial<FooterCertification>) => void;
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
    /** Édition anglaise active : URLs, ordre et certification sont verrouillés. */
    isEnglish: boolean;
    /** Brouillon actif : français en FR, contenu localisé en EN. */
    activeStructure: FooterStructure;
    /** État bilingue complet, consommé par l'en-tête (barre FR | EN). */
    locale: EntityEditorLocale<FooterStructure>;
    /** Bascule de langue avec garde-fou sur un brouillon anglais non enregistré. */
    changeLocale: (next: EditorLocaleOption) => void;
    /** Verrou générique d'un champ en anglais (médias / technique). */
    isFieldReadOnly: (field: string) => boolean;
}

/**
 * État et écritures du pied de page.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : source FR et écritures
 * structurelles déléguées à `useFooterSourceActions`, orchestration bilingue
 * EN PLACE assurée par `useLabelsEditorLocale`. Seuls les libellés/copies sont
 * traduisibles (`col.id`, `link.id`, `brand.tagline`, `brand.description`,
 * `legal.copyright`, `legal.<id>`) ; URLs, ordre et certification restent FR.
 */
export function useFooterEditor({ showToast }: UseFooterEditorArgs): UseFooterEditorResult {
    const [structure, setStructure] = useState<FooterStructure>(DEFAULT_FOOTER.structure);
    const [isPublished, setIsPublished] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isDirty, setIsDirty] = useState(false);
    const [expandedColumn, setExpandedColumn] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const mutateStructure = useCallback((next: FooterStructure) => {
        setStructure(next);
        setIsDirty(true);
    }, []);

    /**
     * Édition EN PLACE : le codec `footer` projette la structure vers l'overlay
     * `labels` (clés composites) et rend la structure active. Le français reste
     * la source ; rien n'est chargé en FR.
     */
    const labelsEditor = useLabelsEditorLocale<FooterStructure, LabelsRow>({
        codec: FOOTER_CODEC,
        entityId: 'main',
        draft: structure,
        setDraft: setStructure,
    });

    const locale = labelsEditor.locale;
    const isEnglish = labelsEditor.isEnglish;
    const activeStructure = labelsEditor.active;

    useEffect(() => {
        let cancelled = false;
        getFooter('main')
            .then((footer) => {
                if (cancelled) return;
                setStructure(footer.structure);
                setIsPublished(footer.is_published);
                setIsDirty(false);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    /**
     * Écriture d'un champ traduisible : en EN l'overlay, en FR la source. La
     * branche FR préserve la sémantique existante de chaque mutation.
     */
    const commitSource = useCallback(
        (next: FooterStructure) => {
            if (isEnglish) labelsEditor.setActive(next);
            else setStructure(next);
        },
        [isEnglish, labelsEditor, setStructure]
    );

    const commitBrand = useCallback(
        (next: FooterStructure) => {
            if (isEnglish) labelsEditor.setActive(next);
            else mutateStructure(next);
        },
        [isEnglish, labelsEditor, mutateStructure]
    );

    // --- Champs traduisibles (nom verrouillé en EN) ---

    const updateBrand = useCallback(
        (updates: Partial<FooterBrand>) => {
            commitBrand({ ...activeStructure, brand: { ...activeStructure.brand, ...updates } });
        },
        [activeStructure, commitBrand]
    );

    const updateColumn = useCallback(
        (id: string, updates: Partial<FooterColumn>) => {
            commitSource(updateColumnIn(activeStructure, id, updates));
        },
        [commitSource, activeStructure]
    );

    const updateLink = useCallback(
        (columnId: string, linkId: string, updates: Partial<FooterLink>) => {
            commitSource(updateLinkIn(activeStructure, columnId, linkId, updates));
        },
        [commitSource, activeStructure]
    );

    const updateCopyright = useCallback(
        (value: string) => {
            commitSource({ ...activeStructure, legal: { ...activeStructure.legal, copyright: value } });
        },
        [commitSource, activeStructure]
    );

    const updateLegalLink = useCallback(
        (linkId: string, updates: Partial<FooterLink>) => {
            commitSource(updateLegalLinkIn(activeStructure, linkId, updates));
        },
        [commitSource, activeStructure]
    );

    // --- Structurel (français uniquement) ---

    const sourceActions = useFooterSourceActions({
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
    });

    /**
     * Action principale de l'écran : en anglais elle enregistre l'**overlay** des
     * libellés et laisse la source française intacte ; en français elle reste la
     * sauvegarde structurelle existante (`sourceActions.handleSave`).
     */
    const handleSave = useCallback(() => {
        if (isEnglish) {
            void labelsEditor.locale.saveTranslation().then((result) => {
                showToast(
                    result.success
                        ? 'Traduction anglaise du pied de page enregistrée.'
                        : 'Échec de l\'enregistrement de la traduction.'
                );
            });
            return;
        }
        sourceActions.handleSave();
    }, [isEnglish, labelsEditor, showToast, sourceActions]);

    return {
        structure,
        columns: sortedColumns(activeStructure),
        legalLinks: sortedLegalLinks(activeStructure),
        isPublished,
        isLoading,
        isPending,
        isDirty,
        expandedColumn,
        updateBrand,
        updateColumn,
        updateLink,
        updateCopyright,
        updateLegalLink,
        isEnglish,
        activeStructure,
        locale,
        changeLocale: labelsEditor.changeLocale,
        isFieldReadOnly: labelsEditor.isFieldReadOnly,
        ...sourceActions,
        // En anglais, l'action principale écrit l'overlay : elle surcharge la
        // sauvegarde structurelle française exposée par `sourceActions`.
        handleSave,
    };
}
