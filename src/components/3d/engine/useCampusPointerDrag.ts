'use client';

import * as THREE from 'three';
import { soundFX } from '@/lib/soundFx';
import {
  EditableFacilityItem,
  FacilityTransform,
  GizmoDragType,
  GizmoMode,
  ThreeSceneContext,
} from '../types/campus3d.types';
import {
  TRANSFORM_LIMITS,
  clampPosition,
  clampScale,
  getFacilityRadius,
  normalizeAngle360,
  snapToStep,
  transformOf,
} from '../data/facilityTransform';
import {
  axisVector,
  getObjectFrame,
  rayAxisParam,
  rayPlanePoint,
  resolveAxisScaleDrag,
  resolveUniformScaleDrag,
  signedAngleAroundAxis,
} from './gizmoMath';
import {
  findBuildingGroup,
  findFirstGizmoHandle,
  handleToDragType,
  handleToMode,
  setGizmoMode,
  setHighlightRadius,
} from './useCampusGizmo';
import { anchorGizmo, applyTransformToObject } from './campusSync';

interface PointerEventsSetupOptions {
  canvas: HTMLCanvasElement;
  threeRef: React.RefObject<ThreeSceneContext | null>;
  facilitiesRef: React.RefObject<Record<string, EditableFacilityItem>>;
  selectedObjectIdRef: React.RefObject<string>;
  isEditorOpenRef: React.RefObject<boolean>;
  snapGridRef: React.RefObject<number>;
  dragModeRef: React.RefObject<'gizmo' | 'orbit'>;
  updateFacilityRef: React.RefObject<(id: string, updates: Partial<EditableFacilityItem>) => void>;
  onSelectObjectId: (id: string) => void;
  focusFacility: (id: string) => void;
  setCameraDistance: (dist: number) => void;
  /** Synchronise l'état React de l'outil quand une poignée impose de changer. */
  onGizmoModeChange: (mode: GizmoMode) => void;
}

type Axis = 'x' | 'y' | 'z';

