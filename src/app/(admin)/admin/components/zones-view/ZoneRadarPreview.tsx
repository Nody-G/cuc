import React from 'react';
import { POI } from '@/components/ui/campus-map/campusMap.data';

export interface ZoneRadarPreviewProps {
    pois: POI[];
    onEditPoi: (poi: POI) => void;
}

export const ZoneRadarPreview: React.FC<ZoneRadarPreviewProps> = ({ pois, onEditPoi }) => (
    <div className="relative w-full h-56 bg-zinc-950 rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl p-4 flex flex-col justify-between">
        {/* Grille Radar */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full border border-zinc-800/80" />
            <div className="w-32 h-32 rounded-full border border-zinc-800/60 absolute" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Plan du campus • Le Cateau-Cambrésis (Nord)
            </div>
            <span className="text-[11px] font-mono text-zinc-500">60 000 m² Domaine Privé</span>
        </div>

        {/* POI Markers sur le Radar */}
        <div className="absolute inset-0 pointer-events-none">
            {pois.map((poi) => (
                <div
                    key={poi.id}
                    style={{ left: `${poi.xPercent}%`, top: `${poi.yPercent}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group/pin pointer-events-auto"
                >
                    <div className="relative cursor-pointer" onClick={() => onEditPoi(poi)}>
                        <span className="flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cuc-gold opacity-60" />
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-cuc-gold border-2 border-black" />
                        </span>
                        <div className="absolute left-5 top-0 hidden group-hover/pin:block bg-black/90 border border-zinc-700 text-white text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap z-30 shadow-xl backdrop-blur">
                            <p className="font-bold text-cuc-gold">{poi.name}</p>
                            <p className="text-zinc-400 text-[10px]">{poi.category}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="relative z-10 text-[11px] text-zinc-500">
            Cliquez sur un point pour l'éditer directement sur le radar.
        </div>
    </div>
);
