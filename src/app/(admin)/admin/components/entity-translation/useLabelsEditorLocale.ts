'use client';

/**
 * ==============================================================================
 * CUC — Orchestration bilingue d'un contenu à overlay `labels` (composite)
 * ==============================================================================
 * Navigation et pied de page partagent EXACTEMENT la même mécanique : un codec
 * dont les clés dérivent d'ancres (`item.id`, `col.id`, `brand.tagline`…), un
 * réalignement anti-clés-orphelines et les trois gestes anglais. Ce hook évite
 * de recopier cette mécanique dans chaque éditeur (SRP + DRY).
 *
 * Il n'écrit jamais la source française lui-même : l'écran fournit `setDraft`
 * (branche FR de `setActive`) et décide, via `setActive`/`locale`, quelle
 * sémantique appliquer côté français.
 */

import { useCallback, useMemo } from 'react';
import type React from 'react';
import type { EditorLocaleOption } from '../ui/LocaleToggle';
import { useEntityEditorLocale } from './useEntityEditorLocale';
import { useAnchoredOverlayResync } from './useAnchoredOverlayResync';
import type { EntityCodec, EntityEditorLocale } from './entity-translation.contract';

export interface LabelsEditorLocale<TDraft extends object> {
    /** État bilingue complet (barre, couverture, verrous, sauvegarde). */
    locale: EntityEditorLocale<TDraft>;
    isEnglish: boolean;
    /** Brouillon actif : français en FR, contenu localisé en EN. */
    active: TDraft;
    /** Overlay chargé : les champs traduisibles redeviennent éditables. */
    ready: boolean;
    /** Écriture de l'overlay (EN) — le français passe par l'écran. */
    setActive: React.Dispatch<React.SetStateAction<TDraft>>;
    /** Bascule de langue, avec garde-fou sur un brouillon anglais non enregistré. */
    changeLocale: (next: EditorLocaleOption) => void;
    /** Verrou générique d'un champ en anglais (médias / technique). */
    isFieldReadOnly: (field: string) => boolean;
}

export interface UseLabelsEditorLocaleOptions<
    TDraft extends object,
    TRow extends { labels: Record<string, string> },
> {
    codec: EntityCodec<TDraft, TRow>;
    entityId: string;
    /** Brouillon source français. */
    draft: TDraft;
    /** Écriture de la source française (branche FR de `setActive`). */
    setDraft?: React.Dispatch<React.SetStateAction<TDraft>>;
}

export function useLabelsEditorLocale<
    TDraft extends object,
    TRow extends { labels: Record<string, string> },
>({ codec, entityId, draft, setDraft }: UseLabelsEditorLocaleOptions<TDraft, TRow>): LabelsEditorLocale<TDraft> {
    const locale = useEntityEditorLocale<TDraft, TRow>({ codec, entityId, draft, setDraft });
    const isEnglish = locale.isEnglish;
    const active = locale.active;

    /**
     * Signature des ancres courantes : un ajout / retrait la fait changer et
     * déclenche le réalignement de l'overlay, qui écarte les clés orphelines.
     */
    const anchorSignature = useMemo(
        () => Object.keys(codec.toRow(active).labels).sort().join('|'),
        [codec, active]
    );

    useAnchoredOverlayResync<TDraft>({
        isEnglish,
        ready: locale.ready,
        anchorSignature,
        active,
        setActive: locale.setActive,
    });

    const changeLocale = useCallback(
        (next: EditorLocaleOption) => {
            if (next === locale.locale) return;
            if (
                locale.isEnglish &&
                locale.dirty &&
                !window.confirm(
                    'Des modifications anglaises ne sont pas enregistrées. Changer de langue les abandonnera.\n\nContinuer sans enregistrer ?'
                )
            ) {
                return;
            }
            if (next === 'en') locale.revertTranslation();
            locale.setLocale(next);
        },
        [locale]
    );

    const isFieldReadOnly = useCallback(
        (field: string) => locale.isReadOnlyField(field),
        [locale]
    );

    return {
        locale,
        isEnglish,
        active,
        ready: locale.ready,
        setActive: locale.setActive,
        changeLocale,
        isFieldReadOnly,
    };
}
