'use client';

import React from 'react';
import type { Discipline, FilmCredit, Instructor, StuntProgram } from '@/types';
import type { POI } from '@/components/ui/campus-map/campusMap.data';
import type { EditorLocaleOption } from '../ui';
import { EntityLocaleBar } from '../entity-translation/EntityLocaleBar';
import type { EntityEditorLocale } from '../entity-translation/entity-translation.contract';
import { DisciplineEditorFields } from './DisciplineEditorFields';
import { DisciplineLinksSection } from './DisciplineLinksSection';

export interface DisciplineEditorModalProps {
    /** Module actif : français en FR, contenu localisé en EN. */
    discipline: Discipline;
    /** Fiche source française : champs techniques et liaisons croisées. */
    sourceDiscipline: Discipline;
    campusPOIs: POI[];
    team: Instructor[];
    films: FilmCredit[];
    programs: StuntProgram[];
    /** Patch des champs traduisibles. */
    onChange: (updates: Partial<Discipline>) => void;
    /** Patch des champs techniques (source FR). */
    onSourceChange: (updates: Partial<Discipline>) => void;
    onToggleLink: (field: 'instructor_ids' | 'film_ids' | 'program_ids', id: string) => void;
    onOpenMediaPicker: () => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    /** État bilingue : barre FR | EN et verrous de champs. */
    localeEditor: EntityEditorLocale<Discipline>;
    onLocaleChange: (next: EditorLocaleOption) => void;
    isFieldReadOnly: (field: string) => boolean;
}

/**
 * Modale d'édition / création d'un module. En anglais, seuls les textes de
 * l'allow-list (`DISCIPLINE_CODEC`) restent éditables ; les liaisons croisées
 * basculent en lecture seule (elles appartiennent à la structure FR).
 */
export const DisciplineEditorModal: React.FC<DisciplineEditorModalProps> = ({
    discipline,
    sourceDiscipline,
    campusPOIs,
    team,
    films,
    programs,
    onChange,
    onSourceChange,
    onToggleLink,
    onOpenMediaPicker,
    onClose,
    onSubmit,
    localeEditor,
    onLocaleChange,
    isFieldReadOnly,
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            <div className="flex flex-col gap-3 px-6 py-4 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-md bg-cuc-gold/10 border border-cuc-gold/30 text-cuc-gold font-mono font-bold text-xs">
                            {sourceDiscipline.number}
                        </span>
                        <h3 className="font-bold text-lg text-white">
                            {discipline.name || 'Nouveau Module de Cascade'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white text-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* Bascule FR | EN : la traduction s'édite dans le même formulaire. */}
                <EntityLocaleBar
                    entityLabel={discipline.name || 'Nouveau Module'}
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

            <form onSubmit={onSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <DisciplineEditorFields
                    value={discipline}
                    onChange={onChange}
                    sourceValue={sourceDiscipline}
                    onSourceChange={onSourceChange}
                    campusPOIs={campusPOIs}
                    onOpenMediaPicker={onOpenMediaPicker}
                    isFieldReadOnly={isFieldReadOnly}
                />

                {/* Liaisons croisées : structure FR, verrouillées en anglais. */}
                <fieldset disabled={localeEditor.isEnglish} className="m-0 min-w-0 border-0 p-0">
                    <DisciplineLinksSection
                        discipline={sourceDiscipline}
                        team={team}
                        programs={programs}
                        films={films}
                        onToggle={onToggleLink}
                    />
                </fieldset>

                {/* Boutons Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 transition"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={
                            localeEditor.isEnglish && (localeEditor.saving || !localeEditor.ready)
                        }
                        className="px-6 py-2.5 rounded-xl bg-cuc-gold text-black text-xs font-bold hover:bg-yellow-400 transition shadow-lg shadow-cuc-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {localeEditor.isEnglish
                            ? localeEditor.saving
                                ? 'Enregistrement…'
                                : 'Enregistrer EN'
                            : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    </div>
);

export default DisciplineEditorModal;
