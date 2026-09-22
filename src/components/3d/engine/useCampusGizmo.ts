/**
 * Gizmo d'édition du campus — baril de ré-export.
 *
 * L'implémentation vit dans `./campus-gizmo/**` : constantes des poignées,
 * picking (détection des poignées et des bâtiments), visibilité des outils,
 * builders Three.js (gizmo + couronne de mise en évidence).
 */

export { GIZMO_HANDLE_NAMES, type GizmoHandleName } from './campus-gizmo/gizmo-constants';

export {
  handleToDragType,
  findGizmoHandle,
  handleToMode,
  findFirstGizmoHandle,
  findBuildingGroup,
  snapValue,
} from './campus-gizmo/gizmo-picking';
export type { GizmoHandleFilter } from './campus-gizmo/gizmo-picking';

export {
  setGizmoMode,
  setRotateRingEmphasis,
  setGizmoScale,
} from './campus-gizmo/gizmo-visibility';

export { createCampusGizmo } from './campus-gizmo/gizmo-builders';

export { createCampusHighlight, setHighlightRadius } from './campus-gizmo/gizmo-highlight';
