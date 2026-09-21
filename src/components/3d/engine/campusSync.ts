import * as THREE from 'three';
import {
  EditableFacilityItem,
  FacilityTransform,
  GizmoMode,
  ThreeSceneContext,
} from '../types/campus3d.types';
import { getFacilityRadius, transformOf } from '../data/facilityTransform';
import { computeGizmoScale, getObjectFrame } from './gizmoMath';
import { setGizmoMode, setGizmoScale, setHighlightRadius } from './useCampusGizmo';

const DEG_TO_RAD = Math.PI / 180;

function degToRad(degrees: number): number {
  return degrees * DEG_TO_RAD;
}

/**
 * Applique la transformée d'une installation à son maillage.
 *
 * Ordre de composition de Three.js : `matrix = T · R · S`. L'échelle est donc
 * appliquée **dans le repère local** de l'objet, avant la rotation. C'est
 * exactement ce qu'il faut pour une mise à l'échelle non uniforme (largeur /
 * profondeur / hauteur) : aucune distorsion en cisaillement, même sur un
 * bâtiment déjà pivoté.
 *
 * Le bâtiment reste posé au sol (`y = 0`) et seul le lacet est appliqué : le
 * modèle de données ne porte ni altitude ni inclinaison.
 */
export function applyTransformToObject(
  three: ThreeSceneContext,
  id: string,
  transform: FacilityTransform
): void {
  const bldg = three.buildingsGroup.getObjectByName(id);
  if (bldg) {
    bldg.position.set(transform.x, 0, transform.z);
    bldg.rotation.set(0, degToRad(transform.rotationY), 0);
    bldg.scale.set(transform.scaleX, transform.scaleY, transform.scaleZ);
  }

  const beacon = three.beaconsGroup.getObjectByName(`beacon-${id}`);
  if (beacon) {
    beacon.position.set(transform.x, 0, transform.z);
  }
}

/**
 * Ancre le gizmo sur l'objet sélectionné.
 *
 * - Mode **Déplacer** : ancrage au sol, pour que le disque de glissement libre
 *   se comporte comme une poignée posée au sol.
 * - Modes **Tourner** / **Redimensionner** : ancrage au centre englobant, afin
 *   que l'anneau de lacet enveloppe le volume et que les poignées d'échelle
 *   restent accessibles sur un bâtiment haut ou agrandi.
 *
 * L'échelle du gizmo est **gelée** pendant un glisser : sans ce gel, agrandir
 * le bâtiment agrandirait le gizmo, qui agrandirait le bâtiment — une boucle
 * de rétroaction divergente.
 */
export function anchorGizmo(
  three: ThreeSceneContext,
  id: string,
  transform: FacilityTransform,
  gizmoMode: GizmoMode
): void {
  const gizmo = three.gizmoGroup;
  if (!gizmo) return;

  const frame = getObjectFrame(three.buildingsGroup.getObjectByName(id));
  three.gizmoObjectRadius = frame?.radius ?? 9;

  // Pendant un glisser, l'ancre reste celle de l'outil saisi : changer
  // d'outil en cours de manipulation ne doit pas faire sauter le gizmo, sinon
  // le centre de rotation se déplace sous le pointeur.
  const effectiveMode = three.isDraggingGizmo ? three.dragGizmoMode : gizmoMode;
  const anchorY = effectiveMode === 'translate' ? 0.15 : frame?.center.y ?? 0.15;

  gizmo.position.set(transform.x, anchorY, transform.z);
  gizmo.rotation.y = 0;

  const frozen = three.gizmoScaleFrozen;
  const scale = frozen ?? computeGizmoScale(three.spherical.radius, three.gizmoObjectRadius);
  setGizmoScale(gizmo, scale);
}

export function syncGizmoPosition(
  three: ThreeSceneContext,
  isEditorOpen: boolean,
  selectedObjectId: string,
  facilities: Record<string, EditableFacilityItem>,
  gizmoMode: GizmoMode
): void {
  const gizmo = three.gizmoGroup;
  if (!gizmo) return;

  const item = facilities[selectedObjectId];
  if (!isEditorOpen || !item) {
    gizmo.visible = false;
    return;
  }

  gizmo.visible = true;
  setGizmoMode(gizmo, gizmoMode);
  anchorGizmo(three, selectedObjectId, transformOf(item), gizmoMode);
}

export function syncHighlightTarget(
  three: ThreeSceneContext,
  selectedObjectId: string,
  facilities: Record<string, EditableFacilityItem>
): void {
  const { highlightGroup, beaconsGroup, buildingsGroup } = three;

  const item = facilities[selectedObjectId];
  if (highlightGroup && item && item.visible) {
    highlightGroup.visible = true;
    highlightGroup.position.set(item.x, 0, item.z);
    setHighlightRadius(highlightGroup, getFacilityRadius(selectedObjectId, item));
  } else if (highlightGroup) {
    highlightGroup.visible = false;
  }

  // Beacon correspondant à l'objet sélectionné.
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

  // Rehaussement de l'émission sur le bâtiment sélectionné.
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
    bldg.visible = item.visible;
    applyTransformToObject(three, id, transformOf(item));

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
  facilities: Record<string, EditableFacilityItem>,
  gizmoMode: GizmoMode
): void {
  if (!three) return;
  syncFacilitiesMeshes(three, facilities);
  syncGizmoPosition(three, isEditorOpen, selectedObjectId, facilities, gizmoMode);
  syncHighlightTarget(three, selectedObjectId, facilities);
}
