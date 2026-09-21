'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { soundFX } from '@/lib/soundFx';
import {
  PlanMode,
  CameraPreset,
  EditableFacilityItem,
  CampusPlan3DProps,
} from './types/campus3d.types';
import { DEFAULT_FACILITIES } from './data/defaultFacilities';
import { useCampusScene } from './engine/useCampusScene';
import { CampusViewerHUD } from './ui/CampusViewerHUD';
import { CampusEditorPanel } from './ui/CampusEditorPanel';
import { CampusJsonStudioModal } from './ui/CampusJsonStudioModal';
import { getCampusPlacements3D } from '@/lib/data/site-service';
import { upsertCampusPlacements3D } from '@/app/admin/actions';

export type { PlanMode, CameraPreset, EditableFacilityItem, CampusPlan3DProps };

/**
 * Plan 3D interactif du domaine CUC.
 *
 * Version publique épurée : l'utilisateur explore le campus (vues caméra,
 * ambiances, sélection d'installations, fiche d'information). L'outil
 * d'édition de placement (« studio ») reste disponible uniquement pour
 * l'équipe technique, via le paramètre d'URL `?studio=1` ou la prop `studio`
 * (Cockpit) — il n'est jamais exposé dans l'interface grand public.
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
          return JSON.parse(saved);
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
  const [isCardVisible, setIsCardVisible] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedFeedback, setCopiedFeedback] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportModalTab, setExportModalTab] = useState<'export' | 'import'>('export');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up pending save timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  // Chargement initial depuis Supabase (Cockpit uniquement).
  // Priorité : placements enregistrés en base > placements locaux > défauts
  // calibrés sur les empreintes OSM réelles.
  useEffect(() => {
    if (!persistToDatabase) return;
    let cancelled = false;

    getCampusPlacements3D()
      .then((placements) => {
        if (cancelled || !placements) return;
        const merged: Record<string, EditableFacilityItem> = { ...DEFAULT_FACILITIES };
        Object.entries(placements).forEach(([id, raw]) => {
          const item = raw as Partial<EditableFacilityItem>;
          const base = merged[id] || DEFAULT_FACILITIES[id];
          if (!base) return;
          merged[id] = { ...base, ...item, id };
        });
        setFacilities(merged);
      })
      .catch(() => {
        // Silencieux : on conserve les placements locaux/défauts.
      });

    return () => {
      cancelled = true;
    };
  }, [persistToDatabase]);

  // Mutation helper for facility modifications with debounced persistence.
  // En mode Cockpit (`persistToDatabase`), l'écriture cible Supabase ; sinon
  // on retombe sur le `localStorage` du navigateur.
  const updateFacility = useCallback(
    (id: string, updates: Partial<EditableFacilityItem>) => {
      setFacilities((prev) => {
        const current = prev[id] || DEFAULT_FACILITIES[id];
        if (!current) return prev;
        const next = { ...prev, [id]: { ...current, ...updates } };

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
        }, 400);

        return next;
      });
    },
    [persistToDatabase]
  );

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
    const jsonStr = JSON.stringify(facilities, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedFeedback(true);
      soundFX.playTacticalClick();
      setTimeout(() => setCopiedFeedback(false), 2500);
    }).catch(() => { });
  }, [facilities]);

  // Download JSON configuration file
  const downloadJsonFile = useCallback(() => {
    const blob = new Blob([JSON.stringify(facilities, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cuc-campus-placements-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    soundFX.playTacticalClick();
  }, [facilities]);

  // Apply imported JSON text
  const applyImportedJson = useCallback(
    (jsonString: string): string | null => {
      try {
        const parsed = JSON.parse(jsonString);
        if (typeof parsed !== 'object' || parsed === null) {
          return 'Format JSON invalide : un objet clé/valeur est attendu.';
        }
        setFacilities(parsed);
        if (persistToDatabase) {
          upsertCampusPlacements3D(parsed).catch(() => { });
        } else {
          localStorage.setItem('cuc_campus_placements_v2', JSON.stringify(parsed));
        }
        soundFX.playTacticalClick();
        return null;
      } catch {
        return 'Erreur de syntaxe JSON. Veuillez vérifier le format de votre code.';
      }
    },
    [persistToDatabase]
  );

  // Reset all facilities to calibrated default
  const resetToDefault = useCallback(() => {
    if (confirm('Voulez-vous réinitialiser tous les emplacements par défaut ?')) {
      setFacilities(DEFAULT_FACILITIES);
      if (persistToDatabase) {
        upsertCampusPlacements3D(DEFAULT_FACILITIES).catch(() => { });
      } else {
        localStorage.removeItem('cuc_campus_placements_v2');
      }
      soundFX.playTacticalClick();
    }
  }, [persistToDatabase]);

  // Add custom marker
  const addCustomMarker = useCallback(() => {
    const customId = `zone-${Date.now()}`;
    const newFacility: EditableFacilityItem = {
      id: customId,
      name: `Repère ${Object.keys(facilities).length + 1}`,
      code: `ZON-${String(Object.keys(facilities).length + 1).padStart(2, '0')}`,
      x: 0,
      z: 0,
      rotationY: 0,
      scale: 1,
      heightScale: 1,
      visible: true,
    };
    setFacilities((prev) => {
      const next = { ...prev, [customId]: newFacility };
      if (persistToDatabase) {
        upsertCampusPlacements3D(next).catch(() => { });
      }
      return next;
    });
    setSelectedObjectId(customId);
    focusFacility(customId);
    soundFX.playTacticalClick();
  }, [facilities, focusFacility, persistToDatabase]);

  // Keyboard Navigation & Shortcuts (studio uniquement)
  useEffect(() => {
    if (!isEditorOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      const item = facilities[selectedObjectId];
      if (!item) return;

      const step = e.shiftKey ? 2.5 : e.altKey ? 0.1 : 0.5;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          updateFacility(selectedObjectId, { x: Math.round((item.x - step) * 10) / 10 });
          break;
        case 'ArrowRight':
          e.preventDefault();
          updateFacility(selectedObjectId, { x: Math.round((item.x + step) * 10) / 10 });
          break;
        case 'ArrowUp':
          e.preventDefault();
          updateFacility(selectedObjectId, { z: Math.round((item.z - step) * 10) / 10 });
          break;
        case 'ArrowDown':
          e.preventDefault();
          updateFacility(selectedObjectId, { z: Math.round((item.z + step) * 10) / 10 });
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          updateFacility(selectedObjectId, { rotationY: (item.rotationY + (e.shiftKey ? -15 : 15) + 360) % 360 });
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          focusFacility(selectedObjectId);
          break;
        case '+':
        case '=':
          e.preventDefault();
          updateFacility(selectedObjectId, { scale: Math.min(3.0, Number((item.scale + 0.1).toFixed(2))) });
          break;
        case '-':
        case '_':
          e.preventDefault();
          updateFacility(selectedObjectId, { scale: Math.max(0.2, Number((item.scale - 0.1).toFixed(2))) });
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isEditorOpen, selectedObjectId, facilities, updateFacility, focusFacility]);

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
