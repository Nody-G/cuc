import * as THREE from 'three';
import type { SceneMaterials } from './shared';

/** City-stade extérieur : aire bleue, terrain, buts, clôture basse. */
export function buildCityStadeMesh(): THREE.Group {
    const stadeGroup = new THREE.Group();
    stadeGroup.name = 'city-stade-exterieur';

    // Aire de jeu synthétique (bleu) + terrain central (vert).
    const blueTrack = new THREE.Mesh(new THREE.PlaneGeometry(32, 20), new THREE.MeshStandardMaterial({ color: 0x1d63b8 }));
    blueTrack.rotation.x = -Math.PI / 2;
    blueTrack.position.set(0, 0.04, 0);
    stadeGroup.add(blueTrack);

    const greenPitch = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), new THREE.MeshStandardMaterial({ color: 0x247248 }));
    greenPitch.rotation.x = -Math.PI / 2;
    greenPitch.position.set(0, 0.05, 0);
    stadeGroup.add(greenPitch);

    // Marquages blancs du terrain.
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const centerLine = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 14), lineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.06, 0);
    stadeGroup.add(centerLine);
    const centerCircle = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.45, 32), lineMat);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.set(0, 0.06, 0);
    stadeGroup.add(centerCircle);

    // Buts (deux cages).
    [-11, 11].forEach((x) => {
        const goal = new THREE.Group();
        const postMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.4, metalness: 0.3 });
        const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 3, 8);
        const p1 = new THREE.Mesh(postGeo, postMat);
        p1.position.set(0, 1.5, -3);
        goal.add(p1);
        const p2 = new THREE.Mesh(postGeo, postMat);
        p2.position.set(0, 1.5, 3);
        goal.add(p2);
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6, 8), postMat);
        bar.rotation.x = Math.PI / 2;
        bar.position.set(0, 3, 0);
        goal.add(bar);
        goal.position.set(x, 0, 0);
        stadeGroup.add(goal);
    });

    // Clôture périphérique basse.
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x2f3542, roughness: 0.6, metalness: 0.5 });
    const fenceN = new THREE.Mesh(new THREE.BoxGeometry(32, 1.2, 0.1), fenceMat);
    fenceN.position.set(0, 0.6, -10);
    stadeGroup.add(fenceN);
    const fenceS = fenceN.clone();
    fenceS.position.set(0, 0.6, 10);
    stadeGroup.add(fenceS);

    return stadeGroup;
}

/** Site de tournage extérieur : bosquet d'arbres, aire dégagée, repères de cadrage. */
export function buildOutdoorMesh(mats: SceneMaterials): THREE.Group {
    const outdoorGroup = new THREE.Group();
    outdoorGroup.name = 'site-tournage';

    // Bosquet d'arbres (décor naturel) + zone dégagée pour tournages.
    for (let t = 0; t < 6; t++) {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 3.5, 6), mats.timberMat);
        trunk.position.set(-15 + t * 6, 1.75, 0);
        trunk.castShadow = true;
        outdoorGroup.add(trunk);
        const top = new THREE.Mesh(new THREE.ConeGeometry(2, 4.5, 6), new THREE.MeshStandardMaterial({ color: 0x1e4620 }));
        top.position.set(-15 + t * 6, 5, 0);
        top.castShadow = true;
        outdoorGroup.add(top);
    }

    // Aire de tournage dégagée (terre battue).
    const clearing = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 26),
        new THREE.MeshStandardMaterial({ color: 0x2a2419, roughness: 0.98 })
    );
    clearing.rotation.x = -Math.PI / 2;
    clearing.position.set(0, 0.02, 14);
    outdoorGroup.add(clearing);

    // Marquages de plateau (repères de cadrage).
    const markMat = new THREE.MeshBasicMaterial({ color: 0xffe500 });
    for (let i = -1; i <= 1; i++) {
        const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 20), markMat);
        mark.rotation.x = -Math.PI / 2;
        mark.position.set(i * 12, 0.04, 14);
        outdoorGroup.add(mark);
    }

    return outdoorGroup;
}
