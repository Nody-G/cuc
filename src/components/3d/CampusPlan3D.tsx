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

export type { PlanMode, CameraPreset, EditableFacilityItem, CampusPlan3DProps };

export const CampusPlan3D: React.FC<CampusPlan3DProps> = ({
  initialMode = 'satellite',
  className = '',
  enableDirectTourJump = true,
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
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
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

  // Mutation helper for facility modifications with debounced localStorage save
  const updateFacility = useCallback((id: string, updates: Partial<EditableFacilityItem>) => {
    setFacilities((prev) => {
      const current = prev[id] || DEFAULT_FACILITIES[id];
      if (!current) return prev;
      const next = { ...prev, [id]: { ...current, ...updates } };

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem('cuc_campus_placements_v2', JSON.stringify(next));
        } catch {
          // LocalStorage quota or privacy mode
        }
      }, 300);

      return next;
    });
  }, []);

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
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Copy JSON configuration to clipboard
  const copyConfiguration = useCallback(() => {
    const jsonStr = JSON.stringify(facilities, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopiedFeedback(true);
      soundFX.playTacticalClick();
      setTimeout(() => setCopiedFeedback(false), 2500);
    }).catch(() => {});
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
  const applyImportedJson = useCallback((jsonString: string): string | null => {
    try {
      const parsed = JSON.parse(jsonString);
      if (typeof parsed !== 'object' || parsed === null) {
        return 'Format JSON invalide : un objet clé/valeur est attendu.';
      }
      setFacilities(parsed);
      localStorage.setItem('cuc_campus_placements_v2', JSON.stringify(parsed));
      soundFX.playTacticalClick();
      return null;
    } catch {
      return 'Erreur de syntaxe JSON. Veuillez vérifier le format de votre code.';
    }
  }, []);

  // Reset all facilities to calibrated default
  const resetToDefault = useCallback(() => {
    if (confirm('Voulez-vous réinitialiser tous les emplacements par défaut ?')) {
      setFacilities(DEFAULT_FACILITIES);
      localStorage.removeItem('cuc_campus_placements_v2');
      soundFX.playTacticalClick();
    }
  }, []);

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
    setFacilities((prev) => ({ ...prev, [customId]: newFacility }));
    setSelectedObjectId(customId);
    focusFacility(customId);
    soundFX.playTacticalClick();
  }, [facilities, focusFacility]);

  // Keyboard Navigation & Shortcuts
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
      className={`relative w-full h-[650px] lg:h-[750px] bg-[#050608] border border-zinc-800 overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen! w-screen! border-0' : ''
      } ${className}`}
    >
      {/* Corner HUD Markers */}

      {/* Tactical HUD Header, Presets, and Overlays */}
      <CampusViewerHUD
        mode={mode}
        onModeChange={setMode}
        activePreset={activePreset}
        onApplyPreset={applyPreset}
        isEditorOpen={isEditorOpen}
        onToggleEditor={() => {
          setIsEditorOpen((prev) => !prev);
          soundFX.playTacticalClick();
        }}
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
        enableDirectTourJump={enableDirectTourJump}
        onCopyConfiguration={copyConfiguration}
        copiedFeedback={copiedFeedback}
        onOpenJsonStudio={(tab) => {
          setExportModalTab(tab);
          setShowExportModal(true);
        }}
      />

      {/* Main Viewport & Studio Sidebar */}
      <div className="relative flex-grow w-full h-full bg-black flex overflow-hidden">
        <div className="relative flex-grow w-full h-full cursor-grab active:cursor-grabbing">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* 3D Placement Studio Sidebar */}
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

      {/* JSON Import/Export Modal */}
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
