import * as THREE from 'three';
import { CAMPUS_FACILITIES } from '@/data/campus';
import { EditableFacilityItem, PlanMode } from '../types/campus3d.types';
import { transformOf } from '../data/facilityTransform';
import {
  createSceneMaterials,
  buildTowerMesh,
  buildZoeBellMesh,
  buildHangarMesh,
  buildDojosMesh,
  buildCityStadeMesh,
  buildMecaniqueMesh,
  buildQgMesh,
  buildManegeMesh,
  buildOutdoorMesh,
  type MaterialRole,
} from './campusBuildingMeshes';

const DEG_TO_RAD = Math.PI / 180;

function degToRad(degrees: number): number {
  return degrees * DEG_TO_RAD;
}

export {
  createSceneMaterials,
  buildTowerMesh,
  buildZoeBellMesh,
  buildHangarMesh,
  buildDojosMesh,
  buildCityStadeMesh,
  buildMecaniqueMesh,
  buildQgMesh,
  buildManegeMesh,
  buildOutdoorMesh,
};

export interface CampusWebGLContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  groundMesh: THREE.Mesh;
  groundGrid: THREE.GridHelper;
  ambientLight: THREE.AmbientLight;
  sunLight: THREE.DirectionalLight;
  aerialTexture: THREE.Texture | null;
}

export function initCampusScene(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CampusWebGLContext {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050608);
  scene.fog = new THREE.FogExp2(0x050608, 0.006);

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 500);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  let aerialTexture: THREE.Texture | null = null;
  try {
    const texLoader = new THREE.TextureLoader();
    aerialTexture = texLoader.load('/images/cuc_campus_aerial_real_z19.jpg');
    aerialTexture.generateMipmaps = true;
    aerialTexture.minFilter = THREE.LinearMipmapLinearFilter;
    aerialTexture.magFilter = THREE.LinearFilter;
  } catch {
    // Graceful fallback
  }

  // Plan de fond calibré sur l'emprise réelle du domaine CUC
  // (way OSM 1007277364 : 201 m Nord-Sud × 225 m Est-Ouest).
  // Marge de 10 % pour englober les abords immédiats.
  const GROUND_SIZE = 248;
  const groundGeo = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);
  const groundMat = new THREE.MeshStandardMaterial({
    map: aerialTexture,
    roughness: 0.85,
    metalness: 0.1,
  });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // Grille : 1 division ≈ 7,75 m (248 / 32), alignée sur l'emprise réelle.
  const groundGrid = new THREE.GridHelper(GROUND_SIZE, 32, 0xffe500, 0x333b4d);
  groundGrid.position.y = 0.08;
  scene.add(groundGrid);

  const ambientLight = new THREE.AmbientLight(0xd0d5e8, 0.9);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffe899, 1.8);
  sunLight.position.set(60, 90, 45);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 320;
  // Emprise élargie pour couvrir le domaine réel (248 m) sans couper les ombres.
  sunLight.shadow.camera.left = -140;
  sunLight.shadow.camera.right = 140;
  sunLight.shadow.camera.top = 140;
  sunLight.shadow.camera.bottom = -140;
  scene.add(sunLight);

  return {
    scene,
    camera,
    renderer,
    groundMesh,
    groundGrid,
    ambientLight,
    sunLight,
    aerialTexture,
  };
}

