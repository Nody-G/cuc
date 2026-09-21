import {
    EditableFacilityItem,
    FacilityTransform,
    GizmoMode,
} from '../types/campus3d.types';
import { REAL_FACILITIES } from './realFacilities';

/**
 * Bornes de transformation du studio 3D.
 *
 * Doctrine : ces bornes servent uniquement à empêcher une saisie absurde
 * (valeur non finie, objet hors du domaine, échelle nulle) — jamais à
 * « inventer » une position. Une transformation reste toujours le fait de
 * l'opérateur.
 */
export const TRANSFORM_LIMITS = {
    /**
     * Demi-étendue du domaine en mètres. Le domaine réel s'étend de
     * x ≈ −46 m à +29 m et de z ≈ −3 m à +107 m (empreintes OSM) ; 160 m
     * laisse une marge confortable sans permettre de perdre un bâtiment.
     */
    position: 160,
    scale: { min: 0.05, max: 12 },
    /** Pas d'échelle appliqué par les boutons ± et le clavier. */
    scaleStep: 0.05,
    /** Pas de rotation (degrés) appliqué par les boutons et le clavier. */
    rotationStep: 15,
} as const;

export const GIZMO_MODE_LABELS: Record<GizmoMode, string> = {
    translate: 'Déplacer',
    rotate: 'Tourner',
    scale: 'Redimensionner',
};

