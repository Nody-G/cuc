import * as THREE from 'three';

export function createCampusGizmo(): THREE.Group {
  const gizmoGroup = new THREE.Group();
  gizmoGroup.name = 'gizmo-root';

  // 1. Center Ground Disc (Dual Axis X/Z free slide)
  const discGeo = new THREE.CircleGeometry(3.6, 32);
  const discMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthTest: false,
  });
  const centerDisc = new THREE.Mesh(discGeo, discMat);
  centerDisc.rotation.x = -Math.PI / 2;
  centerDisc.position.y = 0.12;
  centerDisc.name = 'gizmo-center';
  gizmoGroup.add(centerDisc);

  const discBorder = new THREE.Mesh(
    new THREE.RingGeometry(3.45, 3.65, 32),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide, depthTest: false })
  );
  discBorder.rotation.x = -Math.PI / 2;
  discBorder.position.y = 0.13;
  discBorder.name = 'gizmo-center';
  gizmoGroup.add(discBorder);

  // 2. X Axis (Red / Coral)
  const xAxisGroup = new THREE.Group();
  xAxisGroup.name = 'gizmo-axis-x';
  const xLine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 8.5, 8),
    new THREE.MeshBasicMaterial({ color: 0xff3366, depthTest: false })
  );
  xLine.rotation.z = -Math.PI / 2;
  xLine.position.set(4.25, 0.18, 0);
  xLine.name = 'gizmo-axis-x';
  xAxisGroup.add(xLine);

  const xCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 2.2, 12),
    new THREE.MeshBasicMaterial({ color: 0xff3366, depthTest: false })
  );
  xCone.rotation.z = -Math.PI / 2;
  xCone.position.set(9.0, 0.18, 0);
  xCone.name = 'gizmo-axis-x';
  xAxisGroup.add(xCone);
  gizmoGroup.add(xAxisGroup);

  // 3. Z Axis (Blue / Cyan)
  const zAxisGroup = new THREE.Group();
  zAxisGroup.name = 'gizmo-axis-z';
  const zLine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 8.5, 8),
    new THREE.MeshBasicMaterial({ color: 0x00aaff, depthTest: false })
  );
  zLine.rotation.x = Math.PI / 2;
  zLine.position.set(0, 0.18, 4.25);
  zLine.name = 'gizmo-axis-z';
  zAxisGroup.add(zLine);

  const zCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 2.2, 12),
    new THREE.MeshBasicMaterial({ color: 0x00aaff, depthTest: false })
  );
  zCone.rotation.x = Math.PI / 2;
  zCone.position.set(0, 0.18, 9.0);
  zCone.name = 'gizmo-axis-z';
  zAxisGroup.add(zCone);
  gizmoGroup.add(zAxisGroup);

  // 4. Y Axis Rotation Ring & Indicators (Yellow / Gold)
  const rotSubGroup = new THREE.Group();
  rotSubGroup.name = 'gizmo-rot-subgroup';

  const rotRing = new THREE.Mesh(
    new THREE.TorusGeometry(7.0, 0.16, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0xffe500, transparent: true, opacity: 0.85, depthTest: false })
  );
  rotRing.rotation.x = -Math.PI / 2;
  rotRing.position.y = 0.18;
  rotRing.name = 'gizmo-rot-y';
  rotSubGroup.add(rotRing);

  // Angle markers on rotation ring
  [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((ang, idx) => {
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.35, 1.2),
      new THREE.MeshBasicMaterial({ color: idx === 0 ? 0xffe500 : 0xffffff, depthTest: false })
    );
    tick.position.set(Math.sin(ang) * 7.0, 0.2, Math.cos(ang) * 7.0);
    tick.rotation.y = ang;
    tick.name = 'gizmo-rot-y';
    rotSubGroup.add(tick);
  });

  const facingArrow = new THREE.Mesh(
    new THREE.ConeGeometry(0.8, 1.8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffe500, depthTest: false })
  );
  facingArrow.rotation.x = Math.PI / 2;
  facingArrow.position.set(0, 0.25, 8.2);
  facingArrow.name = 'gizmo-rot-y';
  rotSubGroup.add(facingArrow);

  gizmoGroup.add(rotSubGroup);

  gizmoGroup.position.set(0, 0.15, 0);
  gizmoGroup.visible = false;
  return gizmoGroup;
}

export function findGizmoHandle(obj: THREE.Object3D | null, gizmoRoot: THREE.Group): string | null {
  let cur = obj;
  while (cur && cur !== gizmoRoot) {
    if (cur.name && cur.name.startsWith('gizmo-')) {
      return cur.name;
    }
    cur = cur.parent;
  }
  return null;
}

export function findBuildingGroup(obj: THREE.Object3D | null, buildingsRoot: THREE.Group): THREE.Object3D | null {
  let cur = obj;
  while (cur && cur.parent && cur.parent !== buildingsRoot) {
    cur = cur.parent;
  }
  return cur;
}

export function snapValue(val: number, step: number): number {
  return Math.round(val / step) * step;
}

export function createCampusHighlight(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'campus-highlight-group';

  // 1. Outer target ring
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

  // 2. Inner pulsating disc
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

  // 3. Four corner reticle brackets / ticks
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

  // 4. Subtle vertical light pillar
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

  group.position.set(7.0, 0, 14.0);
  group.visible = true;
  return group;
}

