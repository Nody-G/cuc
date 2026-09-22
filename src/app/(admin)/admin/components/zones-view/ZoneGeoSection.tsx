import React from 'react';
import { POI } from '@/components/ui/campus-map/campusMap.data';

export interface ZoneGeoSectionProps {
    poi: POI;
    onChange: (patch: Partial<POI>) => void;
}

const fieldClass =
    'w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-cuc-gold';

export const ZoneGeoSection: React.FC<ZoneGeoSectionProps> = ({ poi, onChange }) => (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Ordre d'affichage
            </label>
            <input
                type="number"
                min={0}
                value={poi.order_index ?? 0}
                onChange={(e) => onChange({ order_index: Number(e.target.value) })}
                className={fieldClass}
            />
        </div>
        <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Coordonnées GPS
            </label>
            <input
                type="text"
                value={poi.coordinates}
                onChange={(e) => onChange({ coordinates: e.target.value })}
                placeholder="50.0912° N, 3.5380° E"
                className={fieldClass}
            />
        </div>
        <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Position Radar X (%)
            </label>
            <input
                type="number"
                min={0}
                max={100}
                value={poi.xPercent}
                onChange={(e) => onChange({ xPercent: Number(e.target.value) })}
                className={fieldClass}
            />
        </div>
        <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Position Radar Y (%)
            </label>
            <input
                type="number"
                min={0}
                max={100}
                value={poi.yPercent}
                onChange={(e) => onChange({ yPercent: Number(e.target.value) })}
                className={fieldClass}
            />
        </div>
    </div>
);
