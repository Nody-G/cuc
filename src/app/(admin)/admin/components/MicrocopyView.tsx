'use client';

import React from 'react';
import { Check, Loader2 } from 'lucide-react';
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
            <div className="flex items-center justify-center gap-3 py-16 text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                Chargement des micro-textes…
            </div>
        );
    }

    return (
        <div className="space-y-5 animate-in fade-in duration-200">
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
