import * as THREE from 'three';
import { clampNumber } from '../../data/facilityTransform';
import { HIGHLIGHT_BASE_RADIUS } from './gizmo-constants';

/**
 * Couronne de mise en évidence de l'objet sélectionné.
 * Sa taille est pilotée par `setHighlightRadius` afin d'épouser l'emprise
 * réelle d'un bâtiment agrandi, au lieu d'un anneau de taille fixe qui
 * disparaît dans le volume.
 */
export function createCampusHighlight(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'campus-highlight-group';

    const outerRing = new THREE.Mesh(
        new THREE.RingGeometry(8.5, 9.2, 48),
        new THREE.MeshBasicMaterial({
            color: 0xffe500,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
            depthWrite: false,
        })
    );
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.14;
    outerRing.name = 'highlight-outer-ring';
    group.add(outerRing);

    const innerDisc = new THREE.Mesh(
        new THREE.CircleGeometry(8.2, 32),
        new THREE.MeshBasicMaterial({
            color: 0xffe500,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide,
            depthWrite: false,
        })
    );
    innerDisc.rotation.x = -Math.PI / 2;
    innerDisc.position.y = 0.12;
    innerDisc.name = 'highlight-inner-disc';
    group.add(innerDisc);

    const reticleGroup = new THREE.Group();
    reticleGroup.name = 'highlight-reticle';
    [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((ang) => {
        const tick = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.12, 2.2),
            new THREE.MeshBasicMaterial({ color: 0xffe500, depthWrite: false })
        );
        tick.position.set(Math.sin(ang) * 9.0, 0.16, Math.cos(ang) * 9.0);
        tick.rotation.y = ang;
        reticleGroup.add(tick);
    });
    group.add(reticleGroup);

    const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(8.2, 8.2, 22, 24, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0xffe500,
            transparent: true,
            opacity: 0.08,
            side: THREE.DoubleSide,
            depthWrite: false,
        })
    );
    pillar.position.y = 11;
    pillar.name = 'highlight-pillar';
    group.add(pillar);

    group.visible = true;
    return group;
}

/** Adapte la couronne de mise en évidence à l'emprise de l'objet (rayon en mètres). */
export function setHighlightRadius(group: THREE.Group | undefined, radius: number): void {
    if (!group) return;
    const scalar = clampNumber(radius / HIGHLIGHT_BASE_RADIUS, 0.25, 24);
    group.scale.setScalar(scalar);
}
