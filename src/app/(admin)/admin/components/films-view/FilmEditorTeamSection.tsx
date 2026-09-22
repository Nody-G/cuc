'use client';

import React from 'react';
import { Users } from 'lucide-react';
import type { FilmCredit, Instructor } from '@/types';

export interface FilmEditorTeamSectionProps {
    film: FilmCredit;
    team: Instructor[];
    onToggleMember: (memberId: string) => void;
    onRoleChange: (memberId: string, role: string) => void;
}

/**
 * Interconnexions du projet : instructeurs & cascadeurs CUC intervenus, avec
 * rôle technique précis par membre sélectionné.
 */
export const FilmEditorTeamSection: React.FC<FilmEditorTeamSectionProps> = ({
    film,
    team,
    onToggleMember,
    onRoleChange,
}) => {
    if (team.length === 0) return null;

    return (
        <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#FFE500] uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    Instructeurs & Cascadeurs CUC sur cette production
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                    {(film.cuc_team_involved || []).length} intervenants
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {team.map((t) => {
                    const isChecked =
                        film.cuc_team_involved?.includes(t.id) || film.instructor_ids?.includes(t.id);
                    return (
                        <button
                            type="button"
                            key={t.id}
                            onClick={() => onToggleMember(t.id)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-left text-[11px] transition border cursor-pointer ${isChecked
                                ? 'bg-sky-500/20 border-sky-500 text-white font-semibold'
                                : 'bg-black/60 border-white/10 text-zinc-400 hover:border-white/20'
                                }`}
                        >
                            <span className="truncate">{t.name}</span>
                        </button>
                    );
                })}
            </div>

            {/* Rôles qualifiés par membre sélectionné */}
            {(film.cuc_team_involved || []).length > 0 && (
                <div className="pt-2 border-t border-white/10 space-y-2">
                    <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                        Rôle technique précis de chaque cascadeur sur ce film :
                    </label>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {(film.cuc_team_involved || []).map((memberId) => {
                            const memberObj = team.find((t) => t.id === memberId);
                            const currentRole =
                                film.cuc_team_roles?.[memberId] ||
                                (memberObj?.title.toLowerCase().includes('coordinateur')
                                    ? 'Coordinateur des cascades'
                                    : 'Cascadeur (Stunt Performer)');

                            return (
                                <div
                                    key={memberId}
                                    className="flex items-center gap-2 p-1.5 bg-black/60 border border-white/10 rounded"
                                >
                                    <span className="text-xs text-white font-bold truncate w-32 shrink-0">
                                        {memberObj?.name || memberId} :
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="ex: Coordinateur des cascades / Cascadeur / Doublure..."
                                        value={currentRole}
                                        onChange={(e) => onRoleChange(memberId, e.target.value)}
                                        className="flex-1 bg-black/80 border border-white/20 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-[#FFE500]"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
