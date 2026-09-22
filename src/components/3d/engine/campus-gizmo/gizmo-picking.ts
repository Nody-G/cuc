import * as THREE from 'three';
import type { GizmoDragType, GizmoMode } from '../../types/campus3d.types';
import { snapToStep } from '../../data/facilityTransform';
import { GIZMO_HANDLE_SET, type GizmoHandleName } from './gizmo-constants';

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
    let handle: GizmoHandleName | null = null;
    let cur = obj;

    while (cur && cur !== gizmoRoot) {
        // La chaîne complète est contrôlée **avant** de conclure : un maillage peut
        // être visible alors que son groupe porteur est masqué (jeu de poignées
        // d'un autre outil), et il ne doit alors jamais répondre au clic.
        if (!cur.visible) return null;
        if (!handle && cur.name && GIZMO_HANDLE_SET.has(cur.name)) {
            handle = cur.name as GizmoHandleName;
        }
        cur = cur.parent;
    }

    return handle;
}

/** Outil auquel appartient une poignée. */
export function handleToMode(handle: GizmoHandleName): GizmoMode {
    if (handle === 'gizmo-rotate-y') return 'rotate';
    if (handle === 'gizmo-scale-x' || handle === 'gizmo-scale-y' || handle === 'gizmo-scale-z' || handle === 'gizmo-scale-uniform') {
        return 'scale';
    }
    return 'translate';
}

/** Filtre appliqué aux intersections retenues (priorité à un outil). */
export type GizmoHandleFilter = (handle: GizmoHandleName) => boolean;

/**
 * Première poignée **active** (visible) parmi les intersections du rayon.
 *
 * Le tri par proximité ne suffit pas : l'anneau de lacet est affiché en
 * permanence et peut se trouver devant une poignée du mode courant. Le filtre
 * permet de donner la priorité aux poignées de l'outil sélectionné, afin que
 * l'anneau ne vole jamais le clic destiné à un axe de translation ou d'échelle.
 */
export function findFirstGizmoHandle(
    intersections: THREE.Intersection[],
    gizmoRoot: THREE.Group,
    filter?: GizmoHandleFilter
): GizmoHandleName | null {
    for (const hit of intersections) {
        const handle = findGizmoHandle(hit.object, gizmoRoot);
        if (!handle) continue;
        if (filter && !filter(handle)) continue;
        return handle;
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
