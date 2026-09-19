'use client';

import React from 'react';
import {
  Sliders,
  X,
  Target,
  Eye,
  EyeOff,
  Plus,
  Copy,
  Check,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';
import { EditableFacilityItem } from '../types/campus3d.types';
import { EditorCoordinateInputs } from './EditorCoordinateInputs';

interface CampusEditorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: Record<string, EditableFacilityItem>;
  selectedObjectId: string;
  onSelectObjectId: (id: string) => void;
  onFocusFacility: (id: string) => void;
  snapGrid: number;
  onSetSnapGrid: (snap: number) => void;
  dragMode: 'gizmo' | 'orbit';
  onSetDragMode: (mode: 'gizmo' | 'orbit') => void;
  onUpdateFacility: (id: string, updates: Partial<EditableFacilityItem>) => void;
  onAddCustomMarker: () => void;
  onCopyConfiguration: () => void;
  copiedFeedback: boolean;
  onDownloadJson: () => void;
  onOpenJsonStudio: (tab: 'export' | 'import') => void;
  onResetToDefault: () => void;
}

export const CampusEditorPanel: React.FC<CampusEditorPanelProps> = ({
  isOpen,
  onClose,
  facilities,
  selectedObjectId,
  onSelectObjectId,
  onFocusFacility,
  snapGrid,
  onSetSnapGrid,
  dragMode,
  onSetDragMode,
  onUpdateFacility,
  onAddCustomMarker,
  onCopyConfiguration,
  copiedFeedback,
  onDownloadJson,
  onOpenJsonStudio,
  onResetToDefault,
}) => {
  if (!isOpen) return null;

  const selectedItem = facilities[selectedObjectId];
  if (!selectedItem) return null;

  return (
    <aside className="w-full sm:w-92 md:w-96 bg-[#0a0b10]/95 backdrop-blur-md border-l border-zinc-800 flex flex-col z-30 shadow-2xl overflow-y-auto shrink-0">
      {/* Editor Header */}
      <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-[#10121a]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#00e5ff]" />
          <span className="font-display uppercase text-sm font-bold text-white tracking-wider">
            STUDIO 3D • PLACEMENT
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-white cursor-pointer"
          title="Fermer le mode éditeur"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 text-xs font-mono-tech text-zinc-300">
        {/* Object Selector & Quick Focus */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
              OBJET SÉLECTIONNÉ :
            </label>
            <button
              onClick={() => onFocusFacility(selectedObjectId)}
              className="text-[10px] text-[#00e5ff] hover:underline flex items-center gap-1 cursor-pointer"
              title="Cadrer la caméra sur cet objet"
            >
              <Target className="w-3 h-3" />
              <span>Cadrer</span>
            </button>
          </div>
          <select
            value={selectedObjectId}
            onChange={(e) => {
              onSelectObjectId(e.target.value);
              onFocusFacility(e.target.value);
            }}
            className="w-full bg-[#14141c] border border-zinc-700 p-2 text-xs text-white focus:border-[#00e5ff] focus:outline-none"
          >
            {Object.values(facilities).map((item) => (
              <option key={item.id} value={item.id}>
                [{item.code}] {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Grid Snap & Mode Controls */}
        <div className="grid grid-cols-2 gap-2 bg-[#12131b] border border-zinc-800 p-2.5">
          <div>
            <div className="text-[9px] text-zinc-400 uppercase font-bold mb-1">AIMANTATION GRILLE :</div>
            <div className="flex border border-zinc-700 bg-black">
              {[0.1, 0.5, 1.0, 5.0].map((stepVal) => (
                <button
                  key={stepVal}
                  onClick={() => onSetSnapGrid(stepVal)}
                  className={`flex-1 py-1 text-[10px] cursor-pointer transition-colors ${
                    snapGrid === stepVal
                      ? 'bg-[#00e5ff] text-black font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {stepVal}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[9px] text-zinc-400 uppercase font-bold mb-1">CLIC GAUCHE SOURIS :</div>
            <div className="flex border border-zinc-700 bg-black">
              <button
                onClick={() => onSetDragMode('gizmo')}
                className={`flex-1 py-1 text-[10px] cursor-pointer transition-colors ${
                  dragMode === 'gizmo'
                    ? 'bg-[#FFE500] text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Manipuler via les flèches du Gizmo"
              >
                Gizmo 3D
              </button>
              <button
                onClick={() => onSetDragMode('orbit')}
                className={`flex-1 py-1 text-[10px] cursor-pointer transition-colors ${
                  dragMode === 'orbit'
                    ? 'bg-[#FFE500] text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Pivoter la vue"
              >
                Caméra
              </button>
            </div>
          </div>
        </div>

        {/* Position, Orientation, Scale Controls */}
        <EditorCoordinateInputs
          selectedObjectId={selectedObjectId}
          selectedItem={selectedItem}
          onUpdateFacility={onUpdateFacility}
        />

        {/* Visibility & Custom Marker */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateFacility(selectedObjectId, { visible: !selectedItem.visible })}
            className={`flex-1 py-2 px-3 border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              selectedItem.visible
                ? 'bg-[#161822] border-zinc-700 text-zinc-300 hover:text-white'
                : 'bg-red-950/40 border-red-800 text-red-400'
            }`}
          >
            {selectedItem.visible ? <Eye className="w-3.5 h-3.5 text-[#00e5ff]" /> : <EyeOff className="w-3.5 h-3.5 text-red-400" />}
            <span>{selectedItem.visible ? 'Masquer' : 'Afficher'}</span>
          </button>

          <button
            onClick={onAddCustomMarker}
            className="py-2 px-3 bg-[#161822] border border-zinc-700 hover:border-[#00e5ff] text-zinc-200 text-xs flex items-center gap-1 cursor-pointer"
            title="Ajouter un nouveau repère ou zone personnalisée"
          >
            <Plus className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span>Ajouter</span>
          </button>
        </div>

        {/* Export & Reset Actions */}
        <div className="pt-2 border-t border-zinc-800 space-y-2">
          <button
            onClick={onCopyConfiguration}
            className="w-full py-3 bg-[#FFE500] hover:bg-white text-black font-display uppercase tracking-wider text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,229,0,0.35)] cursor-pointer"
          >
            {copiedFeedback ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
            <span>{copiedFeedback ? 'COPIÉ DANS LE PRESSE-PAPIER !' : 'COPIER LES POSITIONS (JSON)'}</span>
          </button>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={onDownloadJson}
              className="py-1.5 bg-[#14141c] hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] flex items-center justify-center gap-1 cursor-pointer"
              title="Télécharger fichier JSON"
            >
              <Download className="w-3 h-3 text-[#00e5ff]" />
              <span>Télécharger</span>
            </button>

            <button
              onClick={() => onOpenJsonStudio('import')}
              className="py-1.5 bg-[#14141c] hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] flex items-center justify-center gap-1 cursor-pointer"
              title="Coller un JSON existant"
            >
              <Upload className="w-3 h-3 text-[#FFE500]" />
              <span>Importer</span>
            </button>

            <button
              onClick={onResetToDefault}
              className="py-1.5 bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-800/80 text-[10px] flex items-center justify-center gap-1 cursor-pointer"
              title="Réinitialiser toutes les positions"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
