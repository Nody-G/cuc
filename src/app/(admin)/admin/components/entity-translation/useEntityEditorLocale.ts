'use client';

/**
 * ==============================================================================
 * CUC — Orchestration bilingue d'un éditeur d'entité (un seul hook)
 * ==============================================================================
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1.2). Il assemble trois
 * briques déjà éprouvées, sans réinventer la fusion :
 *
 *   1. `codec.toRow(draft)`  → la ligne FR (surface traduisible) ;
 *   2. `useEntityTranslation`→ l'overlay EN (chargement paresseux en FR) ;
 *   3. `codec.fromRow(...)`  → le brouillon actif injecté dans les éditeurs.
 *
 * Le français reste la source : en FR, `active === draft` et aucune requête
 * n'est émise. En EN, `active` est le contenu localisé, et toute écriture
 * repasse par le codec (allow-list) — un champ technique ne peut donc pas
 * entrer dans l'overlay.
 */

import { useCallback, useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { isTechnicalKey, PAGE_LOCKED_ROOTS } from '@/lib/i18n/localized-merge';
import { useEntityTranslation } from '@/lib/hooks/useEntityTranslation';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';
import type { EntityEditorLocale, EntityEditorLocaleOptions } from './entity-translation.contract';

export function useEntityEditorLocale<TDraft extends object, TRow extends object>(
    options: EntityEditorLocaleOptions<TDraft, TRow>
): EntityEditorLocale<TDraft> {
    const { codec, entityId, draft, targetLocale, setDraft } = options;

    const [locale, setLocale] = useState<EditorLocaleOption>('fr');
    const isEnglish = locale === 'en';

    /**
     * Ligne FR : recalculée à chaque modification du brouillon via le codec
     * (constante de module), l'effet de réalignement de `useEntityTranslation`
     * reste donc stable.
     */
    const base = useMemo(() => codec.toRow(draft), [draft, codec]);

    const translation = useEntityTranslation<TRow>({
        entity: codec.entity,
        entityId,
        locale,
        base,
        targetLocale,
    });

    /** Brouillon actif : français en FR, contenu localisé en EN. */
    const active = useMemo(
        () => (isEnglish ? codec.fromRow(translation.localized, draft) : draft),
        [isEnglish, codec, translation.localized, draft]
    );

    /**
     * Écriture : en FR on délègue au setter du parent (`setDraft`) ; en EN on
     * convertit le brouillon vers la ligne d'overlay avant `setLocalized`.
     */
    const setActive = useCallback<Dispatch<SetStateAction<TDraft>>>(
        (value) => {
            if (!isEnglish) {
                setDraft?.(value);
                return;
            }
            translation.setLocalized((previousRow) => {
                const previousDraft = codec.fromRow(previousRow, draft);
                const nextDraft =
                    typeof value === 'function'
                        ? (value as (prev: TDraft) => TDraft)(previousDraft)
                        : value;
                return codec.toRow(nextDraft);
            });
        },
        [isEnglish, setDraft, translation, codec, draft]
    );

    /** Garde unique médias/technique : un champ verrouillé n'est pas éditable en EN. */
    const isReadOnlyField = useCallback(
        (field: string) => isEnglish && (isTechnicalKey(field) || PAGE_LOCKED_ROOTS.includes(field)),
        [isEnglish]
    );

    const saveTranslation = useCallback(() => translation.save(), [translation]);
    const revertTranslation = useCallback(() => translation.revert(), [translation]);
    const removeTranslation = useCallback(() => translation.remove(), [translation]);
    const reloadTranslation = useCallback(() => translation.reload(), [translation]);

    return {
        locale,
        setLocale,
        isEnglish,
        active,
        setActive,
        // En FR, le brouillon affiché correspond toujours à l'entité : prêt.
        ready: isEnglish ? translation.ready : true,
        loading: translation.loading,
        dirty: translation.dirty,
        saving: translation.saving,
        coverage: isEnglish && translation.ready ? translation.coverage : null,
        updatedAt: translation.updatedAt,
        error: translation.error,
        saveTranslation,
        revertTranslation,
        removeTranslation,
        reloadTranslation,
        isReadOnlyField,
    };
}
