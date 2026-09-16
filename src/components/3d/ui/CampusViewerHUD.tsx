'use client';

import React from 'react';
import {
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  Compass,
  Keyboard,
  EyeOff,
  Copy,
  Check,
  Code,
} from 'lucide-react';
import {
  PlanMode,
  CameraPreset,
  EditableFacilityItem,
} from '../types/campus3d.types';
import { PRESET_CONFIGS } from '../data/defaultFacilities';
import { FacilitySpotlightCard } from './FacilitySpotlightCard';

interface CampusViewerHUDProps {
  mode: PlanMode;
  onModeChange: (m: PlanMode) => void;
  activePreset: CameraPreset | null;
  onApplyPreset: (p: CameraPreset) => void;
  isEditorOpen: boolean;
  onToggleEditor: () => void;
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
  enableDirectTourJump?: boolean;
  onCopyConfiguration: () => void;
  copiedFeedback: boolean;
  onOpenJsonStudio: (tab: 'export' | 'import') => void;
}

export const CampusViewerHUD: React.FC<CampusViewerHUDProps> = ({
  mode,
  onModeChange,
  activePreset,
  onApplyPreset,
  isEditorOpen,
  onToggleEditor,
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
  enableDirectTourJump = true,
  onCopyConfiguration,
  copiedFeedback,
  onOpenJsonStudio,
}) => {
  const selectedItem = facilities[selectedObjectId];

  return (
    <>
      {/* Top Tactical Control HUD */}
      <div className="bg-[#0c0c12]/95 backdrop-blur-md border-b border-zinc-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none z-20">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-2.5 h-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#FFE500] opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFE500]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display uppercase tracking-wider text-sm text-white font-bold">
              PLAN 3D TACTIQUE // DOMAINE DE 6 HECTARES
            </span>
            <span className="text-[10px] font-mono-tech text-[#FFE500] hidden sm:inline">
              ORTHOPHOTO IGN RÉELLE • LE CATEAU-CAMBRÉSIS • 50.0909° N, 3.5374° E
            </span>
          </div>
        </div>

        {/* View Modes, Editor Mode & Fullscreen */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Editor Mode Toggle */}
          <button
            onClick={onToggleEditor}
            className={`px-3 py-1 text-xs font-mono-tech uppercase font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
              isEditorOpen
                ? 'bg-[#00e5ff] border-[#00e5ff] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                : 'bg-[#14141c] border-zinc-700 text-zinc-300 hover:border-[#00e5ff] hover:text-[#00e5ff]'
            }`}
            title="Activer le mode studio pour déplacer, pivoter, agrandir ou supprimer des objets 3D"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isEditorOpen ? 'ÉDITEUR ACTIF' : 'MODE ÉDITEUR 3D'}</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex bg-[#14141c] border border-zinc-800 p-0.5 text-[11px] font-mono-tech">
            <button
              onClick={() => onModeChange('satellite')}
              className={`px-2.5 py-1 cursor-pointer transition-colors ${
                mode === 'satellite' ? 'bg-[#FFE500] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Nocturne
            </button>
            <button
              onClick={() => onModeChange('blueprint')}
              className={`px-2.5 py-1 cursor-pointer transition-colors ${
                mode === 'blueprint' ? 'bg-[#00e5ff] text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Blueprint
            </button>
            <button
              onClick={() => onModeChange('daylight')}
              className={`px-2.5 py-1 cursor-pointer transition-colors ${
                mode === 'daylight' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Solaire
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-[#14141c] border border-zinc-800">
            <button
              onClick={() => onZoom('in')}
              className="p-1.5 text-zinc-300 hover:text-[#FFE500] cursor-pointer"
              title="Zoom avant"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onZoom('out')}
              className="p-1.5 text-zinc-300 hover:text-[#FFE500] cursor-pointer"
              title="Zoom arrière"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onReset}
              className="p-1.5 text-zinc-300 hover:text-[#FFE500] cursor-pointer"
              title="Réinitialiser vue"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 bg-[#14141c] border border-zinc-800 text-zinc-300 hover:text-[#FFE500] cursor-pointer"
            title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Camera Presets Bar */}
      <div className="bg-[#08090d]/90 backdrop-blur-xs border-b border-zinc-800/80 px-3 py-1.5 flex items-center justify-between text-[11px] font-mono-tech select-none z-20 overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-zinc-500 uppercase tracking-widest text-[9px] mr-1 hidden sm:inline">VUES :</span>
          {(Object.keys(PRESET_CONFIGS) as CameraPreset[]).map((presetKey) => {
            const preset = PRESET_CONFIGS[presetKey];
            const isActive = activePreset === presetKey;
            return (
              <button
                key={presetKey}
                onClick={() => onApplyPreset(presetKey)}
                className={`px-2 py-0.5 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#FFE500] border-[#FFE500] text-black font-bold shadow-[0_0_10px_rgba(255,229,0,0.3)]'
                    : 'bg-[#10121a] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {isEditorOpen && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onCopyConfiguration}
              className="px-3 py-1 bg-[#FFE500] hover:bg-white text-black font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(255,229,0,0.4)] cursor-pointer"
            >
              {copiedFeedback ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3 text-black" />}
              <span>{copiedFeedback ? 'CONFIG COPIÉE !' : 'COPIER CONFIG JSON'}</span>
            </button>
            <button
              onClick={() => onOpenJsonStudio('export')}
              className="px-2.5 py-1 bg-[#14141c] hover:bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center gap-1 cursor-pointer"
              title="Inspecter, exporter ou importer le JSON"
            >
              <Code className="w-3 h-3 text-[#00e5ff]" />
              <span>JSON Studio</span>
            </button>
          </div>
        )}
      </div>

      {/* Viewport Floating Elements (Rendered above WebGL canvas) */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {/* Live Telemetry / Bearing Compass */}
        <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-xs border border-zinc-800 p-2.5 text-[10px] font-mono-tech text-zinc-400 space-y-1 hidden sm:block">
          <div className="flex items-center gap-2 text-white font-bold">
            <Compass className="w-3.5 h-3.5 text-[#FFE500]" />
            <span>CAP // {bearing.toString().padStart(3, '0')}°</span>
          </div>
          <div>DIST // {cameraDistance} MÈTRES</div>
          <div className="text-[#FFE500]">CADASTRE RÉEL // 50.0909°N, 3.5374°E</div>
        </div>

        {/* Top-Right Instructions Overlay */}
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-xs border border-zinc-800/80 px-3 py-1.5 text-[10px] font-mono-tech text-zinc-400 hidden lg:block">
          {isEditorOpen ? (
            <span className="text-[#00e5ff] font-bold">
              MODE ÉDITEUR : Utilisez le Gizmo 3D (Flèche X rouge, Z bleue, Cercle Y jaune) ou les touches Flèches
            </span>
          ) : (
            <span>
              <strong className="text-white">CONTRÔLE 3D :</strong> Glisser pour pivoter • Molette pour zoomer • Cliquer pour cibler
            </span>
          )}
        </div>

        {/* Real-time 3D Coordinates Floating Badge */}
        {isEditorOpen && selectedItem && (
          <div className="pointer-events-auto absolute bottom-4 left-4 z-20 flex flex-col gap-1.5 max-w-xl">
            <div className="bg-[#0b0d14]/95 backdrop-blur-md border border-[#00e5ff] px-3.5 py-2 shadow-[0_0_20px_rgba(0,229,255,0.25)] flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-pulse" />
              <div className="text-xs font-mono-tech">
                <span className="text-white font-bold uppercase mr-2">[{selectedItem.code}] {selectedItem.name}</span>
                <span className="text-[#ff3366] font-bold mr-2.5">X: {selectedItem.x}m</span>
                <span className="text-[#00aaff] font-bold mr-2.5">Z: {selectedItem.z}m</span>
                <span className="text-[#FFE500] font-bold mr-2.5">ROT: {selectedItem.rotationY}°</span>
                <span className="text-zinc-300">ÉCHELLE: {selectedItem.scale}x</span>
              </div>
            </div>

            <div className="bg-black/85 backdrop-blur-xs border border-zinc-800 px-3 py-1.5 text-[10px] font-mono-tech text-zinc-400 flex items-center gap-3 flex-wrap">
              <Keyboard className="w-3.5 h-3.5 text-[#FFE500] shrink-0" />
              <span><strong className="text-white">Flèches :</strong> Déplacer (Shift: ×5, Alt: fin)</span>
              <span><strong className="text-white">R :</strong> Tourner (45°)</span>
              <span><strong className="text-white">F :</strong> Cadrer</span>
              <span><strong className="text-white">+/- :</strong> Échelle</span>
            </div>
          </div>
        )}

        {/* Active Facility Spotlight Card */}
        {!isEditorOpen && (
          <FacilitySpotlightCard
            activeFacility={activeFacility}
            isVisible={isCardVisible}
            onClose={onCloseCard}
            enableDirectTourJump={enableDirectTourJump}
          />
        )}
      </div>

      {/* Bottom Horizontal Quick-Select Carousel */}
      <div className="bg-[#0b0b10] border-t border-zinc-800 p-2 sm:p-3 overflow-x-auto select-none z-20">
        <div className="flex items-center gap-2 min-w-max">
          {Object.values(facilities).map((fac) => {
            const isSelected = fac.id === selectedObjectId;
            return (
              <button
                key={fac.id}
                onClick={() => onFocusFacility(fac.id)}
                className={`px-3 py-2 text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-[#181824] border-[#FFE500] text-white shadow-[0_0_12px_rgba(255,229,0,0.3)] scale-[1.02]'
                    : 'bg-[#101016] border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <span
                  className={`text-[9px] font-mono-tech px-1.5 py-0.5 font-bold ${
                    isSelected ? 'bg-[#FFE500] text-black' : 'bg-zinc-800 text-zinc-400'
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
