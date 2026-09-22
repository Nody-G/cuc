'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';
import type { MicrocopyEntry } from '@/lib/i18n/microcopy';
import type { EditorLocale } from './useMicrocopyEditor';

interface MicrocopyEntryRowProps {
    entry: MicrocopyEntry;
    locale: EditorLocale;
    value: string;
    overridden: boolean;
    dirty: boolean;
    onChange: (entry: MicrocopyEntry, target: EditorLocale, value: string) => void;
    onRevert: (entry: MicrocopyEntry) => void;
}

/** Ligne d'une clé : code, badges, champ éditable et valeur miroir de l'autre langue. */
export const MicrocopyEntryRow: React.FC<MicrocopyEntryRowProps> = ({
    entry,
    locale,
    value,
    overridden,
    dirty,
    onChange,
    onRevert,
}) => {
    const long = value.length > 90 || entry.fr.length > 90 || entry.en.length > 90;

    return (
        <div className="p-3">
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
                    onClick={() => onRevert(entry)}
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
                        onChange={(event) => onChange(entry, locale, event.target.value)}
                        rows={3}
                        className="w-full rounded border border-zinc-700 bg-zinc-950/60 px-2 py-1.5 text-xs text-white outline-hidden focus:border-[#FFE500]"
                    />
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(event) => onChange(entry, locale, event.target.value)}
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
};
