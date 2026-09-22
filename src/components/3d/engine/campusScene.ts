/**
 * Scène 3D du campus — surface publique historique.
 *
 * L'implémentation vit dans `campus-scene/**` (fabrique WebGL, bâtiments,
 * modes de plan) ; cette façade conserve les exports consommés par
 * `scene-init`, `useCampusScene` et les widgets 3D.
 */

export {
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
} from './campusBuildingMeshes';

export { initCampusScene, type CampusWebGLContext } from './campus-scene/scene-factory';
export { setupCampusBuildings } from './campus-scene/scene-buildings';
export { applyPlanMode } from './campus-scene/scene-plan-mode';
