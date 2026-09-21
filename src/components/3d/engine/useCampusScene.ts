'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { soundFX } from '@/lib/soundFx';
import {
  PlanMode,
  CameraPreset,
  EditableFacilityItem,
  GizmoMode,
  ThreeSceneContext,
} from '../types/campus3d.types';
import { PRESET_CONFIGS } from '../data/defaultFacilities';
import {
  initCampusScene,
  setupCampusBuildings,
  applyPlanMode,
} from './campusScene';
import { createCampusGizmo, createCampusHighlight, setGizmoScale } from './useCampusGizmo';
import { computeGizmoScale } from './gizmoMath';
import { setupCampusPointerEvents } from './useCampusPointerDrag';
import { syncCampusScene } from './campusSync';

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
  const [activePreset, setActivePreset] = useState<CameraPreset | null>('overview');

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
    setActivePreset(null);
  }, []);

  // Apply Camera Preset
  const applyPreset = useCallback((presetKey: CameraPreset) => {
    const config = PRESET_CONFIGS[presetKey];
    if (!config || !threeRef.current) return;

    setActivePreset(presetKey);
    soundFX.playTacticalClick();

    threeRef.current.targetCenter.set(config.center[0], config.center[1], config.center[2]);
    threeRef.current.targetSpherical.radius = config.radius;
    threeRef.current.targetSpherical.theta = config.theta;
    threeRef.current.targetSpherical.phi = config.phi;
  }, []);

  // Zoom controls
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const three = threeRef.current;
    if (!three) return;
    const delta = direction === 'in' ? -15 : 15;
    // Plafond relevé à 220 pour couvrir le domaine réel (248 m) en vue zénithale.
    three.targetSpherical.radius = Math.max(20, Math.min(220, three.targetSpherical.radius + delta));
    setCameraDistance(Math.round(three.targetSpherical.radius));
  }, []);

  // Reset view
  const handleReset = useCallback(() => {
    applyPreset('overview');
  }, [applyPreset]);

  const focusFacilityRef = useRef(focusFacility);

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
    focusFacilityRef.current = focusFacility;
    modeRef.current = mode;
  });

  // Main Three.js Initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const {
      scene,
      camera,
      renderer,
      groundMesh,
      groundGrid,
      ambientLight,
      sunLight,
      aerialTexture,
    } = initCampusScene(canvas, width, height);

    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);

    const beaconsGroup = new THREE.Group();
    scene.add(beaconsGroup);

    // Setup procedural facility meshes
    setupCampusBuildings(buildingsGroup, beaconsGroup, facilitiesRef.current);

    // Setup 3D Gizmo & Highlight Target
    const gizmoGroup = createCampusGizmo();
    scene.add(gizmoGroup);

    const highlightGroup = createCampusHighlight();
    scene.add(highlightGroup);

    const overview = PRESET_CONFIGS.overview;
    const spherical = { radius: overview.radius, theta: overview.theta, phi: overview.phi };
    const targetSpherical = { ...spherical };
    const center = new THREE.Vector3(overview.center[0], overview.center[1], overview.center[2]);
    const targetCenter = center.clone();
    const currentLookAt = center.clone();

    threeRef.current = {
      scene,
      camera,
      renderer,
      buildingsGroup,
      beaconsGroup,
      gizmoGroup,
      highlightGroup,
      groundMesh,
      groundGrid,
      groundPlaneRaycast: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      ambientLight,
      sunLight,
      aerialTexture,
      isDragging: false,
      isDraggingGizmo: false,
      activeDragType: null,
      dragStartIntersection: new THREE.Vector3(),
      dragStartTransform: {
        x: 0,
        z: 0,
        rotationY: 0,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
      },
      dragStartAxisParam: 0,
      dragPivot: new THREE.Vector3(),
      dragGizmoMode: 'translate',
      dragStartPointer: { x: 0, y: 0 },
      dragObjectRadius: 9,
      gizmoMode: gizmoModeRef.current,
      gizmoObjectRadius: 9,
      gizmoScaleFrozen: null,
      prevMousePos: { x: 0, y: 0 },
      spherical,
      targetSpherical,
      center,
      targetCenter,
      currentLookAt,
      pulseTime: 0,
      animFrameId: 0,
      raycaster: new THREE.Raycaster(),
      mouseVector: new THREE.Vector2(),
    };

    // Apply initial mode
    applyPlanMode(
      modeRef.current,
      scene,
      buildingsGroup,
      groundMesh,
      groundGrid,
      ambientLight,
      sunLight,
      aerialTexture
    );

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
      focusFacility: (id) => focusFacilityRef.current?.(id),
      setCameraDistance,
      onGizmoModeChange: (nextMode) => onGizmoModeChangeRef.current?.(nextMode),
    });

    const handleResize = () => {
      if (!container || !canvas || !threeRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 60 FPS Render Loop
    const animate = () => {
      const three = threeRef.current;
      if (!three) return;

      three.pulseTime += 0.035;
      three.spherical.radius += (three.targetSpherical.radius - three.spherical.radius) * 0.08;
      three.spherical.theta += (three.targetSpherical.theta - three.spherical.theta) * 0.08;
      three.spherical.phi += (three.targetSpherical.phi - three.spherical.phi) * 0.08;

      three.center.lerp(three.targetCenter, 0.08);
      three.currentLookAt.lerp(three.center, 0.08);

      const { radius, theta, phi } = three.spherical;
      const camX = three.center.x + radius * Math.sin(phi) * Math.sin(theta);
      const camY = three.center.y + radius * Math.cos(phi);
      const camZ = three.center.z + radius * Math.sin(phi) * Math.cos(theta);

      three.camera.position.set(camX, camY, camZ);
      three.camera.lookAt(three.currentLookAt);

      // Throttle React telemetry state updates to ~120ms to prevent 60fps React thrashing
      const now = performance.now();
      if (now - lastTelemetryUpdateRef.current > 120) {
        lastTelemetryUpdateRef.current = now;
        const deg = Math.round((theta * 180) / Math.PI) % 360;
        const normalizedDeg = deg >= 0 ? deg : 360 + deg;
        const roundedDist = Math.round(radius);

        if (prevBearingRef.current !== normalizedDeg) {
          prevBearingRef.current = normalizedDeg;
          setBearing(normalizedDeg);
        }
        if (prevDistRef.current !== roundedDist) {
          prevDistRef.current = roundedDist;
          setCameraDistance(roundedDist);
        }
      }

      // Gizmo : pulsation du disque central + échelle adaptative.
      // L'échelle est recalculée depuis la distance caméra (constance à
      // l'écran) sauf pendant un glisser, où elle reste gelée pour éviter
      // toute boucle de rétroaction sur la mise à l'échelle.
      if (three.gizmoGroup && three.gizmoGroup.visible) {
        const pulse = 1 + Math.sin(three.pulseTime * 4) * 0.03;
        const disc = three.gizmoGroup.getObjectByName('gizmo-center');
        if (disc) disc.scale.set(pulse, pulse, 1);

        if (three.gizmoScaleFrozen === null) {
          setGizmoScale(
            three.gizmoGroup,
            computeGizmoScale(three.spherical.radius, three.gizmoObjectRadius)
          );
        }
      }

      // Animate highlight target reticle & pulsing ring
      if (three.highlightGroup && three.highlightGroup.visible) {
        const reticle = three.highlightGroup.getObjectByName('highlight-reticle');
        if (reticle) reticle.rotation.y += 0.012;
        const pulse = 1 + Math.sin(three.pulseTime * 3) * 0.05;
        const outer = three.highlightGroup.getObjectByName('highlight-outer-ring');
        if (outer) outer.scale.set(pulse, pulse, 1);
      }

      // Animate holographic beacon diamonds
      three.beaconsGroup.children.forEach((bGroup, index) => {
        const diamond = bGroup.children[0];
        if (diamond) {
          diamond.rotation.y += 0.03;
          diamond.position.y = 14 + Math.sin(three.pulseTime * 2 + index * 0.8) * 0.6;
        }
      });

      three.renderer.render(three.scene, three.camera);
      three.animFrameId = requestAnimationFrame(animate);
    };
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
    activePreset,
    focusFacility,
    applyPreset,
    handleZoom,
    handleReset,
  };
}
