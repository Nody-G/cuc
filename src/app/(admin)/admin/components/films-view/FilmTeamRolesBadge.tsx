'use client';

import React, { useState } from 'react';
import { Crown, Sparkles, Users } from 'lucide-react';
import type { FilmCredit, Instructor } from '@/types';
import {
    resolveCoordinators,
    resolveFilmTeamRoles,
    resolveFilmDoublings,
    isLucasCoordinated,
} from './film-filters-domain';

export interface FilmTeamRolesBadgeProps {
    film: FilmCredit;
    team: Instructor[];
}

/**
 * Présentation détaillée des intervenants CUC, coordinateurs et comédiens doublés.
 * Offre une vue claire de « qui a bossé dans quoi » et « quel coach a doublé quel acteur ».
 */
export const FilmTeamRolesBadge: React.FC<FilmTeamRolesBadgeProps> = ({ film, team }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const isLucas = isLucasCoordinated(film);
    const coordinators = resolveCoordinators(film, team);
    const teamRoles = resolveFilmTeamRoles(film, team);
    const doublings = resolveFilmDoublings(film, team);

    const hasAnyContent =
        coordinators.length > 0 ||
        teamRoles.length > 0 ||
        doublings.length > 0;

    if (!hasAnyContent) return null;

    const visibleRoles = isExpanded ? teamRoles : teamRoles.slice(0, 3);
    const remainingCount = teamRoles.length - 3;

    return (
        <div className="pt-2 border-t border-white/5 space-y-2 text-[11px]">
            {/* 1. Mise en avant de la coordination (Lucas ou autre coach) */}
            {coordinators.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${isLucas
                            ? 'bg-[#FFE500]/15 text-[#FFE500] border border-[#FFE500]/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}
                    >
                        <Crown className="w-3 h-3 shrink-0" />
                        Coordination : {coordinators.join(', ')}
                    </span>
                </div>
            )}

            {/* 2. Mise en avant des comédiens doublés par l'équipe CUC */}
            {doublings.length > 0 && (
                <div className="bg-purple-950/25 border border-purple-800/40 rounded-md p-2 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-300 uppercase tracking-wide">
                        <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                        <span>Comédiens doublés par l'équipe CUC :</span>
                    </div>
                    <div className="space-y-1">
                        {doublings.map((d, idx) => (
                            <div key={idx} className="flex items-center flex-wrap gap-1.5 text-[11px] leading-tight">
                                <span className="font-semibold text-white">
                                    {d.actorName}
                                </span>
                                {d.stuntDoubleName && (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-900/60 border border-purple-600/50 text-purple-200">
                                        <span className="text-purple-300">➔ doublé par</span>
                                        <strong className="text-[#FFE500] font-bold">{d.stuntDoubleName}</strong>
                                    </span>
                                )}
                                {d.note && (
                                    <span className="text-[10px] text-zinc-400 italic">
                                        ({d.note})
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Qui a bossé dans quoi (Équipe CUC et rôles précis) */}
            {teamRoles.length > 0 && (
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span className="flex items-center gap-1 text-sky-400">
                            <Users className="w-3 h-3" />
                            Équipe CUC ({teamRoles.length})
                        </span>
                        {remainingCount > 0 && (
                            <button
                                type="button"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-zinc-400 hover:text-white underline cursor-pointer"
                            >
                                {isExpanded ? 'Réduire' : `+${remainingCount} autre${remainingCount > 1 ? 's' : ''}`}
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                        {visibleRoles.map((member) => (
                            <span
                                key={member.coachId}
                                className={`px-1.5 py-0.5 rounded border text-[10px] ${member.isCoordinator
                                    ? 'bg-[#FFE500]/10 border-[#FFE500]/30 text-[#FFE500] font-semibold'
                                    : member.isDouble
                                        ? 'bg-purple-900/20 border-purple-700/30 text-purple-300'
                                        : 'bg-sky-950/40 border-sky-800/30 text-sky-300'
                                    }`}
                                title={`${member.coachName} — ${member.role}`}
                            >
                                <span className="font-bold">{member.coachName}</span>
                                {member.role && (
                                    <span className="text-zinc-400 ml-1 font-normal truncate max-w-[130px] inline-block align-bottom">
                                        ({member.role})
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
