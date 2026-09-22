import * as THREE from 'three';
import { addDoor, addPlinth, addWindowBand, tagRole, type SceneMaterials } from './shared';

/** Espace mécanique : atelier, toiture bac acier, portes de garage, aire bitumée. */
export function buildMecaniqueMesh(mats: SceneMaterials): THREE.Group {
    const mecaGroup = new THREE.Group();
    mecaGroup.name = 'espace-mecanique';

    const W = 24;
    const H = 5.5;
    const D = 14;

    addPlinth(mecaGroup, mats, W, D);

    const workshop = tagRole(new THREE.Mesh(new THREE.BoxGeometry(W, H, D), mats.wallMat), 'wall');
    workshop.position.set(0, H / 2 + 0.5, 0);
    workshop.castShadow = true;
    workshop.receiveShadow = true;
    mecaGroup.add(workshop);

    // Toiture bac acier légèrement inclinée.
    const roof = tagRole(new THREE.Mesh(new THREE.BoxGeometry(W + 1, 0.35, D + 1), mats.roofMat), 'roof');
    roof.position.set(0, H + 0.85, 0);
    roof.rotation.z = 0.05;
    roof.castShadow = true;
    mecaGroup.add(roof);

    // Trois grandes portes de garage (atelier véhicules).
    for (let i = -1; i <= 1; i++) {
        const door = new THREE.Mesh(new THREE.BoxGeometry(5, 4.2, 0.2), mats.roofMat);
        door.position.set(i * 7, 2.6, D / 2 + 0.1);
        mecaGroup.add(door);
        const lintel = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.3, 0.3), mats.yellowMat);
        lintel.name = 'accent';
        lintel.position.set(i * 7, 4.85, D / 2 + 0.15);
        mecaGroup.add(lintel);
    }

    // Aire d'évolution bitumée devant l'atelier.
    const apron = new THREE.Mesh(new THREE.PlaneGeometry(W + 10, 16), new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.95 }));
    apron.rotation.x = -Math.PI / 2;
    apron.position.set(0, 0.03, D / 2 + 8);
    mecaGroup.add(apron);

    // Marquages de piste (traits jaunes).
    for (let i = -2; i <= 2; i++) {
        const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 12), mats.yellowMat);
        mark.rotation.x = -Math.PI / 2;
        mark.position.set(i * 4, 0.05, D / 2 + 8);
        mecaGroup.add(mark);
    }

    return mecaGroup;
}

/** QG staff & hébergement : deux ailes en L, rangées de fenêtres, voie circulaire. */
export function buildQgMesh(mats: SceneMaterials): THREE.Group {
    const qgGroup = new THREE.Group();
    qgGroup.name = 'qg-staff-hebergement';

    // Aile nord (chambres) + aile est (réfectoire) en L.
    const northW = 26;
    const northH = 6.5;
    const northD = 8;
    const eastW = 8;
    const eastH = 6;
    const eastD = 18;

    addPlinth(qgGroup, mats, northW, northD);

    const northWing = tagRole(new THREE.Mesh(new THREE.BoxGeometry(northW, northH, northD), mats.wallMat), 'wall');
    northWing.position.set(0, northH / 2 + 0.5, -9);
    northWing.castShadow = true;
    northWing.receiveShadow = true;
    qgGroup.add(northWing);

    const eastWing = tagRole(new THREE.Mesh(new THREE.BoxGeometry(eastW, eastH, eastD), mats.wallMat), 'wall');
    eastWing.position.set(10, eastH / 2 + 0.5, 0);
    eastWing.castShadow = true;
    eastWing.receiveShadow = true;
    qgGroup.add(eastWing);

    // Toitures plates + acrotères.
    const northRoof = tagRole(new THREE.Mesh(new THREE.BoxGeometry(northW + 0.8, 0.5, northD + 0.8), mats.roofMat), 'roof');
    northRoof.position.set(0, northH + 0.75, -9);
    qgGroup.add(northRoof);
    const eastRoof = tagRole(new THREE.Mesh(new THREE.BoxGeometry(eastW + 0.8, 0.5, eastD + 0.8), mats.roofMat), 'roof');
    eastRoof.position.set(10, eastH + 0.75, 0);
    qgGroup.add(eastRoof);

    // Rangées de fenêtres (chambres) — signature d'un bâtiment d'hébergement.
    addWindowBand(qgGroup, mats, northW, northH, northD, northH * 0.6 + 0.5, 'south', 7);
    addWindowBand(qgGroup, mats, northW, northH, northD, northH * 0.6 + 0.5, 'north', 7);
    addWindowBand(qgGroup, mats, eastW, eastH, eastD, eastH * 0.6 + 0.5, 'east', 5);
    addDoor(qgGroup, mats, northW, northD, 'south');

    // Accent jaune sur l'entrée.
    const entry = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.4, 0.3), mats.yellowMat);
    entry.name = 'accent';
    entry.position.set(0, northH + 0.3, -9 + northD / 2 + 0.15);
    qgGroup.add(entry);

    // Voie d'accès circulaire.
    const ringDrive = new THREE.Mesh(new THREE.RingGeometry(3, 4.5, 24), new THREE.MeshStandardMaterial({ color: 0x9ca3af }));
    ringDrive.rotation.x = -Math.PI / 2;
    ringDrive.position.set(0, 0.05, 0);
    qgGroup.add(ringDrive);

    return qgGroup;
}

