import * as THREE from 'three';

/**
 * Rôle matériau d'un maillage. Permet à `applyPlanMode` de préserver la
 * différenciation (façade / toiture / vitrage / béton / bois) au lieu de
 * tout aplatir en une couleur unique.
 */
export type MaterialRole = 'wall' | 'roof' | 'glass' | 'concrete' | 'timber' | 'steel' | 'accent' | 'ground';

/** Marque un maillage avec son rôle matériau. */
export function tagRole(mesh: THREE.Mesh, role: MaterialRole): THREE.Mesh {
  mesh.userData.materialRole = role;
  return mesh;
}

export interface SceneMaterials {
  steelMat: THREE.MeshStandardMaterial;
  yellowMat: THREE.MeshStandardMaterial;
  darkBuildingMat: THREE.MeshStandardMaterial;
  /** Façade claire (béton / enduit) pour différencier les volumes. */
  wallMat: THREE.MeshStandardMaterial;
  /** Toiture sombre (bac acier / membrane). */
  roofMat: THREE.MeshStandardMaterial;
  /** Vitrage teinté (bandeaux vitrés, verrières). */
  glassMat: THREE.MeshStandardMaterial;
  /** Béton brut (socles, quais, murets). */
  concreteMat: THREE.MeshStandardMaterial;
  /** Bois / bardage chaud (manège, annexes). */
  timberMat: THREE.MeshStandardMaterial;
}

export function createSceneMaterials(): SceneMaterials {
  return {
    steelMat: new THREE.MeshStandardMaterial({
      color: 0x4a5568,
      metalness: 0.85,
      roughness: 0.25,
    }),
    yellowMat: new THREE.MeshStandardMaterial({
      color: 0xffe500,
      emissive: 0x443b00,
      emissiveIntensity: 0.35,
      metalness: 0.5,
      roughness: 0.3,
    }),
    darkBuildingMat: new THREE.MeshStandardMaterial({
      color: 0x181a24,
      roughness: 0.45,
      metalness: 0.6,
      emissive: 0x080910,
      emissiveIntensity: 0.4,
    }),
    wallMat: new THREE.MeshStandardMaterial({
      color: 0x2a2e3a,
      roughness: 0.72,
      metalness: 0.18,
    }),
    roofMat: new THREE.MeshStandardMaterial({
      color: 0x14161d,
      roughness: 0.55,
      metalness: 0.45,
    }),
    glassMat: new THREE.MeshStandardMaterial({
      color: 0x0e2a3d,
      roughness: 0.12,
      metalness: 0.85,
      emissive: 0x0a1c2a,
      emissiveIntensity: 0.5,
    }),
    concreteMat: new THREE.MeshStandardMaterial({
      color: 0x3a3d45,
      roughness: 0.9,
      metalness: 0.05,
    }),
    timberMat: new THREE.MeshStandardMaterial({
      color: 0x4a3524,
      roughness: 0.85,
      metalness: 0.05,
    }),
  };
}

/**
 * Ajoute une bande de fenêtres sur une façade (plan XZ donné).
 * `face` : 'north' | 'south' | 'east' | 'west'.
 */
function addWindowBand(
  group: THREE.Group,
  mats: SceneMaterials,
  width: number,
  height: number,
  depth: number,
  y: number,
  face: 'north' | 'south' | 'east' | 'west',
  count = 4
): void {
  const bandH = Math.min(1.6, height * 0.28);
  const bandY = y;
  const span = face === 'north' || face === 'south' ? width : depth;
  const step = span / (count + 1);
  const winW = Math.min(step * 0.55, 2.4);

  for (let i = 1; i <= count; i++) {
    const offset = -span / 2 + step * i;
    const win = tagRole(new THREE.Mesh(new THREE.BoxGeometry(winW, bandH, 0.12), mats.glassMat), 'glass');
    if (face === 'north') {
      win.position.set(offset, bandY, -depth / 2 - 0.06);
    } else if (face === 'south') {
      win.position.set(offset, bandY, depth / 2 + 0.06);
    } else if (face === 'east') {
      win.rotation.y = Math.PI / 2;
      win.position.set(width / 2 + 0.06, bandY, offset);
    } else {
      win.rotation.y = Math.PI / 2;
      win.position.set(-width / 2 - 0.06, bandY, offset);
    }
    group.add(win);
  }
}

/** Ajoute une porte (rectangle sombre) sur une façade. */
function addDoor(
  group: THREE.Group,
  mats: SceneMaterials,
  width: number,
  depth: number,
  face: 'north' | 'south' | 'east' | 'west'
): void {
  const door = tagRole(new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 0.14), mats.roofMat), 'roof');
  if (face === 'north') door.position.set(0, 1.3, -depth / 2 - 0.07);
  else if (face === 'south') door.position.set(0, 1.3, depth / 2 + 0.07);
  else if (face === 'east') {
    door.rotation.y = Math.PI / 2;
    door.position.set(width / 2 + 0.07, 1.3, 0);
  } else {
    door.rotation.y = Math.PI / 2;
    door.position.set(-width / 2 - 0.07, 1.3, 0);
  }
  group.add(door);
}

/** Ajoute un socle béton sous un bâtiment. */
function addPlinth(group: THREE.Group, mats: SceneMaterials, width: number, depth: number): void {
  const plinth = tagRole(new THREE.Mesh(new THREE.BoxGeometry(width + 1.2, 0.5, depth + 1.2), mats.concreteMat), 'concrete');
  plinth.position.set(0, 0.25, 0);
  plinth.receiveShadow = true;
  group.add(plinth);
}

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
