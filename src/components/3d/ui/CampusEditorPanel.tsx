'use client';

import React from 'react';
import { Sliders, X } from 'lucide-react';
import { CampusSaveStatus, EditableFacilityItem, GizmoMode } from '../types/campus3d.types';
import { EditorCoordinateInputs } from './EditorCoordinateInputs';
import { GizmoToolBar } from './editor-panel/GizmoToolBar';
import { PanelSaveStatus } from './editor-panel/PanelSaveStatus';
import { ObjectSelector } from './editor-panel/ObjectSelector';
import { SnapAndDragControls } from './editor-panel/SnapAndDragControls';
import { VisibilityActions } from './editor-panel/VisibilityActions';
import { ExportActions } from './editor-panel/ExportActions';
import { StudioShortcutsHelp } from './editor-panel/StudioShortcutsHelp';

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
  gizmoMode: GizmoMode;
  onSetGizmoMode: (mode: GizmoMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  saveStatus: CampusSaveStatus;
  onSaveNow: () => void;
  onUpdateFacility: (id: string, updates: Partial<EditableFacilityItem>) => void;
  onAddCustomMarker: () => void;
  onCopyConfiguration: () => void;
  copiedFeedback: boolean;
  onDownloadJson: () => void;
  onOpenJsonStudio: (tab: 'export' | 'import') => void;
  onResetToDefault: () => void;
}

/**
 * Panneau du Studio 3D (placement) — façade de composition.
 *
 * Chaque groupe de contrôles vit dans `editor-panel/**` ; ce panneau assemble
 * l'outil gizmo, la persistance, le sélecteur d'objet, l'aimantation, les
 * coordonnées, la visibilité et l'export.
 */
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
  gizmoMode,
  onSetGizmoMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  saveStatus,
  onSaveNow,
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
        {/* Outil de manipulation actif + historique */}
        <GizmoToolBar
          gizmoMode={gizmoMode}
          onSetGizmoMode={onSetGizmoMode}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
        />

        {/* Persistance : état réel de l'écriture, message d'erreur compris */}
        <PanelSaveStatus saveStatus={saveStatus} onSaveNow={onSaveNow} />

        {/* Object Selector & Quick Focus */}
        <ObjectSelector
          facilities={facilities}
          selectedObjectId={selectedObjectId}
          onSelectObjectId={onSelectObjectId}
          onFocusFacility={onFocusFacility}
        />

        {/* Grid Snap & Mode Controls */}
        <SnapAndDragControls
          snapGrid={snapGrid}
          onSetSnapGrid={onSetSnapGrid}
          dragMode={dragMode}
          onSetDragMode={onSetDragMode}
        />

        {/* Position, Orientation, Scale Controls */}
        <EditorCoordinateInputs
          selectedObjectId={selectedObjectId}
          selectedItem={selectedItem}
          onUpdateFacility={onUpdateFacility}
        />

        {/* Visibility & Custom Marker */}
        <VisibilityActions
          selectedItem={selectedItem}
          onToggleVisible={() =>
            onUpdateFacility(selectedObjectId, { visible: !selectedItem.visible })
          }
          onAddCustomMarker={onAddCustomMarker}
        />

        {/* Export & Reset Actions */}
        <ExportActions
          onCopyConfiguration={onCopyConfiguration}
          copiedFeedback={copiedFeedback}
          onDownloadJson={onDownloadJson}
          onOpenJsonStudio={onOpenJsonStudio}
          onResetToDefault={onResetToDefault}
        />

        {/* Aide contextuelle sobre : gestes et raccourcis réellement disponibles */}
        <StudioShortcutsHelp />
      </div>
    </aside>
  );
};
