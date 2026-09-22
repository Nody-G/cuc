'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadMicrocopyCatalog, saveMicrocopyOverrides } from '../../actions';
import type { MicrocopyEntry, MicrocopyOverlay } from '@/lib/i18n/microcopy';

export type EditorLocale = 'fr' | 'en';

export interface MicrocopyEditorController {
    entries: MicrocopyEntry[];
    groups: string[];
    group: string;
    setGroup: React.Dispatch<React.SetStateAction<string>>;
    locale: EditorLocale;
    setLocale: React.Dispatch<React.SetStateAction<EditorLocale>>;
    query: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    isSaving: boolean;
    dirtyCount: number;
    overrideCount: { fr: number; en: number };
    filtered: MicrocopyEntry[];
    currentValue: (entry: MicrocopyEntry, target: EditorLocale) => string;
    isDirty: (entry: MicrocopyEntry) => boolean;
    isOverridden: (entry: MicrocopyEntry, target: EditorLocale) => boolean;
    handleChange: (entry: MicrocopyEntry, target: EditorLocale, value: string) => void;
    handleRevert: (entry: MicrocopyEntry) => void;
    handleSave: () => Promise<void>;
}

/**
 * Édition des micro-textes d'interface (FR → EN).
 *
 * Les libellés vivent dans `messages/<locale>.json` : ce hook les expose tous
 * (1 000+ clés) et écrit une **surcharge** dans `site_settings`, appliquée au
 * catalogue au moment de la résolution i18n. Aucun site d'appel n'est modifié,
 * aucune valeur vide n'est publiée, et vider un champ ramène au catalogue.
 */
export function useMicrocopyEditor(
    showToast?: (message: string) => void
): MicrocopyEditorController {
    const [entries, setEntries] = useState<MicrocopyEntry[]>([]);
    const [groups, setGroups] = useState<string[]>([]);
    const [overrides, setOverrides] = useState<MicrocopyOverlay>({});
    const [values, setValues] = useState<Record<string, string>>({});
    const [group, setGroup] = useState<string>('all');
    const [locale, setLocale] = useState<EditorLocale>('fr');
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;

        loadMicrocopyCatalog().then((result) => {
            if (cancelled) return;
            if (!result.success) {
                showToast?.(result.error);
                setIsLoading(false);
                return;
            }

            setEntries(result.entries);
            setGroups(result.groups);
            setOverrides(result.overrides);

            const next: Record<string, string> = {};
            for (const entry of result.entries) {
                next[`fr:${entry.key}`] = result.overrides.fr?.[entry.key] ?? entry.fr;
                next[`en:${entry.key}`] = result.overrides.en?.[entry.key] ?? entry.en;
            }
            setValues(next);
            setIsLoading(false);
        });

        return () => {
            cancelled = true;
        };
    }, [showToast]);

    const catalogValue = useCallback(
        (entry: MicrocopyEntry, target: EditorLocale): string =>
            target === 'fr' ? entry.fr : entry.en,
        []
    );

    const currentValue = useCallback(
        (entry: MicrocopyEntry, target: EditorLocale): string =>
            values[`${target}:${entry.key}`] ?? catalogValue(entry, target),
        [values, catalogValue]
    );

    const isDirty = useCallback(
        (entry: MicrocopyEntry): boolean =>
            (currentValue(entry, 'fr') ?? '').trim() !== entry.fr.trim() ||
            (currentValue(entry, 'en') ?? '').trim() !== entry.en.trim(),
        [currentValue]
    );

    const isOverridden = useCallback(
        (entry: MicrocopyEntry, target: EditorLocale): boolean =>
            Boolean(overrides[target]?.[entry.key]),
        [overrides]
    );

    const dirtyCount = useMemo(() => entries.filter(isDirty).length, [entries, isDirty]);
    const overrideCount = useMemo(
        () => ({
            fr: Object.keys(overrides.fr ?? {}).length,
            en: Object.keys(overrides.en ?? {}).length,
        }),
        [overrides]
    );

    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        return entries.filter((entry) => {
            if (group !== 'all' && entry.group !== group) return false;
            if (!needle) return true;
            return (
                entry.key.toLowerCase().includes(needle) ||
                entry.fr.toLowerCase().includes(needle) ||
                entry.en.toLowerCase().includes(needle)
            );
        });
    }, [entries, group, query]);

    const handleChange = (entry: MicrocopyEntry, target: EditorLocale, value: string) => {
        setValues((prev) => ({ ...prev, [`${target}:${entry.key}`]: value }));
    };

    const handleRevert = (entry: MicrocopyEntry) => {
        setValues((prev) => ({
            ...prev,
            [`fr:${entry.key}`]: entry.fr,
            [`en:${entry.key}`]: entry.en,
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);

        const next: MicrocopyOverlay = {};
        const frValues: Record<string, string> = {};
        const enValues: Record<string, string> = {};

        for (const entry of entries) {
            const frValue = (currentValue(entry, 'fr') ?? '').trim();
            if (frValue.length > 0 && frValue !== entry.fr.trim()) frValues[entry.key] = frValue;

            const enValue = (currentValue(entry, 'en') ?? '').trim();
            if (enValue.length > 0 && enValue !== entry.en.trim()) enValues[entry.key] = enValue;
        }

        if (Object.keys(frValues).length > 0) next.fr = frValues;
        if (Object.keys(enValues).length > 0) next.en = enValues;

        const result = await saveMicrocopyOverrides(next);
        setIsSaving(false);

        if (!result.success) {
            showToast?.(result.error);
            return;
        }

        setOverrides(result.overrides);
        setValues((prev) => {
            const synced: Record<string, string> = {};
            for (const entry of entries) {
                const frValue = (prev[`fr:${entry.key}`] ?? '').trim();
                const enValue = (prev[`en:${entry.key}`] ?? '').trim();
                synced[`fr:${entry.key}`] = frValue.length > 0 ? frValue : entry.fr;
                synced[`en:${entry.key}`] = enValue.length > 0 ? enValue : entry.en;
            }
            return synced;
        });

        showToast?.(
            `Micro-textes publiés : ${Object.keys(result.overrides.fr ?? {}).length} FR / ${Object.keys(result.overrides.en ?? {}).length
            } EN — 15 pages revalidées (FR + EN).`
        );
    };

    return {
        entries,
        groups,
        group,
        setGroup,
        locale,
        setLocale,
        query,
        setQuery,
        isLoading,
        isSaving,
        dirtyCount,
        overrideCount,
        filtered,
        currentValue,
        isDirty,
        isOverridden,
        handleChange,
        handleRevert,
        handleSave,
    };
}
