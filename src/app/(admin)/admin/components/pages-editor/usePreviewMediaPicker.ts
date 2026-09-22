'use client';

import type { Dispatch, SetStateAction } from 'react';
import type { SitePageContent } from '@/lib/data/site-service';
import { setFieldValue } from '@/lib/preview/field-path';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';

export interface UsePreviewMediaPickerArgs {
    editorLocale: EditorLocaleOption;
    /** Cible courante demandée depuis l'aperçu (chemin de champ ou clé média). */
    mediaPickerTarget: string | null;
    setMediaPickerTarget: Dispatch<SetStateAction<string | null>>;
    showToast: (msg: string) => void;
    applyDraftChange: (mutate: (prev: SitePageContent) => SitePageContent) => void;
    /** Écriture dédiée aux visuels d'ateliers (team building). */
    onWorkshopImage: (index: number, url: string) => void;
}

export interface PreviewMediaPicker {
    /** Ouvre la médiathèque pour une cible — refusé en anglais (médias partagés). */
    request: (target: string) => void;
    /** Applique l'URL choisie au bon chemin d'écriture, puis referme la modale. */
    applySelected: (url: string) => void;
}

/**
 * Sélection de médias depuis l'aperçu : la médiathèque est partagée entre les
 * langues, l'écriture se fait donc en FR (le mode EN l'annonce au lieu d'écrire
 * une valeur qui serait ignorée à l'enregistrement).
 */
export function usePreviewMediaPicker({
    editorLocale,
    mediaPickerTarget,
    setMediaPickerTarget,
    showToast,
    applyDraftChange,
    onWorkshopImage,
}: UsePreviewMediaPickerArgs): PreviewMediaPicker {
    const request = (target: string) => {
        if (editorLocale === 'en') {
            showToast('Les images sont partagées entre les langues : modifiez-les en français (FR).');
            return;
        }
        setMediaPickerTarget(target);
    };

    const applySelected = (url: string) => {
        const target = mediaPickerTarget;
        if (target === 'hero_bg') {
            applyDraftChange((prev) => ({ ...prev, hero: { ...prev.hero, bg_image: url } }));
        } else if (target === 'og_image') {
            applyDraftChange((prev) => ({ ...prev, og_image: url }));
        } else if (target && target.startsWith('workshop_img_')) {
            const index = parseInt(target.replace('workshop_img_', ''), 10);
            onWorkshopImage(index, url);
        } else if (target) {
            // Cible générique : chemin complet (`hero.bg_image`,
            // `sections_data.<bloc>.<champ>`, `sections_data.<bloc>.items.<i>.<champ>`),
            // écrit dans la langue active (brouillon FR ou overlay EN).
            applyDraftChange((prev) => setFieldValue(prev, target, url));
        }
        setMediaPickerTarget(null);
    };

    return { request, applySelected };
}
