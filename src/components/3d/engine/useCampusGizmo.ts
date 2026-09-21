import * as THREE from 'three';
import { GizmoDragType, GizmoMode } from '../types/campus3d.types';
import { clampNumber, snapToStep } from '../data/facilityTransform';
import { GIZMO_AXIS_LENGTH, GIZMO_RING_RADIUS } from './gizmoMath';

/** Rayon moyen de la couronne de mise en évidence, avant mise à l'échelle. */
const HIGHLIGHT_BASE_RADIUS = 8.85;

/**
 * Liste **exhaustive** des poignées interactives du gizmo.
 *
 * La détection repose sur une correspondance exacte avec cet ensemble, et non
 * sur un test de préfixe `'gizmo-'` : les groupes conteneurs
 * (`gizmo-translate-group`, `gizmo-rotate-group`, `gizmo-scale-group`) portent
 * eux aussi ce préfixe, et un test de préfixe les ferait passer pour des
 * poignées — une poignée fantôme qui capture tous les clics.
 */
export const GIZMO_HANDLE_NAMES = [
  'gizmo-center',
  'gizmo-translate-x',
  'gizmo-translate-z',
  'gizmo-rotate-y',
  'gizmo-scale-x',
  'gizmo-scale-y',
  'gizmo-scale-z',
  'gizmo-scale-uniform',
] as const;

export type GizmoHandleName = (typeof GIZMO_HANDLE_NAMES)[number];

const GIZMO_HANDLE_SET: ReadonlySet<string> = new Set<string>(GIZMO_HANDLE_NAMES);

const AXIS_COLORS = {
  x: 0xff3366,
  y: 0x36d399,
  z: 0x00aaff,
} as const;

/** Correspondance poignée → type de manipulation. */
export function handleToDragType(handle: GizmoHandleName): GizmoDragType {
  switch (handle) {
    case 'gizmo-center':
      return 'translate-free';
    case 'gizmo-translate-x':
      return 'translate-x';
    case 'gizmo-translate-z':
      return 'translate-z';
    case 'gizmo-rotate-y':
      return 'rotate-y';
    case 'gizmo-scale-x':
      return 'scale-x';
    case 'gizmo-scale-y':
      return 'scale-y';
    case 'gizmo-scale-z':
      return 'scale-z';
    case 'gizmo-scale-uniform':
      return 'scale-uniform';
    default:
      return null;
  }
}

const GIZMO_MODE_GROUP = {
  translate: 'gizmo-translate-group',
  rotate: 'gizmo-rotate-group',
  scale: 'gizmo-scale-group',
} as const;

/**
 * Affiche le jeu de poignées du mode courant et masque les autres.
 * Masquer un groupe **retire** ses poignées du raycast : aucune ambiguïté
 * possible entre une flèche de translation et un axe d'échelle superposés.
 */
export function setGizmoMode(gizmoGroup: THREE.Group | undefined, mode: GizmoMode): void {
  if (!gizmoGroup) return;
  gizmoGroup.userData.gizmoMode = mode;

  (Object.keys(GIZMO_MODE_GROUP) as GizmoMode[]).forEach((key) => {
    const group = gizmoGroup.getObjectByName(GIZMO_MODE_GROUP[key]);
    if (group) group.visible = key === mode;
  });
}

/** Applique l'échelle adaptative du gizmo (voir `computeGizmoScale`). */
export function setGizmoScale(gizmoGroup: THREE.Group | undefined, scale: number): void {
  if (!gizmoGroup) return;
  const safe = clampNumber(scale, 0.1, 12);
  gizmoGroup.scale.setScalar(safe);
  gizmoGroup.userData.gizmoScale = safe;
}

function gizmoLineMaterial(color: number): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.95 });
}

/** Flèche unitaire (hampe + cône) alignée sur l'axe demandé. */
function buildArrow(axis: 'x' | 'y' | 'z', handleName: string): THREE.Group {
  const group = new THREE.Group();
  group.name = handleName;

  const material = gizmoLineMaterial(AXIS_COLORS[axis]);
  const shaftLength = GIZMO_AXIS_LENGTH;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, shaftLength, 8), material);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.9, 12), material);

  if (axis === 'x') {
    shaft.rotation.z = -Math.PI / 2;
    shaft.position.set(shaftLength / 2, 0, 0);
    head.rotation.z = -Math.PI / 2;
    head.position.set(shaftLength + 0.95, 0, 0);
  } else if (axis === 'y') {
    shaft.position.set(0, shaftLength / 2, 0);
    head.position.set(0, shaftLength + 0.95, 0);
  } else {
    shaft.rotation.x = Math.PI / 2;
    shaft.position.set(0, 0, shaftLength / 2);
    head.rotation.x = Math.PI / 2;
    head.position.set(0, 0, shaftLength + 0.95);
  }

  shaft.name = handleName;
  head.name = handleName;
  group.add(shaft, head);
  return group;
}

