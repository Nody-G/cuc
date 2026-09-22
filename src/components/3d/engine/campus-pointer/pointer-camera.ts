import * as THREE from 'three';
import type { ThreeSceneContext } from '../../types/campus3d.types';
import { PAN_BOUNDS } from './pointer-options';

export const updateMouseVector = (
    canvas: HTMLCanvasElement,
    three: ThreeSceneContext,
    e: PointerEvent
) => {
    const rect = canvas.getBoundingClientRect();
    three.mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    three.mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    three.raycaster.setFromCamera(three.mouseVector, three.camera);
};

/**
 * Démarre un déplacement latéral de la caméra (pan).
 *
 * Le plan ne permettait que pivoter et zoomer : impossible de se décaler
 * vers un bâtiment hors champ. Le pan complète l'orbite en translatant le
 * point visé, sans changer l'angle ni la distance.
 */
export const beginPan = (canvas: HTMLCanvasElement, three: ThreeSceneContext, e: PointerEvent) => {
    three.isPanning = true;
    three.isDragging = false;
    three.isDraggingGizmo = false;
    three.prevMousePos = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
};

/**
 * Translatte le point visé en proportion de l'écran.
 *
 * L'échelle est dérivée du champ de vision à la distance courante : le
 * décalage suit exactement le curseur (1 pixel écran = 1 pixel monde à
 * l'endroit visé), quel que soit le niveau de zoom.
 */
export const applyPan = (
    canvas: HTMLCanvasElement,
    three: ThreeSceneContext,
    dx: number,
    dy: number
) => {
    const height = Math.max(canvas.clientHeight, 1);
    const width = Math.max(canvas.clientWidth, 1);

    const distance = three.spherical.radius;
    const worldHeight = 2 * distance * Math.tan(THREE.MathUtils.degToRad(three.camera.fov / 2));
    const worldWidth = worldHeight * (width / height);

    const right = new THREE.Vector3().setFromMatrixColumn(three.camera.matrixWorld, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(three.camera.matrixWorld, 1);

    three.targetCenter.addScaledVector(right, (-dx / width) * worldWidth);
    three.targetCenter.addScaledVector(up, (dy / height) * worldHeight);

    three.targetCenter.x = Math.max(-PAN_BOUNDS, Math.min(PAN_BOUNDS, three.targetCenter.x));
    three.targetCenter.z = Math.max(-PAN_BOUNDS, Math.min(PAN_BOUNDS, three.targetCenter.z));
};
