'use client';

import React from 'react';
import type { Discipline, FilmCredit, Instructor, StuntProgram } from '@/types';
import type { POI } from '@/components/ui/campus-map/campusMap.data';
import { DisciplineEditorFields } from './DisciplineEditorFields';
import { DisciplineLinksSection } from './DisciplineLinksSection';

export interface DisciplineEditorModalProps {
    discipline: Discipline;
    campusPOIs: POI[];
    team: Instructor[];
    films: FilmCredit[];
    programs: StuntProgram[];
    onChange: (updates: Partial<Discipline>) => void;
    onToggleLink: (field: 'instructor_ids' | 'film_ids' | 'program_ids', id: string) => void;
    onOpenMediaPicker: () => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

/** Modale d'édition / création d'un module — coquille de composition. */
export const DisciplineEditorModal: React.FC<DisciplineEditorModalProps> = ({
    discipline,
    campusPOIs,
    team,
    films,
    programs,
    onChange,
    onToggleLink,
    onOpenMediaPicker,
    onClose,
    onSubmit,
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-cuc-gold/10 border border-cuc-gold/30 text-cuc-gold font-mono font-bold text-xs">
                        {discipline.number}
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

            <form onSubmit={onSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <DisciplineEditorFields
                    value={discipline}
                    onChange={onChange}
                    campusPOIs={campusPOIs}
                    onOpenMediaPicker={onOpenMediaPicker}
                />

                <DisciplineLinksSection
                    discipline={discipline}
                    team={team}
                    programs={programs}
                    films={films}
                    onToggle={onToggleLink}
                />

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
                        className="px-6 py-2.5 rounded-xl bg-cuc-gold text-black text-xs font-bold hover:bg-yellow-400 transition shadow-lg shadow-cuc-gold/20"
                    >
                        Enregistrer les modifications
                    </button>
                </div>
            </form>
        </div>
    </div>
);
