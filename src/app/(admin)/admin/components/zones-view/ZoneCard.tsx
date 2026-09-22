import React from 'react';
import Image from 'next/image';
import { Edit2, Trash2, Navigation, Shield } from 'lucide-react';
import { POI } from '@/components/ui/campus-map/campusMap.data';
import { Discipline } from '@/types';

export interface ZoneCardProps {
    poi: POI;
    associatedDisciplines: Discipline[];
    onEditPoi: (poi: POI) => void;
    onDeletePoi: (id: string) => void;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({
    poi,
    associatedDisciplines,
    onEditPoi,
    onDeletePoi,
}) => (
    <div className="group bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800/80 rounded-2xl p-6 hover:border-cuc-gold/40 transition-all duration-300 flex flex-col justify-between shadow-xl">
        <div className="space-y-4">
            {/* Visuel de la zone */}
            {poi.image_url ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-zinc-800 bg-black">
                    <Image
                        src={poi.image_url}
                        alt={poi.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                    />
                </div>
            ) : null}

            {/* Header Card */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                            {poi.badge || poi.category}
                        </span>
                        {poi.location_id && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                                ✓ CUC Sign lié
                            </span>
                        )}
                        <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${poi.is_active === false
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                }`}
                        >
                            {poi.is_active === false ? 'Brouillon' : 'Publié'}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cuc-gold transition-colors mt-2">
                        {poi.name}
                    </h3>
                    <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-1 font-mono">
                        <Navigation className="w-3.5 h-3.5 text-zinc-500" />
                        {poi.coordinates} • Radar ({poi.xPercent}%, {poi.yPercent}%)
                    </p>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => onEditPoi(poi)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-cuc-gold hover:text-black text-zinc-300 border border-zinc-700 transition"
                        title="Modifier"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => onDeletePoi(poi.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-300 border border-zinc-700 transition"
                        title="Supprimer"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">{poi.description}</p>

            {/* Spécifications Techniques */}
            <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                    Spécifications & Équipements
                </span>
                <p className="text-zinc-300 font-mono text-[11px]">{poi.specs}</p>
            </div>

            {/* Modules & Disciplines Enseignés Ici */}
            <div className="pt-2 border-t border-zinc-800/80">
                <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 mb-2">
                    <Shield className="w-3.5 h-3.5 text-cuc-gold" />
                    Modules de cascade pratiqués dans cette zone :
                </span>
                {associatedDisciplines.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {associatedDisciplines.map((d) => (
                            <span
                                key={d.id}
                                className="px-2.5 py-1 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-lg text-xs flex items-center gap-1.5"
                            >
                                <span className="text-cuc-gold font-mono font-bold text-[10px]">
                                    {d.number}
                                </span>
                                <span className="truncate max-w-[150px]">{d.name}</span>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-zinc-500 italic">
                        Aucune discipline assignée à cette zone.
                    </p>
                )}
            </div>
        </div>
    </div>
);
