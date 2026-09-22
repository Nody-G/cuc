'use client';

import { useState } from 'react';
import { DEFAULT_PAGE_CONTENTS, normalizeSlug, type SitePageContent } from '@/lib/data/site-service';
import {
    resetPageContentToDefault,
    setPagePublishState,
    updateMicrocopyOverrideField,
    updateSiteSettingField,
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
    /** Réglages modifiés dans l'aperçu (brouillon chrome), clé → valeur. */
    settingDraft: Record<string, string>;
    /** Efface le brouillon chrome après publication réussie. */
    clearSettingDraft: () => void;
    /** Micro-textes modifiés dans l'aperçu (locale active), clé → valeur. */
    microcopyDraft: Record<string, string>;
    /** Efface le brouillon de micro-textes après publication réussie. */
    clearMicrocopyDraft: () => void;
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
    settingDraft,
    clearSettingDraft,
    microcopyDraft,
    clearMicrocopyDraft,
}: UsePageSaveActionsArgs) {
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    /**
     * Écrit le brouillon « chrome » : réglages du site puis micro-textes de la
     * locale active, une clé à la fois. Le brouillon n'est effacé **que** si
     * tout est passé : une valeur refusée reste visible, jamais perdue en
     * silence.
     */
    const flushChromeDraft = async (): Promise<{
        ok: boolean;
        failed: string[];
        count: number;
    }> => {
        const settingKeys = Object.keys(settingDraft);
        const microKeys = Object.keys(microcopyDraft);
        const failed: string[] = [];

        for (const key of settingKeys) {
            const res = await updateSiteSettingField(key, settingDraft[key]);
            if (!res.success) failed.push(`réglage « ${key} »`);
        }
        for (const key of microKeys) {
            const res = await updateMicrocopyOverrideField(editorLocale, key, microcopyDraft[key]);
            if (!res.success) failed.push(`micro-texte « ${key} »`);
        }

        if (failed.length === 0) {
            if (settingKeys.length > 0) clearSettingDraft();
            if (microKeys.length > 0) clearMicrocopyDraft();
        }
        return {
            ok: failed.length === 0,
            failed,
            count: settingKeys.length + microKeys.length,
        };
    };

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

        // Le chrome (réglages + micro-textes) est partagé entre les langues : il
        // suit la même sauvegarde, quel que soit l'onglet d'édition actif.
        const chrome = await flushChromeDraft();
        if (chrome.count > 0) {
            showToast(
                chrome.ok
                    ? `${chrome.count} texte(s) du site publié(s).`
                    : `Non enregistré : ${chrome.failed.join(', ')} — brouillon conservé.`
            );
        }
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

        if (res.success) {
            clearSnapshot();
            onPageSaved(formData);
            bumpPreview();

            const chrome = await flushChromeDraft();
            if (chrome.count === 0) {
                showToast(`Page "${formData.title}" enregistrée avec succès !`);
            } else {
                showToast(
                    chrome.ok
                        ? `Page "${formData.title}" enregistrée · ${chrome.count} texte(s) du site publié(s).`
                        : `Page enregistrée, mais non publié : ${chrome.failed.join(', ')} — brouillon conservé.`
                );
            }
        } else {
            showToast(`Erreur : ${res.error || 'Sauvegarde impossible'}`);
        }
        setIsSaving(false);
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
