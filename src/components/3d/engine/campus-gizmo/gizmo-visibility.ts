import * as THREE from 'three';
import type { GizmoMode } from '../../types/campus3d.types';
import { clampNumber } from '../../data/facilityTransform';
import { GIZMO_EXCLUSIVE_GROUP, ROTATE_GROUP_NAME, ROTATE_RING_OPACITY } from './gizmo-constants';

/**
 * Sélectionne l'outil de manipulation.
 *
 * L'anneau de lacet **reste affiché dans tous les modes** : c'est
 * l'affordance de rotation, et sa disparition rendait la rotation
 * introuvable. Hors mode « Tourner », il est simplement estompé, et la
 * détection lui donne la priorité la plus basse (voir `findFirstGizmoHandle`)
 * pour qu'il ne vole jamais le clic destiné à un axe du mode courant.
 */
export function setGizmoMode(gizmoGroup: THREE.Group | undefined, mode: GizmoMode): void {
    if (!gizmoGroup) return;
    gizmoGroup.userData.gizmoMode = mode;

    (Object.keys(GIZMO_EXCLUSIVE_GROUP) as Array<keyof typeof GIZMO_EXCLUSIVE_GROUP>).forEach(
        (key) => {
            const group = gizmoGroup.getObjectByName(GIZMO_EXCLUSIVE_GROUP[key]);
            if (group) group.visible = key === mode;
        }
    );

    setRotateRingEmphasis(gizmoGroup, mode === 'rotate');
}

/** Estompe ou met en avant l'anneau de lacet selon qu'il est l'outil courant. */
export function setRotateRingEmphasis(gizmoGroup: THREE.Group | undefined, active: boolean): void {
    const group = gizmoGroup?.getObjectByName(ROTATE_GROUP_NAME);
    if (!group) return;

    group.visible = true;
    group.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
            if (material instanceof THREE.MeshBasicMaterial) {
                material.transparent = true;
                material.opacity = active ? ROTATE_RING_OPACITY.active : ROTATE_RING_OPACITY.idle;
            }
        });
    });
}

/** Applique l'échelle adaptative du gizmo (voir `computeGizmoScale`). */
export function setGizmoScale(gizmoGroup: THREE.Group | undefined, scale: number): void {
    if (!gizmoGroup) return;
    const safe = clampNumber(scale, 0.1, 12);
    gizmoGroup.scale.setScalar(safe);
    gizmoGroup.userData.gizmoScale = safe;
}
