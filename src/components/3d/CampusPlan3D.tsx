'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { soundFX } from '@/lib/soundFx';
import {
  PlanMode,
  CameraPreset,
  EditableFacilityItem,
  GizmoMode,
  CampusPlan3DProps,
} from './types/campus3d.types';
import { DEFAULT_FACILITIES } from './data/defaultFacilities';
import {
  clampPosition,
  clampScale,
  normalizeAngle360,
  normalizeFacilityItem,
  normalizeFacilityRecord,
} from './data/facilityTransform';
import { useCampusScene } from './engine/useCampusScene';
import { CampusViewerHUD } from './ui/CampusViewerHUD';
import { CampusEditorPanel } from './ui/CampusEditorPanel';
import { CampusJsonStudioModal } from './ui/CampusJsonStudioModal';
import { getCampusPlacements3D } from '@/lib/data/site-service';
import { upsertCampusPlacements3D } from '@/app/admin/actions';

export type { PlanMode, CameraPreset, EditableFacilityItem, GizmoMode, CampusPlan3DProps };

/** Délai d'écriture différée de la persistance (moyenne les saisies continues). */
const SAVE_DEBOUNCE_MS = 400;

/**
 * Fenêtre de fusion de l'historique : deux modifications du **même champ** sur
 * la **même installation** dans cet intervalle forment une seule étape
 * annulable. Sans cette fusion, glisser un curseur produirait des dizaines
 * d'entrées d'historique et « Annuler » deviendrait inutilisable.
 */
const HISTORY_COALESCE_MS = 700;

/** Profondeur maximale de l'historique (au-delà, les plus anciennes sont perdues). */
const HISTORY_LIMIT = 60;

interface HistoryStore {
  past: Array<Record<string, EditableFacilityItem>>;
  future: Array<Record<string, EditableFacilityItem>>;
  lastKey: string;
  lastAt: number;
}

/**
 * Plan 3D interactif du domaine CUC.
 *
 * Version publique épurée : l'utilisateur explore le campus (vues caméra,
 * ambiances, sélection d'installations, fiche d'information). L'outil
 * d'édition de placement (« studio ») reste disponible uniquement pour
 * l'équipe technique, via le paramètre d'URL `?studio=1` ou la prop `studio`
 * (Cockpit) — il n'est jamais exposé dans l'interface grand public.
 *
 * Le studio permet de **déplacer** (X / Z), **tourner** (lacet autour de l'axe
 * vertical) et **redimensionner** (largeur X, hauteur Y, profondeur Z, avec
 * verrou d'échelle uniforme) chaque bâtiment, au gizmo ou en saisie numérique,
 * avec annulation / rétablissement.
 *
 * Persistance : par défaut le studio écrit dans le `localStorage` du
 * navigateur. Lorsque `persistToDatabase` est activé (Cockpit), les
 * placements sont enregistrés dans Supabase (`site_settings`
 * key='campus_placements_3d') et rechargés au montage, ce qui garantit une
 * source de vérité partagée entre le Cockpit et la page publique.
 */
