'use client';

import { normalizeSlug, type SitePageContent } from '@/lib/data/site-service';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';
import { composePageDraft } from './page-draft';

export interface UseEditorNavigationArgs {
    editorLocale: EditorLocaleOption;
    /** Une traduction EN non enregistrée est en cours. */
    translationDirty: boolean;
    pages: SitePageContent[];
    showToast: (msg: string) => void;
    setEditorLocale: (locale: EditorLocaleOption) => void;
    setSelectedSlug: (slug: string) => void;
    setFormData: React.Dispatch<React.SetStateAction<SitePageContent>>;
    resetDraftHistory: () => void;
    bumpPreview: () => void;
}

export interface EditorNavigation {
    /** Confirme l'abandon d'une saisie anglaise non enregistrée. */
    confirmLeaveEnglishDraft: (action: string) => boolean;
    /** Bascule de langue, avec garde-fou si l'anglais n'est pas enregistré. */
    handleLocaleChange: (next: EditorLocaleOption) => void;
    /** Changement de page : compose le brouillon cible et repart de zéro. */
    handleSelectPage: (slug: string) => void;
    /** La structure (ajouter ou retirer un bloc) appartient à la source française. */
    blockStructureChangeInEnglish: (what: string) => boolean;
}

/**
 * Garde-fous de navigation de l'éditeur de pages : changer de page ou de langue
 * ne doit jamais perdre un travail anglais non enregistré, et la **structure**
 * (ajouter / retirer un bloc) se modifie en français — la traduction la suit.
 */
export function useEditorNavigation({
    editorLocale,
    translationDirty,
    pages,
    showToast,
    setEditorLocale,
    setSelectedSlug,
    setFormData,
    resetDraftHistory,
    bumpPreview,
}: UseEditorNavigationArgs): EditorNavigation {
    /**
     * Le brouillon est conservé tant qu'on reste sur la page, mais changer de
     * page le remplace : mieux vaut prévenir que perdre un travail de traduction.
     */
    const confirmLeaveEnglishDraft = (action: string): boolean => {
        if (editorLocale !== 'en' || !translationDirty) return true;
        return window.confirm(
            `Des modifications anglaises ne sont pas enregistrées. ${action} les abandonnera.\n\nContinuer sans enregistrer ?`
        );
    };

    const handleLocaleChange = (next: EditorLocaleOption) => {
        if (next === editorLocale) return;
        if (!confirmLeaveEnglishDraft('Changer de langue')) return;
        setEditorLocale(next);
        // FR et EN sont deux brouillons distincts : l'historique ne les mélange pas.
        resetDraftHistory();
    };

    // Synchronisation lors du changement de page.
    const handleSelectPage = (slug: string) => {
        if (!confirmLeaveEnglishDraft('Changer de page')) return;
        const clean = normalizeSlug(slug);
        setSelectedSlug(clean);
        const target = pages.find((page) => normalizeSlug(page.slug) === clean);
        setFormData(composePageDraft(clean, target));
        bumpPreview();
        // Nouvelle page = nouveau brouillon : l'historique repart de zéro.
        resetDraftHistory();
    };

    const blockStructureChangeInEnglish = (what: string): boolean => {
        if (editorLocale !== 'en') return false;
        showToast(`${what} se structure en français : modifiez la liste en FR, puis traduisez-la ici.`);
        return true;
    };

    return {
        confirmLeaveEnglishDraft,
        handleLocaleChange,
        handleSelectPage,
        blockStructureChangeInEnglish,
    };
}
