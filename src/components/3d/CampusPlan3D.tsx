'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  CameraPreset,
  CampusPlan3DProps,
  CampusSaveBackend,
  EditableFacilityItem,
  GizmoMode,
  PlanMode,
} from './types/campus3d.types';
import { DEFAULT_FACILITIES } from './data/defaultFacilities';
import { readLocalPlacements } from './campus-plan/placement-storage';
import { useCampusStudioShortcuts } from './campus-plan/useCampusStudioShortcuts';
import { useFacilityHistory } from './campus-plan/useFacilityHistory';
import { usePlacementPersist } from './campus-plan/usePlacementPersist';
import { useStudioTools } from './campus-plan/useStudioTools';
import { useCampusScene } from './engine/useCampusScene';
import { CampusViewerHUD } from './ui/CampusViewerHUD';
import { CampusEditorPanel } from './ui/CampusEditorPanel';
import { CampusStudioToolbar } from './ui/CampusStudioToolbar';
import { CampusJsonStudioModal } from './ui/CampusJsonStudioModal';

export type { PlanMode, CameraPreset, EditableFacilityItem, GizmoMode, CampusPlan3DProps };

/**
 * Plan 3D interactif du domaine CUC — façade de composition (`AGENTS.md` § 1).
 *
 * Version publique épurée : l'utilisateur explore le campus (vues caméra,
 * sélection d'installations, fiche d'information). L'outil d'édition de
 * placement (« studio ») reste réservé à l'équipe technique, via `?studio=1` ou
 * la prop `studio` (Cockpit) — jamais exposé à l'interface grand public.
 *
 * Délégations : placements et historique annulable dans `useFacilityHistory`,
 * persistance (Supabase `site_settings` key='campus_placements_3d' en Cockpit,
 * repli `localStorage` en public, écriture différée + sonde de diagnostic) dans
 * `usePlacementPersist`, raccourcis clavier dans `useCampusStudioShortcuts`,
 * outils JSON dans `useStudioTools`, scène Three.js dans `useCampusScene`.
 */
