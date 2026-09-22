'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { soundFX } from '@/lib/soundFx';
import {
  PlanMode,
  CameraPreset,
  EditableFacilityItem,
  GizmoMode,
  ThreeSceneContext,
} from '../types/campus3d.types';
import { PRESET_CONFIGS } from '../data/defaultFacilities';
import { applyPlanMode } from './campusScene';
import { setupCampusPointerEvents } from './useCampusPointerDrag';
import { syncCampusScene } from './campusSync';
import { initCampusSceneGraph } from './campus-scene/scene-init';
import { createSceneRenderLoop } from './campus-scene/scene-animate';

interface UseCampusSceneProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  facilities: Record<string, EditableFacilityItem>;
  selectedObjectId: string;
  isEditorOpen: boolean;
  snapGrid: number;
  dragMode: 'gizmo' | 'orbit';
  gizmoMode: GizmoMode;
  mode: PlanMode;
  onUpdateFacility: (id: string, updates: Partial<EditableFacilityItem>) => void;
  onSelectObjectId: (id: string) => void;
  /** Remonte un changement d'outil décidé dans la scène (anneau de lacet saisi). */
  onGizmoModeChange: (mode: GizmoMode) => void;
}

/**
 * Orchestration de la scène 3D du campus : cycle de vie Three.js, télémétrie
 * caméra throttlée et ponts vers les interactions (pointeur, gizmo, sync).
 *
 * Le graphe de scène vit dans `campus-scene/scene-init` ; la boucle de rendu
 * dans `campus-scene/scene-animate`.
 */
export function useCampusScene({
  canvasRef,
  containerRef,
  facilities,
  selectedObjectId,
  isEditorOpen,
  snapGrid,
  dragMode,
  gizmoMode,
  mode,
  onUpdateFacility,
  onSelectObjectId,
  onGizmoModeChange,
}: UseCampusSceneProps) {
  const [bearing, setBearing] = useState<number>(315);
  const [cameraDistance, setCameraDistance] = useState<number>(75);

  // Mutable state references for 60fps interaction loop
  const threeRef = useRef<ThreeSceneContext | null>(null);

  const facilitiesRef = useRef(facilities);
  const isEditorOpenRef = useRef(isEditorOpen);
  const selectedObjectIdRef = useRef(selectedObjectId);
  const snapGridRef = useRef(snapGrid);
  const dragModeRef = useRef(dragMode);
  const gizmoModeRef = useRef(gizmoMode);
  const updateFacilityRef = useRef(onUpdateFacility);
  const onSelectObjectIdRef = useRef(onSelectObjectId);
  const onGizmoModeChangeRef = useRef(onGizmoModeChange);
  const modeRef = useRef(mode);

  const lastTelemetryUpdateRef = useRef<number>(0);
  const prevBearingRef = useRef<number>(315);
  const prevDistRef = useRef<number>(75);

  // Smooth Focus on Facility with pleasant framing distance (52-62m instead of tight 35m)
  const focusFacility = useCallback((facId: string) => {
    const three = threeRef.current;
    if (!three) return;

    const fac = facilitiesRef.current[facId];
    if (!fac) return;

    soundFX.playTacticalClick();
    three.targetCenter.set(fac.x, 0, fac.z);
    three.targetSpherical.radius = facId === 'cuc-tower' ? 52 : 62;
    three.targetSpherical.phi = Math.PI * 0.32;
    three.targetSpherical.theta = (fac.rotationY * Math.PI) / 180 + Math.PI * 0.75;
  }, []);

  // Apply Camera Preset
  const applyPreset = useCallback((presetKey: CameraPreset) => {
    const config = PRESET_CONFIGS[presetKey];
    if (!config || !threeRef.current) return;

    soundFX.playTacticalClick();

    threeRef.current.targetCenter.set(config.center[0], config.center[1], config.center[2]);
    threeRef.current.targetSpherical.radius = config.radius;
    threeRef.current.targetSpherical.theta = config.theta;
    threeRef.current.targetSpherical.phi = config.phi;
  }, []);

  // Reset view
  const handleReset = useCallback(() => {
    applyPreset('overview');
  }, [applyPreset]);

  useEffect(() => {
    facilitiesRef.current = facilities;
    isEditorOpenRef.current = isEditorOpen;
    selectedObjectIdRef.current = selectedObjectId;
    snapGridRef.current = snapGrid;
    dragModeRef.current = dragMode;
    gizmoModeRef.current = gizmoMode;
    updateFacilityRef.current = onUpdateFacility;
    onSelectObjectIdRef.current = onSelectObjectId;
    onGizmoModeChangeRef.current = onGizmoModeChange;
    modeRef.current = mode;
  });

  // Main Three.js Initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const three = initCampusSceneGraph({
      canvas,
      width,
      height,
      facilities: facilitiesRef.current,
      mode: modeRef.current,
      gizmoMode: gizmoModeRef.current,
    });
    threeRef.current = three;
    const { renderer } = three;

    // Setup Pointer & Drag Interactions
    const cleanupPointerEvents = setupCampusPointerEvents({
      canvas,
      threeRef,
      facilitiesRef,
      selectedObjectIdRef,
      isEditorOpenRef,
      snapGridRef,
      dragModeRef,
      updateFacilityRef,
      onSelectObjectId: (id) => onSelectObjectIdRef.current(id),
      setCameraDistance,
      onGizmoModeChange: (nextMode) => onGizmoModeChangeRef.current?.(nextMode),
    });

    const handleResize = () => {
      if (!container || !canvas || !threeRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      threeRef.current.camera.aspect = w / h;
      threeRef.current.camera.updateProjectionMatrix();
      threeRef.current.renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 60 FPS Render Loop
    const animate = createSceneRenderLoop(threeRef, {
      lastUpdateRef: lastTelemetryUpdateRef,
      prevBearingRef,
      prevDistRef,
      setBearing,
      setCameraDistance,
    });
    threeRef.current.animFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cleanupPointerEvents();

      if (threeRef.current) {
        cancelAnimationFrame(threeRef.current.animFrameId);
        renderer.dispose();
      }
    };
  }, [canvasRef, containerRef]);

  // Sync mode changes
  useEffect(() => {
    const three = threeRef.current;
    if (!three) return;
    applyPlanMode(
      mode,
      three.scene,
      three.buildingsGroup,
      three.groundMesh,
      three.groundGrid,
      three.ambientLight,
      three.sunLight,
      three.aerialTexture
    );
  }, [mode]);

  // Sync Gizmo, Meshes, and Highlight Target with current state
  useEffect(() => {
    syncCampusScene(threeRef.current, isEditorOpen, selectedObjectId, facilities, gizmoMode);
  }, [isEditorOpen, selectedObjectId, facilities, gizmoMode]);

  return {
    bearing,
    cameraDistance,
    focusFacility,
    handleReset,
  };
}
