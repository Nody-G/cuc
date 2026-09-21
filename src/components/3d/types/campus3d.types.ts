import type * as THREE from 'three';

export type PlanMode = 'satellite' | 'blueprint' | 'daylight';

// Vues caméra publiques : la vue globale et le plan zénithal 2D.
// Les cadrages par bâtiment sont gérés par `focusFacility` (sélecteur
// d'installations), ce qui évite toute redondance dans l'interface.
export type CameraPreset = 'overview' | 'zenith';

export interface EditableFacilityItem {
  id: string;
  name: string;
  code: string;
  x: number;
  z: number;
  rotationY: number; // in degrees
  scale: number;
  heightScale: number;
  visible: boolean;
}

export interface CameraPresetConfig {
  label: string;
  radius: number;
  theta: number;
  phi: number;
  center: [number, number, number];
}

export type GizmoDragType = 'x' | 'z' | 'center' | 'rot' | null;

export interface CampusPlan3DProps {
  initialMode?: PlanMode;
  className?: string;
  /**
   * Force l'ouverture du studio de placement (édition des positions,
   * rotations, échelles et hauteurs des modèles 3D).
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
  isDraggingGizmo: boolean;
  activeDragType: GizmoDragType;
  dragStartIntersection: THREE.Vector3;
  dragStartPos: { x: number; z: number };
  dragStartRotation: number;
  dragStartAngle: number;
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