export const CampusPlan3D: React.FC<CampusPlan3DProps> = ({
  initialMode = 'satellite',
  className = '',
  studio,
  persistToDatabase = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /** Destination réelle des écritures : Supabase (Cockpit) ou navigateur. */
  const saveBackend: CampusSaveBackend = persistToDatabase ? 'database' : 'local';

  /**
   * Ambiance du plan. Fixe : le sélecteur d'ambiance (nocturne / solaire) a
   * été retiré de l'interface, `initialMode` ne sert donc plus qu'à choisir le
   * rendu par défaut d'un intégrateur.
   */
  const mode: PlanMode = initialMode;

  const [initialFacilities] = useState<Record<string, EditableFacilityItem>>(
    () => readLocalPlacements() ?? DEFAULT_FACILITIES
  );
  // Source de vérité synchrone partagée entre l'historique et la persistance.
  const facilitiesRef = useRef<Record<string, EditableFacilityItem>>(initialFacilities);

  const [selectedObjectId, setSelectedObjectId] = useState<string>('cuc-tower');
  // Le studio d'édition n'est accessible qu'aux techniciens via `?studio=1`
  // ou via la prop `studio` (Cockpit). Il n'apparaît jamais dans l'interface
  // publique.
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(() => {
    if (typeof studio === 'boolean') return studio;
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('studio') === '1';
  });
  const [snapGrid, setSnapGrid] = useState<number>(0.5);
  const [dragMode, setDragMode] = useState<'gizmo' | 'orbit'>('gizmo');
  const [gizmoMode, setGizmoMode] = useState<GizmoMode>('translate');
  const [isCardVisible, setIsCardVisible] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportModalTab, setExportModalTab] = useState<'export' | 'import'>('export');

  const persist = usePlacementPersist({ persistToDatabase, saveBackend, facilitiesRef });

  const history = useFacilityHistory({
    facilitiesRef,
    initialFacilities,
    schedulePersist: persist.schedulePersist,
  });

  const handleSelectObjectId = useCallback((id: string) => {
    setSelectedObjectId(id);
    setIsCardVisible(true);
  }, []);

  const { bearing, cameraDistance, focusFacility, handleReset } = useCampusScene({
    canvasRef,
    containerRef,
    facilities: history.facilities,
    selectedObjectId,
    isEditorOpen,
    snapGrid,
    dragMode,
    gizmoMode,
    mode,
    onUpdateFacility: history.updateFacility,
    onSelectObjectId: handleSelectObjectId,
    onGizmoModeChange: setGizmoMode,
  });

  const tools = useStudioTools({
    facilitiesRef,
    commitFacilities: history.commitFacilities,
    focusFacility,
    onSelectObjectId: setSelectedObjectId,
  });

  useCampusStudioShortcuts({
    isEditorOpen,
    selectedObjectId,
    facilitiesRef,
    updateFacility: history.updateFacility,
    focusFacility,
    undo: history.undo,
    redo: history.redo,
    setGizmoMode,
  });

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
    }
  }, []);

  const activeFacility = history.facilities[selectedObjectId] || null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[650px] lg:h-[750px] bg-[#050608] border border-zinc-800 overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 h-screen! w-screen! border-0' : ''
        } ${className}`}
    >
      {/* Barre de contrôle et fiche du bâtiment sélectionné */}
      <CampusViewerHUD
        onReset={handleReset}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        bearing={bearing}
        cameraDistance={cameraDistance}
        activeFacility={activeFacility}
        isCardVisible={isCardVisible}
        onCloseCard={() => setIsCardVisible(false)}
      />

      {/* Viewport WebGL */}
      <div className="relative flex-grow w-full h-full bg-black flex overflow-hidden">
        <div className="relative flex-grow w-full h-full cursor-grab active:cursor-grabbing">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Outil de manipulation accessible dans le viewport : la rotation
              reste trouvable même si le panneau latéral est hors champ. */}
          {isEditorOpen && (
            <CampusStudioToolbar
              gizmoMode={gizmoMode}
              onSetGizmoMode={setGizmoMode}
              canUndo={history.historyFlags.canUndo}
              canRedo={history.historyFlags.canRedo}
              onUndo={history.undo}
              onRedo={history.redo}
              saveStatus={persist.saveStatus}
              onSaveNow={persist.saveNow}
            />
          )}
        </div>

        {/* Studio de placement — techniciens uniquement (?studio=1) */}
        <CampusEditorPanel
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          facilities={history.facilities}
          selectedObjectId={selectedObjectId}
          onSelectObjectId={setSelectedObjectId}
          onFocusFacility={focusFacility}
          snapGrid={snapGrid}
          onSetSnapGrid={setSnapGrid}
          dragMode={dragMode}
          onSetDragMode={setDragMode}
          gizmoMode={gizmoMode}
          onSetGizmoMode={setGizmoMode}
          canUndo={history.historyFlags.canUndo}
          canRedo={history.historyFlags.canRedo}
          onUndo={history.undo}
          onRedo={history.redo}
          saveStatus={persist.saveStatus}
          onSaveNow={persist.saveNow}
          onUpdateFacility={history.updateFacility}
          onAddCustomMarker={tools.addCustomMarker}
          onCopyConfiguration={tools.copyConfiguration}
          copiedFeedback={tools.copiedFeedback}
          onDownloadJson={tools.downloadJsonFile}
          onOpenJsonStudio={(tab) => {
            setExportModalTab(tab);
            setShowExportModal(true);
          }}
          onResetToDefault={tools.resetToDefault}
        />
      </div>

      {/* JSON Import/Export Modal — techniciens uniquement */}
      <CampusJsonStudioModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        facilities={history.facilities}
        tab={exportModalTab}
        onSetTab={setExportModalTab}
        onApplyImport={tools.applyImportedJson}
        copiedFeedback={tools.copiedFeedback}
        onCopyConfiguration={tools.copyConfiguration}
        onDownloadJson={tools.downloadJsonFile}
      />
    </div>
  );
};

export default CampusPlan3D;
