export const GROUPS_STORAGE_KEY = 'cuc.cockpit.sidebar.collapsed';
export const PINS_STORAGE_KEY = 'cuc.cockpit.sidebar.pins';
export const RAIL_STORAGE_KEY = 'cuc.cockpit.sidebar.rail';
/** Événement global émis par les raccourcis clavier (Ctrl/Cmd+B). */
export const TOGGLE_SIDEBAR_EVENT = 'cuc:cockpit:toggle-sidebar';

export function readStringArray(key: string): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
    } catch {
        return [];
    }
}

/** Repli du rail : préférence persistée (faux hors navigateur). */
export function readRailCollapsed(): boolean {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(RAIL_STORAGE_KEY) === '1';
}
