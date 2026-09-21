import type * as THREE from 'three';

export type PlanMode = 'satellite' | 'blueprint' | 'daylight';

// Vues caméra publiques : la vue globale et le plan zénithal 2D.
// Les cadrages par bâtiment sont gérés par `focusFacility` (sélecteur
// d'installations), ce qui évite toute redondance dans l'interface.
export type CameraPreset = 'overview' | 'zenith';

/**
 * Mode d'édition du gizmo. Chaque mode expose un jeu de poignées distinct :
 * - `translate` : flèches X / Z + disque de glissement libre au sol.
 * - `rotate`    : anneau de lacet (rotation autour de l'axe vertical).
 * - `scale`     : trois poignées d'axe + cube central d'échelle uniforme.
 *
 * Le périmètre retenu est volontairement restreint : **déplacer** sur le plan
 * du sol, **tourner** autour de l'axe vertical et **redimensionner**.
 * L'altitude et les inclinaisons (tangage / roulis) ne sont pas exposées :
 * un bâtiment posé au sol ne se surélève ni ne se penche.
 */
export type GizmoMode = 'translate' | 'rotate' | 'scale';

/**
 * Transformée d'une installation dans le repère scène.
 * Les translations sont en mètres, la rotation en degrés (convention
 * `Object3D.rotation` de Three.js).
 */
export interface FacilityTransform {
  x: number;
  z: number;
  /** Lacet autour de l'axe vertical, en degrés. */
  rotationY: number;
  /** Facteur d'échelle sur l'axe local X (largeur de l'empreinte). */
  scaleX: number;
  /** Facteur d'échelle sur l'axe local Y (hauteur). */
  scaleY: number;
  /** Facteur d'échelle sur l'axe local Z (profondeur de l'empreinte). */
  scaleZ: number;
}

export interface EditableFacilityItem extends FacilityTransform {
  id: string;
  name: string;
  code: string;
  /**
   * Verrouille les trois facteurs d'échelle entre eux : modifier un axe
   * applique le même rapport proportionnel aux deux autres.
   */
  uniformScale: boolean;
  visible: boolean;
  /**
   * Champs hérités (v1) : `scale` (uniforme XZ) et `heightScale` (Y).
   * Lus uniquement à la migration (`normalizeFacilityItem`), jamais écrits.
   */
  scale?: number;
  heightScale?: number;
}

export interface CameraPresetConfig {
  label: string;
  radius: number;
  theta: number;
  phi: number;
  center: [number, number, number];
}

/**
 * Type de manipulation active pendant un glisser de poignée de gizmo.
 * `null` = aucune manipulation de gizmo en cours.
 */
export type GizmoDragType =
  | 'translate-x'
  | 'translate-z'
  | 'translate-free'
  | 'rotate-y'
  | 'scale-x'
  | 'scale-y'
  | 'scale-z'
  | 'scale-uniform'
  | null;

/**
 * État de persistance des placements.
 *
 * Un enregistrement qui échoue en silence est indiscernable d'un
 * enregistrement réussi : l'opérateur croit avoir sauvegardé. Cet état est
 * donc rendu visible, message d'erreur réel inclus.
 */
export type CampusSaveState = 'idle' | 'saving' | 'saved' | 'error';

/** Destination réelle des écritures — déterminante pour l'opérateur. */
export type CampusSaveBackend = 'database' | 'local';

export interface CampusSaveStatus {
  state: CampusSaveState;
  /**
   * `database` : Cockpit, écriture partagée dans Supabase.
   * `local`    : studio ouvert depuis le site public (`?studio=1`), écriture
   *              dans le seul navigateur courant — ces positions ne sont ni
   *              partagées, ni visibles depuis le Cockpit.
   */
  backend: CampusSaveBackend;
  /** Message remonté par Supabase (ou par le stockage local), le cas échéant. */
  error?: string;
  /**
   * Écriture réussie mais conséquence partielle (par exemple revalidation des
   * pages publiques en échec). Les données sont bien en base : il serait faux
   * de présenter l'opération comme un échec.
   */
  warning?: string;
  /** Horodatage de la dernière écriture réussie. */
  savedAt?: number;
}

export interface CampusPlan3DProps {
  initialMode?: PlanMode;
  className?: string;
  /**
   * Force l'ouverture du studio de placement (déplacement, rotation et mise à
   * l'échelle des modèles 3D).
   *
   * - `true`  : studio ouvert d'emblée (usage Cockpit).
   * - `false` : studio fermé (usage public).
   * - `undefined` : comportement historique, piloté par `?studio=1`.
   */
  studio?: boolean;
  /**
   * Active la persistance Supabase (`site_settings` key='campus_placements_3d')
   * au lieu du seul `localStorage`. Utilisé par le Cockpit.
   */
  persistToDatabase?: boolean;
}

export interface ThreeSceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  buildingsGroup: THREE.Group;
  beaconsGroup: THREE.Group;
  gizmoGroup: THREE.Group;
  highlightGroup: THREE.Group;
  groundMesh: THREE.Mesh;
  groundGrid: THREE.GridHelper;
  groundPlaneRaycast: THREE.Plane;
  ambientLight: THREE.AmbientLight;
  sunLight: THREE.DirectionalLight;
  aerialTexture: THREE.Texture | null;
  isDragging: boolean;
  /** Déplacement latéral de la caméra (clic droit, molette, ou Maj + glisser). */
  isPanning: boolean;
  isDraggingGizmo: boolean;
  activeDragType: GizmoDragType;
  dragStartIntersection: THREE.Vector3;
  /** Transformée de l'objet au moment du clic (pas du glisser). */
  dragStartTransform: FacilityTransform;
  /** Paramètre le long de l'axe manipulé au moment du clic (échelle / rotation). */
  dragStartAxisParam: number;
  /**
   * Pivot figé au moment de la saisie : les mesures d'angle et de mise à
   * l'échelle se font autour de ce point, jamais autour de la position
   * vivante du gizmo. Sans ce gel, un changement d'outil ou le suivi de
   * l'objet pendant le glisser décaleraient le centre de rotation.
   */
  dragPivot: THREE.Vector3;
  /** Outil actif au moment de la saisie (l'ancre ne doit pas bouger ensuite). */
  dragGizmoMode: GizmoMode;
  /** Position écran du pointeur au moment du clic (échelle uniforme). */
  dragStartPointer: { x: number; y: number };
  /** Rayon englobant de l'objet sélectionné, figé pour la durée du glisser. */
  dragObjectRadius: number;
  /** Mode d'édition actif (piloté par le studio). */
  gizmoMode: GizmoMode;
  /** Rayon englobant de l'objet sélectionné (mis en cache à la synchro). */
  gizmoObjectRadius: number;
  /** Échelle du gizmo figée pendant un glisser (évite tout effet de boucle). */
  gizmoScaleFrozen: number | null;
  prevMousePos: { x: number; y: number };
  spherical: { radius: number; theta: number; phi: number };
  targetSpherical: { radius: number; theta: number; phi: number };
  center: THREE.Vector3;
  targetCenter: THREE.Vector3;
  currentLookAt: THREE.Vector3;
  pulseTime: number;
  animFrameId: number;
  raycaster: THREE.Raycaster;
  mouseVector: THREE.Vector2;
}
