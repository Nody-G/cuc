import * as THREE from 'three';
import type { SceneMaterials } from './shared';

/** Tour d'entraînement (« cuc-tower ») : structure, escaliers, plateformes, airbag. */
export function buildTowerMesh(mats: SceneMaterials): THREE.Group {
    const towerGroup = new THREE.Group();
    towerGroup.name = 'cuc-tower';

    const colGeo = new THREE.BoxGeometry(0.35, 21, 0.35);
    const colCoords = [
        [-2.5, 10.5, -2.5],
        [2.5, 10.5, -2.5],
        [-2.5, 10.5, 2.5],
        [2.5, 10.5, 2.5],
    ];
    colCoords.forEach(([cx, cy, cz]) => {
        const col = new THREE.Mesh(colGeo, mats.steelMat);
        col.position.set(cx, cy, cz);
        col.castShadow = true;
        towerGroup.add(col);
    });

    // Contreventements diagonaux entre les poteaux (structure réelle).
    for (let lvl = 0; lvl < 5; lvl++) {
        const y = 2 + lvl * 4;
        const brace = new THREE.Mesh(new THREE.BoxGeometry(0.16, 5.6, 0.16), mats.steelMat);
        brace.position.set(0, y, -2.5);
        brace.rotation.z = lvl % 2 === 0 ? 0.42 : -0.42;
        towerGroup.add(brace);
        const brace2 = brace.clone();
        brace2.position.set(0, y, 2.5);
        brace2.rotation.z = lvl % 2 === 0 ? -0.42 : 0.42;
        towerGroup.add(brace2);
    }

    for (let f = 0; f < 5; f++) {
        const stairY = 2 + f * 3.8;
        const flight = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 3.8), mats.steelMat);
        flight.position.set(-1.8, stairY, 0);
        flight.rotation.x = f % 2 === 0 ? 0.35 : -0.35;
        flight.castShadow = true;
        towerGroup.add(flight);

        const landing = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 1.8), mats.steelMat);
        landing.position.set(-1.8, stairY + 1.6, f % 2 === 0 ? 1.6 : -1.6);
        towerGroup.add(landing);

        // Garde-corps d'escalier.
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 3.8), mats.steelMat);
        rail.position.set(-2.5, stairY + 0.6, 0);
        towerGroup.add(rail);
    }

    const platformHeights = [6, 9, 12, 15, 21];
    platformHeights.forEach((ph, idx) => {
        const isTop = idx === platformHeights.length - 1;
        const plat = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.3, 5.2), isTop ? mats.yellowMat : mats.steelMat);
        plat.position.set(0, ph, 0);
        plat.castShadow = true;
        towerGroup.add(plat);

        // Garde-corps périphérique sur chaque plateforme.
        const railGeo = new THREE.BoxGeometry(5.2, 1.1, 0.08);
        const railN = new THREE.Mesh(railGeo, mats.yellowMat);
        railN.position.set(0, ph + 0.7, -2.6);
        towerGroup.add(railN);
        const railS = new THREE.Mesh(railGeo, mats.yellowMat);
        railS.position.set(0, ph + 0.7, 2.6);
        towerGroup.add(railS);
        const railGeoZ = new THREE.BoxGeometry(0.08, 1.1, 5.2);
        const railE = new THREE.Mesh(railGeoZ, mats.yellowMat);
        railE.position.set(2.6, ph + 0.7, 0);
        towerGroup.add(railE);
        const railW = new THREE.Mesh(railGeoZ, mats.yellowMat);
        railW.position.set(-2.6, ph + 0.7, 0);
        towerGroup.add(railW);

        const bay = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 3.4), mats.yellowMat);
        bay.name = 'accent';
        bay.position.set(0.8, ph, 3.6);
        bay.castShadow = true;
        towerGroup.add(bay);

        const rail = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 0.1), mats.yellowMat);
        rail.position.set(0.8, ph + 0.6, 5.2);
        towerGroup.add(rail);
    });

    const windbreak = new THREE.Mesh(
        new THREE.BoxGeometry(5.4, 3.2, 5.4),
        new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.8 })
    );
    windbreak.position.set(0, 1.6, 0);
    towerGroup.add(windbreak);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 5, 8), mats.steelMat);
    pole.position.set(-1.8, 23.5, -1.8);
    towerGroup.add(pole);

    const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x111116, side: THREE.DoubleSide })
    );
    flag.position.set(-0.6, 25, -1.8);
    towerGroup.add(flag);

    const beaconLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 10, 10),
        new THREE.MeshBasicMaterial({ color: 0xff1100 })
    );
    beaconLight.position.set(0, 22.2, 0);
    towerGroup.add(beaconLight);

    const airbag = new THREE.Mesh(
        new THREE.BoxGeometry(10, 1.8, 10),
        new THREE.MeshStandardMaterial({ color: 0x0052cc, roughness: 0.35 })
    );
    airbag.position.set(0.8, 0.9, 9.5);
    airbag.castShadow = true;
    towerGroup.add(airbag);

    const cushionCenter = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.1, 8),
        new THREE.MeshStandardMaterial({ color: 0x15151b, roughness: 0.8 })
    );
    cushionCenter.position.set(0.8, 1.85, 9.5);
    towerGroup.add(cushionCenter);

    const targetRing = new THREE.Mesh(
        new THREE.RingGeometry(1.6, 2.8, 24),
        new THREE.MeshBasicMaterial({ color: 0xffe500, side: THREE.DoubleSide })
    );
    targetRing.rotation.x = -Math.PI / 2;
    targetRing.position.set(0.8, 1.92, 9.5);
    towerGroup.add(targetRing);

    return towerGroup;
}
