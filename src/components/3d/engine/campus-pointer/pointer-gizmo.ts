import * as THREE from 'three';
import type {
    EditableFacilityItem,
    FacilityTransform,
    GizmoDragType,
    ThreeSceneContext,
} from '../../types/campus3d.types';
import {
    TRANSFORM_LIMITS,
    clampPosition,
    clampScale,
    normalizeAngle360,
    snapToStep,
    transformOf,
} from '../../data/facilityTransform';
import {
    axisVector,
    getObjectFrame,
    rayAxisParam,
    rayPlanePoint,
    resolveAxisScaleDrag,
    resolveUniformScaleDrag,
    signedAngleAroundAxis,
} from '../gizmoMath';
import type { Axis } from './pointer-options';

/**
 * Angle courant du pointeur autour de l'axe vertical, mesuré dans le plan
 * perpendiculaire passant par le centre du gizmo.
 *
 * Le sens de rotation obtenu est celui de Three.js (règle de la main
 * droite) : le delta d'angle se cumule donc directement à `rotationY`, sans
 * correction de signe ad hoc.
 */
export const lacetAngleAt = (
    three: ThreeSceneContext,
    center: THREE.Vector3
): number | null => {
    const axis = axisVector('y');
    const planePoint = rayPlanePoint(three.raycaster.ray, axis, center);
    if (!planePoint) return null;
    return signedAngleAroundAxis(planePoint, center, axis, new THREE.Vector3(1, 0, 0));
};

/**
 * Capture l'état nécessaire à la manipulation : transformée de départ,
 * rayon englobant de l'objet, échelle du gizmo **gelée** pour la durée du
 * glisser (sans ce gel, agrandir le bâtiment agrandirait le gizmo, qui
 * agrandirait le bâtiment — une boucle divergente), et paramètre de
 * référence le long de l'axe manipulé.
 */
export const beginGizmoDrag = (
    canvas: HTMLCanvasElement,
    three: ThreeSceneContext,
    e: PointerEvent,
    item: EditableFacilityItem,
    dragType: GizmoDragType
) => {
    if (!dragType) return;

    three.dragStartTransform = transformOf(item);
    three.dragStartPointer = { x: e.clientX, y: e.clientY };
    three.activeDragType = dragType;
    three.dragObjectRadius =
        getObjectFrame(three.buildingsGroup.getObjectByName(item.id))?.radius ?? 9;

    const frozen = three.gizmoGroup.userData.gizmoScale;
    three.gizmoScaleFrozen = typeof frozen === 'number' && frozen > 0 ? frozen : 1;

    const groundHit = new THREE.Vector3();
    if (three.raycaster.ray.intersectPlane(three.groundPlaneRaycast, groundHit)) {
        three.dragStartIntersection.copy(groundHit);
    } else {
        three.dragStartIntersection.set(three.dragStartTransform.x, 0, three.dragStartTransform.z);
    }

    // Pivot figé à la saisie : toutes les mesures du glisser se rapportent à
    // ce point. Le gizmo, lui, continue de suivre l'objet visuellement.
    three.dragPivot.copy(three.gizmoGroup.position);
    three.dragGizmoMode = three.gizmoMode;
    const center = three.dragPivot;
    three.dragStartAxisParam = 0;

    if (dragType === 'scale-x' || dragType === 'scale-y' || dragType === 'scale-z') {
        const axis = dragType.slice(-1) as Axis;
        three.dragStartAxisParam = rayAxisParam(three.raycaster.ray, center, axisVector(axis));
    } else if (dragType === 'rotate-y') {
        three.dragStartAxisParam = lacetAngleAt(three, center) ?? 0;
    }

    three.isDraggingGizmo = true;
    three.isDragging = false;
    canvas.setPointerCapture(e.pointerId);
};

export interface ResolveGizmoDragArgs {
    three: ThreeSceneContext;
    active: NonNullable<GizmoDragType>;
    item: EditableFacilityItem;
    event: PointerEvent;
    /** Pas de grille courant (0/1 = pas d'alignement contraint). */
    snap: number;
}

/** Transformée cible pendant un glisser de gizmo (aucune écriture ici). */
export function resolveGizmoDragTransform({
    three,
    active,
    item,
    event,
    snap,
}: ResolveGizmoDragArgs): FacilityTransform {
    const ray = three.raycaster.ray;
    const start = three.dragStartTransform;
    const next: FacilityTransform = { ...start };
    const fine = event.shiftKey;
    const center = three.dragPivot;

    switch (active) {
        case 'translate-x':
        case 'translate-z':
        case 'translate-free': {
            const hit = new THREE.Vector3();
            if (!ray.intersectPlane(three.groundPlaneRaycast, hit)) break;
            const dx = hit.x - three.dragStartIntersection.x;
            const dz = hit.z - three.dragStartIntersection.z;
            if (active !== 'translate-z') {
                next.x = clampPosition(snapToStep(start.x + dx, snap));
            }
            if (active !== 'translate-x') {
                next.z = clampPosition(snapToStep(start.z + dz, snap));
            }
            break;
        }

        case 'scale-x':
        case 'scale-y':
        case 'scale-z': {
            const axis = active.slice(-1) as Axis;
            let delta = rayAxisParam(ray, center, axisVector(axis)) - three.dragStartAxisParam;
            if (fine) delta *= 0.25;

            const key = `scale${axis.toUpperCase()}` as 'scaleX' | 'scaleY' | 'scaleZ';
            const startScale = start[key];
            const raw = resolveAxisScaleDrag(startScale, delta, three.dragObjectRadius);
            const snapped =
                !fine && snap >= 1
                    ? snapToStep(raw, TRANSFORM_LIMITS.scaleStep)
                    : Number(raw.toFixed(3));

            if (item.uniformScale) {
                const ratio = snapped / (startScale || 1);
                next.scaleX = clampScale(start.scaleX * ratio);
                next.scaleY = clampScale(start.scaleY * ratio);
                next.scaleZ = clampScale(start.scaleZ * ratio);
            } else {
                next[key] = clampScale(snapped, startScale);
            }
            break;
        }

        case 'scale-uniform': {
            const factor = resolveUniformScaleDrag(1, event.clientY - three.dragStartPointer.y, fine);
            next.scaleX = clampScale(start.scaleX * factor);
            next.scaleY = clampScale(start.scaleY * factor);
            next.scaleZ = clampScale(start.scaleZ * factor);
            break;
        }

        case 'rotate-y': {
            const angle = lacetAngleAt(three, center);
            if (angle === null) break;

            let deltaDeg = THREE.MathUtils.radToDeg(angle - three.dragStartAxisParam);
            // Déroulement du passage ±180° pour éviter un saut d'un demi-tour.
            if (deltaDeg > 180) deltaDeg -= 360;
            if (deltaDeg < -180) deltaDeg += 360;
            if (fine) deltaDeg *= 0.25;
            if (!fine && snap >= 1) deltaDeg = snapToStep(deltaDeg, 5);

            next.rotationY = normalizeAngle360(start.rotationY + deltaDeg);
            break;
        }

        default:
            break;
    }

    return next;
}