/** Poignée d'échelle (hampe + cube terminal) alignée sur l'axe demandé. */
function buildScaleHandle(axis: 'x' | 'y' | 'z', handleName: string): THREE.Group {
  const group = new THREE.Group();
  group.name = handleName;

  const material = gizmoLineMaterial(AXIS_COLORS[axis]);
  const shaftLength = GIZMO_AXIS_LENGTH;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, shaftLength, 8), material);
  const knob = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), material);

  if (axis === 'x') {
    shaft.rotation.z = -Math.PI / 2;
    shaft.position.set(shaftLength / 2, 0, 0);
    knob.position.set(shaftLength + 0.65, 0, 0);
  } else if (axis === 'y') {
    shaft.position.set(0, shaftLength / 2, 0);
    knob.position.set(0, shaftLength + 0.65, 0);
  } else {
    shaft.rotation.x = Math.PI / 2;
    shaft.position.set(0, 0, shaftLength / 2);
    knob.position.set(0, 0, shaftLength + 0.65);
  }

  shaft.name = handleName;
  knob.name = handleName;
  group.add(shaft, knob);
  return group;
}

/** Anneau de rotation dans le plan perpendiculaire à l'axe demandé. */
function buildRotationRing(axis: 'x' | 'y' | 'z', handleName: string): THREE.Group {
  const group = new THREE.Group();
  group.name = handleName;

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(GIZMO_RING_RADIUS, 0.16, 8, 64),
    new THREE.MeshBasicMaterial({
      color: AXIS_COLORS[axis],
      depthTest: false,
      transparent: true,
      opacity: 0.9,
    })
  );
  ring.name = handleName;

  if (axis === 'x') ring.rotation.y = Math.PI / 2;
  else if (axis === 'y') ring.rotation.x = Math.PI / 2;

  group.add(ring);

  // Deux repères d'angle à 90° pour lire le sens de rotation.
  const tickMat = new THREE.MeshBasicMaterial({
    color: AXIS_COLORS[axis],
    depthTest: false,
    transparent: true,
    opacity: 0.7,
  });
  [Math.PI / 2, -Math.PI / 2].forEach((angle) => {
    const tick = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.7), tickMat);
    tick.name = handleName;
    if (axis === 'x') tick.position.set(0, Math.sin(angle) * GIZMO_RING_RADIUS, Math.cos(angle) * GIZMO_RING_RADIUS);
    else if (axis === 'y') tick.position.set(Math.sin(angle) * GIZMO_RING_RADIUS, 0, Math.cos(angle) * GIZMO_RING_RADIUS);
    else tick.position.set(Math.sin(angle) * GIZMO_RING_RADIUS, Math.cos(angle) * GIZMO_RING_RADIUS, 0);
    group.add(tick);
  });

  return group;
}

/**
 * Construit le gizmo complet : trois jeux de poignées (translation au sol,
 * lacet, mise à l'échelle) plus le disque central de glissement libre.
 *
 * Le groupe est ancré par `syncGizmoPosition` tantôt au sol (mode Déplacer),
 * tantôt au **centre englobant** de l'objet (modes Tourner / Redimensionner),
 * afin que les poignées restent accessibles sur un bâtiment haut ou agrandi.
 */
export function createCampusGizmo(): THREE.Group {
  const gizmoGroup = new THREE.Group();
  gizmoGroup.name = 'gizmo-root';
  gizmoGroup.userData.gizmoMode = 'translate' as GizmoMode;
  gizmoGroup.userData.gizmoScale = 1;

  // --- Mode « Déplacer » : flèches X / Y / Z + disque de glissement libre ---
  const translateGroup = new THREE.Group();
  translateGroup.name = GIZMO_MODE_GROUP.translate;

  const discMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthTest: false,
  });
  const discGeo = new THREE.CircleGeometry(3.6, 32);
  const centerDisc = new THREE.Mesh(discGeo, discMat);
  centerDisc.rotation.x = -Math.PI / 2;
  centerDisc.name = 'gizmo-center';
  translateGroup.add(centerDisc);

  const discBorder = new THREE.Mesh(
    new THREE.RingGeometry(3.45, 3.65, 32),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide, depthTest: false })
  );
  discBorder.rotation.x = -Math.PI / 2;
  discBorder.name = 'gizmo-center';
  translateGroup.add(discBorder);

  translateGroup.add(buildArrow('x', 'gizmo-translate-x'));
  translateGroup.add(buildArrow('z', 'gizmo-translate-z'));
  gizmoGroup.add(translateGroup);

  // --- Mode « Tourner » : anneau de lacet (rotation autour de l'axe vertical).
  // Le bâtiment reste d'aplomb : aucune inclinaison n'est exposée.
  const rotateGroup = new THREE.Group();
  rotateGroup.name = GIZMO_MODE_GROUP.rotate;
  rotateGroup.add(buildRotationRing('y', 'gizmo-rotate-y'));
  rotateGroup.visible = false;
  gizmoGroup.add(rotateGroup);

  // --- Mode « Redimensionner » : axes + cube central d'échelle uniforme ---
  const scaleGroup = new THREE.Group();
  scaleGroup.name = GIZMO_MODE_GROUP.scale;
  scaleGroup.add(buildScaleHandle('x', 'gizmo-scale-x'));
  scaleGroup.add(buildScaleHandle('y', 'gizmo-scale-y'));
  scaleGroup.add(buildScaleHandle('z', 'gizmo-scale-z'));

  const uniformKnob = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 1.9, 1.9),
    new THREE.MeshBasicMaterial({ color: 0xffe500, depthTest: false, transparent: true, opacity: 0.95 })
  );
  uniformKnob.name = 'gizmo-scale-uniform';
  scaleGroup.add(uniformKnob);

  const wireBox = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(3.4, 3.4, 3.4)),
    new THREE.LineBasicMaterial({ color: 0xffe500, transparent: true, opacity: 0.55, depthTest: false })
  );
  wireBox.name = 'gizmo-scale-uniform';
  scaleGroup.add(wireBox);

  scaleGroup.visible = false;
  gizmoGroup.add(scaleGroup);

  gizmoGroup.visible = false;
  return gizmoGroup;
}