export const CampusPlan3D: React.FC<CampusPlan3DProps> = ({
  initialMode = 'satellite',
  className = '',
  studio,
  persistToDatabase = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mode, setMode] = useState<PlanMode>(initialMode);
  const [facilities, setFacilities] = useState<Record<string, EditableFacilityItem>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cuc_campus_placements_v2');
      if (saved) {
        try {
          // Migration transparente des placements v1 (`scale` / `heightScale`).
          return normalizeFacilityRecord(JSON.parse(saved), DEFAULT_FACILITIES);
        } catch {
          // Fallback to default
        }
      }
    }
    return DEFAULT_FACILITIES;
  });

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
  const [copiedFeedback, setCopiedFeedback] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportModalTab, setExportModalTab] = useState<'export' | 'import'>('export');
  const [historyFlags, setHistoryFlags] = useState({ canUndo: false, canRedo: false });
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Source de vérité synchrone pour les mutations et l'historique : évite
  // toute écriture d'effet de bord à l'intérieur d'un updater React (double
  // invocation en mode strict = entrées d'historique dupliquées).
  const facilitiesRef = useRef(facilities);
  const historyRef = useRef<HistoryStore>({ past: [], future: [], lastKey: '', lastAt: 0 });

  useEffect(() => {
    facilitiesRef.current = facilities;
  }, [facilities]);

  // Clean up pending save timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const syncHistoryFlags = useCallback(() => {
    const history = historyRef.current;
    setHistoryFlags({ canUndo: history.past.length > 0, canRedo: history.future.length > 0 });
  }, []);

  /**
   * Écriture différée : `localStorage` en mode public, Supabase en mode
   * Cockpit (`site_settings` key='campus_placements_3d').
   */
  const schedulePersist = useCallback(
    (next: Record<string, EditableFacilityItem>) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        if (persistToDatabase) {
          upsertCampusPlacements3D(next).catch(() => {
            // Silencieux : l'état local reste la source immédiate.
          });
        } else {
          try {
            localStorage.setItem('cuc_campus_placements_v2', JSON.stringify(next));
          } catch {
            // LocalStorage quota or privacy mode
          }
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [persistToDatabase]
  );

  const pushHistory = useCallback(
    (snapshot: Record<string, EditableFacilityItem>, key: string) => {
      const history = historyRef.current;
      const now = Date.now();
      const coalesced =
        history.lastKey === key &&
        history.past.length > 0 &&
        now - history.lastAt < HISTORY_COALESCE_MS;

      if (!coalesced) {
        history.past.push(snapshot);
        if (history.past.length > HISTORY_LIMIT) history.past.shift();
      }
      history.future = [];
      history.lastKey = key;
      history.lastAt = now;
      syncHistoryFlags();
    },
    [syncHistoryFlags]
  );

  /** Applique un nouvel état complet, en l'inscrivant dans l'historique. */
  const commitFacilities = useCallback(
    (next: Record<string, EditableFacilityItem>, key: string) => {
      pushHistory(facilitiesRef.current, key);
      facilitiesRef.current = next;
      setFacilities(next);
      schedulePersist(next);
    },
    [pushHistory, schedulePersist]
  );

  // Chargement initial depuis Supabase (Cockpit uniquement).
  // Priorité : placements enregistrés en base > placements locaux > défauts
  // calibrés sur les empreintes OSM réelles.
  useEffect(() => {
    if (!persistToDatabase) return;
    let cancelled = false;

    getCampusPlacements3D()
      .then((placements) => {
        if (cancelled || !placements) return;
        const merged = normalizeFacilityRecord(placements, DEFAULT_FACILITIES);
        facilitiesRef.current = merged;
        setFacilities(merged);
      })
      .catch(() => {
        // Silencieux : on conserve les placements locaux/défauts.
      });

    return () => {
      cancelled = true;
    };
  }, [persistToDatabase]);

  /**
   * Mutation d'une installation avec persistance différée et inscription dans
   * l'historique. Toute valeur est normalisée (bornes, axes manquants, champs
   * hérités) avant d'entrer dans l'état.
   */
  const updateFacility = useCallback(
    (id: string, updates: Partial<EditableFacilityItem>) => {
      const current = facilitiesRef.current[id] ?? DEFAULT_FACILITIES[id];
      if (!current) return;

      const normalized = normalizeFacilityItem(id, { ...current, ...updates }, current);
      const next = { ...facilitiesRef.current, [id]: normalized };
      const historyKey = `${id}:${Object.keys(updates).sort().join(',')}`;
      commitFacilities(next, historyKey);
    },
    [commitFacilities]
  );

  const undo = useCallback(() => {
    const history = historyRef.current;
    const previous = history.past.pop();
    if (!previous) return;

    history.future.push(facilitiesRef.current);
    history.lastKey = '';
    facilitiesRef.current = previous;
    setFacilities(previous);
    schedulePersist(previous);
    syncHistoryFlags();
    soundFX.playTacticalClick();
  }, [schedulePersist, syncHistoryFlags]);

  const redo = useCallback(() => {
    const history = historyRef.current;
    const next = history.future.pop();
    if (!next) return;

    history.past.push(facilitiesRef.current);
    history.lastKey = '';
    facilitiesRef.current = next;
    setFacilities(next);
    schedulePersist(next);
    syncHistoryFlags();
    soundFX.playTacticalClick();
  }, [schedulePersist, syncHistoryFlags]);

  const handleSelectObjectId = useCallback((id: string) => {
    setSelectedObjectId(id);
    setIsCardVisible(true);
  }, []);

  // Use Scene Hook
  const {
    bearing,
    cameraDistance,
    activePreset,
    focusFacility,
    applyPreset,
    handleZoom,
    handleReset,
  } = useCampusScene({
    canvasRef,
    containerRef,
    facilities,
    selectedObjectId,
    isEditorOpen,
    snapGrid,
    dragMode,
    gizmoMode,
    mode,
    onUpdateFacility: updateFacility,
    onSelectObjectId: handleSelectObjectId,
  });

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => { });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => { });
    }
  }, []);

  // Copy JSON configuration to clipboard
  const copyConfiguration = useCallback(() => {
    const jsonStr = JSON.stringify(facilitiesRef.current, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedFeedback(true);
      soundFX.playTacticalClick();
      setTimeout(() => setCopiedFeedback(false), 2500);
    }).catch(() => { });
  }, []);

  // Download JSON configuration file
  const downloadJsonFile = useCallback(() => {
    const blob = new Blob([JSON.stringify(facilitiesRef.current, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cuc-campus-placements-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    soundFX.playTacticalClick();
  }, []);

  // Apply imported JSON text (normalisé : bornes et migration des anciens champs)
  const applyImportedJson = useCallback(
    (jsonString: string): string | null => {
      try {
        const parsed = JSON.parse(jsonString);
        if (typeof parsed !== 'object' || parsed === null) {
          return 'Format JSON invalide : un objet clé/valeur est attendu.';
        }
        const normalized = normalizeFacilityRecord(parsed);
        if (Object.keys(normalized).length === 0) {
          return 'Aucune installation exploitable dans ce JSON.';
        }
        commitFacilities(normalized, `import:${Date.now()}`);
        soundFX.playTacticalClick();
        return null;
      } catch {
        return 'Erreur de syntaxe JSON. Veuillez vérifier le format de votre code.';
      }
    },
    [commitFacilities]
  );

  // Reset all facilities to calibrated default
  const resetToDefault = useCallback(() => {
    if (confirm('Voulez-vous réinitialiser tous les emplacements par défaut ?')) {
      commitFacilities(DEFAULT_FACILITIES, `reset:${Date.now()}`);
      soundFX.playTacticalClick();
    }
  }, [commitFacilities]);

  // Add custom marker
  const addCustomMarker = useCallback(() => {
    const customId = `zone-${Date.now()}`;
    const newFacility: EditableFacilityItem = {
      id: customId,
      name: `Repère ${Object.keys(facilitiesRef.current).length + 1}`,
      code: `ZON-${String(Object.keys(facilitiesRef.current).length + 1).padStart(2, '0')}`,
      x: 0,
      z: 0,
      rotationY: 0,
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      uniformScale: true,
      visible: true,
    };
    commitFacilities({ ...facilitiesRef.current, [customId]: newFacility }, `add:${customId}`);
    setSelectedObjectId(customId);
    focusFacility(customId);
    soundFX.playTacticalClick();
  }, [commitFacilities, focusFacility]);

  // Keyboard Navigation & Shortcuts (studio uniquement)
  useEffect(() => {
    if (!isEditorOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      // Historique : disponible quel que soit l'état de l'élément sélectionné.
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
          return;
        }
      }

      const item = facilitiesRef.current[selectedObjectId];
      if (!item) return;

      const step = e.shiftKey ? 2.5 : e.altKey ? 0.1 : 0.5;
      const scaleFactor = e.altKey ? 1.01 : 1.1;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          updateFacility(selectedObjectId, { x: clampPosition(Number((item.x - step).toFixed(2))) });
          break;
        case 'ArrowRight':
          e.preventDefault();
          updateFacility(selectedObjectId, { x: clampPosition(Number((item.x + step).toFixed(2))) });
          break;
        case 'ArrowUp':
          e.preventDefault();
          updateFacility(selectedObjectId, { z: clampPosition(Number((item.z - step).toFixed(2))) });
          break;
        case 'ArrowDown':
          e.preventDefault();
          updateFacility(selectedObjectId, { z: clampPosition(Number((item.z + step).toFixed(2))) });
          break;
        case '[':
          e.preventDefault();
          updateFacility(selectedObjectId, {
            rotationY: normalizeAngle360(item.rotationY - 15),
          });
          break;
        case ']':
          e.preventDefault();
          updateFacility(selectedObjectId, {
            rotationY: normalizeAngle360(item.rotationY + 15),
          });
          break;
        case '+':
        case '=':
          e.preventDefault();
          updateFacility(selectedObjectId, {
            scaleX: clampScale(item.scaleX * scaleFactor),
            scaleY: clampScale(item.scaleY * scaleFactor),
            scaleZ: clampScale(item.scaleZ * scaleFactor),
          });
          break;
        case '-':
        case '_':
          e.preventDefault();
          updateFacility(selectedObjectId, {
            scaleX: clampScale(item.scaleX / scaleFactor),
            scaleY: clampScale(item.scaleY / scaleFactor),
            scaleZ: clampScale(item.scaleZ / scaleFactor),
          });
          break;
        case '1':
          e.preventDefault();
          setGizmoMode('translate');
          break;
        case '2':
          e.preventDefault();
          setGizmoMode('rotate');
          break;
        case '3':
          e.preventDefault();
          setGizmoMode('scale');
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          focusFacility(selectedObjectId);
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isEditorOpen, selectedObjectId, updateFacility, focusFacility, undo, redo]);

  const activeFacility = facilities[selectedObjectId] || null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[650px] lg:h-[750px] bg-[#050608] border border-zinc-800 overflow-hidden flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 h-screen! w-screen! border-0' : ''
        } ${className}`}
    >
      {/* Barre de contrôle, aide contextuelle et sélecteur d'installations */}
      <CampusViewerHUD
        mode={mode}
        onModeChange={setMode}
        activePreset={activePreset}
        onApplyPreset={applyPreset}
        onZoom={handleZoom}
        onReset={handleReset}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        bearing={bearing}
        cameraDistance={cameraDistance}
        facilities={facilities}
        selectedObjectId={selectedObjectId}
        onFocusFacility={(id) => {
          setSelectedObjectId(id);
          focusFacility(id);
          setIsCardVisible(true);
        }}
        activeFacility={activeFacility}
        isCardVisible={isCardVisible}
        onCloseCard={() => setIsCardVisible(false)}
      />

      {/* Viewport WebGL */}
      <div className="relative flex-grow w-full h-full bg-black flex overflow-hidden">
        <div className="relative flex-grow w-full h-full cursor-grab active:cursor-grabbing">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* Studio de placement — techniciens uniquement (?studio=1) */}
        <CampusEditorPanel
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          facilities={facilities}
          selectedObjectId={selectedObjectId}
          onSelectObjectId={setSelectedObjectId}
          onFocusFacility={focusFacility}
          snapGrid={snapGrid}
          onSetSnapGrid={setSnapGrid}
          dragMode={dragMode}
          onSetDragMode={setDragMode}
          gizmoMode={gizmoMode}
          onSetGizmoMode={setGizmoMode}
          canUndo={historyFlags.canUndo}
          canRedo={historyFlags.canRedo}
          onUndo={undo}
          onRedo={redo}
          onUpdateFacility={updateFacility}
          onAddCustomMarker={addCustomMarker}
          onCopyConfiguration={copyConfiguration}
          copiedFeedback={copiedFeedback}
          onDownloadJson={downloadJsonFile}
          onOpenJsonStudio={(tab) => {
            setExportModalTab(tab);
            setShowExportModal(true);
          }}
          onResetToDefault={resetToDefault}
        />
      </div>

      {/* JSON Import/Export Modal — techniciens uniquement */}
      <CampusJsonStudioModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        facilities={facilities}
        tab={exportModalTab}
        onSetTab={setExportModalTab}
        onApplyImport={applyImportedJson}
        copiedFeedback={copiedFeedback}
        onCopyConfiguration={copyConfiguration}
        onDownloadJson={downloadJsonFile}
      />
    </div>
  );
};

export default CampusPlan3D;
