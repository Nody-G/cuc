import type * as THREE from 'three';

export type PlanMode = 'satellite' | 'blueprint' | 'daylight';

export type CameraPreset =
  | 'overview'
  | 'zenith'
  | 'tower'
  | 'zoebell'
  | 'citystade'
  | 'drift'
  | 'manege'
  | 'qg';

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
  spotId?: string;
}

export type GizmoDragType = 'x' | 'z' | 'center' | 'rot' | null;

export interface CampusPlan3DProps {
  initialMode?: PlanMode;
  className?: string;
  enableDirectTourJump?: boolean;
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
