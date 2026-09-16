import * as THREE from 'three';

export interface SceneMaterials {
  steelMat: THREE.MeshStandardMaterial;
  yellowMat: THREE.MeshStandardMaterial;
  darkBuildingMat: THREE.MeshStandardMaterial;
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
  };
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
  }

  const platformHeights = [6, 9, 12, 15, 21];
  platformHeights.forEach((ph, idx) => {
    const isTop = idx === platformHeights.length - 1;
    const plat = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.3, 5.2), isTop ? mats.yellowMat : mats.steelMat);
    plat.position.set(0, ph, 0);
    plat.castShadow = true;
    towerGroup.add(plat);

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
  const zoeBody = new THREE.Mesh(new THREE.BoxGeometry(26, 8, 20), mats.darkBuildingMat);
  zoeBody.position.set(0, 4, 0);
  zoeBody.castShadow = true;
  zoeGroup.add(zoeBody);

  const zoeRoof = new THREE.Mesh(new THREE.ConeGeometry(18, 3, 4), mats.yellowMat);
  zoeRoof.name = 'accent';
  zoeRoof.rotation.y = Math.PI / 4;
  zoeRoof.position.set(0, 9.5, 0);
  zoeGroup.add(zoeRoof);

  const foamPit = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0x0077dd }));
  foamPit.position.set(0, 0.3, -12);
  zoeGroup.add(foamPit);

  return zoeGroup;
}

export function buildHangarMesh(mats: SceneMaterials): THREE.Group {
  const wireGroup = new THREE.Group();
  wireGroup.name = 'hangar-wirework';
  const wireBody = new THREE.Mesh(new THREE.BoxGeometry(20, 9, 22), mats.darkBuildingMat);
  wireBody.position.set(0, 4.5, 0);
  wireBody.castShadow = true;
  wireGroup.add(wireBody);

  const craneBeam = new THREE.Mesh(new THREE.BoxGeometry(22, 1, 1), mats.yellowMat);
  craneBeam.name = 'accent';
  craneBeam.position.set(0, 9.6, 0);
  wireGroup.add(craneBeam);

  return wireGroup;
}

export function buildDojosMesh(mats: SceneMaterials): THREE.Group {
  const dojoGroup = new THREE.Group();
  dojoGroup.name = 'dojos-sceniques';
  const dojoBody = new THREE.Mesh(new THREE.BoxGeometry(22, 7, 18), mats.darkBuildingMat);
  dojoBody.position.set(0, 3.5, 0);
  dojoBody.castShadow = true;
  dojoGroup.add(dojoBody);
  return dojoGroup;
}

export function buildCityStadeMesh(): THREE.Group {
  const stadeGroup = new THREE.Group();
  stadeGroup.name = 'city-stade-exterieur';
  const blueTrack = new THREE.Mesh(new THREE.PlaneGeometry(32, 20), new THREE.MeshStandardMaterial({ color: 0x1d63b8 }));
  blueTrack.rotation.x = -Math.PI / 2;
  blueTrack.position.set(0, 0.04, 0);
  stadeGroup.add(blueTrack);

  const greenPitch = new THREE.Mesh(new THREE.PlaneGeometry(24, 14), new THREE.MeshStandardMaterial({ color: 0x247248 }));
  greenPitch.rotation.x = -Math.PI / 2;
  greenPitch.position.set(0, 0.05, 0);
  stadeGroup.add(greenPitch);
  return stadeGroup;
}

export function buildMecaniqueMesh(mats: SceneMaterials): THREE.Group {
  const mecaGroup = new THREE.Group();
  mecaGroup.name = 'espace-mecanique';
  const workshop = new THREE.Mesh(new THREE.BoxGeometry(24, 5.5, 14), mats.darkBuildingMat);
  workshop.position.set(0, 2.75, 0);
  workshop.castShadow = true;
  mecaGroup.add(workshop);
  return mecaGroup;
}

export function buildQgMesh(mats: SceneMaterials): THREE.Group {
  const qgGroup = new THREE.Group();
  qgGroup.name = 'qg-staff-hebergement';
  const northWing = new THREE.Mesh(new THREE.BoxGeometry(26, 6.5, 8), mats.darkBuildingMat);
  northWing.position.set(0, 3.25, -9);
  northWing.castShadow = true;
  qgGroup.add(northWing);

  const eastWing = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 18), mats.darkBuildingMat);
  eastWing.position.set(10, 3, 0);
  eastWing.castShadow = true;
  qgGroup.add(eastWing);

  const ringDrive = new THREE.Mesh(new THREE.RingGeometry(3, 4.5, 24), new THREE.MeshStandardMaterial({ color: 0x9ca3af }));
  ringDrive.rotation.x = -Math.PI / 2;
  ringDrive.position.set(0, 0.05, 0);
  qgGroup.add(ringDrive);
  return qgGroup;
}

export function buildManegeMesh(mats: SceneMaterials): THREE.Group {
  const manegeGroup = new THREE.Group();
  manegeGroup.name = 'manege-equestre';
  const manegeHangar = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 26, 20, 1, false, 0, Math.PI), mats.darkBuildingMat);
  manegeHangar.rotation.z = Math.PI / 2;
  manegeHangar.castShadow = true;
  manegeGroup.add(manegeHangar);

  const paddock = new THREE.Mesh(new THREE.RingGeometry(10, 12, 28), new THREE.MeshStandardMaterial({ color: 0xd6b38a }));
  paddock.rotation.x = -Math.PI / 2;
  paddock.position.set(0, 0.05, 16);
  manegeGroup.add(paddock);
  return manegeGroup;
}

export function buildOutdoorMesh(mats: SceneMaterials): THREE.Group {
  const outdoorGroup = new THREE.Group();
  outdoorGroup.name = 'site-tournage';
  for (let t = 0; t < 6; t++) {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 3.5, 6), mats.darkBuildingMat);
    trunk.position.set(-15 + t * 6, 1.75, 0);
    outdoorGroup.add(trunk);
    const top = new THREE.Mesh(new THREE.ConeGeometry(2, 4.5, 6), new THREE.MeshStandardMaterial({ color: 0x1e4620 }));
    top.position.set(-15 + t * 6, 5, 0);
    outdoorGroup.add(top);
  }
  return outdoorGroup;
}