export function clampNumber(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/** Convertit une valeur éventuellement invalide (`NaN`, `Infinity`) en repli sûr. */
export function finiteOr(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function clampScale(value: unknown, fallback = 1): number {
    const next = finiteOr(value, fallback);
    return clampNumber(next, TRANSFORM_LIMITS.scale.min, TRANSFORM_LIMITS.scale.max);
}

export function clampPosition(value: unknown, fallback = 0): number {
    const next = finiteOr(value, fallback);
    return clampNumber(next, -TRANSFORM_LIMITS.position, TRANSFORM_LIMITS.position);
}

/** Normalise un angle dans l'intervalle [0, 360). */
export function normalizeAngle360(degrees: number): number {
    return ((degrees % 360) + 360) % 360;
}

/** Extrait la seule transformée d'une installation. */
export function transformOf(item: FacilityTransform): FacilityTransform {
    return {
        x: item.x,
        z: item.z,
        rotationY: item.rotationY,
        scaleX: item.scaleX,
        scaleY: item.scaleY,
        scaleZ: item.scaleZ,
    };
}

/**
 * Normalise une installation brute (base de données, `localStorage`, import
 * JSON ou état local) vers la forme canonique `EditableFacilityItem`.
 *
 * Migration v1 → v2 : les anciens couples `scale` (uniforme XZ) et
 * `heightScale` (Y) sont conservés **au pixel près** — la scène appliquait
 * `scale.set(scale, scale * heightScale, scale)`, donc :
 *   scaleX = scale, scaleZ = scale, scaleY = scale × heightScale.
 *
 * Les clés d'un enregistrement plus large (comme une altitude ou une
 * inclinaison héritées) sont ignorées : le modèle ne les porte plus.
 */
export function normalizeFacilityItem(
    id: string,
    raw: Partial<EditableFacilityItem> | undefined,
    base?: Partial<EditableFacilityItem>
): EditableFacilityItem {
    const source: Partial<EditableFacilityItem> = { ...(base ?? {}), ...(raw ?? {}) };

    const legacyScale = finiteOr(source.scale, 1);
    const legacyHeight = finiteOr(source.heightScale, 1);

    const hasAxes =
        source.scaleX !== undefined || source.scaleY !== undefined || source.scaleZ !== undefined;

    const scaleX = clampScale(hasAxes ? source.scaleX : legacyScale, legacyScale);
    const scaleZ = clampScale(hasAxes ? source.scaleZ : legacyScale, legacyScale);
    const scaleY = clampScale(
        hasAxes ? source.scaleY : legacyScale * legacyHeight,
        legacyScale * legacyHeight
    );

    return {
        id,
        name: typeof source.name === 'string' && source.name.length > 0 ? source.name : id,
        code: typeof source.code === 'string' && source.code.length > 0 ? source.code : '—',
        x: clampPosition(source.x, 0),
        z: clampPosition(source.z, 0),
        rotationY: normalizeAngle360(finiteOr(source.rotationY, 0)),
        scaleX,
        scaleY,
        scaleZ,
        uniformScale: typeof source.uniformScale === 'boolean' ? source.uniformScale : false,
        visible: typeof source.visible === 'boolean' ? source.visible : true,
    };
}

/**
 * Normalise un dictionnaire complet d'installations.
 *
 * - Sans `base` : seules les clés fournies sont conservées (sémantique
 *   « remplacement », utilisée à l'import JSON).
 * - Avec `base` : les installations absentes du dictionnaire brut sont
 *   réintroduites depuis `base` (utilisé au chargement Supabase, afin
 *   qu'une entrée partielle n'efface jamais le reste du plan).
 */
export function normalizeFacilityRecord(
    raw: unknown,
    base?: Record<string, EditableFacilityItem>
): Record<string, EditableFacilityItem> {
    const record = (raw && typeof raw === 'object' ? raw : {}) as Record<
        string,
        Partial<EditableFacilityItem>
    >;

    const ids = base
        ? Array.from(new Set([...Object.keys(base), ...Object.keys(record)]))
        : Object.keys(record);

    const out: Record<string, EditableFacilityItem> = {};
    for (const id of ids) {
        out[id] = normalizeFacilityItem(id, record[id], base?.[id]);
    }
    return out;
}

/**
 * Applique une nouvelle valeur à un axe d'échelle en respectant le verrou
 * d'échelle uniforme : le rapport appliqué à l'axe piloté est reporté
 * proportionnellement sur les deux autres axes, ce qui préserve un jeu
 * d'échelles déséquilibré (par exemple 1 : 2 : 3 → 2 : 4 : 6).
 */
export function scaleAxisPatch(
    item: EditableFacilityItem,
    axis: 'x' | 'y' | 'z',
    nextValue: number
): Partial<EditableFacilityItem> {
    const key = (`scale${axis.toUpperCase()}`) as 'scaleX' | 'scaleY' | 'scaleZ';
    const next = clampScale(nextValue, item[key]);

    if (!item.uniformScale) {
        return { [key]: next } as Partial<EditableFacilityItem>;
    }

    const current = item[key] || 1;
    const ratio = next / current;
    return {
        scaleX: clampScale(item.scaleX * ratio, item.scaleX),
        scaleY: clampScale(item.scaleY * ratio, item.scaleY),
        scaleZ: clampScale(item.scaleZ * ratio, item.scaleZ),
    };
}

/** Applique la même valeur aux trois axes (échelle uniforme absolue). */
export function scaleUniformPatch(value: number): Partial<EditableFacilityItem> {
    const next = clampScale(value);
    return { scaleX: next, scaleY: next, scaleZ: next };
}

/** Décale le lacet (rotation Y) avec repli circulaire dans [0, 360). */
export function rotateYPatch(
    item: EditableFacilityItem,
    deltaDegrees: number
): Partial<EditableFacilityItem> {
    return { rotationY: normalizeAngle360(item.rotationY + deltaDegrees) };
}

/** Arrondit une valeur au pas d'aimantation (0 ou négatif = pas d'arrondi). */
export function snapToStep(value: number, step: number): number {
    if (step <= 0) return Number(value.toFixed(3));
    return Number((Math.round(value / step) * step).toFixed(3));
}

/**
 * Référence dimensionnelle réelle d'une installation, en mètres, d'après
 * l'empreinte OpenStreetMap (`realFacilities.ts`).
 *
 * Retourne `null` pour les repères créés dans le cockpit : aucune dimension
 * réelle n'existe, et l'UI n'affiche alors aucune valeur inventée.
 */
export function getRealFootprintReference(id: string): { width: number; depth: number } | null {
    const real = REAL_FACILITIES[id];
    if (!real?.footprint) return null;
    const { width, depth } = real.footprint;
    if (!Number.isFinite(width) || !Number.isFinite(depth) || width <= 0 || depth <= 0) {
        return null;
    }
    return { width, depth };
}

/**
 * Rayon d'emprise affichable d'une installation, en mètres (demi-diagonale
 * de l'empreinte réelle mise à l'échelle). Sert au dimensionnement de la
 * couronne de mise en évidence et du gizmo.
 *
 * Repli : 9 m (rayon historique de la couronne) quand aucune empreinte réelle
 * n'est disponible.
 */
export function getFacilityRadius(
    id: string,
    item: Pick<FacilityTransform, 'scaleX' | 'scaleZ'>
): number {
    const footprint = getRealFootprintReference(id);
    if (!footprint) return 9;
    const halfWidth = (footprint.width / 2) * Math.abs(item.scaleX);
    const halfDepth = (footprint.depth / 2) * Math.abs(item.scaleZ);
    return clampNumber(Math.hypot(halfWidth, halfDepth), 4, 400);
}
