/**
 * Domaine du bloc « Position / Orientation / Dimensions » du studio 3D :
 * déclarations d'axes, pas rapides et formatages. Aucun JSX
 * (`AGENTS.md` § 1-2) — le rendu vit dans les blocs voisins.
 */

/** Axe déplaçable sur le plan du sol. */
export type PositionAxisKey = 'x' | 'z';

/** Axe redimensionnable (facteur d'échelle). */
export type ScaleAxisKey = 'x' | 'y' | 'z';

/** Champ de facteur d'échelle correspondant à un axe (`EditableFacilityItem`). */
export type ScaleField = 'scaleX' | 'scaleY' | 'scaleZ';

export interface AxisDescriptor<Key extends string> {
    key: Key;
    label: string;
    dotColor: string;
    accentClass: string;
    /** Renseigné pour les axes d'échelle : évite toute indexation dynamique. */
    field?: ScaleField;
}

/** Déplacements possibles : X (est/ouest) et Z (nord/sud). */
export const POSITION_AXES: ReadonlyArray<AxisDescriptor<PositionAxisKey>> = [
    { key: 'x', label: 'Axe X (Est / Ouest)', dotColor: '#ff3366', accentClass: 'accent-[#ff3366]' },
    { key: 'z', label: 'Axe Z (Nord / Sud)', dotColor: '#00aaff', accentClass: 'accent-[#00aaff]' },
];

/** Facteurs d'échelle : largeur, hauteur, profondeur. */
export const SCALE_AXES: ReadonlyArray<AxisDescriptor<ScaleAxisKey> & { field: ScaleField }> = [
    {
        key: 'x',
        field: 'scaleX',
        label: 'Largeur (X)',
        dotColor: '#ff3366',
        accentClass: 'accent-[#ff3366]',
    },
    {
        key: 'y',
        field: 'scaleY',
        label: 'Hauteur (Y)',
        dotColor: '#36d399',
        accentClass: 'accent-[#36d399]',
    },
    {
        key: 'z',
        field: 'scaleZ',
        label: 'Profondeur (Z)',
        dotColor: '#00aaff',
        accentClass: 'accent-[#00aaff]',
    },
];

/** Pas rapides (± en mètres) des déplacements. */
export const POSITION_QUICK_STEPS: number[] = [-5, -1, -0.2, 0.2, 1, 5];

/** Pas rapides (± en facteurs) des dimensions. */
export const SCALE_QUICK_STEPS: number[] = [-0.5, -0.1, -0.05, 0.05, 0.1, 0.5];

/** Pas rapides (± en degrés) du lacet. */
export const ORIENTATION_QUICK_STEPS: number[] = [-90, -45, -15, 15, 45, 90];

/** Formate une longueur en mètres, à la française, sans fausse précision. */
export function formatMeters(value: number, decimals = 1): string {
    return `${value.toFixed(decimals).replace('.', ',')} m`;
}

/** Delta de facteur d'échelle (« +0.5x », « -0.1x »). */
export const formatScaleDelta = (delta: number): string => (delta > 0 ? `+${delta}x` : `${delta}x`);

/** Delta d'angle (« +45° », « -90° »). */
export const formatDegreesDelta = (delta: number): string =>
    delta > 0 ? `+${delta}°` : `${delta}°`;
