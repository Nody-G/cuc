'use client';

import React from 'react';
import { CornerUpLeft, FileText, Languages, ListChecks, RotateCcw } from 'lucide-react';
import type { DraftFieldChange } from '@/lib/preview/draft-diff';

interface StudioInspectorProps {
    /** Champs qui diffèrent de la version enregistrée (brouillon en cours). */
    changes: readonly DraftFieldChange[];
    /** Faux en édition anglaise : le brouillon FR n'y décrit pas la traduction. */
    isEnabled: boolean;
    /** Vrai si le brouillon courant est une traduction (l'inspecteur est alors inactif). */
    isTranslation?: boolean;
    /** Recentrage du formulaire sur un champ (clic sur la ligne). */
    onFocusField?: (path: string) => void;
    /** Annule un champ : la valeur enregistrée revient. */
    onRevert: (path: string) => void;
    /** Annule tout le brouillon (retour à la version enregistrée). */
    onRevertAll: () => void;
}

function shortLabel(path: string): string {
    const segments = path.split('.');
    if (segments.length <= 3) return path;
    return `${segments.slice(0, 2).join('.')}…${segments.slice(-1)}`;
}

function renderValue(value: unknown): string {
    if (value === undefined) return '∅';
    if (value === null) return 'null';
    if (typeof value === 'string') {
        return value.length > 90 ? `${value.slice(0, 90)}…` : value || '∅';
    }
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return Array.isArray(value) ? `[${value.length} éléments]` : '{…}';
}

/**
 * Inspecteur de la Vue Studio.
 *
 * Le Mode Studio travaille en mémoire : cet encart rend le brouillon **visible et
 * réversible** — liste des champs touchés (avec avant → après), retour champ par
 * champ ou annulation totale. Aucune écriture en base n'est déclenchée ici : seul
 * « Enregistrer » persiste.
 */
export const StudioInspector: React.FC<StudioInspectorProps> = ({
    changes,
    isEnabled,
    isTranslation = false,
    onFocusField,
    onRevert,
    onRevertAll,
}) => {
    if (!isEnabled) {
        return (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-gray-400 flex items-start gap-2">
                <Languages className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-300" />
                <span>
                    {isTranslation
                        ? 'Édition anglaise : l’inspecteur suit le brouillon français. Les surcharges de traduction se contrôlent dans « Traductions EN ».'
                        : 'Inspecteur indisponible pour cette vue.'}
                </span>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-white/10">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-gray-300">
                    <ListChecks className="w-3.5 h-3.5 text-[#FFE500]" />
                    <span>Modifications du brouillon</span>
                    <span className="rounded border border-white/15 bg-black/40 px-1.5 py-0.5 text-[10px] text-gray-300">
                        {changes.length}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={onRevertAll}
                    disabled={changes.length === 0}
                    className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-semibold border transition-colors ${changes.length === 0
                        ? 'border-white/10 text-gray-500 cursor-not-allowed'
                        : 'border-[#FFE500]/50 text-[#FFE500] hover:bg-[#FFE500]/10'
                        }`}
                    title="Revenir à la version enregistrée (brouillon complet)"
                >
                    <RotateCcw className="w-3 h-3" />
                    <span>Tout annuler</span>
                </button>
            </div>

            {changes.length === 0 ? (
                <div className="flex items-start gap-2 px-3.5 py-3 text-xs text-gray-400">
                    <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                        Aucune modification : le brouillon est identique à la version enregistrée. Les
                        changements apparaissent ici au fur et à mesure de l’édition dans l’aperçu.
                    </span>
                </div>
            ) : (
                <ul className="max-h-[22rem] overflow-y-auto divide-y divide-white/5">
                    {changes.map((change) => (
                        <li key={change.path} className="px-3.5 py-2.5 text-xs">
                            <div className="flex items-start justify-between gap-2">
                                <button
                                    type="button"
                                    onClick={() => onFocusField?.(change.path)}
                                    className="text-left min-w-0 flex-1 group"
                                    title={change.path}
                                >
                                    <code className="block font-mono text-[11px] text-gray-300 group-hover:text-white truncate">
                                        {shortLabel(change.path)}
                                    </code>
                                    <span className="mt-1 block text-[11px] text-gray-500">
                                        <span className="text-gray-400 line-through">
                                            {renderValue(change.before)}
                                        </span>
                                        <span className="mx-1 text-gray-600">→</span>
                                        <span className="text-gray-200">{renderValue(change.after)}</span>
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onRevert(change.path)}
                                    className="shrink-0 inline-flex items-center gap-1 rounded border border-white/15 px-1.5 py-1 text-[10px] text-gray-300 hover:text-white hover:border-white/30 transition-colors"
                                    title={`Revenir sur « ${change.path} »`}
                                >
                                    <CornerUpLeft className="w-3 h-3" />
                                    <span>Revenir</span>
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <div className="border-t border-white/10 px-3.5 py-2 text-[11px] text-gray-500">
                Rien n’est écrit en base avant « Enregistrer » : Ctrl+Z annule la dernière action,
                « Revenir » restaure un seul champ.
            </div>
        </div>
    );
};