/**
 * Remonte l'arbre d'un objet touché par le rayon jusqu'à trouver une poignée
 * **exactement** nommée. Retourne `null` si le clic n'a pas touché de poignée.
 *
 * Le contrôle de visibilité est indispensable : `Raycaster` de Three.js
 * **ignore `Object3D.visible`**. Sans lui, les poignées masquées des autres
 * modes (par exemple les axes d'échelle en mode Déplacer) intercepteraient
 * toujours les clics et déclencheraient la mauvaise manipulation.
 */
export function findGizmoHandle(
  obj: THREE.Object3D | null,
  gizmoRoot: THREE.Group
): GizmoHandleName | null {
  let cur = obj;
  while (cur && cur !== gizmoRoot) {
    if (!cur.visible) return null;
    if (cur.name && GIZMO_HANDLE_SET.has(cur.name)) {
      return cur.name as GizmoHandleName;
    }
    cur = cur.parent;
  }
  return null;
}

/**
 * Première poignée **active** (visible) parmi les intersections du rayon.
 * Le tri par proximité ne suffit pas : la première intersection peut
 * appartenir à un jeu de poignées masqué, tandis qu'une poignée visible du
 * mode courant se trouve juste derrière.
 */
export function findFirstActiveGizmoHandle(
  intersections: THREE.Intersection[],
  gizmoRoot: THREE.Group
): GizmoHandleName | null {
  for (const hit of intersections) {
    const handle = findGizmoHandle(hit.object, gizmoRoot);
    if (handle) return handle;
  }
  return null;
}

/** Groupe bâtiment (enfant direct de `buildingsRoot`) contenant l'objet donné. */
export function findBuildingGroup(
  obj: THREE.Object3D | null,
  buildingsRoot: THREE.Group
): THREE.Object3D | null {
  let cur = obj;
  while (cur && cur.parent && cur.parent !== buildingsRoot) {
    cur = cur.parent;
  }
  return cur;
}

/** Arrondit une valeur au pas d'aimantation (0 = pas d'arrondi). */
export function snapValue(val: number, step: number): number {
  return snapToStep(val, step);
}

/**
 * Couronne de mise en évidence de l'objet sélectionné.
 * Sa taille est pilotée par `setHighlightRadius` afin d'épouser l'emprise
 * réelle d'un bâtiment agrandi, au lieu d'un anneau de taille fixe qui
 * disparaît dans le volume.
 */
export function createCampusHighlight(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'campus-highlight-group';

  const outerRing = new THREE.Mesh(
    new THREE.RingGeometry(8.5, 9.2, 48),
    new THREE.MeshBasicMaterial({
      color: 0xffe500,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  outerRing.rotation.x = -Math.PI / 2;
  outerRing.position.y = 0.14;
  outerRing.name = 'highlight-outer-ring';
  group.add(outerRing);

  const innerDisc = new THREE.Mesh(
    new THREE.CircleGeometry(8.2, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffe500,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  innerDisc.rotation.x = -Math.PI / 2;
  innerDisc.position.y = 0.12;
  innerDisc.name = 'highlight-inner-disc';
  group.add(innerDisc);

  const reticleGroup = new THREE.Group();
  reticleGroup.name = 'highlight-reticle';
  [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((ang) => {
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.12, 2.2),
      new THREE.MeshBasicMaterial({ color: 0xffe500, depthWrite: false })
    );
    tick.position.set(Math.sin(ang) * 9.0, 0.16, Math.cos(ang) * 9.0);
    tick.rotation.y = ang;
    reticleGroup.add(tick);
  });
  group.add(reticleGroup);

  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(8.2, 8.2, 22, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffe500,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  pillar.position.y = 11;
  pillar.name = 'highlight-pillar';
  group.add(pillar);

  group.visible = true;
  return group;
}

/** Adapte la couronne de mise en évidence à l'emprise de l'objet (rayon en mètres). */
export function setHighlightRadius(group: THREE.Group | undefined, radius: number): void {
  if (!group) return;
  const scalar = clampNumber(radius / HIGHLIGHT_BASE_RADIUS, 0.25, 24);
  group.scale.setScalar(scalar);
}
