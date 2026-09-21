import * as THREE from 'three';
import { clampNumber, clampScale } from '../data/facilityTransform';

/** Longueur d'une flèche de translation, avant mise à l'échelle adaptative. */
export const GIZMO_AXIS_LENGTH = 8.5;

/** Rayon des anneaux de rotation, avant mise à l'échelle adaptative. */
export const GIZMO_RING_RADIUS = 7;

/** Sphère englobante d'un objet de la scène (centre monde + rayon). */
export interface ObjectFrame {
    center: THREE.Vector3;
    radius: number;
}

/**
 * Paramètre `s` du point de la droite `origin + s·dir` le plus proche du
 * rayon donné (formule des droites gauches, Ericson).
 *
 * Utilisé pour la mise à l'échelle le long d'un axe : le pointeur est projeté
 * sur l'axe, et l'écart au point de saisie devient le facteur d'échelle.
 *
 * Retourne `0` lorsque le rayon est parallèle à l'axe (projection dégénérée) :
 * l'appelant retombe alors sur un pilotage au delta écran.
 */
export function rayAxisParam(ray: THREE.Ray, origin: THREE.Vector3, dir: THREE.Vector3): number {
    if (!ray.direction || ray.direction.lengthSq() < 1e-12) return 0;
    if (dir.lengthSq() < 1e-12) return 0;

    const w0 = new THREE.Vector3().subVectors(ray.origin, origin);
    const a = ray.direction.dot(ray.direction);
    const b = ray.direction.dot(dir);
    const c = dir.dot(dir);
    const d = ray.direction.dot(w0);
    const e = dir.dot(w0);
    const denom = a * c - b * b;

    if (Math.abs(denom) < 1e-8) return 0;
    return (a * e - b * d) / denom;
}

/** Point d'intersection du rayon avec un plan (normale normalisée). */
export function rayPlanePoint(
    ray: THREE.Ray,
    planeNormal: THREE.Vector3,
    planePoint: THREE.Vector3
): THREE.Vector3 | null {
    const denominator = planeNormal.dot(ray.direction);
    if (Math.abs(denominator) < 1e-6) return null;

    const t = planeNormal.dot(new THREE.Vector3().subVectors(planePoint, ray.origin)) / denominator;
    if (!Number.isFinite(t)) return null;
    return ray.origin.clone().addScaledVector(ray.direction, t);
}

/** Axe (unitaire) associé à un nom d'axe scène. */
export function axisVector(axis: 'x' | 'y' | 'z'): THREE.Vector3 {
    if (axis === 'x') return new THREE.Vector3(1, 0, 0);
    if (axis === 'y') return new THREE.Vector3(0, 1, 0);
    return new THREE.Vector3(0, 0, 1);
}

/**
 * Angle signé (radians) de `point` autour de `axisDir`, dans le plan
 * perpendiculaire à l'axe, mesuré depuis `refDir`.
 */
export function signedAngleAroundAxis(
    point: THREE.Vector3,
    center: THREE.Vector3,
    axisDir: THREE.Vector3,
    refDir: THREE.Vector3
): number {
    const axis = axisDir.clone().normalize();
    const v = new THREE.Vector3().subVectors(point, center);
    v.addScaledVector(axis, -v.dot(axis));
    if (v.lengthSq() < 1e-8) return 0;

    const ref = refDir.clone();
    ref.addScaledVector(axis, -ref.dot(axis));
    if (ref.lengthSq() < 1e-8) return 0;

    v.normalize();
    ref.normalize();

    const cross = new THREE.Vector3().crossVectors(ref, v);
    return Math.atan2(cross.dot(axis), clampNumber(ref.dot(v), -1, 1));
}

/**
 * Sphère englobante d'un objet, en coordonnées monde.
 * `setFromObject` tient compte de la position, de la rotation et de
 * l'échelle en cours — donc de la transformation vivante pendant un glisser.
 */
export function getObjectFrame(object: THREE.Object3D | null | undefined): ObjectFrame | null {
    if (!object) return null;
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return null;

    const sphere = box.getBoundingSphere(new THREE.Sphere());
    if (!Number.isFinite(sphere.radius)) return null;

    return { center: sphere.center.clone(), radius: Math.max(sphere.radius, 1) };
}

/**
 * Échelle adaptative du gizmo.
 *
 * Deux contraintes se combinent :
 * 1. **Constance à l'écran** : l'échelle croît avec la distance caméra, sinon
 *    les poignées deviennent inatteignables en vue globale.
 * 2. **Accessibilité sur les gros volumes** : un bâtiment agrandi doit garder
 *    des poignées en bord d'emprise, sinon elles restent enfouies dans le
 *    maillage.
 *
 * La valeur est bornée pour rester prévisible et ne jamais masquer la scène.
 * Pendant un glisser de mise à l'échelle, l'appelant gèle cette valeur : sans
 * gel, agrandir le bâtiment agrandirait le gizmo qui agrandirait le
 * bâtiment — une boucle de rétroaction divergente.
 */
export function computeGizmoScale(cameraDistance: number, objectRadius: number): number {
    const byDistance = cameraDistance * 0.055;
    const byObject = objectRadius * 0.5;
    return clampNumber(Math.max(byDistance, byObject), 0.55, 8);
}

/**
 * Nouveau facteur d'échelle d'un axe piloté au glisser.
 *
 * Le déplacement est rapporté au rayon de l'objet : décaler le pointeur de
 * « un rayon » le long de l'axe double l'échelle. Le ressenti reste ainsi
 * identique quelle que soit la taille du bâtiment.
 */
export function resolveAxisScaleDrag(
    startScale: number,
    deltaAlongAxis: number,
    objectRadius: number
): number {
    const reference = Math.max(objectRadius, 0.5);
    const factor = 1 + deltaAlongAxis / reference;
    return clampScale(startScale * factor, startScale);
}

/**
 * Facteur d'échelle uniforme piloté au déplacement vertical du pointeur
 * (vers le haut = agrandir), en progression multiplicative.
 */
export function resolveUniformScaleDrag(
    startScale: number,
    deltaY: number,
    fine = false
): number {
    const sensitivity = fine ? 0.0015 : 0.006;
    const factor = Math.exp(-deltaY * sensitivity);
    return clampScale(startScale * factor, startScale);
}
