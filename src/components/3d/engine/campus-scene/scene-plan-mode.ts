/**
 * Modes d'affichage du plan (blueprint / daylight / satellite) : fond, brume,
 * lumières, grille, sol et palette par rôle de matériau.
 */

import * as THREE from 'three';
import { PlanMode } from '../../types/campus3d.types';
import type { MaterialRole } from '../campusBuildingMeshes';

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
