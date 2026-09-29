'use server';

/**
 * Journal d'activité — rétention et purge.
 *
 * Règle SRP : `AGENTS.md` § 1-2. Le §3 de `durability_health.md` impose que toute
 * table de croissance soit mesurée **et** plafonnée ; la politique de durée vit
 * dans `src/lib/logging/retention.ts` (source unique, partagée avec le script
 * `npm run audit:logs`).
 *
 * Le journal est en **ajout seul** côté utilisateur : la table n'a aucune policy
 * `DELETE`. Seule cette action, gardée par la Direction et exécutée avec la clé de
 * service, peut purger — un journal effaçable depuis le Cockpit ne serait plus une
 * trace. `dryRun` est le mode par défaut : on mesure avant d'effacer.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_RETENTION, buildPurgeThresholds, type RetentionPolicy } from '@/lib/logging/retention';
import { LOG_LEVELS, type LogLevel } from '@/lib/logging/types';
import { requireManager } from './user-guards';

const TABLE = 'site_activity_logs';

export interface ActivityLogRetention {
    policy: RetentionPolicy;
    oldestAt: string | null;
    byLevel: Array<{ level: LogLevel; total: number; purgeable: number }>;
}

/** Résultat d'une purge : le détail par niveau fait office de compte rendu. */
export interface PurgeResult {
    applied: boolean;
    deleted: Array<{ level: LogLevel; count: number }>;
    refused: boolean;
    error: string | null;
}

/** État de rétention : ce qui est conservé, et ce qui est déjà purgeable. */
export async function getActivityLogRetention(): Promise<ActivityLogRetention | null> {
    const guard = await requireManager();
    if (!guard.ok) return null;

    try {
        const admin = createAdminClient();
        const thresholds = buildPurgeThresholds(Date.now());

        const [totals, purgeable, oldest] = await Promise.all([
            Promise.all(
                LOG_LEVELS.map((level) =>
                    admin.from(TABLE).select('id', { count: 'exact', head: true }).eq('level', level),
                ),
            ),
            Promise.all(
                thresholds.map(({ level, before }) =>
                    admin
                        .from(TABLE)
                        .select('id', { count: 'exact', head: true })
                        .eq('level', level)
                        .lt('occurred_at', before),
                ),
            ),
            admin
                .from(TABLE)
                .select('occurred_at')
                .order('occurred_at', { ascending: true })
                .limit(1)
                .maybeSingle(),
        ]);

        return {
            policy: DEFAULT_RETENTION,
            oldestAt: oldest.data?.occurred_at ?? null,
            byLevel: LOG_LEVELS.map((level, index) => ({
                level,
                total: totals[index]?.count ?? 0,
                purgeable: purgeable[index]?.count ?? 0,
            })),
        };
    } catch (error) {
        console.warn(
            `[activity-log] Rétention illisible : ${error instanceof Error ? error.message : error}`,
        );
        return null;
    }
}

/**
 * Applique la rétention. `dryRun` par défaut : on mesure avant d'effacer.
 *
 * La suppression renvoie les lignes effacées (`select('id')`), ce qui donne le
 * compte réel — jamais une estimation.
 */
export async function purgeActivityLogs(dryRun = true): Promise<PurgeResult> {
    const guard = await requireManager();
    if (!guard.ok) {
        return { applied: false, deleted: [], refused: true, error: guard.error };
    }

    try {
        const admin = createAdminClient();
        const thresholds = buildPurgeThresholds(Date.now());
        const deleted: Array<{ level: LogLevel; count: number }> = [];

        for (const { level, before } of thresholds) {
            if (dryRun) {
                const { count, error } = await admin
                    .from(TABLE)
                    .select('id', { count: 'exact', head: true })
                    .eq('level', level)
                    .lt('occurred_at', before);
                if (error) return { applied: false, deleted, refused: false, error: error.message };
                deleted.push({ level, count: count ?? 0 });
                continue;
            }

            const { data, error } = await admin
                .from(TABLE)
                .delete()
                .eq('level', level)
                .lt('occurred_at', before)
                .select('id');
            if (error) return { applied: false, deleted, refused: false, error: error.message };
            deleted.push({ level, count: data?.length ?? 0 });
        }

        return { applied: !dryRun, deleted, refused: false, error: null };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur inconnue';
        console.warn(`[activity-log] Purge impossible : ${message}`);
        return { applied: false, deleted: [], refused: false, error: message };
    }
}
