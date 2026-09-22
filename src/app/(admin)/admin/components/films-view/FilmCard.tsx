'use client';

import React from 'react';
import Image from 'next/image';
import { Edit2, Shield, Star, Trash2, Users } from 'lucide-react';
import { ImdbLogo, AllocineLogo, YouTubeLogo } from '@/components/ui/BrandLogos';
import type { Discipline, FilmCredit, Instructor } from '@/types';

export interface FilmCardProps {
    film: FilmCredit;
    /** Intervenants CUC liés (résolus en amont). */
    linkedStaff: Instructor[];
    /** Modules de cascade liés (résolus en amont). */
    linkedDisc: Discipline[];
    onEdit: () => void;
    onDelete: () => void;
}

/** Carte d'un projet : affiche, badges, interconnexions et liens de référence. */
export const FilmCard: React.FC<FilmCardProps> = ({
    film,
    linkedStaff,
    linkedDisc,
    onEdit,
    onDelete,
}) => (
    <div className="bg-[#0D0D12] border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between hover:border-white/20 transition-colors group">
        <div className="relative aspect-[16/10] bg-black/60 overflow-hidden">
            {film.image ? (
                <Image
                    src={film.image}
                    alt={film.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="300px"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-bold">
                    PAS D'AFFICHE
                </div>
            )}
            {film.highlight && (
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black uppercase flex items-center gap-1 shadow">
                        <Star className="w-2.5 h-2.5 fill-black" /> Vedette
                    </span>
                </div>
            )}
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono">
                {film.year}
            </span>
        </div>

        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
                <div className="text-sm font-bold text-white group-hover:text-[#FFE500] transition-colors truncate">
                    {film.title}
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-400">
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-[#FFE500] font-mono">
                        {film.category}
                    </span>
                    {film.director && (
                        <span className="text-[11px] text-gray-400 truncate">
                            Réal : {film.director}
                        </span>
                    )}
                </div>
                {film.doubledActors && film.doubledActors.length > 0 && (
                    <div className="text-[11px] text-gray-400 line-clamp-1">
                        <span className="text-gray-500 font-medium">Doublures :</span>{' '}
                        {Array.isArray(film.doubledActors)
                            ? film.doubledActors.join(', ')
                            : film.doubledActors}
                    </div>
                )}
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {film.stuntRoles}
                </p>

                {/* Interconnexions : Formateurs et Modules Liés */}
                {(linkedStaff.length > 0 || linkedDisc.length > 0) && (
                    <div className="pt-2 border-t border-white/5 space-y-1 text-[10px]">
                        {linkedStaff.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <Users className="w-3 h-3 text-sky-400 shrink-0" />
                                <span className="text-zinc-500">Staff CUC :</span>
                                {linkedStaff.slice(0, 2).map((t) => (
                                    <span
                                        key={t.id}
                                        className="px-1.5 py-0.2 bg-sky-950/40 text-sky-300 border border-sky-800/30 rounded"
                                    >
                                        {t.name.split(' ')[0]}
                                    </span>
                                ))}
                                {linkedStaff.length > 2 && (
                                    <span className="text-zinc-500 font-mono">+{linkedStaff.length - 2}</span>
                                )}
                            </div>
                        )}
                        {linkedDisc.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <Shield className="w-3 h-3 text-[#FFE500] shrink-0" />
                                <span className="text-zinc-500">Modules :</span>
                                {linkedDisc.slice(0, 2).map((d) => (
                                    <span
                                        key={d.id}
                                        className="px-1.5 py-0.2 bg-[#FFE500]/10 text-[#FFE500] border border-[#FFE500]/20 rounded font-mono"
                                    >
                                        {d.number}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {film.imdbUrl && (
                        <a
                            href={film.imdbUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-1.5 py-1 rounded bg-[#f5c518]/15 hover:bg-[#f5c518]/30 text-[#f5c518] flex items-center transition-colors"
                            title="Fiche IMDb"
                        >
                            <ImdbLogo className="h-3 w-auto shrink-0" />
                        </a>
                    )}
                    {film.allocineUrl && (
                        <a
                            href={film.allocineUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-1.5 py-1 rounded bg-[#fecc00]/15 hover:bg-[#fecc00]/30 text-[#fecc00] flex items-center transition-colors"
                            title="Fiche AlloCiné"
                        >
                            <AllocineLogo className="h-3 w-auto shrink-0" />
                        </a>
                    )}
                    {film.trailerUrl && (
                        <a
                            href={film.trailerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-1.5 py-1 rounded bg-red-600/15 hover:bg-red-600/30 text-red-400 flex items-center transition-colors"
                            title="Bande-annonce"
                        >
                            <YouTubeLogo className="w-3 h-3 shrink-0" variant="color" />
                        </a>
                    )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={onEdit}
                        className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1"
                    >
                        <Edit2 className="w-3 h-3" />
                        Modifier
                    </button>
                    <button
                        onClick={onDelete}
                        title="Supprimer le projet"
                        className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-xs transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    </div>
);
