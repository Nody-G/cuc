/**
 * Traduction des lignes de `site_activity_logs` vers le domaine.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : fonctions **pures**, testables
 * sans base. Extraites de la Server Action, qui dépassait le plafond dur de
 * 300 lignes (`AGENTS.md` § 2) — et de toute façon, valider une ligne brute n'est
 * pas une responsabilité de transport.
 */

import { LOG_LEVELS, LOG_SOURCES, type ActivityLogEntry, type LogLevel, type LogSource } from './types';

/** Colonnes lues explicitement — jamais `*`, pour maîtriser le volume renvoyé. */
export const LOG_SELECTED_COLUMNS =
    'id, occurred_at, level, source, category, message, target, context, request_id, duration_ms, origin, actor_id, actor_name, repeat_count';

export function isLogLevel(value: unknown): value is LogLevel {
    return typeof value === 'string' && (LOG_LEVELS as readonly string[]).includes(value);
}

export function isLogSource(value: unknown): value is LogSource {
    return typeof value === 'string' && (LOG_SOURCES as readonly string[]).includes(value);
}

function optionalText(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}

/**
 * Normalise une ligne brute.
 *
 * Une valeur hors référentiel est ramenée à `info` / `cockpit` plutôt que
 * rejetée : une ligne mal formée — écrite par une version antérieure du code ou
 * modifiée à la main dans le tableau de bord Supabase — doit rester **visible**,
 * même imparfaitement classée. La masquer serait la pire des réponses pour un
 * journal dont le rôle est justement de ne rien perdre.
 */
export function toActivityLogEntry(row: Record<string, unknown>): ActivityLogEntry {
    return {
        id: String(row.id ?? ''),
        occurred_at: String(row.occurred_at ?? ''),
        level: isLogLevel(row.level) ? row.level : 'info',
        source: isLogSource(row.source) ? row.source : 'cockpit',
        category: String(row.category ?? ''),
        message: String(row.message ?? ''),
        target: optionalText(row.target),
        context:
            row.context && typeof row.context === 'object' && !Array.isArray(row.context)
                ? (row.context as Record<string, unknown>)
                : null,
        request_id: optionalText(row.request_id),
        duration_ms: typeof row.duration_ms === 'number' ? row.duration_ms : null,
        origin: optionalText(row.origin),
        actor_id: optionalText(row.actor_id),
        actor_name: optionalText(row.actor_name),
        repeat_count: typeof row.repeat_count === 'number' ? row.repeat_count : 1,
    };
}

/** Traduit une liste de lignes, en ignorant les entrées non conformes. */
export function toActivityLogEntries(rows: readonly unknown[] | null | undefined): ActivityLogEntry[] {
    if (!Array.isArray(rows)) return [];
    return rows
        .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
        .map(toActivityLogEntry);
}
