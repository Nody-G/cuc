/**
 * Formatage du hub Journal — présentation pure.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : aucun JSX, aucune horloge
 * implicite. Les fonctions transforment une entrée en texte lisible ; elles sont
 * de ce fait testables sans rendu.
 */

import { toCsv } from '@/lib/csv-export';
import { formatDuration, formatFullDate } from '@/lib/format/date';
import {
    LOG_LEVEL_LABELS,
    LOG_SOURCE_LABELS,
    type ActivityLogEntry,
    type LogLevel,
    type LogSource,
} from '@/lib/logging/types';
import type { CockpitBadgeTone } from '../ui';

/** Correspondance gravité → tonalité du badge du design system. */
export function levelTone(level: LogLevel): CockpitBadgeTone {
    switch (level) {
        case 'critical':
            return 'danger';
        case 'error':
            return 'danger';
        case 'warning':
            return 'warning';
        default:
            return 'neutral';
    }
}

/** Libellé français d'une gravité. */
export function levelLabel(level: LogLevel): string {
    return LOG_LEVEL_LABELS[level] ?? level;
}

/** Libellé français d'un domaine. */
export function sourceLabel(source: LogSource): string {
    return LOG_SOURCE_LABELS[source] ?? source;
}

/**
 * Phrase d'une entrée : la catégorie d'abord, puis le message.
 *
 * La catégorie est conservée visible parce qu'elle est **filtrable** et stable,
 * là où le message est une phrase. Un opérateur qui cherche une famille
 * d'incidents cherche la catégorie, pas la formulation du jour.
 */
export function entryHeadline(entry: ActivityLogEntry): string {
    return entry.category ? `${entry.category} — ${entry.message}` : entry.message;
}

/** Mention de regroupement, quand l'anti-inondation a absorbé des répétitions. */
export function repeatLabel(entry: ActivityLogEntry): string | null {
    if (!entry.repeat_count || entry.repeat_count <= 1) return null;
    return `× ${entry.repeat_count} occurrences regroupées`;
}

/** Durée d'opération, ou `null` si non mesurée. */
export function durationLabel(entry: ActivityLogEntry): string | null {
    if (entry.duration_ms === null || entry.duration_ms === undefined) return null;
    return formatDuration(entry.duration_ms);
}

/** Auteur lisible — « Système » quand aucun compte n'est identifié. */
export function authorLabel(entry: ActivityLogEntry): string {
    return entry.actor_name?.trim() || 'Système';
}

/** Date complète d'une entrée. */
export function entryDate(entry: ActivityLogEntry): string {
    return formatFullDate(entry.occurred_at);
}

/** Export CSV ; `null` si aucune entrée (l'appelant décide alors du message). */
export function buildLogsCsv(entries: ActivityLogEntry[]): string | null {
    if (entries.length === 0) return null;

    const header = [
        'Date',
        'Gravité',
        'Domaine',
        'Catégorie',
        'Message',
        'Cible',
        'Auteur',
        'Durée',
        'Occurrences',
        'Origine',
    ];

    const rows = entries.map((entry) => [
        entryDate(entry),
        levelLabel(entry.level),
        sourceLabel(entry.source),
        entry.category,
        entry.message,
        entry.target ?? '',
        authorLabel(entry),
        durationLabel(entry) ?? '',
        String(entry.repeat_count ?? 1),
        entry.origin ?? '',
    ]);

    return toCsv([header, ...rows]);
}

/**
 * Export JSON — utile pour joindre un incident à un dossier.
 *
 * Le contexte est inclus **tel qu'il est stocké**, donc déjà expurgé à
 * l'écriture (`src/lib/logging/redact.ts`) : l'export ne peut pas ressusciter un
 * secret qui n'a jamais été enregistré.
 */
export function buildLogsJson(entries: ActivityLogEntry[]): string {
    return JSON.stringify(entries, null, 2);
}
