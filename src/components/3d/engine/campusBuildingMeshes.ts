/**
 * ==============================================================================
 * CUC — Maillages des bâtiments du campus : façade (API publique inchangée)
 * ==============================================================================
 * L'implémentation vit dans `./campus-meshes/**` :
 *   - `shared.ts`      : `MaterialRole`, `tagRole`, `SceneMaterials`,
 *     `createSceneMaterials` et les helpers de façade (bandeaux vitrés,
 *     portes, socles) ;
 *   - `acrobatics.ts`  : `buildTowerMesh` (tour d'entraînement + airbag) ;
 *   - `halls.ts`       : `buildZoeBellMesh`, `buildHangarMesh`, `buildDojosMesh` ;
 *   - `grounds.ts`     : `buildCityStadeMesh`, `buildOutdoorMesh` ;
 *   - `facilities.ts`  : `buildMecaniqueMesh`, `buildQgMesh`, `buildManegeMesh`.
 */

export {
  createSceneMaterials,
  tagRole,
  type MaterialRole,
  type SceneMaterials,
} from './campus-meshes/shared';
export { buildTowerMesh } from './campus-meshes/acrobatics';
export { buildDojosMesh, buildHangarMesh, buildZoeBellMesh } from './campus-meshes/halls';
export { buildCityStadeMesh, buildOutdoorMesh } from './campus-meshes/grounds';
export { buildManegeMesh, buildMecaniqueMesh, buildQgMesh } from './campus-meshes/facilities';
