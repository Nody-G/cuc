'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, Check, HelpCircle, Loader2, RefreshCw } from 'lucide-react';
import { useMicrocopyEditor } from './microcopy-view/useMicrocopyEditor';
import { MicrocopyToolbar } from './microcopy-view/MicrocopyToolbar';
import { MicrocopyEntryRow } from './microcopy-view/MicrocopyEntryRow';

interface MicrocopyViewProps {
    showToast?: (message: string) => void;
}

/**
 * Édition des micro-textes d'interface (FR → EN) — façade de composition.
 *
 * L'orchestration (catalogue, surcharges `site_settings`, publication) vit dans
 * `useMicrocopyEditor` ; les blocs visuels dans `microcopy-view/**`.
 */
export const MicrocopyView: React.FC<MicrocopyViewProps> = ({ showToast }) => {
    const editor = useMicrocopyEditor(showToast);

    if (editor.isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-zinc-400">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-sm font-medium">Chargement du catalogue des micro-textes…</span>
                <span className="text-xs text-zinc-500">Lecture des 700+ libellés d'interface (FR / EN)</span>
            </div>
        );
    }

    if (editor.error) {
        return (
            <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-8 text-center max-w-lg mx-auto my-12 space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-900/30 text-red-400 mx-auto flex items-center justify-center">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-zinc-200">Impossible de charger les micro-textes</h3>
                    <p className="text-xs text-zinc-400 mt-1">{editor.error}</p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        onClick={editor.retry}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Réessayer
                    </button>
                    <Link
                        href="/admin/login?next=/admin/microcopy"
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 transition"
                    >
                        Se reconnecter au Cockpit
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-in fade-in duration-200">
            {/* Guide d'orientation clair pour l'équipe */}
            <div className="flex items-start gap-3 p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-zinc-300">
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p>
                        <strong className="text-amber-300">💡 Conseil d'utilisation :</strong> Pour modifier le texte d'une page (titres, paragraphes, photos) avec prévisualisation en direct, utilisez plutôt le <strong className="text-zinc-100">Mode Studio</strong> dans l'onglet <em>« Éditeur de Pages »</em>.
                    </p>
                    <p className="text-zinc-400">
                        Cette page sert de <strong>dictionnaire technique</strong> pour ajuster les libellés génériques récurrents (boutons d'action, mentions de navigation, messages d'état FR/EN).
                    </p>
                </div>
            </div>
            <MicrocopyToolbar
                entriesCount={editor.entries.length}
                groupsCount={editor.groups.length}
                groups={editor.groups}
                group={editor.group}
                onSetGroup={editor.setGroup}
                query={editor.query}
                onSetQuery={editor.setQuery}
                locale={editor.locale}
                onSetLocale={editor.setLocale}
                overrideCount={editor.overrideCount}
                dirtyCount={editor.dirtyCount}
                isSaving={editor.isSaving}
                onSave={editor.handleSave}
            />

            <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900/20">
                {editor.filtered.map((entry) => (
                    <MicrocopyEntryRow
                        key={entry.key}
                        entry={entry}
                        locale={editor.locale}
                        value={editor.currentValue(entry, editor.locale)}
                        overridden={editor.isOverridden(entry, editor.locale)}
                        dirty={editor.isDirty(entry)}
                        onChange={editor.handleChange}
                        onRevert={editor.handleRevert}
                    />
                ))}

                {editor.filtered.length === 0 && (
                    <div className="flex items-center gap-2 p-6 text-xs text-zinc-500">
                        <Check className="h-4 w-4" />
                        Aucune clé ne correspond à ce filtre.
                    </div>
                )}
            </div>
        </div>
    );
};
