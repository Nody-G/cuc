'use client';

import React from 'react';
import { Boxes, Compass } from 'lucide-react';
import type { POI } from '@/components/ui/campus-map/campusMap.data';
import type { Discipline } from '@/types';
import { CampusPlan3DView } from './CampusPlan3DView';
import { CampusZonesView } from './CampusZonesView';

interface CampusManagerViewProps {
  activeSubTab?: '3d' | 'zones';
  campusPOIs: POI[];
  setCampusPOIs: React.Dispatch<React.SetStateAction<POI[]>>;
  disciplines: Discipline[];
  showToast: (msg: string) => void;
  onSubTabChange?: (sub: '3d' | 'zones') => void;
}

/**
 * Vue unifiée Campus & Installations du Cockpit (`AGENTS.md` § 1).
 *
 * Regroupe sous un même pôle ergonomique :
 *  1. Le studio de placement 3D du campus (`CampusPlan3DView`)
 *  2. L'inventaire des bâtiments & zones POI d'entraînement (`CampusZonesView`)
 */
export const CampusManagerView: React.FC<CampusManagerViewProps> = ({
  activeSubTab = '3d',
  campusPOIs,
  setCampusPOIs,
  disciplines,
  showToast,
  onSubTabChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Sélecteur de sous-vue unifiée du Campus */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => onSubTabChange?.('3d')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === '3d'
              ? 'bg-[#FFE500] text-black shadow-md shadow-yellow-500/10'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Plan 3D Interactif
        </button>
        <button
          type="button"
          onClick={() => onSubTabChange?.('zones')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeSubTab === 'zones'
              ? 'bg-[#FFE500] text-black shadow-md shadow-yellow-500/10'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          }`}
        >
          <Compass className="w-4 h-4" />
          Bâtiments &amp; Zones POI ({campusPOIs.length})
        </button>
      </div>

      {activeSubTab === '3d' ? (
        <CampusPlan3DView />
      ) : (
        <CampusZonesView
          campusPOIs={campusPOIs}
          setCampusPOIs={setCampusPOIs}
          disciplines={disciplines}
          showToast={showToast}
        />
      )}
    </div>
  );
};
