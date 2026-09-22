/**
 * Mesure et contrôle : couverture d'une traduction, tableaux désalignés et
 * nettoyage défensif d'un payload d'overlay avant écriture.
 */
import { flattenEditorial, isTechnicalKey } from './localized-merge-editorial';
import {
    MISSING_PATHS_LIMIT,
    PAGE_LOCKED_ROOTS,
    type OverlayOptions,
    type StaleArray,
    type TranslationCoverage,
} from './localized-merge-types';

/** Feuilles d'un payload, à plat. */
function flattenOverlay(
    payload: unknown,
    options: OverlayOptions
): Record<string, string> {
    return flattenEditorial(payload, options);
}

/**
 * Couverture d'une traduction, feuille par feuille.
 *
 * `translated` compte les feuilles dont la valeur anglaise **diffère** du
 * français. Une traduction identique au français (marque, nom propre) est
 * légitime mais n'est pas comptée comme un manque : elle est simplement héritée.
 */
export function translationCoverage(
    base: unknown,
    payload: unknown,
    options: OverlayOptions = {}
): TranslationCoverage {
    const baseLeaves = flattenEditorial(base, options);
    const payloadLeaves = flattenOverlay(payload, options);

    const basePaths = Object.keys(baseLeaves);
    const extraPaths = Object.keys(payloadLeaves).filter((p) => !(p in baseLeaves));

    let translated = 0;
    const missing: string[] = [];
    for (const path of basePaths) {
        const fr = baseLeaves[path];
        const en = payloadLeaves[path];
        if (en !== undefined && en !== fr) {
            translated += 1;
        } else if (missing.length < MISSING_PATHS_LIMIT) {
            missing.push(path);
        }
    }
    translated += extraPaths.length;

    const total = basePaths.length + extraPaths.length;
    const percent = total === 0 ? 100 : Math.min(100, Math.round((translated / total) * 100));

    return {
        total,
        translated,
        percent,
        missing,
        staleArrays: findStaleArrays(base, payload, options),
    };
}

/**
 * Tableaux dont la structure a divergé depuis la traduction (item FR ajouté ou
 * supprimé, ou `id` déplacé). Le Cockpit les signale : sans resynchronisation,
 * l'overlay décrirait une page qui n'existe plus.
 */
export function findStaleArrays(
    base: unknown,
    payload: unknown,
    options: OverlayOptions = {}
): StaleArray[] {
    const lockedRoots = options.lockedRoots ?? PAGE_LOCKED_ROOTS;
    const out: StaleArray[] = [];

    const walk = (baseNode: unknown, overlayNode: unknown, path: string): void => {
        if (Array.isArray(baseNode)) {
            if (!Array.isArray(overlayNode)) return;
            const idMismatch = baseNode.some((item, i) => {
                const other = overlayNode[i];
                const a = item as { id?: unknown } | null;
                const b = other as { id?: unknown } | null;
                if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
                if (a.id === undefined || b.id === undefined) return false;
                return a.id !== b.id;
            });
            if (overlayNode.length !== baseNode.length || idMismatch) {
                out.push({
                    path,
                    frLength: baseNode.length,
                    enLength: overlayNode.length,
                    idMismatch,
                });
            }
            baseNode.forEach((item, i) => walk(item, overlayNode[i], `${path}[${i}]`));
            return;
        }
        if (baseNode !== null && typeof baseNode === 'object') {
            if (overlayNode === null || typeof overlayNode !== 'object') return;
            for (const [key, value] of Object.entries(baseNode as Record<string, unknown>)) {
                // Une racine verrouillée (structure, médias, identité) n'est jamais
                // traduite : elle ne peut donc pas être « désalignée ».
                if (lockedRoots.includes(key)) continue;
                walk(value, (overlayNode as Record<string, unknown>)[key], `${path}.${key}`);
            }
        }
    };

    walk(base, payload, '');
    return out;
}

/**
 * Nettoyage défensif d'un payload d'overlay avant écriture.
 *
 * - retire les racines verrouillées et les clés techniques au premier niveau ;
 * - supprime les chaînes vides, `null` et objets vides, récursivement ;
 * - **ne filtre jamais l'intérieur d'un tableau** : un tableau est écrit en bloc,
 *   retirer une clé d'un item publierait un champ vide sur la vitrine.
 */
export function sanitizeOverlayPayload(
    payload: unknown,
    options: OverlayOptions = {}
): Record<string, unknown> {
    const lockedRoots = options.lockedRoots ?? PAGE_LOCKED_ROOTS;

    const clean = (node: unknown): unknown => {
        if (node === null || node === undefined) return undefined;
        if (typeof node === 'string') return node.trim() === '' ? undefined : node;
        if (Array.isArray(node)) return node.length > 0 ? node : undefined;
        if (typeof node === 'object') {
            const out: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
                const cleaned = clean(value);
                if (cleaned !== undefined) out[key] = cleaned;
            }
            return Object.keys(out).length > 0 ? out : undefined;
        }
        return node;
    };

    if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return {};
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
        if (lockedRoots.includes(key) || isTechnicalKey(key)) continue;
        if (Array.isArray(value)) {
            if (value.length > 0) out[key] = value;
            continue;
        }
        const cleaned = clean(value);
        if (cleaned !== undefined) out[key] = cleaned;
    }
    return out;
}
