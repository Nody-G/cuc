'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import type { Discipline, FilmCredit, Instructor, StuntProgram } from '@/types';

export interface DisciplineLinksSectionProps {
    discipline: Discipline;
    team: Instructor[];
    programs: StuntProgram[];
    films: FilmCredit[];
    onToggle: (field: 'instructor_ids' | 'film_ids' | 'program_ids', id: string) => void;
}

/** Interconnexions & liaisons croisées : formateurs, programmes et films de référence. */
export const DisciplineLinksSection: React.FC<DisciplineLinksSectionProps> = ({
    discipline,
    team,
    programs,
    films,
    onToggle,
}) => (
    <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-cuc-gold flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Interconnexions & Liaisons Croisées
        </h4>

        {/* Formateurs Référents */}
        <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Formateurs Référents de ce Module ({team.length} instructeurs au staff) :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {team.map((inst) => {
                    const isChecked = discipline.instructor_ids?.includes(inst.id);
                    return (
                        <button
                            type="button"
                            key={inst.id}
                            onClick={() => onToggle('instructor_ids', inst.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition border ${isChecked
                                ? 'bg-cuc-gold/15 border-cuc-gold text-white font-semibold'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                        >
                            <div
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${isChecked ? 'bg-cuc-gold border-cuc-gold text-black' : 'border-zinc-700'
                                    }`}
                            >
                                {isChecked && '✓'}
                            </div>
                            <span className="truncate">{inst.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Formations Associées */}
        <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Programmes de Formation qui intègrent ce module :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {programs.map((prog) => {
                    const isChecked = discipline.program_ids?.includes(prog.id);
                    return (
                        <button
                            type="button"
                            key={prog.id}
                            onClick={() => onToggle('program_ids', prog.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition border ${isChecked
                                ? 'bg-emerald-500/15 border-emerald-500 text-white font-semibold'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                        >
                            <div
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${isChecked ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-zinc-700'
                                    }`}
                            >
                                {isChecked && '✓'}
                            </div>
                            <span className="truncate">{prog.title}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* Films Phares de Référence */}
        <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
                Films & Œuvres illustrant cette discipline (sélection du catalogue CUC) :
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {films.slice(0, 12).map((film) => {
                    const isChecked = discipline.film_ids?.includes(film.id);
                    return (
                        <button
                            type="button"
                            key={film.id}
                            onClick={() => onToggle('film_ids', film.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition border ${isChecked
                                ? 'bg-purple-500/15 border-purple-500 text-white font-semibold'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                }`}
                        >
                            <div
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${isChecked ? 'bg-purple-500 border-purple-500 text-white' : 'border-zinc-700'
                                    }`}
                            >
                                {isChecked && '✓'}
                            </div>
                            <span className="truncate">{film.title}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    </div>
);
