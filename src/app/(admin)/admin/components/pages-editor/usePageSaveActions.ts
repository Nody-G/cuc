'use client';

import { useState } from 'react';
import { DEFAULT_PAGE_CONTENTS, normalizeSlug, type SitePageContent } from '@/lib/data/site-service';
import {
    resetPageContentToDefault,
    setPagePublishState,
    upsertPageContent,
} from '@/app/(admin)/admin/actions';
import type { UseEntityTranslationResult } from '@/lib/hooks/useEntityTranslation';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';

export interface UsePageSaveActionsArgs {
    formData: SitePageContent;
    /** État enregistré de la page (référence du verrou d'écriture optimiste). */
    savedData: SitePageContent;
    setFormData: React.Dispatch<React.SetStateAction<SitePageContent>>;
    editorLocale: EditorLocaleOption;
    translation: UseEntityTranslationResult<SitePageContent>;
    onPageSaved: (updatedPage: SitePageContent) => void;
    showToast: (msg: string) => void;
    /** Recharge l'aperçu live. */
    bumpPreview: () => void;
    /** Efface le brouillon local après un enregistrement réussi. */
    clearSnapshot: () => void;
}

/**
 * Écritures de l'éditeur de pages : enregistrement français (verrou optimiste
 * `expectedUpdatedAt`), enregistrement de la traduction anglaise (seul le diff
 * est écrit), publication, réinitialisation et suppression de l'overlay EN.
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1) — les Server Actions
 * restent dans `actions/**`.
 */
export function usePageSaveActions({
    formData,
    savedData,
    setFormData,
    editorLocale,
    translation,
    onPageSaved,
    showToast,
    bumpPreview,
    clearSnapshot,
}: UsePageSaveActionsArgs) {
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    /**
     * Enregistrement de la traduction anglaise.
     *
     * N'écrit que le diff avec le français : aucune valeur vide, tableaux complets,
     * structure et médias repris du français. Le contenu source n'est jamais
     * touché, et un overlay devenu identique au français est supprimé plutôt que
     * laissé vide.
     */
    const handleSaveTranslation = async () => {
        const before = translation.coverage;
        const res = await translation.save();

        if (!res.success) {
            showToast(`Erreur : ${res.error || 'Enregistrement de la traduction impossible'}`);
            return;
        }

        bumpPreview();
        showToast(
            before.translated === 0
                ? 'Aucune différence avec le français : la page reste servie en français.'
                : `Traduction anglaise enregistrée — ${before.percent} % de couverture (${before.translated}/${before.total} champs).`
        );
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (editorLocale === 'en') {
            await handleSaveTranslation();
            return;
        }

        setIsSaving(true);

        const clean = normalizeSlug(formData.slug);
        const res = await upsertPageContent(clean, {
            title: formData.title,
            meta_title: formData.meta_title,
            meta_description: formData.meta_description,
            og_image: formData.og_image,
            hero: formData.hero,
            sections: formData.sections || [],
            layout_sections: formData.layout_sections || [],
            sections_data: formData.sections_data || {},
            is_published: formData.is_published,
            // Refus d'écriture si la page a bougé depuis son ouverture (autre onglet,
            // autre administrateur) : on ne réécrit jamais par-dessus sans le dire.
            expectedUpdatedAt: savedData.updated_at ?? null,
        });

        setIsSaving(false);
        if (res.success) {
            clearSnapshot();
            onPageSaved(formData);
            bumpPreview();
            showToast(`Page "${formData.title}" enregistrée avec succès !`);
        } else {
            showToast(`Erreur : ${res.error || 'Sauvegarde impossible'}`);
        }
    };

    const handleTogglePublish = async () => {
        const nextState = !formData.is_published;
        setIsPublishing(true);
        const res = await setPagePublishState(formData.slug, nextState);
        setIsPublishing(false);

        if (res.success) {
            const updated = { ...formData, is_published: nextState };
            setFormData(updated);
            onPageSaved(updated);
            bumpPreview();
            showToast(
                nextState
                    ? `Page "${formData.title}" publiée sur la vitrine.`
                    : `Page "${formData.title}" repassée en brouillon (non visible publiquement).`
            );
        } else {
            showToast(`Erreur : ${res.error || 'Changement de statut impossible'}`);
        }
    };

    const handleResetToDefault = async () => {
        const confirmed = window.confirm(
            `Êtes-vous sûr de vouloir rétablir les textes et la disposition d'origine pour "${formData.title}" ? Vos modifications personnalisées sur cette page seront réinitialisées.`
        );
        if (!confirmed) return;

        setIsResetting(true);
        const res = await resetPageContentToDefault(formData.slug);
        setIsResetting(false);

        if (res.success) {
            const defaultData = DEFAULT_PAGE_CONTENTS[formData.slug];
            if (defaultData) {
                setFormData({ ...defaultData });
                onPageSaved(defaultData);
                bumpPreview();
                showToast(`Page "${formData.title}" rétablie aux réglages d'origine CUC.`);
            }
        } else {
            showToast(`Erreur lors de la réinitialisation : ${res.error}`);
        }
    };

    /**
     * Réinitialisation anglaise : on supprime l'overlay, la page repasse
     * intégralement en français (jamais un contenu vide publié).
     */
    const handleRemoveTranslation = async () => {
        const confirmed = window.confirm(
            `Supprimer la traduction anglaise de « ${formData.title} » ? La page repassera entièrement en français sur la vitrine.`
        );
        if (!confirmed) return;

        const res = await translation.remove();
        if (res.success) {
            bumpPreview();
            showToast('Traduction anglaise supprimée — la page repasse en français.');
        } else {
            showToast(`Erreur : ${res.error || 'Suppression impossible'}`);
        }
    };

    return {
        handleSave,
        handleTogglePublish,
        handleResetToDefault,
        handleRemoveTranslation,
        isSaving,
        isResetting,
        isPublishing,
    };
}
