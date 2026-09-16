'use client';

import * as THREE from 'three';
import { soundFX } from '@/lib/soundFx';
import {
  EditableFacilityItem,
  ThreeSceneContext,
} from '../types/campus3d.types';
import { findGizmoHandle, findBuildingGroup } from './useCampusGizmo';

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
}

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
}: PointerEventsSetupOptions) {
  let pointerDownClientPos = { x: 0, y: 0 };
  let pendingDragValues: { id: string; x: number; z: number; rotationY: number } | null = null;

  const onPointerDown = (e: PointerEvent) => {
    const three = threeRef.current;
    if (!three) return;

    three.prevMousePos = { x: e.clientX, y: e.clientY };
    pointerDownClientPos = { x: e.clientX, y: e.clientY };
    pendingDragValues = null;
    const rect = canvas.getBoundingClientRect();
    three.mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    three.mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    three.raycaster.setFromCamera(three.mouseVector, three.camera);

    // Gizmo hit detection in editor mode
    if (isEditorOpenRef.current && e.button === 0) {
      const gizmoHits = three.raycaster.intersectObjects(three.gizmoGroup.children, true);
      if (gizmoHits.length > 0) {
        const handleName = findGizmoHandle(gizmoHits[0].object, three.gizmoGroup);
        if (handleName) {
          const currentItem = facilitiesRef.current[selectedObjectIdRef.current];
          if (currentItem) {
            const groundHit = new THREE.Vector3();
            if (three.raycaster.ray.intersectPlane(three.groundPlaneRaycast, groundHit)) {
              three.dragStartIntersection.copy(groundHit);
              three.dragStartPos = { x: currentItem.x, z: currentItem.z };
              three.dragStartRotation = currentItem.rotationY;
              three.dragStartAngle = (Math.atan2(groundHit.x - currentItem.x, groundHit.z - currentItem.z) * 180) / Math.PI;

              if (handleName === 'gizmo-axis-x') three.activeDragType = 'x';
              else if (handleName === 'gizmo-axis-z') three.activeDragType = 'z';
              else if (handleName === 'gizmo-rot-y') three.activeDragType = 'rot';
              else three.activeDragType = 'center';

              three.isDraggingGizmo = true;
              three.isDragging = false;
              canvas.setPointerCapture(e.pointerId);
              return;
            }
          }
        }
      }

      // Building click detection in editor mode
      const bldgHits = three.raycaster.intersectObjects(three.buildingsGroup.children, true);
      if (bldgHits.length > 0) {
        const topBldg = findBuildingGroup(bldgHits[0].object, three.buildingsGroup);
        if (topBldg && topBldg.name) {
          onSelectObjectId(topBldg.name);
          soundFX.playTacticalClick();
          if (dragModeRef.current === 'gizmo') {
            const curItem = facilitiesRef.current[topBldg.name];
            if (curItem) {
              const groundHit = new THREE.Vector3();
              if (three.raycaster.ray.intersectPlane(three.groundPlaneRaycast, groundHit)) {
                three.dragStartIntersection.copy(groundHit);
                three.dragStartPos = { x: curItem.x, z: curItem.z };
                three.dragStartRotation = curItem.rotationY;
                three.activeDragType = 'center';
                three.isDraggingGizmo = true;
                three.isDragging = false;
                canvas.setPointerCapture(e.pointerId);
                return;
              }
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

    const rect = canvas.getBoundingClientRect();
    three.mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    three.mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Active Gizmo dragging
    if (three.isDraggingGizmo && isEditorOpenRef.current && three.activeDragType) {
      three.raycaster.setFromCamera(three.mouseVector, three.camera);
      const curHit = new THREE.Vector3();
      if (three.raycaster.ray.intersectPlane(three.groundPlaneRaycast, curHit)) {
        const selectedId = selectedObjectIdRef.current;
        const currentItem = facilitiesRef.current[selectedId];
        if (!currentItem) return;

        const snap = snapGridRef.current;
        const applySnap = (val: number) => {
          if (snap <= 0.1) return Math.round(val * 10) / 10;
          return Math.round(val / snap) * snap;
        };

        let nextX = currentItem.x;
        let nextZ = currentItem.z;
        let nextRot = currentItem.rotationY;

        if (three.activeDragType === 'x') {
          const dx = curHit.x - three.dragStartIntersection.x;
          nextX = applySnap(Math.max(-75, Math.min(75, three.dragStartPos.x + dx)));
        } else if (three.activeDragType === 'z') {
          const dz = curHit.z - three.dragStartIntersection.z;
          nextZ = applySnap(Math.max(-75, Math.min(75, three.dragStartPos.z + dz)));
        } else if (three.activeDragType === 'center') {
          const dx = curHit.x - three.dragStartIntersection.x;
          const dz = curHit.z - three.dragStartIntersection.z;
          nextX = applySnap(Math.max(-75, Math.min(75, three.dragStartPos.x + dx)));
          nextZ = applySnap(Math.max(-75, Math.min(75, three.dragStartPos.z + dz)));
        } else if (three.activeDragType === 'rot') {
          const curAngle = (Math.atan2(curHit.x - currentItem.x, curHit.z - currentItem.z) * 180) / Math.PI;
          const diffAngle = curAngle - three.dragStartAngle;
          nextRot = Math.round(((three.dragStartRotation - diffAngle) + 3600) % 360);
          if (snap >= 1.0) nextRot = Math.round(nextRot / 5) * 5;
        }

        // Direct 60 FPS mesh updates without locking localStorage
        const bldg = three.buildingsGroup.getObjectByName(selectedId);
        if (bldg) {
          bldg.position.x = nextX;
          bldg.position.z = nextZ;
          bldg.rotation.y = (nextRot * Math.PI) / 180;
        }
        const beacon = three.beaconsGroup.getObjectByName(`beacon-${selectedId}`);
        if (beacon) beacon.position.set(nextX, 0, nextZ);
        if (three.gizmoGroup) {
          three.gizmoGroup.position.set(nextX, 0.15, nextZ);
          const rotSub = three.gizmoGroup.getObjectByName('gizmo-rot-subgroup');
          if (rotSub) {
            rotSub.rotation.y = (nextRot * Math.PI) / 180;
          }
        }

        pendingDragValues = { id: selectedId, x: nextX, z: nextZ, rotationY: nextRot };
      }
      return;
    }

    // Camera orbit
    if (three.isDragging) {
      const deltaX = e.clientX - three.prevMousePos.x;
      const deltaY = e.clientY - three.prevMousePos.y;
      three.prevMousePos = { x: e.clientX, y: e.clientY };

      three.targetSpherical.theta -= deltaX * 0.007;
      three.targetSpherical.phi = Math.max(0.04, Math.min(Math.PI * 0.48, three.targetSpherical.phi - deltaY * 0.007));
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    const three = threeRef.current;
    if (!three) return;

    if (canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }

    const totalDragDist = Math.hypot(e.clientX - pointerDownClientPos.x, e.clientY - pointerDownClientPos.y);

    // Only select and focus a building if the user actually clicked (drag < 6px)
    if (!isEditorOpenRef.current && !three.isDraggingGizmo) {
      if (totalDragDist < 6) {
        const rect = canvas.getBoundingClientRect();
        three.mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        three.mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        three.raycaster.setFromCamera(three.mouseVector, three.camera);

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

    // Commit gizmo changes upon mouse release
    if (three.isDraggingGizmo) {
      three.isDraggingGizmo = false;
      three.activeDragType = null;
      if (pendingDragValues) {
        updateFacilityRef.current(pendingDragValues.id, {
          x: pendingDragValues.x,
          z: pendingDragValues.z,
          rotationY: pendingDragValues.rotationY,
        });
        pendingDragValues = null;
      }
      soundFX.playTacticalClick();
    }
    three.isDragging = false;
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const three = threeRef.current;
    if (!three) return;
    three.targetSpherical.radius = Math.max(22, Math.min(140, three.targetSpherical.radius + e.deltaY * 0.06));
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
