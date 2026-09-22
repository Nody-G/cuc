'use client';

import React from 'react';
import Image from 'next/image';
import {
    Edit2,
    Film,
    GraduationCap,
    Image as ImageIcon,
    MapPin,
    Trash2,
    Users,
} from 'lucide-react';
import type { Discipline, FilmCredit, Instructor, StuntProgram } from '@/types';
import type { POI } from '@/components/ui/campus-map/campusMap.data';
import { disciplineLevelBadgeClass } from './discipline-form';

export interface DisciplineCardProps {
    discipline: Discipline;
    /** Zone campus assignée (résolue en amont). */
    zone?: POI;
    linkedInstructors: Instructor[];
    linkedFilms: FilmCredit[];
    linkedProgs: StuntProgram[];
    onEdit: (discipline: Discipline) => void;
    onDelete: (id: string) => void;
}

/** Carte d'un module : visuel, niveau, interconnexions, matériel et actions. */
export const DisciplineCard: React.FC<DisciplineCardProps> = ({
    discipline: d,
    zone,
    linkedInstructors,
    linkedFilms,
    linkedProgs,
    onEdit,
    onDelete,
}) => (
    <div className="group relative bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden hover:border-cuc-gold/40 transition-all duration-300 flex flex-col justify-between shadow-xl">
        {/* Header Image & Badge */}
        <div>
            <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
                {d.heroImage ? (
                    <Image
                        src={d.heroImage}
                        alt={d.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-950/80">
                        <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
                        <span className="text-xs">Aucune image</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                {/* Badges Flottants */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-cuc-gold/40 text-cuc-gold font-mono font-bold text-xs shadow-lg">
                        {d.number}
                    </span>
                    <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${disciplineLevelBadgeClass(d.level)}`}
                    >
                        {d.level}
                    </span>
                </div>

                {/* Actions Rapides */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                    <button
                        onClick={() => onEdit(d)}
                        className="p-1.5 rounded-lg bg-black/70 hover:bg-cuc-gold hover:text-black text-zinc-300 border border-zinc-700/50 transition backdrop-blur"
                        title="Modifier"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDelete(d.id)}
                        className="p-1.5 rounded-lg bg-black/70 hover:bg-rose-500 hover:text-white text-zinc-300 border border-zinc-700/50 transition backdrop-blur"
                        title="Supprimer"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Contenu */}
            <div className="p-5 space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cuc-gold transition-colors line-clamp-1">
                        {d.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {d.shortDesc}
                    </p>
                </div>

                {/* Interconnexions Actives */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/60 text-xs">
                    {/* Zone Campus */}
                    <div className="flex items-center gap-2 text-zinc-300">
                        <MapPin className="w-3.5 h-3.5 text-cuc-gold shrink-0" />
                        <span className="text-zinc-500">Zone Campus :</span>
                        {zone ? (
                            <span className="font-medium text-amber-300 truncate">{zone.name}</span>
                        ) : (
                            <span className="text-zinc-600 italic">Non assignée</span>
                        )}
                    </div>

                    {/* Formateurs Référents */}
                    <div className="flex items-center gap-2 text-zinc-300">
                        <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="text-zinc-500">Formateurs :</span>
                        {linkedInstructors.length > 0 ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {linkedInstructors.slice(0, 2).map((inst) => (
                                    <span
                                        key={inst.id}
                                        className="px-2 py-0.5 bg-zinc-800/80 rounded-md text-[11px] text-zinc-200 border border-zinc-700/50"
                                    >
                                        {inst.name.split(' ')[0]}
                                    </span>
                                ))}
                                {linkedInstructors.length > 2 && (
                                    <span className="text-[10px] text-zinc-400 font-mono">
                                        +{linkedInstructors.length - 2}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-zinc-600 italic">Aucun formateur lié</span>
                        )}
                    </div>

                    {/* Films Phares Liés */}
                    {linkedFilms.length > 0 && (
                        <div className="flex items-center gap-2 text-zinc-300">
                            <Film className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="text-zinc-500">Films phares :</span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {linkedFilms.slice(0, 2).map((f) => (
                                    <span
                                        key={f.id}
                                        className="px-2 py-0.5 bg-purple-950/40 text-purple-200 rounded-md text-[11px] border border-purple-800/40 truncate max-w-[130px]"
                                    >
                                        {f.title}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Formations Associées */}
                    {linkedProgs.length > 0 && (
                        <div className="flex items-center gap-2 text-zinc-300">
                            <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-zinc-500">Programmes :</span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {linkedProgs.map((p) => (
                                    <span
                                        key={p.id}
                                        className="px-2 py-0.5 bg-emerald-950/40 text-emerald-300 rounded-md text-[10px] border border-emerald-800/30"
                                    >
                                        {p.badge || p.title.slice(0, 15)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Matériel Clé */}
                {d.equipment && d.equipment.length > 0 && (
                    <div className="pt-2">
                        <div className="flex flex-wrap gap-1">
                            {d.equipment.slice(0, 3).map((eq, i) => (
                                <span
                                    key={i}
                                    className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 rounded"
                                >
                                    {eq}
                                </span>
                            ))}
                            {d.equipment.length > 3 && (
                                <span className="text-[10px] text-zinc-500 self-center">
                                    +{d.equipment.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);
