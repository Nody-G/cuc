import * as THREE from 'three';

/**
 * Rôle matériau d'un maillage. Permet à `applyPlanMode` de préserver la
 * différenciation (façade / toiture / vitrage / béton / bois) au lieu de
 * tout aplatir en une couleur unique.
 */
export type MaterialRole = 'wall' | 'roof' | 'glass' | 'concrete' | 'timber' | 'steel' | 'accent' | 'ground';

/** Marque un maillage avec son rôle matériau. */
export function tagRole(mesh: THREE.Mesh, role: MaterialRole): THREE.Mesh {
    mesh.userData.materialRole = role;
    return mesh;
}

export interface SceneMaterials {
    steelMat: THREE.MeshStandardMaterial;
    yellowMat: THREE.MeshStandardMaterial;
    darkBuildingMat: THREE.MeshStandardMaterial;
    /** Façade claire (béton / enduit) pour différencier les volumes. */
    wallMat: THREE.MeshStandardMaterial;
    /** Toiture sombre (bac acier / membrane). */
    roofMat: THREE.MeshStandardMaterial;
    /** Vitrage teinté (bandeaux vitrés, verrières). */
    glassMat: THREE.MeshStandardMaterial;
    /** Béton brut (socles, quais, murets). */
    concreteMat: THREE.MeshStandardMaterial;
    /** Bois / bardage chaud (manège, annexes). */
    timberMat: THREE.MeshStandardMaterial;
}

export function createSceneMaterials(): SceneMaterials {
    return {
        steelMat: new THREE.MeshStandardMaterial({
            color: 0x4a5568,
            metalness: 0.85,
            roughness: 0.25,
        }),
        yellowMat: new THREE.MeshStandardMaterial({
            color: 0xffe500,
            emissive: 0x443b00,
            emissiveIntensity: 0.35,
            metalness: 0.5,
            roughness: 0.3,
        }),
        darkBuildingMat: new THREE.MeshStandardMaterial({
            color: 0x181a24,
            roughness: 0.45,
            metalness: 0.6,
            emissive: 0x080910,
            emissiveIntensity: 0.4,
        }),
        wallMat: new THREE.MeshStandardMaterial({
            color: 0x2a2e3a,
            roughness: 0.72,
            metalness: 0.18,
        }),
        roofMat: new THREE.MeshStandardMaterial({
            color: 0x14161d,
            roughness: 0.55,
            metalness: 0.45,
        }),
        glassMat: new THREE.MeshStandardMaterial({
            color: 0x0e2a3d,
            roughness: 0.12,
            metalness: 0.85,
            emissive: 0x0a1c2a,
            emissiveIntensity: 0.5,
        }),
        concreteMat: new THREE.MeshStandardMaterial({
            color: 0x3a3d45,
            roughness: 0.9,
            metalness: 0.05,
        }),
        timberMat: new THREE.MeshStandardMaterial({
            color: 0x4a3524,
            roughness: 0.85,
            metalness: 0.05,
        }),
    };
}

/**
 * Ajoute une bande de fenêtres sur une façade (plan XZ donné).
 * `face` : 'north' | 'south' | 'east' | 'west'.
 */
export function addWindowBand(
    group: THREE.Group,
    mats: SceneMaterials,
    width: number,
    height: number,
    depth: number,
    y: number,
    face: 'north' | 'south' | 'east' | 'west',
    count = 4
): void {
    const bandH = Math.min(1.6, height * 0.28);
    const bandY = y;
    const span = face === 'north' || face === 'south' ? width : depth;
    const step = span / (count + 1);
    const winW = Math.min(step * 0.55, 2.4);

    for (let i = 1; i <= count; i++) {
        const offset = -span / 2 + step * i;
        const win = tagRole(new THREE.Mesh(new THREE.BoxGeometry(winW, bandH, 0.12), mats.glassMat), 'glass');
        if (face === 'north') {
            win.position.set(offset, bandY, -depth / 2 - 0.06);
        } else if (face === 'south') {
            win.position.set(offset, bandY, depth / 2 + 0.06);
        } else if (face === 'east') {
            win.rotation.y = Math.PI / 2;
            win.position.set(width / 2 + 0.06, bandY, offset);
        } else {
            win.rotation.y = Math.PI / 2;
            win.position.set(-width / 2 - 0.06, bandY, offset);
        }
        group.add(win);
    }
}

/** Ajoute une porte (rectangle sombre) sur une façade. */
export function addDoor(
    group: THREE.Group,
    mats: SceneMaterials,
    width: number,
    depth: number,
    face: 'north' | 'south' | 'east' | 'west'
): void {
    const door = tagRole(new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 0.14), mats.roofMat), 'roof');
    if (face === 'north') door.position.set(0, 1.3, -depth / 2 - 0.07);
    else if (face === 'south') door.position.set(0, 1.3, depth / 2 + 0.07);
    else if (face === 'east') {
        door.rotation.y = Math.PI / 2;
        door.position.set(width / 2 + 0.07, 1.3, 0);
    } else {
        door.rotation.y = Math.PI / 2;
        door.position.set(-width / 2 - 0.07, 1.3, 0);
    }
    group.add(door);
}

/** Ajoute un socle béton sous un bâtiment. */
export function addPlinth(group: THREE.Group, mats: SceneMaterials, width: number, depth: number): void {
    const plinth = tagRole(new THREE.Mesh(new THREE.BoxGeometry(width + 1.2, 0.5, depth + 1.2), mats.concreteMat), 'concrete');
    plinth.position.set(0, 0.25, 0);
    plinth.receiveShadow = true;
    group.add(plinth);
}
