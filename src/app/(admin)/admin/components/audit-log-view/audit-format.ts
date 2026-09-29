import type { AuditLogEntry } from '@/lib/data/site-service';
import { toCsv } from '@/lib/csv-export';
import { dayKey, formatDayLabel, formatFullDate } from '@/lib/format/date';

/**
 * Plages et formateurs de date : la définition n'est plus ici.
 *
 * Le hub Journal partage désormais ces utilitaires, or « une seule source par
 * sujet » (`durability_health.md` § 4) interdit deux jeux de seuils. Ils vivent
 * dans `src/lib/time-range.ts` et `src/lib/format/date.ts` ; ce module les
 * ré-exporte pour ne rompre aucun import existant de la vue d'audit.
 */
export type { RangeFilter } from '@/lib/time-range';
export { RANGE_LABELS, RANGE_MS, RANGE_OPTIONS } from '@/lib/time-range';
export { dayKey, formatDayLabel, formatFullDate, formatTime } from '@/lib/format/date';

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
