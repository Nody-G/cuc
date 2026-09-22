/**
 * Construction du graphe de scène Three.js du campus : init du renderer,
 * groupes (bâtiments, balises, gizmo, surbrillance), état mutable de la caméra
 * et application du mode de plan initial.
 */

import * as THREE from 'three';
import {
    PlanMode,
    EditableFacilityItem,
    GizmoMode,
    ThreeSceneContext,
} from '../../types/campus3d.types';
import { PRESET_CONFIGS } from '../../data/defaultFacilities';
import {
    initCampusScene,
    setupCampusBuildings,
    applyPlanMode,
} from '../campusScene';
import { createCampusGizmo, createCampusHighlight } from '../useCampusGizmo';

interface InitCampusSceneGraphArgs {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
    facilities: Record<string, EditableFacilityItem>;
    mode: PlanMode;
    gizmoMode: GizmoMode;
}

/** Crée le renderer, les groupes et l'état mutable `ThreeSceneContext` initial. */
export function initCampusSceneGraph({
    canvas,
    width,
    height,
    facilities,
    mode,
    gizmoMode,
}: InitCampusSceneGraphArgs): ThreeSceneContext {
    const {
        scene,
        camera,
        renderer,
        groundMesh,
        groundGrid,
        ambientLight,
        sunLight,
        aerialTexture,
    } = initCampusScene(canvas, width, height);

    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);

    const beaconsGroup = new THREE.Group();
    scene.add(beaconsGroup);

    // Setup procedural facility meshes
    setupCampusBuildings(buildingsGroup, beaconsGroup, facilities);

    // Setup 3D Gizmo & Highlight Target
    const gizmoGroup = createCampusGizmo();
    scene.add(gizmoGroup);

    const highlightGroup = createCampusHighlight();
    scene.add(highlightGroup);

    const overview = PRESET_CONFIGS.overview;
    const spherical = { radius: overview.radius, theta: overview.theta, phi: overview.phi };
    const targetSpherical = { ...spherical };
    const center = new THREE.Vector3(overview.center[0], overview.center[1], overview.center[2]);
    const targetCenter = center.clone();
    const currentLookAt = center.clone();

    const three: ThreeSceneContext = {
        scene,
        camera,
        renderer,
        buildingsGroup,
        beaconsGroup,
        gizmoGroup,
        highlightGroup,
        groundMesh,
        groundGrid,
        groundPlaneRaycast: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
        ambientLight,
        sunLight,
        aerialTexture,
        isDragging: false,
        isPanning: false,
        isDraggingGizmo: false,
        activeDragType: null,
        dragStartIntersection: new THREE.Vector3(),
        dragStartTransform: {
            x: 0,
            z: 0,
            rotationY: 0,
            scaleX: 1,
            scaleY: 1,
            scaleZ: 1,
        },
        dragStartAxisParam: 0,
        dragPivot: new THREE.Vector3(),
        dragGizmoMode: 'translate',
        dragStartPointer: { x: 0, y: 0 },
        dragObjectRadius: 9,
        gizmoMode,
        gizmoObjectRadius: 9,
        gizmoScaleFrozen: null,
        prevMousePos: { x: 0, y: 0 },
        spherical,
        targetSpherical,
        center,
        targetCenter,
        currentLookAt,
        pulseTime: 0,
        animFrameId: 0,
        raycaster: new THREE.Raycaster(),
        mouseVector: new THREE.Vector2(),
    };

    // Apply initial mode
    applyPlanMode(
        mode,
        scene,
        buildingsGroup,
        groundMesh,
        groundGrid,
        ambientLight,
        sunLight,
        aerialTexture
    );

    return three;
}
