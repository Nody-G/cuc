/** Rayon moyen de la couronne de mise en évidence, avant mise à l'échelle. */
export const HIGHLIGHT_BASE_RADIUS = 8.85;

/**
 * Liste **exhaustive** des poignées interactives du gizmo.
 *
 * La détection repose sur une correspondance exacte avec cet ensemble, et non
 * sur un test de préfixe `'gizmo-'` : les groupes conteneurs
 * (`gizmo-translate-group`, `gizmo-rotate-group`, `gizmo-scale-group`) portent
 * eux aussi ce préfixe, et un test de préfixe les ferait passer pour des
 * poignées — une poignée fantôme qui capture tous les clics.
 */
export const GIZMO_HANDLE_NAMES = [
    'gizmo-center',
    'gizmo-translate-x',
    'gizmo-translate-z',
    'gizmo-rotate-y',
    'gizmo-scale-x',
    'gizmo-scale-y',
    'gizmo-scale-z',
    'gizmo-scale-uniform',
] as const;

export type GizmoHandleName = (typeof GIZMO_HANDLE_NAMES)[number];

export const GIZMO_HANDLE_SET: ReadonlySet<string> = new Set<string>(GIZMO_HANDLE_NAMES);

export const AXIS_COLORS = {
    x: 0xff3366,
    y: 0x36d399,
    z: 0x00aaff,
} as const;

export const ROTATE_GROUP_NAME = 'gizmo-rotate-group';

/**
 * Groupes **exclusifs** : une seule famille d'axes affichée à la fois.
 * Les flèches de translation et les axes d'échelle occupent la même place ;
 * les afficher simultanément rendrait la moindre poignée ambiguë.
 */
export const GIZMO_EXCLUSIVE_GROUP = {
    translate: 'gizmo-translate-group',
    scale: 'gizmo-scale-group',
} as const;

/** Opacité de l'anneau de lacet selon qu'il est l'outil courant ou non. */
export const ROTATE_RING_OPACITY = { active: 0.9, idle: 0.28 } as const;