export function setupCampusBuildings(
  buildingsGroup: THREE.Group,
  beaconsGroup: THREE.Group,
  facilities: Record<string, EditableFacilityItem>
): void {
  const mats = createSceneMaterials();

  const builders: Record<string, () => THREE.Group> = {
    'cuc-tower': () => buildTowerMesh(mats),
    'zoe-bell-hall': () => buildZoeBellMesh(mats),
    'hangar-wirework': () => buildHangarMesh(mats),
    'dojos-sceniques': () => buildDojosMesh(mats),
    'city-stade-exterieur': () => buildCityStadeMesh(),
    'espace-mecanique': () => buildMecaniqueMesh(mats),
    'qg-staff-hebergement': () => buildQgMesh(mats),
    'manege-equestre': () => buildManegeMesh(mats),
    'site-tournage': () => buildOutdoorMesh(mats),
  };

  Object.entries(builders).forEach(([id, builder]) => {
    const item = facilities[id];
    const group = builder();
    if (item) {
      const transform = transformOf(item);
      // `|| 1` : garde-fou contre un enregistrement hérité incomplet (une
      // échelle `NaN` rendrait le maillage invisible sans message d'erreur).
      group.position.set(transform.x || 0, 0, transform.z || 0);
      group.rotation.y = degToRad(transform.rotationY || 0);
      group.scale.set(transform.scaleX || 1, transform.scaleY || 1, transform.scaleZ || 1);
      group.visible = item.visible;
    }
    buildingsGroup.add(group);
  });

  // Holographic Beacon Pins
  CAMPUS_FACILITIES.forEach((fac) => {
    const item = facilities[fac.id] || { x: 0, z: 0, visible: true };
    const beacon = new THREE.Group();
    beacon.name = `beacon-${fac.id}`;

    const diamond = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.3, 0),
      new THREE.MeshStandardMaterial({ color: 0xffe500, emissive: 0xffe500, emissiveIntensity: 0.9, wireframe: true })
    );
    diamond.position.y = 14;
    beacon.add(diamond);

    const dropLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 14, 0), new THREE.Vector3(0, 0.2, 0)]),
      new THREE.LineBasicMaterial({ color: 0xffe500, transparent: true, opacity: 0.5 })
    );
    beacon.add(dropLine);

    const ripple = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 2.8, 20),
      new THREE.MeshBasicMaterial({ color: 0xffe500, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.y = 0.2;
    beacon.add(ripple);

    beacon.position.set(item.x || 0, 0, item.z || 0);
    beacon.visible = item.visible;
    beaconsGroup.add(beacon);
  });
}

/**
 * Palette de matériaux par rôle, déclinée pour chaque mode d'affichage.
 * Permet à `applyPlanMode` de préserver la différenciation des volumes
 * (murs / toitures / vitrages / béton / bois / acier / accent) au lieu
 * d'aplatir tous les bâtiments sur une couleur unique.
 */
type RolePalette = Record<
  MaterialRole,
  { color: number; roughness: number; metalness: number; emissive?: number; emissiveIntensity?: number }
>;

const DAYLIGHT_PALETTE: RolePalette = {
  wall: { color: 0xd8d2c6, roughness: 0.72, metalness: 0.05 },
  roof: { color: 0x8f8a80, roughness: 0.85, metalness: 0.08 },
  glass: { color: 0x9fc6e0, roughness: 0.12, metalness: 0.35 },
  concrete: { color: 0xb9b6ae, roughness: 0.9, metalness: 0.02 },
  timber: { color: 0xb08a5c, roughness: 0.8, metalness: 0.03 },
  steel: { color: 0x9aa2ad, roughness: 0.35, metalness: 0.75 },
  accent: { color: 0xffe500, roughness: 0.4, metalness: 0.4 },
  ground: { color: 0xffffff, roughness: 0.95, metalness: 0.0 },
};

const SATELLITE_PALETTE: RolePalette = {
  wall: { color: 0x4a4d57, roughness: 0.7, metalness: 0.15 },
  roof: { color: 0x2f323b, roughness: 0.8, metalness: 0.2 },
  glass: { color: 0x2b4a63, roughness: 0.15, metalness: 0.5, emissive: 0x0a1a2a, emissiveIntensity: 0.3 },
  concrete: { color: 0x3c3f47, roughness: 0.9, metalness: 0.05 },
  timber: { color: 0x5a4630, roughness: 0.85, metalness: 0.05 },
  steel: { color: 0x6b7280, roughness: 0.4, metalness: 0.7 },
  accent: { color: 0xffe500, roughness: 0.45, metalness: 0.6, emissive: 0x443b00, emissiveIntensity: 0.4 },
  ground: { color: 0xd5d5d5, roughness: 0.95, metalness: 0.0 },
};

function resolveMaterialRole(child: THREE.Mesh): MaterialRole {
  const tagged = child.userData?.materialRole as MaterialRole | undefined;
  if (tagged) return tagged;
  // Repli sur l'ancien contrat par nom pour les meshes non taggés.
  if (child.name === 'accent' || child.name === 'cuc-tower') return 'accent';
  return 'wall';
}

