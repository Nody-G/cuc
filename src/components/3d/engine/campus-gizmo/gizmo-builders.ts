import * as THREE from 'three';
import type { GizmoMode } from '../../types/campus3d.types';
import { GIZMO_AXIS_LENGTH, GIZMO_RING_RADIUS } from '../gizmoMath';
import {
    AXIS_COLORS,
    GIZMO_EXCLUSIVE_GROUP,
    ROTATE_GROUP_NAME,
} from './gizmo-constants';
import { setGizmoMode } from './gizmo-visibility';

function gizmoLineMaterial(color: number): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.95 });
}

/** Flèche unitaire (hampe + cône) alignée sur l'axe demandé. */
function buildArrow(axis: 'x' | 'y' | 'z', handleName: string): THREE.Group {
    const group = new THREE.Group();
    group.name = handleName;

    const material = gizmoLineMaterial(AXIS_COLORS[axis]);
    const shaftLength = GIZMO_AXIS_LENGTH;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, shaftLength, 8), material);
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.9, 12), material);

    if (axis === 'x') {
        shaft.rotation.z = -Math.PI / 2;
        shaft.position.set(shaftLength / 2, 0, 0);
        head.rotation.z = -Math.PI / 2;
        head.position.set(shaftLength + 0.95, 0, 0);
    } else if (axis === 'y') {
        shaft.position.set(0, shaftLength / 2, 0);
        head.position.set(0, shaftLength + 0.95, 0);
    } else {
        shaft.rotation.x = Math.PI / 2;
        shaft.position.set(0, 0, shaftLength / 2);
        head.rotation.x = Math.PI / 2;
        head.position.set(0, 0, shaftLength + 0.95);
    }

    shaft.name = handleName;
    head.name = handleName;
    group.add(shaft, head);
    return group;
}

/** Poignée d'échelle (hampe + cube terminal) alignée sur l'axe demandé. */
function buildScaleHandle(axis: 'x' | 'y' | 'z', handleName: string): THREE.Group {
    const group = new THREE.Group();
    group.name = handleName;

    const material = gizmoLineMaterial(AXIS_COLORS[axis]);
    const shaftLength = GIZMO_AXIS_LENGTH;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, shaftLength, 8), material);
    const knob = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), material);

    if (axis === 'x') {
        shaft.rotation.z = -Math.PI / 2;
        shaft.position.set(shaftLength / 2, 0, 0);
        knob.position.set(shaftLength + 0.65, 0, 0);
    } else if (axis === 'y') {
        shaft.position.set(0, shaftLength / 2, 0);
        knob.position.set(0, shaftLength + 0.65, 0);
    } else {
        shaft.rotation.x = Math.PI / 2;
        shaft.position.set(0, 0, shaftLength / 2);
        knob.position.set(0, 0, shaftLength + 0.65);
    }

    shaft.name = handleName;
    knob.name = handleName;
    group.add(shaft, knob);
    return group;
}

/** Anneau de rotation dans le plan perpendiculaire à l'axe demandé. */
function buildRotationRing(axis: 'x' | 'y' | 'z', handleName: string): THREE.Group {
    const group = new THREE.Group();
    group.name = handleName;

    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(GIZMO_RING_RADIUS, 0.16, 8, 64),
        new THREE.MeshBasicMaterial({
            color: AXIS_COLORS[axis],
            depthTest: false,
            transparent: true,
            opacity: 0.9,
        })
    );
    ring.name = handleName;

    if (axis === 'x') ring.rotation.y = Math.PI / 2;
    else if (axis === 'y') ring.rotation.x = Math.PI / 2;

    group.add(ring);

    // Deux repères d'angle à 90° pour lire le sens de rotation.
    const tickMat = new THREE.MeshBasicMaterial({
        color: AXIS_COLORS[axis],
        depthTest: false,
        transparent: true,
        opacity: 0.7,
    });
    [Math.PI / 2, -Math.PI / 2].forEach((angle) => {
        const tick = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.7), tickMat);
        tick.name = handleName;
        if (axis === 'x') tick.position.set(0, Math.sin(angle) * GIZMO_RING_RADIUS, Math.cos(angle) * GIZMO_RING_RADIUS);
        else if (axis === 'y') tick.position.set(Math.sin(angle) * GIZMO_RING_RADIUS, 0, Math.cos(angle) * GIZMO_RING_RADIUS);
        else tick.position.set(Math.sin(angle) * GIZMO_RING_RADIUS, Math.cos(angle) * GIZMO_RING_RADIUS, 0);
        group.add(tick);
    });

    return group;
}

