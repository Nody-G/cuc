import type { AuditLogEntry } from '@/lib/data/site-service';
import { toCsv } from '@/lib/csv-export';

export type RangeFilter = 'all' | '24h' | '7d' | '30d';

export const RANGE_LABELS: Record<RangeFilter, string> = {
    all: 'Tout l’historique',
    '24h': 'Dernières 24 h',
    '7d': '7 derniers jours',
    '30d': '30 derniers jours',
};

export const RANGE_MS: Record<Exclude<RangeFilter, 'all'>, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
};

export function formatFullDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

export function formatDayLabel(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Date inconnue';
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (sameDay(d, today)) return 'Aujourd’hui';
    if (sameDay(d, yesterday)) return 'Hier';
    return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function dayKey(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'unknown';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export interface AuditDayGroup {
    key: string;
    label: string;
    entries: AuditLogEntry[];
}

/** Regroupe les entrées visibles par jour (ordre d'arrivée conservé). */
export function groupLogsByDay(logs: AuditLogEntry[]): AuditDayGroup[] {
    const groups: AuditDayGroup[] = [];
    const index = new Map<string, number>();

    logs.forEach((log) => {
        const key = dayKey(log.created_at);
        let pos = index.get(key);
        if (pos === undefined) {
            pos = groups.length;
            index.set(key, pos);
            groups.push({ key, label: formatDayLabel(log.created_at), entries: [] });
        }
        groups[pos].entries.push(log);
    });

    return groups;
}

/** Construit le CSV d'export ; `null` si aucune entrée. */
export function buildAuditCsv(logs: AuditLogEntry[]): string | null {
    if (logs.length === 0) return null;

    const header = ['Date', 'Auteur', 'Action', 'Entité', 'Détails'];
    const rows = logs.map((l) => [
        formatFullDate(l.created_at),
        l.user_name || '',
        l.action || '',
        l.entity || '',
        l.details || '',
    ]);

    return toCsv([header, ...rows]);
}

export { downloadCsv } from '@/lib/csv-export';
