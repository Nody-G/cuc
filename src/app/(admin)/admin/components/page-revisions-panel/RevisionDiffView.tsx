'use client';

import React from 'react';
import { FileText, X, RotateCcw } from 'lucide-react';
import type { PageRevisionDiffEntry, SitePageRevision } from '@/lib/data/site-service';
import { CockpitButton } from '../ui';
import { FIELD_LABELS, summarizeValue } from './revision-format';

interface RevisionDiffViewProps {
    selected: SitePageRevision | null;
    compared: SitePageRevision | null;
    diff: PageRevisionDiffEntry[];
    onClearCompare: () => void;
    onRestore: () => void;
}

/** Volet droit : détail d'une version et différences avec la référence. */
export const RevisionDiffView: React.FC<RevisionDiffViewProps> = ({
    selected,
    compared,
    diff,
    onClearCompare,
    onRestore,
}) => (
    <div className="p-4 max-h-[26rem] overflow-y-auto">
        {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <FileText className="w-8 h-8 text-gray-600 mb-3" />
                <p className="text-xs text-gray-400">
                    Sélectionnez une version pour afficher son contenu et les différences.
                </p>
            </div>
        ) : (
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-gray-300">
                        Version n°{selected.revision_number}
                    </h4>
                    {compared && (
                        <button
                            type="button"
                            onClick={onClearCompare}
                            className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-gray-500 hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="w-3 h-3" />
                            Comparaison active
                        </button>
                    )}
                </div>

                {diff.length === 0 ? (
                    <p className="text-xs text-gray-500">
                        Aucune différence détectée avec la version de référence.
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {diff.map((entry) => (
                            <li
                                key={entry.field}
                                className="rounded-lg border border-white/10 bg-black/40 p-3"
                            >
                                <p className="text-[10px] font-mono uppercase tracking-wider text-[#FFE500] mb-2">
                                    {FIELD_LABELS[entry.field] ?? entry.field}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="rounded border border-red-500/20 bg-red-500/5 p-2">
                                        <p className="text-[9px] font-mono uppercase tracking-wider text-red-400/80 mb-1">
                                            Avant
                                        </p>
                                        <p className="text-[11px] text-gray-300 break-words">
                                            {summarizeValue(entry.before)}
                                        </p>
                                    </div>
                                    <div className="rounded border border-emerald-500/20 bg-emerald-500/5 p-2">
                                        <p className="text-[9px] font-mono uppercase tracking-wider text-emerald-400/80 mb-1">
                                            Après
                                        </p>
                                        <p className="text-[11px] text-gray-300 break-words">
                                            {summarizeValue(entry.after)}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <CockpitButton
                    variant="secondary"
                    size="sm"
                    onClick={onRestore}
                    className="w-full"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restaurer cette version
                </CockpitButton>
            </div>
        )}
    </div>
);
