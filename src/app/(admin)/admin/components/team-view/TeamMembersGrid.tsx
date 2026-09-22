'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, ExternalLink, Film, Shield } from 'lucide-react';
import { InstagramLogo, ImdbLogo } from '@/components/ui/BrandLogos';
import type { Instructor, FilmCredit, Discipline } from '@/types';
import { CockpitLoadMore, useProgressiveList } from '../ui';

export interface TeamMembersGridProps {
    team: Instructor[];
    films: FilmCredit[];
    disciplines: Discipline[];
    /** Ouvre le modal d'édition sur une fiche vierge. */
    onAdd: () => void;
    /** Ouvre le modal d'édition sur un membre existant. */
    onEdit: (member: Instructor) => void;
    onDelete: (id: string, name: string) => void;
}

/**
 * Cockpit — grille des formateurs (barre d'outils + cartes + pagination).
 *
 * Composant de présentation : il ne détient que l'état de pagination locale
 * (`useProgressiveList`) ; toute écriture remonte via `onAdd`/`onEdit`/`onDelete`.
 */
export const TeamMembersGrid: React.FC<TeamMembersGridProps> = ({
    team,
    films,
    disciplines,
    onAdd,
    onEdit,
    onDelete,
}) => {
    const {
        visibleItems: visibleTeam,
        visibleCount: visibleTeamCount,
        total: totalTeam,
        loadMore: loadMoreTeam,
    } = useProgressiveList(team, {
        step: 24,
        initial: 24,
    });

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="text-xs font-mono text-gray-400">{team.length} FORMATEURS</div>
                <button
                    onClick={onAdd}
                    className="px-4 py-2 rounded-lg bg-[#FFE500] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:bg-[#ffe600e6]"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter un formateur
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleTeam.map((member) => (
                    <div
                        key={member.id}
                        className="bg-[#0D0D12] border border-white/10 rounded-xl p-5 flex flex-col justify-between hover:border-white/20 transition-colors group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative shrink-0">
                                {member.avatarUrl ? (
                                    <Image
                                        src={member.avatarUrl}
                                        alt={member.name}
                                        fill
                                        className="object-cover"
                                        sizes="56px"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-bold">
                                        CUC
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-bold text-white truncate flex items-center justify-between gap-1">
                                    <span className="truncate">{member.name}</span>
                                    {member.profile_id && (
                                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                                            ✓ CUC Sign
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-[#FFE500] font-medium truncate">{member.role}</div>
                                <div className="text-[11px] text-gray-400 truncate mt-0.5">{member.title}</div>
                            </div>
                        </div>

                        <p className="text-xs text-gray-300 mt-3 line-clamp-2 leading-relaxed">
                            {member.bio}
                        </p>

                        {member.specialties && member.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                                {member.specialties.slice(0, 4).map((spec, sIdx) => (
                                    <span
                                        key={sIdx}
                                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 text-gray-300 border border-white/5"
                                    >
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Interconnexions : Modules et Films Liés */}
                        {(() => {
                            const taughtDisciplines = disciplines.filter(
                                (d) => member.discipline_ids?.includes(d.id) || d.instructor_ids?.includes(member.id)
                            );
                            const relatedFilms = films.filter(
                                (f) =>
                                    member.film_ids?.includes(f.id) ||
                                    f.cuc_team_involved?.includes(member.id) ||
                                    f.instructor_ids?.includes(member.id) ||
                                    member.notableCredits?.some((c) => f.title.toLowerCase().includes(c.toLowerCase()))
                            );

                            if (taughtDisciplines.length === 0 && relatedFilms.length === 0) return null;

                            return (
                                <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-[11px]">
                                    {taughtDisciplines.length > 0 && (
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <Shield className="w-3 h-3 text-[#FFE500] shrink-0" />
                                            <span className="text-zinc-500 text-[10px]">Modules :</span>
                                            {taughtDisciplines.slice(0, 3).map((d) => (
                                                <span
                                                    key={d.id}
                                                    className="px-1.5 py-0.2 bg-[#FFE500]/10 text-[#FFE500] border border-[#FFE500]/20 rounded text-[10px] font-mono"
                                                >
                                                    {d.number}
                                                </span>
                                            ))}
                                            {taughtDisciplines.length > 3 && (
                                                <span className="text-[10px] text-zinc-500">
                                                    +{taughtDisciplines.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {relatedFilms.length > 0 && (
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <Film className="w-3 h-3 text-purple-400 shrink-0" />
                                            <span className="text-zinc-500 text-[10px]">Films :</span>
                                            {relatedFilms.slice(0, 2).map((f) => (
                                                <span
                                                    key={f.id}
                                                    className="px-1.5 py-0.2 bg-purple-950/40 text-purple-200 border border-purple-800/30 rounded text-[10px] truncate max-w-[110px]"
                                                >
                                                    {f.title}
                                                </span>
                                            ))}
                                            {relatedFilms.length > 2 && (
                                                <span className="text-[10px] text-zinc-500">
                                                    +{relatedFilms.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-gray-400">
                                {member.instagram && (
                                    <a
                                        href={member.instagram}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:text-[#FFE500] transition-colors"
                                        title="Instagram"
                                    >
                                        <InstagramLogo className="w-4 h-4" />
                                    </a>
                                )}
                                {member.imdb && (
                                    <a
                                        href={member.imdb}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:text-[#FFE500] transition-colors"
                                        title="Fiche IMDb"
                                    >
                                        <ImdbLogo className="w-5 h-3.5" />
                                    </a>
                                )}
                                {member.externalUrl && (
                                    <a
                                        href={member.externalUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:text-[#FFE500] transition-colors"
                                        title="Site officiel / Portfolio"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => onEdit(member)}
                                    className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1.5"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    Modifier
                                </button>
                                <button
                                    onClick={() => onDelete(member.id, member.name)}
                                    title="Supprimer le formateur"
                                    className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <CockpitLoadMore
                visibleCount={visibleTeamCount}
                total={totalTeam}
                onLoadMore={loadMoreTeam}
                label="Afficher plus de formateurs"
            />
        </>
    );
};
