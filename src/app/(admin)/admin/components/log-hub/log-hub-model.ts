/**
 * Modèle du hub Journal — fonctions **pures**.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : aucune dépendance React,
 * aucune horloge implicite (`nowMs` est injecté), donc entièrement testable.
 * Le hook et les composants ne doivent contenir aucun calcul : tout ce qui
 * décide (regroupement, comptage, traduction des filtres) est ici.
 */

import { sanitizeSearchTerm, clampLogLimit, clampLogOffset } from '@/lib/logging/query';
import { LOG_LEVEL_RANK, type ActivityLogEntry, type LogLevel, type LogQuery, type LogSource } from '@/lib/logging/types';
import { dayKey, formatDayLabel } from '@/lib/format/date';
import { rangeSinceIso } from '@/lib/time-range';
import type { LogDayGroup, LogHubFilterState, LogHubSummary } from './log-hub.types';

/**
 * Regroupe par jour, dans l'ordre d'arrivée (le plus récent d'abord).
 *
 * L'ordre des entrées n'est **pas** recalculé : il vient de la requête, triée sur
 * `occurred_at` décroissant. Retrier ici donnerait deux vérités possibles pour la
 * même liste.
 */
export function groupLogsByDay(entries: ActivityLogEntry[], nowMs: number): LogDayGroup[] {
    const groups: LogDayGroup[] = [];
    const index = new Map<string, number>();

    for (const entry of entries) {
        const key = dayKey(entry.occurred_at);
        let position = index.get(key);
        if (position === undefined) {
            position = groups.length;
            index.set(key, position);
            groups.push({ key, label: formatDayLabel(entry.occurred_at, nowMs), entries: [] });
        }
        groups[position].entries.push(entry);
    }

    return groups;
}

/** Compte par gravité et par domaine sur la fenêtre chargée. */
export function summarizeLogs(entries: ActivityLogEntry[]): LogHubSummary {
    const byLevel: Record<LogLevel, number> = { info: 0, warning: 0, error: 0, critical: 0 };
    const sourceCounts = new Map<LogSource, number>();

    for (const entry of entries) {
        byLevel[entry.level] += 1;
        sourceCounts.set(entry.source, (sourceCounts.get(entry.source) ?? 0) + 1);
    }

    const bySource = Array.from(sourceCounts.entries())
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);

    return { total: entries.length, byLevel, bySource };
}

/** Le pire niveau présent — pilote la couleur du bandeau de synthèse. */
export function worstLevel(entries: ActivityLogEntry[]): LogLevel | null {
    let worst: LogLevel | null = null;
    for (const entry of entries) {
        if (!worst || LOG_LEVEL_RANK[entry.level] > LOG_LEVEL_RANK[worst]) worst = entry.level;
    }
    return worst;
}

/** Ajoute ou retire un niveau (filtre à bascule). */
export function toggleLevel(levels: LogLevel[], level: LogLevel): LogLevel[] {
    return levels.includes(level) ? levels.filter((item) => item !== level) : [...levels, level];
}

/** Ajoute ou retire un domaine (filtre à bascule). */
export function toggleSource(sources: LogSource[], source: LogSource): LogSource[] {
    return sources.includes(source) ? sources.filter((item) => item !== source) : [...sources, source];
}

/**
 * Traduit l'état des filtres en critères de lecture.
 *
 * C'est ce qui garantit qu'un écran filtré interroge la base avec **les mêmes
 * critères** que ceux affichés : un filtrage fait à moitié côté client et à
 * moitié côté serveur finit toujours par diverger (compteurs faux, pagination
 * incohérente).
 */
export function filtersToQuery(
    filters: LogHubFilterState,
    nowMs: number,
    limit?: number,
    offset?: number,
): LogQuery {
    const since = rangeSinceIso(filters.range, nowMs);
    const search = sanitizeSearchTerm(filters.search);

    return {
        ...(filters.levels.length > 0 ? { levels: filters.levels } : {}),
        ...(filters.sources.length > 0 ? { sources: filters.sources } : {}),
        ...(since ? { since } : {}),
        ...(search ? { search } : {}),
        limit: clampLogLimit(limit),
        offset: clampLogOffset(offset),
    };
}

/** Les filtres sont-ils tous au repos ? */
export function isFilterStateEmpty(filters: LogHubFilterState): boolean {
    return (
        filters.levels.length === 0 &&
        filters.sources.length === 0 &&
        filters.range === 'all' &&
        filters.search.trim().length === 0
    );
}
