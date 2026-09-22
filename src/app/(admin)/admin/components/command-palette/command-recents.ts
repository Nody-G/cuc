/**
 * Historique des commandes récentes de la palette (repli `localStorage`).
 * Module pur côté DOM (`AGENTS.md` § 1) — aucune donnée critique.
 */

export const RECENT_STORAGE_KEY = 'cuc.cockpit.commandPalette.recent';
export const MAX_RECENTS = 5;

export function readRecents(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
    } catch {
        return [];
    }
}

export function writeRecents(ids: string[]): void {
    try {
        window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(ids));
    } catch {
        /* stockage indisponible : on ignore */
    }
}
