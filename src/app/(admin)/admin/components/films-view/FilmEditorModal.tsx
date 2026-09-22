'use client';

import React from 'react';
import { Film, Star } from 'lucide-react';
import type { FilmCredit, Instructor } from '@/types';
import { FilmEditorFields } from './FilmEditorFields';
import { FilmEditorTeamSection } from './FilmEditorTeamSection';

export interface FilmEditorModalProps {
    film: FilmCredit;
    team: Instructor[];
    onChange: (updates: Partial<FilmCredit>) => void;
    onToggleMember: (memberId: string) => void;
    onRoleChange: (memberId: string, role: string) => void;
    onOpenMediaPicker: () => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

/** Modale d'édition / création d'un projet — coquille de composition. */
export const FilmEditorModal: React.FC<FilmEditorModalProps> = ({
    film,
    team,
    onChange,
    onToggleMember,
    onRoleChange,
    onOpenMediaPicker,
    onClose,
    onSubmit,
}) => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-[#12121A] border border-white/10 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white uppercase tracking-wide flex items-center gap-2">
                    <Film className="w-4 h-4 text-[#FFE500]" />
                    {film.title ? `Modifier : ${film.title}` : 'Ajouter un film'}
                </h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white text-sm"
                >
                    ✕
                </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <FilmEditorFields
                    value={film}
                    onChange={onChange}
                    onOpenMediaPicker={onOpenMediaPicker}
                />

                <FilmEditorTeamSection
                    film={film}
                    team={team}
                    onToggleMember={onToggleMember}
                    onRoleChange={onRoleChange}
                />

                <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={film.highlight || false}
                            onChange={(e) => onChange({ highlight: e.target.checked })}
                            className="rounded border-white/20 text-[#FFE500] focus:ring-[#FFE500] h-4 w-4 bg-black/60"
                        />
                        <span className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                            <Star className="w-3.5 h-3.5 text-[#FFE500]" />
                            Mettre en avant ce film (Projet Vedette sur le site vitrine)
                        </span>
                    </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider"
                    >
                        Enregistrer
                    </button>
                </div>
            </form>
        </div>
    </div>
);
