/**
 * ==============================================================================
 * CUC — Historique du brouillon (undo / redo)
 * ==============================================================================
 * Le Mode Studio édite un brouillon **local** : il doit donc savoir revenir en
 * arrière sans dépendre du réseau. Ce module en porte la mécanique pure :
 *
 *  - `pushHistory` empile l'état AVANT modification et **vide la pile de redo**
 *    (une nouvelle édition invalide le futur, comme partout ailleurs) ;
 *  - `undoHistory` / `redoHistory` renvoient l'état à rétablir, ou `null` si la
 *    pile est vide — l'appelant décide alors de ne rien faire ;
 *  - la profondeur est bornée (`limit`) : la mémoire de l'onglet ne croît pas
 *    indéfiniment sur une longue session d'édition ;
 *  - aucune mutation d'entrée : les piles sont manipulées par l'appelant.
 */

export interface DraftHistory<T> {
    past: T[];
    future: T[];
}

/** Profondeur maximale de l'historique (au-delà, les plus anciens sont oubliés). */
export const DRAFT_HISTORY_LIMIT = 50;

export function createDraftHistory<T>(): DraftHistory<T> {
    return { past: [], future: [] };
}

/** Empile l'état précédent et invalide le futur (nouvelle branche d'édition). */
export function pushHistory<T>(
    history: DraftHistory<T>,
    snapshot: T,
    limit: number = DRAFT_HISTORY_LIMIT
): void {
    history.past.push(snapshot);
    if (history.past.length > limit) history.past.shift();
    history.future = [];
}

/**
 * Dépile un état passé. `current` est conservé pour permettre le redo.
 * Retourne `null` si l'historique est vide.
 */
export function undoHistory<T>(history: DraftHistory<T>, current: T): T | null {
    const previous = history.past.pop();
    if (previous === undefined) return null;
    history.future.push(current);
    return previous;
}

/** Rétablit un état annulé. Retourne `null` si rien à rétablir. */
export function redoHistory<T>(history: DraftHistory<T>, current: T): T | null {
    const next = history.future.pop();
    if (next === undefined) return null;
    history.past.push(current);
    return next;
}

/** Vide les deux piles (changement de page, de langue, enregistrement…). */
export function resetHistory<T>(history: DraftHistory<T>): void {
    history.past = [];
    history.future = [];
}

export function canUndoHistory<T>(history: DraftHistory<T>): boolean {
    return history.past.length > 0;
}

export function canRedoHistory<T>(history: DraftHistory<T>): boolean {
    return history.future.length > 0;
}
