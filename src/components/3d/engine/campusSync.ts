import * as THREE from 'three';
import { EditableFacilityItem, ThreeSceneContext } from '../types/campus3d.types';

export function syncGizmoPosition(
  gizmoGroup: THREE.Group | undefined,
  isEditorOpen: boolean,
  selectedObjectId: string,
  facilities: Record<string, EditableFacilityItem>
): void {
  if (!gizmoGroup) return;

  if (!isEditorOpen) {
    gizmoGroup.visible = false;
    return;
  }

  const item = facilities[selectedObjectId];
  if (item) {
    gizmoGroup.visible = true;
    gizmoGroup.position.set(item.x, 0.15, item.z);
    gizmoGroup.rotation.y = 0;
    const rotSub = gizmoGroup.getObjectByName('gizmo-rot-subgroup');
    if (rotSub) {
      rotSub.rotation.y = (item.rotationY * Math.PI) / 180;
    }
  } else {
    gizmoGroup.visible = false;
  }
}

export function syncHighlightTarget(
  highlightGroup: THREE.Group | undefined,
  selectedObjectId: string,
  facilities: Record<string, EditableFacilityItem>,
  beaconsGroup?: THREE.Group,
  buildingsGroup?: THREE.Group
): void {
  if (!highlightGroup) return;

  const item = facilities[selectedObjectId];
  if (item && item.visible) {
    highlightGroup.visible = true;
    highlightGroup.position.set(item.x, 0, item.z);
    const baseScale = Math.max(1.0, item.scale);
    highlightGroup.scale.set(baseScale, 1, baseScale);
  } else {
    highlightGroup.visible = false;
  }

  // Highlight beacon corresponding to selected object
  if (beaconsGroup) {
    beaconsGroup.children.forEach((bGroup) => {
      const isSelected = bGroup.name === `beacon-${selectedObjectId}`;
      const diamond = bGroup.children[0] as THREE.Mesh | undefined;
      if (diamond) {
        diamond.scale.setScalar(isSelected ? 1.7 : 1.0);
        if (diamond.material instanceof THREE.MeshStandardMaterial) {
          diamond.material.emissiveIntensity = isSelected ? 1.6 : 0.6;
        }
      }
      const ripple = bGroup.children[2] as THREE.Mesh | undefined;
      if (ripple && ripple.material instanceof THREE.MeshBasicMaterial) {
        ripple.material.opacity = isSelected ? 1.0 : 0.35;
      }
    });
  }

  // Enhance emissive lighting on the selected building
  if (buildingsGroup) {
    buildingsGroup.children.forEach((bldg) => {
      const isSelected = bldg.name === selectedObjectId;
      bldg.traverse((child) => {
        if (child instanceof THREE.Mesh && !child.name.startsWith('gizmo-')) {
          if (child.material && 'emissive' in child.material && 'emissiveIntensity' in child.material) {
            child.material.emissiveIntensity = isSelected ? 0.75 : 0.25;
          }
        }
      });
    });
  }
}

function createCustomMarkerMesh(id: string): THREE.Group {
  const grp = new THREE.Group();
  grp.name = id;

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 3.5, 4.5),
    new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      roughness: 0.35,
      metalness: 0.65,
      emissive: 0x002233,
      emissiveIntensity: 0.5,
    })
  );
  box.position.y = 1.75;
  box.castShadow = true;
  grp.add(box);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(2.6, 3.6, 24),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.08;
  grp.add(ring);

  return grp;
}

function createCustomBeacon(id: string): THREE.Group {
  const beacon = new THREE.Group();
  beacon.name = `beacon-${id}`;

  const diamond = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.3, 0),
    new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.9,
      wireframe: true,
    })
  );
  diamond.position.y = 14;
  beacon.add(diamond);

  const dropLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 14, 0), new THREE.Vector3(0, 0.2, 0)]),
    new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.5 })
  );
  beacon.add(dropLine);

  return beacon;
}

export function syncFacilitiesMeshes(
  three: ThreeSceneContext | null,
  facilities: Record<string, EditableFacilityItem>
): void {
  if (!three) return;

  Object.entries(facilities).forEach(([id, item]) => {
    let bldg = three.buildingsGroup.getObjectByName(id);
    if (!bldg) {
      bldg = createCustomMarkerMesh(id);
      three.buildingsGroup.add(bldg);
    }
    bldg.position.x = item.x;
    bldg.position.z = item.z;
    bldg.rotation.y = (item.rotationY * Math.PI) / 180;
    bldg.scale.set(item.scale, item.scale * item.heightScale, item.scale);
    bldg.visible = item.visible;

    let beacon = three.beaconsGroup.getObjectByName(`beacon-${id}`);
    if (!beacon) {
      beacon = createCustomBeacon(id);
      three.beaconsGroup.add(beacon);
    }
    beacon.position.set(item.x, 0, item.z);
    beacon.visible = item.visible;
  });
}

export function syncCampusScene(
  three: ThreeSceneContext | null,
  isEditorOpen: boolean,
  selectedObjectId: string,
  facilities: Record<string, EditableFacilityItem>
): void {
  if (!three) return;
  syncGizmoPosition(three.gizmoGroup, isEditorOpen, selectedObjectId, facilities);
  syncFacilitiesMeshes(three, facilities);
  syncHighlightTarget(three.highlightGroup, selectedObjectId, facilities, three.beaconsGroup, three.buildingsGroup);
}
