/**
 * Rétention du journal d'activité — politique unique.
 *
 * Couche « Domaine & Services » (`AGENTS.md` § 1) : fonction pure, sans accès
 * base ni horloge implicite. Le §3 de `durability_health.md` impose que toute
 * table de croissance soit **mesurée et plafonnée** : cette politique est la
 * seule source des durées, partagée par l'action de purge du Cockpit
 * (`src/app/(admin)/admin/actions/logs.ts`) et par le script de rétention
 * (`scripts/audit_activity_logs.mjs`).
 */

import { LOG_LEVELS, LOG_LEVEL_RANK, type LogLevel } from './types';

/** Durées de conservation, en jours. */
export interface RetentionPolicy {
    /** Événements ordinaires (`info`). */
    infoDays: number;
    /** Avertissements et erreurs (`warning`, `error`). */
    signalDays: number;
    /** Incidents critiques — conservés le plus longtemps. */
    criticalDays: number;
    /** Volume maximal de lignes toléré : au-delà, la purge est obligatoire. */
    maxRows: number;
}

/**
 * Politique par défaut (décision du 2026-09-29).
 *
 * 90 jours suffisent à couvrir un trimestre d'exploitation ; les signaux utiles
 * (`warning`, `error`) survivent six mois, et un incident critique une année —
 * le temps de relire un post-mortem sans avoir à fouiller les journaux Vercel,
 * qui ne sont, eux, pas consultables depuis le Cockpit.
 */
export const DEFAULT_RETENTION: RetentionPolicy = {
    infoDays: 90,
    signalDays: 180,
    criticalDays: 365,
    maxRows: 20000,
};

/** Niveau de gravité à partir duquel une entrée bascule en rétention longue. */
export const SIGNAL_LEVEL: LogLevel = 'warning';

/** Le niveau impose-t-il la rétention longue (`signalDays` / `criticalDays`) ? */
export function isLongLivedLevel(level: LogLevel): boolean {
    return LOG_LEVEL_RANK[level] >= LOG_LEVEL_RANK[SIGNAL_LEVEL];
}

/** Durée applicable à un niveau, selon la politique fournie. */
export function retentionDaysFor(level: LogLevel, policy: RetentionPolicy = DEFAULT_RETENTION): number {
    if (level === 'critical') return policy.criticalDays;
    return isLongLivedLevel(level) ? policy.signalDays : policy.infoDays;
}

/**
 * Date ISO à partir de laquelle les entrées d'un niveau deviennent purgables.
 * `nowMs` est injecté : la fonction reste pure et testable.
 */
export function purgeThresholdIso(
    level: LogLevel,
    nowMs: number,
    policy: RetentionPolicy = DEFAULT_RETENTION,
): string {
    const days = retentionDaysFor(level, policy);
    return new Date(nowMs - days * 24 * 60 * 60 * 1000).toISOString();
}

/** Seuils de purge par niveau — consommé directement par la purge en base. */
export function buildPurgeThresholds(
    nowMs: number,
    policy: RetentionPolicy = DEFAULT_RETENTION,
): Array<{ level: LogLevel; before: string }> {
    return LOG_LEVELS.map((level) => ({
        level,
        before: purgeThresholdIso(level, nowMs, policy),
    }));
}
