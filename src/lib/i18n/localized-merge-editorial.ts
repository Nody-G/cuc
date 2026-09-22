/**
 * Surface traduisible : quelles feuilles sont éditoriales, et aplatissement
 * `{ chemin: texte }`. Mêmes règles d'exclusion que
 * `scripts/audit_i18n_completeness.mjs`.
 */
import {
    NEVER_TRANSLATED_KEYS,
    PAGE_LOCKED_ROOTS,
    TECHNICAL_KEY,
    type OverlayOptions,
} from './localized-merge-types';

/** Dernier segment d'un chemin, index de tableau retiré (`items[0].title` → `title`). */
export function lastKeyOf(path: string): string {
    return (path.split('.').pop() || '').replace(/\[\d+\]/g, '');
}

/** Clé technique (média, lien, ordre, état, mesure) ou non traduisible par nature. */
export function isTechnicalKey(key: string): boolean {
    return NEVER_TRANSLATED_KEYS.has(key) || TECHNICAL_KEY.test(key);
}

/**
 * Une valeur est-elle du texte éditorial traduisible ?
 * Mêmes règles que `scripts/audit_i18n_completeness.mjs` (seuil de 3 caractères,
 * ni URL, ni valeur purement numérique).
 */
export function isEditorialLeaf(value: unknown, path: string): value is string {
    if (typeof value !== 'string') return false;
    const v = value.trim();
    if (v.length < 3) return false;
    const key = lastKeyOf(path);
    if (NEVER_TRANSLATED_KEYS.has(key)) return false;
    if (TECHNICAL_KEY.test(key)) return false;
    if (/^(https?:)?\/\//.test(v) || v.startsWith('/')) return false;
    if (/^[#\d\s.,%°+-]+$/.test(v)) return false;
    return true;
}

/**
 * Aplatit un contenu en `{ chemin: texte }` pour toutes les feuilles éditoriales.
 * Les racines verrouillées (structure, médias, identité) sont ignorées, à
 * n'importe quel niveau.
 */
export function flattenEditorial(
    node: unknown,
    options: OverlayOptions = {},
    prefix = '',
    out: Record<string, string> = {}
): Record<string, string> {
    if (node === null || node === undefined) return out;
    const lockedRoots = options.lockedRoots ?? PAGE_LOCKED_ROOTS;

    if (Array.isArray(node)) {
        node.forEach((item, i) => flattenEditorial(item, options, `${prefix}[${i}]`, out));
        return out;
    }
    if (typeof node === 'object') {
        for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
            if (lockedRoots.includes(key)) continue;
            flattenEditorial(value, options, prefix ? `${prefix}.${key}` : key, out);
        }
        return out;
    }
    if (prefix && isEditorialLeaf(node, prefix)) out[prefix] = node;
    return out;
}