/** Manège équestre : bardage bois, toiture à deux pans, carrière sable fibré. */
export function buildManegeMesh(mats: SceneMaterials): THREE.Group {
    const manegeGroup = new THREE.Group();
    manegeGroup.name = 'manege-equestre';

    // Manège couvert : grand volume à toiture en pente (pas un demi-cylindre).
    const W = 30;
    const H = 8;
    const D = 24;

    addPlinth(manegeGroup, mats, W, D);

    const manegeBody = tagRole(new THREE.Mesh(new THREE.BoxGeometry(W, H, D), mats.timberMat), 'timber');
    manegeBody.position.set(0, H / 2 + 0.5, 0);
    manegeBody.castShadow = true;
    manegeBody.receiveShadow = true;
    manegeGroup.add(manegeBody);

    // Toiture à deux pans (charpente).
    const slope = tagRole(new THREE.Mesh(new THREE.BoxGeometry(W + 1.4, 0.4, D / 2 + 0.7), mats.roofMat), 'roof');
    slope.position.set(0, H + 1.5, -D / 4);
    slope.rotation.x = -0.16;
    slope.castShadow = true;
    manegeGroup.add(slope);
    const slope2 = slope.clone();
    slope2.position.set(0, H + 1.5, D / 4);
    slope2.rotation.x = 0.16;
    manegeGroup.add(slope2);
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(W + 1.6, 0.35, 0.5), mats.roofMat);
    ridge.position.set(0, H + 1.95, 0);
    manegeGroup.add(ridge);

    // Grandes ouvertures latérales (manèges équestres très ouverts).
    const openingMat = new THREE.MeshStandardMaterial({ color: 0x0a0b0f, roughness: 0.9 });
    const opening = new THREE.Mesh(new THREE.BoxGeometry(W - 4, H * 0.55, 0.2), openingMat);
    opening.position.set(0, H * 0.35 + 0.5, D / 2 + 0.11);
    manegeGroup.add(opening);
    const openingN = opening.clone();
    openingN.position.set(0, H * 0.35 + 0.5, -D / 2 - 0.11);
    manegeGroup.add(openingN);

    // Accent jaune (enseigne).
    const sign = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 0.3), mats.yellowMat);
    sign.name = 'accent';
    sign.position.set(0, H + 0.3, D / 2 + 0.15);
    manegeGroup.add(sign);

    // Carrière / paddock extérieur en sable fibré.
    const paddock = new THREE.Mesh(new THREE.RingGeometry(10, 12, 28), new THREE.MeshStandardMaterial({ color: 0xd6b38a }));
    paddock.rotation.x = -Math.PI / 2;
    paddock.position.set(0, 0.05, D / 2 + 14);
    manegeGroup.add(paddock);
    const paddockInner = new THREE.Mesh(new THREE.CircleGeometry(10, 28), new THREE.MeshStandardMaterial({ color: 0xc9a97e }));
    paddockInner.rotation.x = -Math.PI / 2;
    paddockInner.position.set(0, 0.04, D / 2 + 14);
    manegeGroup.add(paddockInner);

    // Barres d'obstacle (cavaletti) dans la carrière.
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 });
    for (let i = -1; i <= 1; i++) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 6, 8), poleMat);
        pole.rotation.z = Math.PI / 2;
        pole.position.set(0, 0.9, D / 2 + 14 + i * 3);
        manegeGroup.add(pole);
    }

    return manegeGroup;
}
