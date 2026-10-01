'use client';

import React from 'react';
import { Menu, RotateCcw, Save } from 'lucide-react';
import type { NavigationStructure } from '@/data/navigation';
import type { EditorLocaleOption } from '../ui';
import { EntityLocaleBar } from '../entity-translation/EntityLocaleBar';
import type { EntityEditorLocale } from '../entity-translation/entity-translation.contract';

export interface NavigationHeaderProps {
    isPending: boolean;
    onReset: () => void;
    onSave: () => void;
    /** État bilingue : barre FR | EN du même écran. */
    localeEditor: EntityEditorLocale<NavigationStructure>;
    /** Bascule de langue, avec garde-fou sur un brouillon anglais non enregistré. */
    onLocaleChange: (next: EditorLocaleOption) => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
    isPending,
    onReset,
    onSave,
    localeEditor,
    onLocaleChange,
}) => (
    <div className="border-b border-white/10 pb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
                    <Menu className="w-3.5 h-3.5" /> Structure du site
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                    Navigation principale
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                    Réorganisez les entrées de la barre de navigation, leurs menus déroulants et le bouton
                    d'appel à l'action.
                </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                    onClick={onReset}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Réinitialiser
                </button>
                <button
                    onClick={onSave}
                    disabled={
                        isPending ||
                        (localeEditor.isEnglish && (localeEditor.saving || !localeEditor.ready))
                    }
                    title={
                        localeEditor.isEnglish
                            ? 'Enregistrer la traduction anglaise (seules les différences avec le français sont écrites)'
                            : 'Enregistrer la navigation française'
                    }
                    className="px-5 py-2.5 bg-[#FFE500] hover:bg-[#ffe600e6] disabled:opacity-50 text-black text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-2 shadow-lg shadow-yellow-500/10 transition-transform active:scale-95"
                >
                    <Save className="w-4 h-4" />
                    {localeEditor.isEnglish
                        ? localeEditor.saving
                            ? 'Enregistrement…'
                            : 'Enregistrer EN'
                        : isPending
                            ? 'Enregistrement…'
                            : 'Enregistrer'}
                </button>
            </div>
        </div>

        {/* Bascule FR | EN : la traduction s'édite dans le même écran. */}
        <EntityLocaleBar
            entityLabel="Navigation principale"
            locale={localeEditor.locale}
            onLocaleChange={onLocaleChange}
            coverage={localeEditor.coverage}
            dirty={localeEditor.isEnglish && localeEditor.dirty}
            busy={localeEditor.loading}
            ready={localeEditor.ready}
            saving={localeEditor.saving}
            onSaveTranslation={() => void localeEditor.saveTranslation()}
            onRevertTranslation={localeEditor.revertTranslation}
            onRemoveTranslation={() => void localeEditor.removeTranslation()}
        />

        {localeEditor.error && (
            <p role="alert" className="text-[11px] text-red-400">
                {localeEditor.error}
            </p>
        )}
    </div>
);

export default NavigationHeader;
