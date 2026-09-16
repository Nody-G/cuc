'use client';

import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  Compass,
  EyeOff,
  Layers,
  Map,
} from 'lucide-react';
import {
  PlanMode,
  CameraPreset,
  EditableFacilityItem,
} from '../types/campus3d.types';
import { FacilitySpotlightCard } from './FacilitySpotlightCard';

interface CampusViewerHUDProps {
  mode: PlanMode;
  onModeChange: (m: PlanMode) => void;
  activePreset: CameraPreset | null;
  onApplyPreset: (p: CameraPreset) => void;
  onZoom: (dir: 'in' | 'out') => void;
  onReset: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  bearing: number;
  cameraDistance: number;
  facilities: Record<string, EditableFacilityItem>;
  selectedObjectId: string;
  onFocusFacility: (id: string) => void;
  activeFacility: EditableFacilityItem | null;
  isCardVisible: boolean;
  onCloseCard: () => void;
}

/**
 * HUD public du plan 3D — volontairement épuré.
 *
 * Principes de conception :
 *  - Une seule barre de contrôle supérieure (vues caméra + zoom + plein écran).
 *  - Un seul sélecteur d'installation : le carrousel inférieur (source unique de vérité).
 *  - Une seule fiche d'information contextuelle (FacilitySpotlightCard).
 *  - Aucune télémesure dupliquée, aucune surcharge d'instructions.
 *  - L'outil d'édition (studio de placement) n'est pas exposé au grand public.
 */
export const CampusViewerHUD: React.FC<CampusViewerHUDProps> = ({
  mode,
  onModeChange,
  activePreset,
  onApplyPreset,
  onZoom,
  onReset,
  isFullscreen,
  onToggleFullscreen,
  bearing,
  cameraDistance,
  facilities,
  selectedObjectId,
  onFocusFacility,
  activeFacility,
  isCardVisible,
  onCloseCard,
}) => {
  // Deux vues caméra essentielles uniquement : le reste est redondant avec le
  // carrousel d'installations qui cadre déjà chaque bâtiment.
  const cameraViews: { key: CameraPreset; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Vue globale', icon: <Layers className="w-3.5 h-3.5" /> },
    { key: 'zenith', label: 'Plan 2D', icon: <Map className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      {/* Barre de contrôle unique */}
      <div className="bg-[#0c0c12]/95 backdrop-blur-md border-b border-zinc-800 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 select-none z-20">
        {/* Identité + télémesure compacte */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex items-center justify-center w-2.5 h-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#FFE500] opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFE500]" />
          </span>
          <span className="font-display uppercase tracking-wider text-sm text-white font-bold truncate">
            Plan 3D du domaine
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono-tech text-zinc-500">
            <Compass className="w-3 h-3 text-[#FFE500]" />
            <span>{bearing.toString().padStart(3, '0')}°</span>
            <span className="text-zinc-700">•</span>
            <span>{cameraDistance} m</span>
          </span>
        </div>

        {/* Contrôles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Vues caméra */}
          <div className="flex bg-[#14141c] border border-zinc-800 p-0.5 text-[11px] font-mono-tech">
            {cameraViews.map((view) => (
              <button
                key={view.key}
                type="button"
                onClick={() => onApplyPreset(view.key)}
                aria-pressed={activePreset === view.key}
                className={`px-2.5 py-1 cursor-pointer transition-colors flex items-center gap-1.5 ${activePreset === view.key
                  ? 'bg-[#FFE500] text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
                  }`}
              >
                {view.icon}
                <span className="hidden sm:inline">{view.label}</span>
              </button>
            ))}
          </div>

          {/* Ambiance */}
          <div className="flex bg-[#14141c] border border-zinc-800 p-0.5 text-[11px] font-mono-tech">
            <button
              type="button"
              onClick={() => onModeChange('satellite')}
              aria-pressed={mode === 'satellite'}
              className={`px-2.5 py-1 cursor-pointer transition-colors ${mode === 'satellite' ? 'bg-[#FFE500] text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
            >
              Nocturne
            </button>
            <button
              type="button"
              onClick={() => onModeChange('daylight')}
              aria-pressed={mode === 'daylight'}
              className={`px-2.5 py-1 cursor-pointer transition-colors ${mode === 'daylight' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
            >
              Solaire
            </button>
          </div>

          {/* Zoom + reset */}
          <div className="hidden sm:flex items-center bg-[#14141c] border border-zinc-800">
            <button
              type="button"
              onClick={() => onZoom('in')}
              className="p-1.5 text-zinc-300 hover:text-[#FFE500] cursor-pointer"
              aria-label="Zoom avant"
              title="Zoom avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onZoom('out')}
              className="p-1.5 text-zinc-300 hover:text-[#FFE500] cursor-pointer"
              aria-label="Zoom arrière"
              title="Zoom arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 text-zinc-300 hover:text-[#FFE500] cursor-pointer"
              aria-label="Réinitialiser la vue"
              title="Réinitialiser la vue"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Plein écran */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-1.5 bg-[#14141c] border border-zinc-800 text-zinc-300 hover:text-[#FFE500] cursor-pointer"
            aria-label={isFullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
            title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Aide contextuelle unique, discrète */}
      <div className="pointer-events-none absolute top-3 right-3 z-10 hidden lg:block">
        <span className="bg-black/70 backdrop-blur-xs border border-zinc-800/80 px-2.5 py-1 text-[10px] font-mono-tech text-zinc-400">
          Glisser pour pivoter • Molette pour zoomer • Cliquer un bâtiment
        </span>
      </div>

      {/* Fiche d'information de l'installation sélectionnée */}
      <FacilitySpotlightCard
        activeFacility={activeFacility}
        isVisible={isCardVisible}
        onClose={onCloseCard}
      />

      {/* Sélecteur unique d'installations */}
      <div className="bg-[#0b0b10] border-t border-zinc-800 p-2 sm:p-3 overflow-x-auto select-none z-20">
        <div className="flex items-center gap-2 min-w-max">
          {Object.values(facilities).map((fac) => {
            const isSelected = fac.id === selectedObjectId;
            return (
              <button
                key={fac.id}
                type="button"
                onClick={() => onFocusFacility(fac.id)}
                aria-pressed={isSelected}
                className={`px-3 py-2 text-left border transition-all cursor-pointer flex items-center gap-2.5 ${isSelected
                  ? 'bg-[#181824] border-[#FFE500] text-white shadow-[0_0_12px_rgba(255,229,0,0.3)]'
                  : 'bg-[#101016] border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
              >
                <span
                  className={`text-[9px] font-mono-tech px-1.5 py-0.5 font-bold ${isSelected ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}
                >
                  {fac.code}
                </span>
                <span className="font-display uppercase text-xs tracking-wider text-white whitespace-nowrap">
                  {fac.name.split('—')[0].split('(')[0]}
                </span>
                {!fac.visible && <EyeOff className="w-3 h-3 text-red-400 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
