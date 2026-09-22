/**
 * Helpers temporels du moteur analytique du Cockpit.
 * Fonctions pures, sans dépendance au cycle de vie UI.
 */

export const DAY_MS = 86_400_000;

export function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function formatDayLabel(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
}

export function safeDate(value: string | undefined | null): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}
