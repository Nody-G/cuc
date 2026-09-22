import * as THREE from 'three';
import { addDoor, addPlinth, addWindowBand, tagRole, type SceneMaterials } from './shared';

/** Hall Zoe Bell : grand volume, toiture à deux pans, verrière, fosse à cubes. */
export function buildZoeBellMesh(mats: SceneMaterials): THREE.Group {
    const zoeGroup = new THREE.Group();
    zoeGroup.name = 'zoe-bell-hall';

    const W = 26;
    const H = 8;
    const D = 20;

    addPlinth(zoeGroup, mats, W, D);

    const zoeBody = tagRole(new THREE.Mesh(new THREE.BoxGeometry(W, H, D), mats.wallMat), 'wall');
    zoeBody.position.set(0, H / 2 + 0.5, 0);
    zoeBody.castShadow = true;
    zoeBody.receiveShadow = true;
    zoeGroup.add(zoeBody);

    // Toiture à faible pente (deux pans) plutôt qu'un cône.
    const roofSlope = tagRole(new THREE.Mesh(new THREE.BoxGeometry(W + 1.4, 0.4, D / 2 + 0.7), mats.roofMat), 'roof');
    roofSlope.position.set(0, H + 1.4, -D / 4);
    roofSlope.rotation.x = -0.12;
    roofSlope.castShadow = true;
    zoeGroup.add(roofSlope);
    const roofSlope2 = roofSlope.clone();
    roofSlope2.position.set(0, H + 1.4, D / 4);
    roofSlope2.rotation.x = 0.12;
    zoeGroup.add(roofSlope2);

    // Faîtage.
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(W + 1.6, 0.35, 0.5), mats.roofMat);
    ridge.position.set(0, H + 1.75, 0);
    zoeGroup.add(ridge);

    // Bandeaux vitrés (verrière zénithale + façades).
    const skylight = tagRole(new THREE.Mesh(new THREE.BoxGeometry(W - 6, 0.25, 3), mats.glassMat), 'glass');
    skylight.position.set(0, H + 1.9, 0);
    zoeGroup.add(skylight);

    addWindowBand(zoeGroup, mats, W, H, D, H * 0.62 + 0.5, 'south', 5);
    addWindowBand(zoeGroup, mats, W, H, D, H * 0.62 + 0.5, 'north', 5);
    addWindowBand(zoeGroup, mats, W, H, D, H * 0.62 + 0.5, 'east', 3);
    addWindowBand(zoeGroup, mats, W, H, D, H * 0.62 + 0.5, 'west', 3);
    addDoor(zoeGroup, mats, W, D, 'south');

    // Accent jaune (marqueur d'identité CUC).
    const accentBand = new THREE.Mesh(new THREE.BoxGeometry(W + 0.3, 0.5, 0.2), mats.yellowMat);
    accentBand.name = 'accent';
    accentBand.position.set(0, H + 0.2, D / 2 + 0.1);
    zoeGroup.add(accentBand);

    // Fosse à cubes de mousse (extérieur, côté nord).
    const foamPit = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0x0077dd }));
    foamPit.position.set(0, 0.3, -D / 2 - 4);
    zoeGroup.add(foamPit);

    return zoeGroup;
}

/** Hangar câblage : toiture shed, pont roulant, grandes portes. */
export function buildHangarMesh(mats: SceneMaterials): THREE.Group {
    const wireGroup = new THREE.Group();
    wireGroup.name = 'hangar-wirework';

    const W = 20;
    const H = 9;
    const D = 22;

    addPlinth(wireGroup, mats, W, D);

    const wireBody = tagRole(new THREE.Mesh(new THREE.BoxGeometry(W, H, D), mats.wallMat), 'wall');
    wireBody.position.set(0, H / 2 + 0.5, 0);
    wireBody.castShadow = true;
    wireBody.receiveShadow = true;
    wireGroup.add(wireBody);

    // Toiture en shed (mono-pente, typique hangar industriel).
    const shedRoof = tagRole(new THREE.Mesh(new THREE.BoxGeometry(W + 1.2, 0.4, D + 1.2), mats.roofMat), 'roof');
    shedRoof.position.set(0, H + 1.2, 0);
    shedRoof.rotation.z = 0.07;
    shedRoof.castShadow = true;
    wireGroup.add(shedRoof);

    // Poutre de levage (pont roulant) — signature du hall câblage.
    const craneBeam = new THREE.Mesh(new THREE.BoxGeometry(W + 2, 1, 1), mats.yellowMat);
    craneBeam.name = 'accent';
    craneBeam.position.set(0, H + 0.4, 0);
    wireGroup.add(craneBeam);
    const craneTrolley = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 1.6), mats.steelMat);
    craneTrolley.position.set(3, H - 0.2, 0);
    wireGroup.add(craneTrolley);

    // Grandes portes de hangar (façade sud).
    const hangarDoor = new THREE.Mesh(new THREE.BoxGeometry(7, 6, 0.2), mats.roofMat);
    hangarDoor.position.set(0, 3.5, D / 2 + 0.1);
    wireGroup.add(hangarDoor);
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.3, 0.3), mats.yellowMat);
    doorFrame.position.set(0, 6.6, D / 2 + 0.15);
    wireGroup.add(doorFrame);

    // Bandeau vitré haut (éclairage naturel).
    addWindowBand(wireGroup, mats, W, H, D, H * 0.78 + 0.5, 'east', 3);
    addWindowBand(wireGroup, mats, W, H, D, H * 0.78 + 0.5, 'west', 3);

    return wireGroup;
}

/** Trois dojos scéniques : toiture plate avec acrotère, volumes marqués. */
export function buildDojosMesh(mats: SceneMaterials): THREE.Group {
    const dojoGroup = new THREE.Group();
    dojoGroup.name = 'dojos-sceniques';

    const W = 22;
    const H = 7;
    const D = 18;

    addPlinth(dojoGroup, mats, W, D);

    const dojoBody = tagRole(new THREE.Mesh(new THREE.BoxGeometry(W, H, D), mats.wallMat), 'wall');
    dojoBody.position.set(0, H / 2 + 0.5, 0);
    dojoBody.castShadow = true;
    dojoBody.receiveShadow = true;
    dojoGroup.add(dojoBody);

    // Toiture plate avec acrotère.
    const parapet = tagRole(new THREE.Mesh(new THREE.BoxGeometry(W + 0.8, 0.7, D + 0.8), mats.roofMat), 'roof');
    parapet.position.set(0, H + 0.85, 0);
    dojoGroup.add(parapet);
    const roofDeck = tagRole(new THREE.Mesh(new THREE.BoxGeometry(W - 0.6, 0.2, D - 0.6), mats.roofMat), 'roof');
    roofDeck.position.set(0, H + 1.15, 0);
    dojoGroup.add(roofDeck);

    // Trois volumes de dojos distincts (salles 1/2/3) marqués en façade.
    for (let i = -1; i <= 1; i++) {
        const bay = new THREE.Mesh(new THREE.BoxGeometry(0.3, H * 0.7, 0.3), mats.yellowMat);
        bay.name = 'accent';
        bay.position.set(i * (W / 3), H * 0.45 + 0.5, D / 2 + 0.12);
        dojoGroup.add(bay);
    }

    addWindowBand(dojoGroup, mats, W, H, D, H * 0.66 + 0.5, 'south', 4);
    addWindowBand(dojoGroup, mats, W, H, D, H * 0.66 + 0.5, 'north', 4);
    addDoor(dojoGroup, mats, W, D, 'south');

    return dojoGroup;
}
