import React from 'react';
import { Compass, Plus } from 'lucide-react';

export interface ZonesHeaderProps {
    zoneCount: number;
    onAddZone: () => void;
}

export const ZonesHeader: React.FC<ZonesHeaderProps> = ({ zoneCount, onAddZone }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Compass className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                        Infrastructures & Zones du Campus
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {zoneCount} Zones
                        </span>
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Configurez les points d’intérêt du parc du campus, leurs coordonnées et les modules associés.
                    </p>
                </div>
            </div>
        </div>

        <button
            onClick={onAddZone}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-cuc-gold text-black font-semibold rounded-xl hover:bg-yellow-400 transition shadow-lg shadow-cuc-gold/10 text-sm shrink-0"
        >
            <Plus className="w-4 h-4" />
            Ajouter une Zone
        </button>
    </div>
);
