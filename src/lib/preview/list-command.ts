/**
 * ==============================================================================
 * CUC — Commandes de liste du Mode Studio
 * ==============================================================================
 * Ajouter, supprimer, réordonner ou dupliquer un item d'une liste éditoriale,
 * **sans jamais inventer de structure** :
 *
 *  - `add` / `duplicate` clonent un item existant (donc tous ses champs requis)
 *    et lui donnent un `id` unique — jamais un objet vide qui casserait le
 *    rendu ou les ancres ;
 *  - `add` sur une liste **vide** ne fait rien : la forme d'un item inconnu ne
 *    s'invente pas (doctrine « aucune structure inventée ») ;
 *  - `remove` refuse de vider complètement une liste rendue par la vitrine ;
 *  - `move-up` / `move-down` échangent deux items, bornés aux extrémités ;
 *  - l'entrée n'est jamais mutée (copie immuable le long du chemin).
 */

/** Commandes acceptées par le moteur (miroir du protocole). */
export type ListCommand = 'add' | 'remove' | 'move-up' | 'move-down' | 'duplicate';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function segments(path: string): string[] {
    return path
        .split('.')
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);
}

/** Lit la valeur au chemin (ou `undefined`). */
function readAt(node: unknown, path: readonly string[]): unknown {
    let current: unknown = node;
    for (const segment of path) {
        if (!isRecord(current) && !Array.isArray(current)) return undefined;
        current = (current as Record<string, unknown>)[segment];
    }
    return current;
}

/** Écrit une valeur au chemin, en copiant chaque niveau (immuable). */
function writeAt(node: unknown, path: readonly string[], value: unknown): unknown {
    const [head, ...rest] = path;
    if (!head) return value;

    if (Array.isArray(node)) {
        const next = [...node];
        if (/^\d+$/.test(head)) {
            const index = Number(head);
            next[index] = rest.length === 0 ? value : writeAt(next[index], rest, value);
        }
        return next;
    }

    const base: Record<string, unknown> = isRecord(node) ? { ...node } : {};
    base[head] = rest.length === 0 ? value : writeAt(base[head], rest, value);
    return base;
}

/** Identifiant unique dérivé des identifiants présents dans la liste. */
function uniqueId(items: readonly unknown[], baseId: string): string {
    const taken = new Set(
        items
            .map((item) => (isRecord(item) ? item.id : undefined))
            .filter((id): id is string => typeof id === 'string')
    );
    if (!taken.has(baseId)) return baseId;
    let suffix = 2;
    while (taken.has(`${baseId}-${suffix}`)) suffix += 1;
    return `${baseId}-${suffix}`;
}

/**
 * Applique une commande de liste à `root` (chemin de **tableau**, ex.
 * `sections_data.formules.items`). Retourne `root` inchangé si la commande est
 * impossible — jamais d'objet partiel, jamais de mutation.
 */
export function applyListCommand<T>(
    root: T,
    arrayPath: string,
    command: ListCommand,
    index: number
): T {
    const path = segments(arrayPath);
    if (path.length === 0) return root;

    const current = readAt(root, path);
    if (!Array.isArray(current)) return root;

    const items = [...current];
    const bounded = Number.isInteger(index) ? index : -1;

    switch (command) {
        case 'add':
        case 'duplicate': {
            const sourceIndex = bounded >= 0 && bounded < items.length ? bounded : items.length - 1;
            const source = items[sourceIndex];
            if (source === undefined) return root; // liste vide : forme inconnue
            const sourceId = isRecord(source) && typeof source.id === 'string' ? source.id : 'item';
            const copy: unknown = isRecord(source)
                ? { ...source, id: uniqueId(items, `${sourceId}-copie`) }
                : source;
            const insertAt = command === 'duplicate' ? sourceIndex + 1 : items.length;
            items.splice(insertAt, 0, copy);
            return writeAt(root, path, items) as T;
        }
        case 'remove': {
            if (bounded < 0 || bounded >= items.length) return root;
            if (items.length <= 1) return root; // on ne vide jamais une liste rendue
            items.splice(bounded, 1);
            return writeAt(root, path, items) as T;
        }
        case 'move-up':
        case 'move-down': {
            const target = command === 'move-up' ? bounded - 1 : bounded + 1;
            if (bounded < 0 || bounded >= items.length) return root;
            if (target < 0 || target >= items.length) return root;
            [items[bounded], items[target]] = [items[target], items[bounded]];
            return writeAt(root, path, items) as T;
        }
        default:
            return root;
    }
}