/**
 * Construit le gizmo complet : trois jeux de poignées (translation au sol,
 * lacet, mise à l'échelle) plus le disque central de glissement libre.
 *
 * Le groupe est ancré par `syncGizmoPosition` tantôt au sol (mode Déplacer),
 * tantôt au **centre englobant** de l'objet (modes Tourner / Redimensionner),
 * afin que les poignées restent accessibles sur un bâtiment haut ou agrandi.
 */
export function createCampusGizmo(): THREE.Group {
    const gizmoGroup = new THREE.Group();
    gizmoGroup.name = 'gizmo-root';
    gizmoGroup.userData.gizmoMode = 'translate' as GizmoMode;
    gizmoGroup.userData.gizmoScale = 1;

    // --- Mode « Déplacer » : flèches X / Z + disque de glissement libre ---
    const translateGroup = new THREE.Group();
    translateGroup.name = GIZMO_EXCLUSIVE_GROUP.translate;

    const discMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        depthTest: false,
    });
    const discGeo = new THREE.CircleGeometry(3.6, 32);
    const centerDisc = new THREE.Mesh(discGeo, discMat);
    centerDisc.rotation.x = -Math.PI / 2;
    centerDisc.name = 'gizmo-center';
    translateGroup.add(centerDisc);

    const discBorder = new THREE.Mesh(
        new THREE.RingGeometry(3.45, 3.65, 32),
        new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide, depthTest: false })
    );
    discBorder.rotation.x = -Math.PI / 2;
    discBorder.name = 'gizmo-center';
    translateGroup.add(discBorder);

    translateGroup.add(buildArrow('x', 'gizmo-translate-x'));
    translateGroup.add(buildArrow('z', 'gizmo-translate-z'));
    gizmoGroup.add(translateGroup);

    // --- Anneau de lacet (rotation autour de l'axe vertical), affiché dans
    // --- tous les modes : c'est l'affordance de rotation du studio.
    // Le bâtiment reste d'aplomb : aucune inclinaison n'est exposée.
    const rotateGroup = new THREE.Group();
    rotateGroup.name = ROTATE_GROUP_NAME;
    rotateGroup.add(buildRotationRing('y', 'gizmo-rotate-y'));
    gizmoGroup.add(rotateGroup);

    // --- Mode « Redimensionner » : axes + cube central d'échelle uniforme ---
    const scaleGroup = new THREE.Group();
    scaleGroup.name = GIZMO_EXCLUSIVE_GROUP.scale;
    scaleGroup.add(buildScaleHandle('x', 'gizmo-scale-x'));
    scaleGroup.add(buildScaleHandle('y', 'gizmo-scale-y'));
    scaleGroup.add(buildScaleHandle('z', 'gizmo-scale-z'));

    const uniformKnob = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 1.9, 1.9),
        new THREE.MeshBasicMaterial({ color: 0xffe500, depthTest: false, transparent: true, opacity: 0.95 })
    );
    uniformKnob.name = 'gizmo-scale-uniform';
    scaleGroup.add(uniformKnob);

    const wireBox = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(3.4, 3.4, 3.4)),
        new THREE.LineBasicMaterial({ color: 0xffe500, transparent: true, opacity: 0.55, depthTest: false })
    );
    wireBox.name = 'gizmo-scale-uniform';
    scaleGroup.add(wireBox);

    scaleGroup.visible = false;
    gizmoGroup.add(scaleGroup);

    setGizmoMode(gizmoGroup, 'translate');

    gizmoGroup.visible = false;
    return gizmoGroup;
}
