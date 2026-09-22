'use server';

/**
 * Santé système — extrait de `actions.ts` (façade conservée).
 * Règle SRP : `AGENTS.md` § 1-2. Server Actions : docs Next.js (`use server`).
 */

import { createAdminClient } from '@/lib/supabase/admin';

export type HealthState = 'ok' | 'degraded' | 'down';

export interface HealthMetric {
  /** Identifiant technique de la sonde. */
  id: string;
  /** Libellé affiché dans le Cockpit. */
  label: string;
  /** État calculé à partir de la mesure réelle. */
  state: HealthState;
  /** Valeur mesurée, déjà formatée pour l'affichage. */
  value: string;
  /** Détail factuel (pas de superlatif). */
  detail: string;
}

export interface SystemHealthReport {
  /** Horodatage ISO de la mesure. */
  measuredAt: string;
  /** Latence de la sonde Supabase en millisecondes (null si injoignable). */
  latencyMs: number | null;
  /** État global agrégé. */
  overall: HealthState;
  /** Nombre de tables du site vitrine effectivement interrogeables. */
  tablesReachable: number;
  /** Nombre total de tables sondées. */
  tablesTotal: number;
  /** Métriques détaillées. */
  metrics: HealthMetric[];
}

/**
 * Sonde la santé réelle du système : latence Supabase, accessibilité des tables
 * du site vitrine, volumétrie et dernière écriture.
 *
 * Aucune valeur n'est codée en dur : tout provient d'une mesure au moment de
 * l'appel. En cas d'échec, l'état passe à `degraded` ou `down` avec le message
 * d'erreur réel.
 */
export async function getSystemHealth(): Promise<SystemHealthReport> {
  const measuredAt = new Date().toISOString();
  const metrics: HealthMetric[] = [];

  // Tables du site vitrine à sonder (comptage réel).
  const TABLES = [
    'site_films',
    'site_team',
    'site_partners',
    'site_sessions',
    'site_inquiries',
    'site_disciplines',
    'site_events',
    'site_campus_pois',
  ] as const;

  let latencyMs: number | null = null;
  let tablesReachable = 0;
  let lastWriteAt: string | null = null;
  let lastWriteTable: string | null = null;
  let probeError: string | null = null;

  try {
    const adminClient = createAdminClient();

    // 1. Mesure de latence : requête minimale chronométrée.
    const t0 = Date.now();
    const { error: pingError } = await adminClient
      .from('site_settings')
      .select('key')
      .limit(1);
    latencyMs = Date.now() - t0;

    if (pingError) {
      probeError = pingError.message;
    } else {
      // 2. Accessibilité + volumétrie de chaque table.
      for (const table of TABLES) {
        try {
          const { count, error } = await adminClient
            .from(table)
            .select('*', { count: 'exact', head: true });
          if (!error) {
            tablesReachable += 1;
            metrics.push({
              id: `table:${table}`,
              label: table,
              state: 'ok',
              value: `${count ?? 0} ligne${(count ?? 0) > 1 ? 's' : ''}`,
              detail: 'Table interrogeable.',
            });
          } else {
            metrics.push({
              id: `table:${table}`,
              label: table,
              state: 'degraded',
              value: 'Indisponible',
              detail: error.message,
            });
          }
        } catch (err: unknown) {
          metrics.push({
            id: `table:${table}`,
            label: table,
            state: 'degraded',
            value: 'Indisponible',
            detail: err instanceof Error ? err.message : 'Erreur inconnue',
          });
        }
      }

      // 3. Dernière écriture réelle (audit log).
      try {
        const { data: lastLog } = await adminClient
          .from('site_audit_logs')
          .select('action, target, created_at')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lastLog?.created_at) {
          lastWriteAt = lastLog.created_at;
          lastWriteTable = lastLog.target || lastLog.action || null;
        }
      } catch {
        // Table d'audit absente : non bloquant.
      }
    }
  } catch (err: unknown) {
    probeError = err instanceof Error ? err.message : 'Erreur inconnue';
  }

  // --- Métrique : latence Supabase ---
  let latencyState: HealthState = 'ok';
  if (latencyMs === null) {
    latencyState = 'down';
  } else if (latencyMs > 1500) {
    latencyState = 'down';
  } else if (latencyMs > 600) {
    latencyState = 'degraded';
  }
  metrics.unshift({
    id: 'supabase:latency',
    label: 'Latence Supabase',
    state: latencyState,
    value: latencyMs === null ? 'Injoignable' : `${latencyMs} ms`,
    detail:
      latencyMs === null
        ? probeError || 'Aucune réponse du serveur Supabase.'
        : latencyMs > 600
          ? 'Latence supérieure au seuil de confort (600 ms).'
          : 'Réponse dans le seuil nominal.',
  });

  // --- Métrique : couverture des tables ---
  const coverageState: HealthState =
    tablesReachable === TABLES.length
      ? 'ok'
      : tablesReachable === 0
        ? 'down'
        : 'degraded';
  metrics.unshift({
    id: 'supabase:tables',
    label: 'Tables vitrine',
    state: coverageState,
    value: `${tablesReachable} / ${TABLES.length}`,
    detail:
      coverageState === 'ok'
        ? 'Toutes les tables du site vitrine répondent.'
        : `${TABLES.length - tablesReachable} table(s) injoignable(s).`,
  });

  // --- Métrique : dernière écriture ---
  const writeState: HealthState = lastWriteAt ? 'ok' : 'degraded';
  metrics.unshift({
    id: 'supabase:last-write',
    label: 'Dernière écriture',
    state: writeState,
    value: lastWriteAt
      ? new Date(lastWriteAt).toLocaleString('fr-FR')
      : 'Aucune trace',
    detail: lastWriteTable
      ? `Dernière cible : ${lastWriteTable}.`
      : 'Journal d\u2019audit vide ou absent.',
  });

  // --- État global agrégé ---
  const overall: HealthState = metrics.some((m) => m.state === 'down')
    ? 'down'
    : metrics.some((m) => m.state === 'degraded')
      ? 'degraded'
      : 'ok';

  return {
    measuredAt,
    latencyMs,
    overall,
    tablesReachable,
    tablesTotal: TABLES.length,
    metrics,
  };
}
