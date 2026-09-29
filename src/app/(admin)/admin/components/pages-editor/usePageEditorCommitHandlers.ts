'use client';

/**
 * Gestes de validation de l'éditeur de pages — hook d'orchestration.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1). Extrait de
 * `PagesEditorView.tsx`, qui dépassait le plafond dur de 300 lignes
 * (`AGENTS.md` § 2) — et l'extraction répond à un besoin réel : ces trois gestes
 * partagent une même nature (une **écriture décidée par l'auteur**), là où le
 * reste de la vue ne fait qu'assembler des brouillons.
 *
 * La règle éditoriale est ici, et nulle part ailleurs : en anglais, on n'écrit pas
 * une valeur française dans une fiche d'entité, car elle resterait invisible sous
 * la surcouche EN — on l'annonce et on renvoie l'auteur vers l'écran dédié.
 */

import type React from 'react';
import { DEFAULT_PAGE_CONTENTS, type SitePageContent } from '@/lib/data/site-service';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';

export interface UsePageEditorCommitHandlersArgs {
    /** Langue d'édition courante : l'anglais n'écrit jamais dans les entités. */
    editorLocale: EditorLocaleOption;
    showToast: (msg: string) => void;
    /** Slug de la page éditée — sert à retrouver sa disposition d'origine. */
    slug: string;
    setFormData: React.Dispatch<React.SetStateAction<SitePageContent>>;
    /** Écrit une entité (coach, film, annonce) dans le brouillon « chrome ». */
    commitEntity: (ref: string, value: string) => void;
    /** Signale au parent qu'une page a changé, pour rafraîchir sa liste. */
    onPageSaved: (updated: SitePageContent) => void;
    /** Force le rechargement de l'aperçu après une modification structurelle. */
    bumpPreview: () => void;
}

export interface PageEditorCommitHandlers {
    handleEntityCommit: (ref: string, value: string) => void;
    handleResetLayout: () => void;
    handleRestored: (restored: SitePageContent) => void;
}

export function usePageEditorCommitHandlers({
    editorLocale,
    showToast,
    slug,
    setFormData,
    commitEntity,
    onPageSaved,
    bumpPreview,
}: UsePageEditorCommitHandlersArgs): PageEditorCommitHandlers {
    /**
     * Entités (coachs, films, annonces) : elles se traduisent depuis leurs écrans
     * dédiés — en anglais, on l'annonce au lieu d'écrire une valeur française qui
     * resterait invisible sous la surcouche EN.
     */
    const handleEntityCommit = (ref: string, value: string) => {
        if (editorLocale === 'en') {
            showToast(
                'Les fiches (coachs, films, annonces) se traduisent depuis leurs écrans : modifiez-les en français (FR).',
            );
            return;
        }
        commitEntity(ref, value);
    };

    const handleResetLayout = () => {
        const defaultData = DEFAULT_PAGE_CONTENTS[slug];
        if (defaultData?.layout_sections) {
            setFormData((prev) => ({ ...prev, layout_sections: defaultData.layout_sections }));
            showToast('Disposition des blocs réinitialisée à sa configuration d’origine.');
        }
    };

    const handleRestored = (restored: SitePageContent) => {
        setFormData(restored);
        onPageSaved(restored);
        bumpPreview();
    };

    return { handleEntityCommit, handleResetLayout, handleRestored };
}
