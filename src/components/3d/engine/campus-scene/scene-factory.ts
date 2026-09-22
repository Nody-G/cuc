/**
 * Fabrique WebGL du campus : scène, caméra, renderer, sol photographique et
 * lumières — le contexte brut consommé par le graphe de scène.
 */

import * as THREE from 'three';

const DEG_TO_RAD = Math.PI / 180;

export function degToRad(degrees: number): number {
    return degrees * DEG_TO_RAD;
}

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
