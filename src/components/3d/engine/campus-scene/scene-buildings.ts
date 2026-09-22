/**
 * Construction des bâtiments procéduraux du campus et des balises
 * holographiques, positionnés depuis les transformations éditables.
 */

import * as THREE from 'three';
import { CAMPUS_FACILITIES } from '@/data/campus';
import { EditableFacilityItem } from '../../types/campus3d.types';
import { transformOf } from '../../data/facilityTransform';
import {
    createSceneMaterials,
    buildTowerMesh,
    buildZoeBellMesh,
    buildHangarMesh,
    buildDojosMesh,
    buildCityStadeMesh,
    buildMecaniqueMesh,
    buildQgMesh,
    buildManegeMesh,
    buildOutdoorMesh,
} from '../campusBuildingMeshes';
import { degToRad } from './scene-factory';

export function setupCampusBuildings(
    buildingsGroup: THREE.Group,
    beaconsGroup: THREE.Group,
    facilities: Record<string, EditableFacilityItem>
): void {
    const mats = createSceneMaterials();

    const builders: Record<string, () => THREE.Group> = {
        'cuc-tower': () => buildTowerMesh(mats),
        'zoe-bell-hall': () => buildZoeBellMesh(mats),
        'hangar-wirework': () => buildHangarMesh(mats),
        'dojos-sceniques': () => buildDojosMesh(mats),
        'city-stade-exterieur': () => buildCityStadeMesh(),
        'espace-mecanique': () => buildMecaniqueMesh(mats),
        'qg-staff-hebergement': () => buildQgMesh(mats),
        'manege-equestre': () => buildManegeMesh(mats),
        'site-tournage': () => buildOutdoorMesh(mats),
    };

    Object.entries(builders).forEach(([id, builder]) => {
        const item = facilities[id];
        const group = builder();
        if (item) {
            const transform = transformOf(item);
            // `|| 1` : garde-fou contre un enregistrement hérité incomplet (une
            // échelle `NaN` rendrait le maillage invisible sans message d'erreur).
            group.position.set(transform.x || 0, 0, transform.z || 0);
            group.rotation.y = degToRad(transform.rotationY || 0);
            group.scale.set(transform.scaleX || 1, transform.scaleY || 1, transform.scaleZ || 1);
            group.visible = item.visible;
        }
        buildingsGroup.add(group);
    });

    // Holographic Beacon Pins
    CAMPUS_FACILITIES.forEach((fac) => {
        const item = facilities[fac.id] || { x: 0, z: 0, visible: true };
        const beacon = new THREE.Group();
        beacon.name = `beacon-${fac.id}`;

        const diamond = new THREE.Mesh(
            new THREE.OctahedronGeometry(1.3, 0),
            new THREE.MeshStandardMaterial({ color: 0xffe500, emissive: 0xffe500, emissiveIntensity: 0.9, wireframe: true })
        );
        diamond.position.y = 14;
        beacon.add(diamond);

        const dropLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 14, 0), new THREE.Vector3(0, 0.2, 0)]),
            new THREE.LineBasicMaterial({ color: 0xffe500, transparent: true, opacity: 0.5 })
        );
        beacon.add(dropLine);

        const ripple = new THREE.Mesh(
            new THREE.RingGeometry(0.8, 2.8, 20),
            new THREE.MeshBasicMaterial({ color: 0xffe500, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
        );
        ripple.rotation.x = -Math.PI / 2;
        ripple.position.y = 0.2;
        beacon.add(ripple);

        beacon.position.set(item.x || 0, 0, item.z || 0);
        beacon.visible = item.visible;
        beaconsGroup.add(beacon);
    });
}