export function setupCampusPointerEvents({
  canvas,
  threeRef,
  facilitiesRef,
  selectedObjectIdRef,
  isEditorOpenRef,
  snapGridRef,
  dragModeRef,
  updateFacilityRef,
  onSelectObjectId,
  focusFacility,
  setCameraDistance,
  onGizmoModeChange,
}: PointerEventsSetupOptions) {
  let pointerDownClientPos = { x: 0, y: 0 };
  let pendingTransform: { id: string; transform: FacilityTransform } | null = null;

  const updateMouseVector = (three: ThreeSceneContext, e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    three.mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    three.mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    three.raycaster.setFromCamera(three.mouseVector, three.camera);
  };

  const applySnap = (value: number): number => snapToStep(value, snapGridRef.current);

  /**
   * Angle courant du pointeur autour de l'axe vertical, mesuré dans le plan
   * perpendiculaire passant par le centre du gizmo.
   *
   * Le sens de rotation obtenu est celui de Three.js (règle de la main
   * droite) : le delta d'angle se cumule donc directement à `rotationY`, sans
   * correction de signe ad hoc.
   */
  const lacetAngleAt = (three: ThreeSceneContext, center: THREE.Vector3): number | null => {
    const axis = axisVector('y');
    const planePoint = rayPlanePoint(three.raycaster.ray, axis, center);
    if (!planePoint) return null;
    return signedAngleAroundAxis(planePoint, center, axis, new THREE.Vector3(1, 0, 0));
  };

  /**
   * Capture l'état nécessaire à la manipulation : transformée de départ,
   * rayon englobant de l'objet, échelle du gizmo **gelée** pour la durée du
   * glisser (sans ce gel, agrandir le bâtiment agrandirait le gizmo, qui
   * agrandirait le bâtiment — une boucle divergente), et paramètre de
   * référence le long de l'axe manipulé.
   */
  const beginGizmoDrag = (
    three: ThreeSceneContext,
    e: PointerEvent,
    item: EditableFacilityItem,
    dragType: GizmoDragType
  ) => {
    if (!dragType) return;

    three.dragStartTransform = transformOf(item);
    three.dragStartPointer = { x: e.clientX, y: e.clientY };
    three.activeDragType = dragType;
    three.dragObjectRadius =
      getObjectFrame(three.buildingsGroup.getObjectByName(item.id))?.radius ?? 9;

    const frozen = three.gizmoGroup.userData.gizmoScale;
    three.gizmoScaleFrozen = typeof frozen === 'number' && frozen > 0 ? frozen : 1;

    const groundHit = new THREE.Vector3();
    if (three.raycaster.ray.intersectPlane(three.groundPlaneRaycast, groundHit)) {
      three.dragStartIntersection.copy(groundHit);
    } else {
      three.dragStartIntersection.set(three.dragStartTransform.x, 0, three.dragStartTransform.z);
    }

    // Pivot figé à la saisie : toutes les mesures du glisser se rapportent à
    // ce point. Le gizmo, lui, continue de suivre l'objet visuellement.
    three.dragPivot.copy(three.gizmoGroup.position);
    three.dragGizmoMode = three.gizmoMode;
    const center = three.dragPivot;
    three.dragStartAxisParam = 0;

    if (dragType === 'scale-x' || dragType === 'scale-y' || dragType === 'scale-z') {
      const axis = dragType.slice(-1) as Axis;
      three.dragStartAxisParam = rayAxisParam(three.raycaster.ray, center, axisVector(axis));
    } else if (dragType === 'rotate-y') {
      three.dragStartAxisParam = lacetAngleAt(three, center) ?? 0;
    }

    three.isDraggingGizmo = true;
    three.isDragging = false;
    canvas.setPointerCapture(e.pointerId);
  };

  const onPointerDown = (e: PointerEvent) => {
    const three = threeRef.current;
    if (!three) return;

    three.prevMousePos = { x: e.clientX, y: e.clientY };
    pointerDownClientPos = { x: e.clientX, y: e.clientY };
    pendingTransform = null;
    updateMouseVector(three, e);

    if (isEditorOpenRef.current && e.button === 0) {
      // 1. Poignée de gizmo : noms exacts **et** poignée réellement visible
      //    (`Raycaster` ignore `Object3D.visible`, donc les jeux de poignées
      //    masqués doivent être écartés explicitement).
      //    Priorité aux poignées de l'outil courant : l'anneau de lacet, affiché
      //    en permanence, ne doit pas voler le clic destiné à une flèche ou à un
      //    axe d'échelle placés devant lui.
      const currentItem = facilitiesRef.current[selectedObjectIdRef.current];
      const gizmoHits = three.raycaster.intersectObjects(three.gizmoGroup.children, true);
      if (currentItem && gizmoHits.length > 0) {
        const handle =
          findFirstGizmoHandle(gizmoHits, three.gizmoGroup, (name) => handleToMode(name) === three.gizmoMode) ??
          findFirstGizmoHandle(gizmoHits, three.gizmoGroup);

        const dragType = handle ? handleToDragType(handle) : null;
        if (dragType) {
          // Glisser l'anneau de lacet depuis un autre outil bascule sur
          // « Tourner » : la manipulation aboutit toujours, et le panneau
          // reflète ensuite l'outil réellement utilisé.
          if (dragType === 'rotate-y' && three.gizmoMode !== 'rotate') {
            three.gizmoMode = 'rotate';
            setGizmoMode(three.gizmoGroup, 'rotate');
            onGizmoModeChange('rotate');
          }
          beginGizmoDrag(three, e, currentItem, dragType);
          return;
        }
      }

      // 2. Clic sur un bâtiment : sélection, puis glisser libre au sol si le
      //    mode « Gizmo » est actif.
      const bldgHits = three.raycaster.intersectObjects(three.buildingsGroup.children, true);
      if (bldgHits.length > 0) {
        const topBldg = findBuildingGroup(bldgHits[0].object, three.buildingsGroup);
        if (topBldg && topBldg.name) {
          onSelectObjectId(topBldg.name);
          soundFX.playTacticalClick();

          if (dragModeRef.current === 'gizmo') {
            const curItem = facilitiesRef.current[topBldg.name];
            if (curItem) {
              beginGizmoDrag(three, e, curItem, 'translate-free');
            }
          }
          return;
        }
      }
    }

    three.isDragging = true;
    three.isDraggingGizmo = false;
    canvas.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    const three = threeRef.current;
    if (!three) return;

    // --- Manipulation de gizmo active ---
    if (three.isDraggingGizmo && isEditorOpenRef.current && three.activeDragType) {
      const active = three.activeDragType;
      updateMouseVector(three, e);
      const ray = three.raycaster.ray;

      const id = selectedObjectIdRef.current;
      const item = facilitiesRef.current[id];
      if (!item) return;

      const start = three.dragStartTransform;
      const next: FacilityTransform = { ...start };
      const fine = e.shiftKey;
      const snap = snapGridRef.current;
      const center = three.dragPivot;

      switch (active) {
        case 'translate-x':
        case 'translate-z':
        case 'translate-free': {
          const hit = new THREE.Vector3();
          if (!ray.intersectPlane(three.groundPlaneRaycast, hit)) break;
          const dx = hit.x - three.dragStartIntersection.x;
          const dz = hit.z - three.dragStartIntersection.z;
          if (active !== 'translate-z') {
            next.x = clampPosition(applySnap(start.x + dx));
          }
          if (active !== 'translate-x') {
            next.z = clampPosition(applySnap(start.z + dz));
          }
          break;
        }

        case 'scale-x':
        case 'scale-y':
        case 'scale-z': {
          const axis = active.slice(-1) as Axis;
          let delta = rayAxisParam(ray, center, axisVector(axis)) - three.dragStartAxisParam;
          if (fine) delta *= 0.25;

          const key = `scale${axis.toUpperCase()}` as 'scaleX' | 'scaleY' | 'scaleZ';
          const startScale = start[key];
          const raw = resolveAxisScaleDrag(startScale, delta, three.dragObjectRadius);
          const snapped =
            !fine && snap >= 1
              ? snapToStep(raw, TRANSFORM_LIMITS.scaleStep)
              : Number(raw.toFixed(3));

          if (item.uniformScale) {
            const ratio = snapped / (startScale || 1);
            next.scaleX = clampScale(start.scaleX * ratio);
            next.scaleY = clampScale(start.scaleY * ratio);
            next.scaleZ = clampScale(start.scaleZ * ratio);
          } else {
            next[key] = clampScale(snapped, startScale);
          }
          break;
        }

        case 'scale-uniform': {
          const factor = resolveUniformScaleDrag(1, e.clientY - three.dragStartPointer.y, fine);
          next.scaleX = clampScale(start.scaleX * factor);
          next.scaleY = clampScale(start.scaleY * factor);
          next.scaleZ = clampScale(start.scaleZ * factor);
          break;
        }

        case 'rotate-y': {
          const angle = lacetAngleAt(three, center);
          if (angle === null) break;

          let deltaDeg = THREE.MathUtils.radToDeg(angle - three.dragStartAxisParam);
          // Déroulement du passage ±180° pour éviter un saut d'un demi-tour.
          if (deltaDeg > 180) deltaDeg -= 360;
          if (deltaDeg < -180) deltaDeg += 360;
          if (fine) deltaDeg *= 0.25;
          if (!fine && snap >= 1) deltaDeg = snapToStep(deltaDeg, 5);

          next.rotationY = normalizeAngle360(start.rotationY + deltaDeg);
          break;
        }

        default:
          break;
      }

      // Application directe à 60 FPS, sans écriture de persistance.
      applyTransformToObject(three, id, next);
      anchorGizmo(three, id, next, three.gizmoMode);
      if (three.highlightGroup?.visible) {
        setHighlightRadius(three.highlightGroup, getFacilityRadius(id, next));
      }

      pendingTransform = { id, transform: next };
      return;
    }

    // --- Orbite caméra ---
    if (three.isDragging) {
      const deltaX = e.clientX - three.prevMousePos.x;
      const deltaY = e.clientY - three.prevMousePos.y;
      three.prevMousePos = { x: e.clientX, y: e.clientY };

      three.targetSpherical.theta -= deltaX * 0.007;
      three.targetSpherical.phi = Math.max(
        0.04,
        Math.min(Math.PI * 0.48, three.targetSpherical.phi - deltaY * 0.007)
      );
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    const three = threeRef.current;
    if (!three) return;

    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    const totalDragDist = Math.hypot(
      e.clientX - pointerDownClientPos.x,
      e.clientY - pointerDownClientPos.y
    );

    // Hors studio, un clic net (sans glisser) cadre le bâtiment pointé.
    if (!isEditorOpenRef.current && !three.isDraggingGizmo) {
      if (totalDragDist < 6) {
        updateMouseVector(three, e);
        const intersects = three.raycaster.intersectObjects(three.buildingsGroup.children, true);
        if (intersects.length > 0) {
          const topObj = findBuildingGroup(intersects[0].object, three.buildingsGroup);
          if (topObj && topObj.name) {
            focusFacility(topObj.name);
            onSelectObjectId(topObj.name);
          }
        }
      }
    }

    // Validation de la manipulation à la fin du glisser : une seule écriture,
    // donc une seule entrée d'historique par geste.
    if (three.isDraggingGizmo) {
      three.isDraggingGizmo = false;
      three.activeDragType = null;
      three.gizmoScaleFrozen = null;

      if (pendingTransform) {
        updateFacilityRef.current(pendingTransform.id, { ...pendingTransform.transform });
        pendingTransform = null;
      }
      soundFX.playTacticalClick();
    }

    three.isDragging = false;
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const three = threeRef.current;
    if (!three) return;
    // Bornes alignées sur `handleZoom` (20 → 220 m) pour couvrir le domaine réel.
    three.targetSpherical.radius = Math.max(
      20,
      Math.min(220, three.targetSpherical.radius + e.deltaY * 0.06)
    );
    setCameraDistance(Math.round(three.targetSpherical.radius));
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  return () => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup', onPointerUp);
    canvas.removeEventListener('pointercancel', onPointerUp);
    canvas.removeEventListener('wheel', onWheel);
  };
}
