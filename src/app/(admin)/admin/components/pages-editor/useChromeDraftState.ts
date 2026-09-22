'use client';

import { useCallback, useState } from 'react';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';
import { useChromeDraftPersistence } from './useChromeDraftPersistence';

export interface ChromeDraftState {
    /** Réglages du site modifiés dans l'aperçu (clé → valeur). */
    settings: Record<string, string>;
    /** Micro-textes de la locale active (clé de catalogue → valeur). */
    microcopy: Record<string, string>;
    /** Valeur validée pour un réglage : vide = retrait de la surcharge. */
    commitSetting: (key: string, value: string) => void;
    /** Valeur validée pour un micro-texte : vide = retour au catalogue. */
    commitMicrocopy: (key: string, value: string) => void;
    clearSettings: () => void;
    clearMicrocopy: () => void;
}

/**
 * Brouillon « chrome » de l'aperçu (réglages du site + micro-textes), adossé au
 * filet local (`useChromeDraftPersistence`) et **segmenté par locale d'édition** :
 * un libellé appartient à une langue. Sans cette séparation, un texte français
 * saisi dans l'aperçu puis publié après bascule en anglais serait écrit dans la
 * surcharge EN.
 *
 * Invariant : une valeur vidée **retire** la surcharge — jamais un texte blanc.
 */
export function useChromeDraftState(locale: EditorLocaleOption): ChromeDraftState {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [microcopyDrafts, setMicrocopyDrafts] = useState<
        Record<EditorLocaleOption, Record<string, string>>
    >({ fr: {}, en: {} });
    const microcopy = microcopyDrafts[locale];

    const commitSetting = useCallback((key: string, value: string) => {
        setSettings((prev) => {
            const next = { ...prev };
            if (value.trim().length === 0) delete next[key];
            else next[key] = value;
            return next;
        });
    }, []);

    const commitMicrocopy = useCallback(
        (key: string, value: string) => {
            setMicrocopyDrafts((prev) => {
                const next = { ...prev[locale] };
                if (value.trim().length === 0) delete next[key];
                else next[key] = value;
                return { ...prev, [locale]: next };
            });
        },
        [locale]
    );

    const setMicrocopy = useCallback(
        (values: Record<string, string>) => {
            setMicrocopyDrafts((prev) => ({ ...prev, [locale]: values }));
        },
        [locale]
    );

    useChromeDraftPersistence({
        locale,
        settings,
        microcopy,
        setSettings,
        setMicrocopy,
    });

    const clearSettings = useCallback(() => setSettings({}), []);
    const clearMicrocopy = useCallback(() => setMicrocopy({}), [setMicrocopy]);

    return {
        settings,
        microcopy,
        commitSetting,
        commitMicrocopy,
        clearSettings,
        clearMicrocopy,
    };
}
