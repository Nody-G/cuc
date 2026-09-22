'use client';

import React from 'react';
import { Columns2, Eye, Redo2, Undo2 } from 'lucide-react';
import type { SitePageContent } from '@/lib/data/site-service';
import type { EditorLocaleOption } from '@/app/(admin)/admin/components/ui/LocaleToggle';
import type { ListCommand } from '@/lib/preview/list-command';
import type { PreviewMode } from '@/lib/preview/preview-protocol';
import { LivePreviewPane } from './LivePreviewPane';
import { StudioInspector } from './StudioInspector';

export interface PreviewTabPanelProps {
    previewUrl: string;
    isSplitView: boolean;
    onToggleSplitView: () => void;
    historyState: { canUndo: boolean; canRedo: boolean };
    onUndo: () => void;
    onRedo: () => void;
    previewKey: number;
    activeData: SitePageContent;
    previewMode: PreviewMode;
    onPreviewModeChange: (mode: PreviewMode) => void;
    onFieldCommit: (field: string, value: string) => void;
    /** Surcharges de réglages (brouillon chrome) poussées dans l'aperçu. */
    settings: Record<string, string>;
    /** Valeur validée pour un réglage du site (`data-cuc-setting`). */
    onSettingCommit: (key: string, value: string) => void;
    onFieldSelect: (field: string) => void;
    locale: EditorLocaleOption;
    onLocaleChange: (locale: EditorLocaleOption) => void;
    onMediaRequest: (target: string) => void;
    onListCommand: (field: string, command: ListCommand, index: number) => void;
    draftChanges: React.ComponentProps<typeof StudioInspector>['changes'];
    isInspectorEnabled: boolean;
    onRevertChange: (path: string) => void;
    onRevertAllChanges: () => void;
    /** Éditeurs de contenu (bloc partagé avec la vue côte à côte). */
    contentEditors: React.ReactNode;
}

/**
 * Onglet aperçu live : barre (undo/redo, vue partagée), iframe de la vraie page
 * et inspecteur du brouillon — seul ou côte à côte avec les éditeurs.
 */
export const PreviewTabPanel: React.FC<PreviewTabPanelProps> = ({
    previewUrl,
    isSplitView,
    onToggleSplitView,
    historyState,
    onUndo,
    onRedo,
    previewKey,
    activeData,
    previewMode,
    onPreviewModeChange,
    onFieldCommit,
    settings,
    onSettingCommit,
    onFieldSelect,
    locale,
    onLocaleChange,
    onMediaRequest,
    onListCommand,
    draftChanges,
    isInspectorEnabled,
    onRevertChange,
    onRevertAllChanges,
    contentEditors,
}) => {
    const fieldSelect = previewMode === 'inspect' ? onFieldSelect : undefined;

    const inspector = (
        <StudioInspector
            changes={draftChanges}
            isEnabled={isInspectorEnabled}
            isTranslation={locale === 'en'}
            onFocusField={onFieldSelect}
            onRevert={onRevertChange}
            onRevertAll={onRevertAllChanges}
        />
    );

    const preview = (
        <LivePreviewPane
            draft={activeData}
            previewUrl={previewUrl}
            reloadKey={previewKey}
            mode={previewMode}
            onModeChange={onPreviewModeChange}
            onFieldCommit={onFieldCommit}
            settings={settings}
            onSettingCommit={onSettingCommit}
            onFieldSelect={fieldSelect}
            locale={locale}
            onLocaleChange={onLocaleChange}
            onMediaRequest={onMediaRequest}
            onListCommand={onListCommand}
        />
    );

    return (
        <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl bg-[#0D0D12] border border-white/10">
                <div className="flex items-center gap-2 text-xs text-gray-300 min-w-0">
                    <Eye className="w-4 h-4 text-[#FFE500] shrink-0" />
                    <span className="font-bold uppercase tracking-wider shrink-0">Aperçu Live :</span>
                    <span className="font-mono text-[#FFE500] truncate">{previewUrl}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onUndo}
                        disabled={!historyState.canUndo}
                        className="px-2.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/5"
                        title="Annuler la dernière modification (Ctrl+Z)"
                    >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Annuler</span>
                    </button>

                    <button
                        type="button"
                        onClick={onRedo}
                        disabled={!historyState.canRedo}
                        className="px-2.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/5"
                        title="Rétablir (Ctrl+Maj+Z)"
                    >
                        <Redo2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Rétablir</span>
                    </button>

                    <button
                        type="button"
                        onClick={onToggleSplitView}
                        className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-colors shrink-0 ${isSplitView
                            ? 'bg-[#FFE500] text-black border-[#FFE500]'
                            : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10'
                            }`}
                        title="Afficher l’éditeur et l’aperçu côte à côte"
                    >
                        <Columns2 className="w-3.5 h-3.5" />
                        <span>Vue partagée</span>
                    </button>
                </div>
            </div>

            {isSplitView ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                    <div className="min-w-0">{contentEditors}</div>
                    <div className="min-w-0 xl:sticky xl:top-4 space-y-4">
                        {preview}
                        {inspector}
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {inspector}
                    {preview}
                </div>
            )}
        </div>
    );
};
