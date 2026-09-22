import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { POI } from '@/components/ui/campus-map/campusMap.data';

export interface ZoneStatusToggleProps {
    poi: POI;
    onChange: (patch: Partial<POI>) => void;
}

export const ZoneStatusToggle: React.FC<ZoneStatusToggleProps> = ({ poi, onChange }) => (
    <div className="flex items-center justify-between gap-3 p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div>
            <p className="text-xs font-semibold text-zinc-300">
                {poi.is_active === false
                    ? 'Brouillon (masqué sur la vitrine)'
                    : 'Publié sur la vitrine'}
            </p>
            <p className="text-[11px] text-zinc-500 font-mono">
                Décochez pour préparer la zone sans l'exposer publiquement.
            </p>
        </div>
        <button
            type="button"
            onClick={() => onChange({ is_active: poi.is_active === false })}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition shrink-0 ${poi.is_active === false
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
        >
            {poi.is_active === false ? (
                <EyeOff className="w-3.5 h-3.5" />
            ) : (
                <Eye className="w-3.5 h-3.5" />
            )}
            {poi.is_active === false ? 'Brouillon' : 'Publié'}
        </button>
    </div>
);
