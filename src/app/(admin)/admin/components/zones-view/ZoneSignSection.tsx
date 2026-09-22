import React from 'react';
import { POI } from '@/components/ui/campus-map/campusMap.data';
import { CUC_SIGN_LOCATIONS } from './zone-form';

export interface ZoneSignSectionProps {
    poi: POI;
    onChange: (patch: Partial<POI>) => void;
}

export const ZoneSignSection: React.FC<ZoneSignSectionProps> = ({ poi, onChange }) => (
    <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-zinc-300">
                Lieu CUC Sign associé (Base Supabase &Eacute;margement) :
            </label>
            {poi.location_id && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    Lieu Lié
                </span>
            )}
        </div>
        <select
            value={poi.location_id || ''}
            onChange={(e) => onChange({ location_id: e.target.value || undefined })}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-cuc-gold"
        >
            <option value="">-- Aucun lieu CUC Sign lié --</option>
            {CUC_SIGN_LOCATIONS.map((location) => (
                <option key={location.id} value={location.id}>
                    {location.label}
                </option>
            ))}
        </select>
        <p className="text-[11px] text-zinc-500 font-mono">
            Permet à CUC Sign de rattacher les plannings et l'émargement sur ce spot précis du campus.
        </p>
    </div>
);
