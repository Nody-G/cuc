'use client';

import React from 'react';
import { StickySaveBar } from '../ui/StickySaveBar';

export interface PageEditorSaveBarProps {
    /** Un brouillon (page, chrome ou traduction) attend un enregistrement. */
    isDirty: boolean;
    /** Enregistrement en cours — neutralise les boutons. */
    isSaving: boolean;
    /** Enregistre le brouillon courant (FR ou EN selon la langue éditée). */
    onSave: () => void | Promise<void>;
    /** Abandonne les modifications non enregistrées. */
    onDiscard: () => void | Promise<void>;
}

/**
 * Barre d'enregistrement flottante de l'éditeur de pages : simple adaptateur
 * déclaratif de `StickySaveBar` (aucune logique métier).
 *
 * Isolée de la façade `PagesEditorView` pour respecter le plafond de 300 lignes
 * (`AGENTS.md` § 2) : la façade ne fait que lui passer l'état de brouillon.
 */
export const PageEditorSaveBar: React.FC<PageEditorSaveBarProps> = ({
    isDirty,
    isSaving,
    onSave,
    onDiscard,
}) => (
    <StickySaveBar
        isDirty={isDirty}
        isPending={isSaving}
        onSave={onSave}
        onReset={onDiscard}
        label="Modifications de la page en attente d’enregistrement"
        saveLabel="Enregistrer la page"
    />
);
