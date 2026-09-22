'use client';

import { useState } from 'react';
import { DEFAULT_PAGE_CONTENTS, normalizeSlug, type SitePageContent } from '@/lib/data/site-service';
import { useEntityTranslation } from '@/lib/hooks/useEntityTranslation';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';
import { collectDraftChanges, revertDraftField } from '@/lib/preview/draft-diff';
import { setFieldValue } from '@/lib/preview/field-path';
import { applyListCommand, type ListCommand } from '@/lib/preview/list-command';
import { composePageDraft } from './page-draft';
import { useDraftPersistence } from './useDraftPersistence';
import { useEditorHistory } from './useEditorHistory';

export interface UsePageEditorDraftArgs {
    pages: SitePageContent[];
    /** Slug nettoyé de la page éditée. */
    selectedSlug: string;
    editorLocale: EditorLocaleOption;
}

/**
 * Brouillon de la page éditée : formulaire français, overlay anglais, diff avec
 * l'enregistré, historique undo/redo et persistance locale de secours.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) : les écritures en base
 * vivent dans `usePageSaveActions`, la sélection de page dans la façade.
 */
export function usePageEditorDraft({ pages, selectedSlug, editorLocale }: UsePageEditorDraftArgs) {
    const currentPage =
        pages.find((p) => normalizeSlug(p.slug) === selectedSlug) ||
        pages[0] ||
        DEFAULT_PAGE_CONTENTS['/'];

    // État local du formulaire avec initialisation sécurisée.
    const [formData, setFormData] = useState<SitePageContent>(() =>
        composePageDraft(selectedSlug, currentPage)
    );

    /**
     * Langue d'édition. Le français reste la source : passer en anglais ne change
     * pas de page, cela injecte le contenu localisé (français + surcharges
     * anglaises) dans les mêmes éditeurs. Rien n'est chargé tant qu'on reste en FR.
     */
    const translation = useEntityTranslation<SitePageContent>({
        entity: 'page',
        entityId: selectedSlug,
        locale: editorLocale,
        base: formData,
    });

    /** Contenu injecté dans les éditeurs : source FR, ou contenu localisé en EN. */
    const activeData: SitePageContent = editorLocale === 'en' ? translation.localized : formData;
    const setActiveData: React.Dispatch<React.SetStateAction<SitePageContent>> =
        editorLocale === 'en' ? translation.setLocalized : setFormData;

    /** En anglais, la traduction doit être chargée avant d'être éditée. */
    const isTranslationLoading = editorLocale === 'en' && !translation.ready;

    const { applyDraftChange, handleUndo, handleRedo, historyState, resetDraftHistory } =
        useEditorHistory(activeData, setActiveData);

    /**
     * État **enregistré** de la page : référence du diff de l'inspecteur. Il est
     * reconstruit exactement comme l'initialisation du formulaire, donc une
     * modification du brouillon ne le décale jamais.
     */
    const savedData: SitePageContent = composePageDraft(selectedSlug, currentPage);

    /**
     * Diff du brouillon. En édition anglaise l'inspecteur est neutralisé : le
     * brouillon anglais est un overlay, sa comparaison au français serait fausse.
     */
    const isInspectorEnabled = editorLocale === 'fr';
    const draftChanges = isInspectorEnabled ? collectDraftChanges(savedData, activeData) : [];

    const { clearCurrentSnapshot } = useDraftPersistence({
        slug: selectedSlug,
        locale: editorLocale,
        draftCount: draftChanges.length,
        activeData,
        applyDraftChange,
    });

    const handleRevertChange = (path: string) => {
        applyDraftChange((prev) => revertDraftField(prev, savedData, path));
    };

    const handleRevertAllChanges = () => {
        applyDraftChange(() => savedData);
    };

    /**
     * Édition en place : la valeur validée dans l'aperçu est écrite dans le
     * brouillon courant (français ou traduction anglaise). Aucune écriture en base —
     * la persistance reste l'action explicite « Enregistrer ».
     */
    const handlePreviewFieldCommit = (field: string, value: string) => {
        if (isTranslationLoading) return;
        applyDraftChange((prev) => setFieldValue(prev, field, value));
    };

    /**
     * Commandes de listes (ajouter, supprimer, réordonner, dupliquer) : le moteur
     * pur garantit qu'aucun item n'est inventé (liste vide) et qu'aucune liste
     * rendue n'est vidée ; l'écriture vise le brouillon de la langue active.
     */
    const handlePreviewListCommand = (field: string, command: ListCommand, index: number) => {
        if (isTranslationLoading) return;
        applyDraftChange((prev) => applyListCommand(prev, field, command, index));
    };

    return {
        formData,
        setFormData,
        currentPage,
        translation,
        activeData,
        setActiveData,
        isTranslationLoading,
        savedData,
        draftChanges,
        isInspectorEnabled,
        applyDraftChange,
        handleUndo,
        handleRedo,
        historyState,
        resetDraftHistory,
        handleRevertChange,
        handleRevertAllChanges,
        handlePreviewFieldCommit,
        handlePreviewListCommand,
        clearCurrentSnapshot,
    };
}
