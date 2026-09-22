/**
 * ==============================================================================
 * CUC — Diff du brouillon (inspecteur de la Vue Studio)
 * ==============================================================================
 * L'aperçu en place écrit dans un brouillon en mémoire ; le Cockpit n'enregistre
 * qu'au bouton « Enregistrer ». Encore faut-il **voir** ce qui a été modifié :
 * ce module produit la liste des champs qui diffèrent de l'état enregistré et
 * permet de revenir sur un champ précis.
 *
 * Principes :
 *   - lecture et écriture **immuables** : la source n'est jamais mutée ;
 *   - seules les **feuilles** sont listées (chaîne, nombre, booléen, null) ;
 *     un item supprimé ressort donc sous forme de feuille passée à `undefined` ;
 *   - aucun chemin inventé : un champ absent des deux côtés n'apparaît pas ;
 *   - garde-fous de volume (profondeur et nombre de changements) pour qu'un
 *     brouillon pathologique ne fige pas l'interface.
 */

const MAX_DEPTH = 12;
const MAX_CHANGES = 400;

export interface DraftFieldChange {
    /** Chemin canonique du champ (`sections_data.about.title`). */
    path: string;
    /** Valeur enregistrée (absente si le champ a été ajouté). */
    before: unknown;
    /** Valeur en brouillon (absente si le champ a été supprimé). */
    after: unknown;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLeaf(value: unknown): boolean {
    return value === null || typeof value !== 'object';
}

function segments(path: string): string[] {
    return path.split('.').filter((segment) => segment.length > 0);
}

/** Lit une valeur par chemin (immuable). `undefined` si le chemin n'existe pas. */
export function getFieldValue(root: unknown, path: string): unknown {
    let cursor: unknown = root;
    for (const segment of segments(path)) {
        if (Array.isArray(cursor)) {
            const index = Number.parseInt(segment, 10);
            if (!Number.isInteger(index) || index < 0 || index >= cursor.length) return undefined;
            cursor = cursor[index];
            continue;
        }
        if (!isPlainObject(cursor)) return undefined;
        cursor = cursor[segment];
    }
    return cursor;
}

/** Retire une clé (ou un index) du clone — utilisé pour annuler un ajout. */
function removePath(target: unknown, path: string): void {
    const parts = segments(path);
    if (parts.length === 0) return;

    let cursor: unknown = target;
    for (const segment of parts.slice(0, -1)) {
        if (Array.isArray(cursor)) {
            const index = Number.parseInt(segment, 10);
            if (!Number.isInteger(index) || index < 0 || index >= cursor.length) return;
            cursor = cursor[index];
            continue;
        }
        if (!isPlainObject(cursor)) return;
        cursor = cursor[segment];
    }

    const last = parts[parts.length - 1];
    if (Array.isArray(cursor)) {
        const index = Number.parseInt(last, 10);
        if (Number.isInteger(index) && index >= 0 && index < cursor.length) cursor.splice(index, 1);
        return;
    }
    if (isPlainObject(cursor)) delete cursor[last];
}

function clone<T>(value: T): T {
    if (Array.isArray(value)) return value.map((entry) => clone(entry)) as unknown as T;
    if (isPlainObject(value)) {
        return Object.fromEntries(
            Object.entries(value).map(([key, entry]) => [key, clone(entry)])
        ) as unknown as T;
    }
    return value;
}

function walk(
    before: unknown,
    after: unknown,
    prefix: string,
    out: DraftFieldChange[],
    depth: number
): void {
    if (out.length >= MAX_CHANGES) return;

    if (isLeaf(before) && isLeaf(after)) {
        if (before !== after) out.push({ path: prefix, before, after });
        return;
    }

    // Un type change (objet → chaîne, tableau → objet) : la feuille porte le tout.
    if (isLeaf(before) !== isLeaf(after)) {
        out.push({ path: prefix, before, after });
        return;
    }

    if (depth >= MAX_DEPTH) return;

    const beforeList = Array.isArray(before) ? before : null;
    const afterList = Array.isArray(after) ? after : null;

    if (beforeList || afterList) {
        const a = beforeList ?? [];
        const b = afterList ?? [];
        const length = Math.max(a.length, b.length);
        for (let index = 0; index < length && out.length < MAX_CHANGES; index += 1) {
            walk(a[index], b[index], `${prefix}.${index}`, out, depth + 1);
        }
        return;
    }

    const beforeObject = isPlainObject(before) ? before : null;
    const afterObject = isPlainObject(after) ? after : null;
    if (!beforeObject && !afterObject) return;

    const keys = new Set([
        ...Object.keys(beforeObject ?? {}),
        ...Object.keys(afterObject ?? {}),
    ]);

    for (const key of keys) {
        if (key.startsWith('_')) continue;
        if (out.length >= MAX_CHANGES) return;
        const path = prefix ? `${prefix}.${key}` : key;
        walk((beforeObject ?? {})[key], (afterObject ?? {})[key], path, out, depth + 1);
    }
}

/**
 * Liste les champs qui diffèrent entre l'état enregistré (`initial`) et le
 * brouillon (`current`). Les chemins sont triés pour un affichage stable.
 */
export function collectDraftChanges(
    initial: unknown,
    current: unknown,
    options: { maxChanges?: number } = {}
): DraftFieldChange[] {
    const limit = options.maxChanges ?? MAX_CHANGES;
    const out: DraftFieldChange[] = [];
    walk(initial, current, '', out, 0);
    return out.slice(0, limit).sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Annule un champ : la valeur enregistrée revient, ou le champ est **retiré**
 * s'il n'existait pas au départ (aucun champ fantôme laissé dans le brouillon).
 */
export function revertDraftField<T>(current: T, initial: T, path: string): T {
    const parts = segments(path);
    if (parts.length === 0) return current;

    const next = clone(current) as unknown;
    const before = getFieldValue(initial, path);

    if (before === undefined) {
        removePath(next, path);
        return next as T;
    }

    // Écriture par chemin : réutilise le clone comme cible, les objets
    // intermédiaires existants sont conservés.
    let cursor: unknown = next;
    for (const segment of parts.slice(0, -1)) {
        if (Array.isArray(cursor)) {
            const index = Number.parseInt(segment, 10);
            if (!Number.isInteger(index) || index < 0 || index >= cursor.length) return current;
            cursor = cursor[index];
            continue;
        }
        if (!isPlainObject(cursor)) return current;
        if (!isPlainObject(cursor[segment]) && !Array.isArray(cursor[segment])) cursor[segment] = {};
        cursor = cursor[segment];
    }

    const last = parts[parts.length - 1];
    if (Array.isArray(cursor)) {
        const index = Number.parseInt(last, 10);
        if (Number.isInteger(index) && index >= 0 && index < cursor.length) {
            cursor[index] = clone(before);
        }
        return next as T;
    }
    if (isPlainObject(cursor)) {
        cursor[last] = clone(before);
    }
    return next as T;
}

/** Regroupe les changements par nature, pour l'en-tête de l'inspecteur. */
export function summarizeDraftChanges(changes: readonly DraftFieldChange[]): {
    total: number;
    added: number;
    updated: number;
    removed: number;
} {
    let added = 0;
    let updated = 0;
    let removed = 0;

    for (const change of changes) {
        if (change.before === undefined) added += 1;
        else if (change.after === undefined) removed += 1;
        else updated += 1;
    }

    return { total: changes.length, added, updated, removed };
}