function applyRolePalette(
  buildingsGroup: THREE.Group,
  palette: RolePalette,
  options: { emissive?: boolean } = {}
): void {
  buildingsGroup.traverse((child) => {
    if (child instanceof THREE.Mesh && !child.name.startsWith('gizmo-')) {
      const role = resolveMaterialRole(child);
      const spec = palette[role];
      child.material = new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: spec.roughness,
        metalness: spec.metalness,
        emissive: options.emissive ? (spec.emissive ?? 0x000000) : 0x000000,
        emissiveIntensity: options.emissive ? (spec.emissiveIntensity ?? 0) : 0,
      });
    }
  });
}

export function applyPlanMode(
  mode: PlanMode,
  scene: THREE.Scene,
  buildingsGroup: THREE.Group,
  groundMesh: THREE.Mesh,
  groundGrid: THREE.GridHelper,
  ambientLight: THREE.AmbientLight,
  sunLight: THREE.DirectionalLight,
  aerialTexture: THREE.Texture | null
): void {
  if (mode === 'blueprint') {
    scene.background = new THREE.Color(0x020409);
    scene.fog = new THREE.FogExp2(0x020409, 0.007);
    ambientLight.color.setHex(0x003b5c);
    ambientLight.intensity = 1.0;
    sunLight.color.setHex(0x00e5ff);
    sunLight.intensity = 1.2;

    groundGrid.visible = true;
    groundGrid.material = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.35,
    });

    (groundMesh.material as THREE.MeshStandardMaterial).color.setHex(0x020a14);
    (groundMesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x002233);
    (groundMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.4;
    if (aerialTexture) {
      (groundMesh.material as THREE.MeshStandardMaterial).map = aerialTexture;
    }

    buildingsGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && !child.name.startsWith('gizmo-')) {
        child.material = new THREE.MeshBasicMaterial({
          color: 0x00e5ff,
          wireframe: true,
          transparent: true,
          opacity: 0.75,
        });
      }
    });
  } else if (mode === 'daylight') {
    scene.background = new THREE.Color(0xdce7f5);
    scene.fog = new THREE.FogExp2(0xdce7f5, 0.004);
    ambientLight.color.setHex(0xffffff);
    ambientLight.intensity = 1.6;
    sunLight.color.setHex(0xfff5ea);
    sunLight.intensity = 2.4;

    groundGrid.visible = true;
    groundGrid.material = new THREE.LineBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.25,
    });

    (groundMesh.material as THREE.MeshStandardMaterial).color.setHex(0xffffff);
    (groundMesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
    (groundMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.0;
    (groundMesh.material as THREE.MeshStandardMaterial).opacity = 1.0;
    (groundMesh.material as THREE.MeshStandardMaterial).transparent = false;
    if (aerialTexture) {
      (groundMesh.material as THREE.MeshStandardMaterial).map = aerialTexture;
    }

    applyRolePalette(buildingsGroup, DAYLIGHT_PALETTE);
  } else {
    scene.background = new THREE.Color(0x050608);
    scene.fog = new THREE.FogExp2(0x050608, 0.006);
    ambientLight.color.setHex(0xd0d5e8);
    ambientLight.intensity = 0.9;
    sunLight.color.setHex(0xffe899);
    sunLight.intensity = 1.8;

    groundGrid.visible = true;
    groundGrid.material = new THREE.LineBasicMaterial({
      color: 0xffe500,
      transparent: true,
      opacity: 0.18,
    });

    (groundMesh.material as THREE.MeshStandardMaterial).color.setHex(0xd5d5d5);
    (groundMesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
    (groundMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.0;
    (groundMesh.material as THREE.MeshStandardMaterial).opacity = 0.95;
    (groundMesh.material as THREE.MeshStandardMaterial).transparent = false;
    if (aerialTexture) {
      (groundMesh.material as THREE.MeshStandardMaterial).map = aerialTexture;
    }

    applyRolePalette(buildingsGroup, SATELLITE_PALETTE, { emissive: true });
  }
}
