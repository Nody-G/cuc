'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Loader2, RotateCcw, Save, Search } from 'lucide-react';
import { loadMicrocopyCatalog, saveMicrocopyOverrides } from '../actions';
import type { MicrocopyEntry, MicrocopyOverlay } from '@/lib/i18n/microcopy';
import { cx } from './ui';

interface MicrocopyViewProps {
    showToast?: (message: string) => void;
}

type EditorLocale = 'fr' | 'en';

/**
 * Édition des micro-textes d'interface (FR → EN).
 *
 * Les libellés vivent dans `messages/<locale>.json` : cette vue les expose tous
 * (1 000+ clés) et écrit une **surcharge** dans `site_settings`, appliquée au
 * catalogue au moment de la résolution i18n. Aucun site d'appel n'est modifié,
 * aucune valeur vide n'est publiée, et vider un champ ramène au catalogue.
 */
export const MicrocopyView: React.FC<MicrocopyViewProps> = ({ showToast }) => {
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-3 py-16 text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                Chargement des micro-textes…
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-in fade-in duration-200">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-white">Micro-textes du site</h2>
                        <p className="mt-1 max-w-3xl text-xs text-zinc-400">
                            Tous les libellés d'interface (boutons, badges, intitulés, mentions) réunis
                            ici. Une valeur vide n'est jamais publiée : effacer un champ le ramène au
                            catalogue. La publication revalide les 15 pages, en français et en anglais.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="rounded border border-zinc-700 bg-zinc-950/60 px-2 py-1 font-mono text-zinc-300">
                            {entries.length} clés
                        </span>
                        <span className="rounded border border-[#FFE500]/40 bg-[#FFE500]/10 px-2 py-1 font-mono text-[#FFE500]">
                            {overrideCount.fr} FR · {overrideCount.en} EN surchargés
                        </span>
                        {dirtyCount > 0 && (
                            <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1 font-mono text-amber-300">
                                {dirtyCount} modification(s)
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Rechercher une clé ou un texte…"
                            className="w-64 rounded border border-zinc-700 bg-zinc-950/60 py-1.5 pl-8 pr-3 text-xs text-white outline-hidden focus:border-[#FFE500]"
                        />
                    </div>

                    <select
                        value={group}
                        onChange={(event) => setGroup(event.target.value)}
                        className="rounded border border-zinc-700 bg-zinc-950/60 px-2 py-1.5 text-xs text-white outline-hidden focus:border-[#FFE500]"
                    >
                        <option value="all">Tous les groupes ({groups.length})</option>
                        {groups.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>

                    <div className="ml-auto flex items-center gap-1 rounded border border-zinc-700 bg-zinc-950/60 p-0.5">
                        {(['fr', 'en'] as EditorLocale[]).map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setLocale(item)}
                                className={cx(
                                    'rounded px-2.5 py-1 text-xs font-semibold uppercase transition-colors',
                                    locale === item
                                        ? 'bg-[#FFE500] text-black'
                                        : 'text-zinc-400 hover:text-white'
                                )}
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || dirtyCount === 0}
                        className={cx(
                            'inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-semibold transition-colors',
                            dirtyCount === 0 || isSaving
                                ? 'cursor-not-allowed bg-zinc-800 text-zinc-500'
                                : 'bg-[#FFE500] text-black hover:bg-[#FFF04D]'
                        )}
                    >
                        {isSaving ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Save className="h-3.5 w-3.5" />
                        )}
                        Publier
                    </button>
                </div>
            </div>

            <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900/20">
                {filtered.map((entry) => {
                    const value = currentValue(entry, locale);
                    const overridden = isOverridden(entry, locale);
                    const dirty = isDirty(entry);
                    const long = value.length > 90 || entry.fr.length > 90 || entry.en.length > 90;

                    return (
                        <div key={entry.key} className="p-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <code className="font-mono text-[11px] text-zinc-500">{entry.key}</code>
                                {overridden && (
                                    <span className="rounded border border-[#FFE500]/40 bg-[#FFE500]/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-[#FFE500]">
                                        surchargé
                                    </span>
                                )}
                                {dirty && (
                                    <span className="rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-amber-300">
                                        modifié
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleRevert(entry)}
                                    title="Revenir au catalogue pour cette clé"
                                    className="ml-auto inline-flex items-center gap-1 text-[11px] text-zinc-500 transition-colors hover:text-white"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                    Catalogue
                                </button>
                            </div>

                            <div className="mt-1.5 grid grid-cols-1 gap-2 lg:grid-cols-2">
                                {long ? (
                                    <textarea
                                        value={value}
                                        onChange={(event) => handleChange(entry, locale, event.target.value)}
                                        rows={3}
                                        className="w-full rounded border border-zinc-700 bg-zinc-950/60 px-2 py-1.5 text-xs text-white outline-hidden focus:border-[#FFE500]"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(event) => handleChange(entry, locale, event.target.value)}
                                        className="w-full rounded border border-zinc-700 bg-zinc-950/60 px-2 py-1.5 text-xs text-white outline-hidden focus:border-[#FFE500]"
                                    />
                                )}

                                <div className="rounded border border-zinc-800 bg-zinc-950/40 px-2 py-1.5 text-xs text-zinc-500">
                                    <span className="mr-2 font-mono text-[10px] uppercase text-zinc-600">
                                        {locale === 'fr' ? 'EN' : 'FR'}
                                    </span>
                                    {locale === 'fr' ? entry.en : entry.fr}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="flex items-center gap-2 p-6 text-xs text-zinc-500">
                        <Check className="h-4 w-4" />
                        Aucune clé ne correspond à ce filtre.
                    </div>
                )}
            </div>
        </div>
    );
};
