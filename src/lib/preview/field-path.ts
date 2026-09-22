/**
 * ==============================================================================
 * CUC — Chemin de champ du Mode Studio
 * ==============================================================================
 * Les éditeurs et l'aperçu manipulent des chemins canoniques
 * (`sections_data.about.title`, `hero.subtitle`, `sections_data.faq.items.2.question`).
 * Ce module est le seul à savoir les écrire dans un brouillon :
 *
 *  - **copie immuable** le long du chemin — React détecte donc le changement et
 *    l'aperçu se met à jour sans rechargement ;
 *  - frères préservés : seuls les nœuds traversés sont recréés ;
 *  - un tableau n'est copié que si un index est réellement visé ;
 *  - chemin vide → brouillon inchangé (aucune invention de structure).
 */

const NUMERIC_SEGMENT = /^\d+$/;

function setAt(node: unknown, segments: readonly string[], value: string): unknown {
    const [head, ...rest] = segments;

    if (Array.isArray(node)) {
        const next = [...node];
        if (NUMERIC_SEGMENT.test(head)) {
            const index = Number(head);
            next[index] = rest.length === 0 ? value : setAt(next[index], rest, value);
        }
        return next;
    }

    const base: Record<string, unknown> =
        node && typeof node === 'object' ? { ...(node as Record<string, unknown>) } : {};

    if (rest.length === 0) {
        base[head] = value;
        return base;
    }

    base[head] = setAt(base[head], rest, value);
    return base;
}

/**
 * Écrit `value` au chemin `path` dans `root`, sans jamais muter l'entrée.
 * Retourne `root` inchangé si le chemin est vide.
 */
export function setFieldValue<T>(root: T, path: string, value: string): T {
    const segments = path
        .split('.')
        .map((segment) => segment.trim())
        .filter((segment) => segment.length > 0);
    if (segments.length === 0) return root;
    return setAt(root, segments, value) as T;
}
