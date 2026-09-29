#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Journal d'activité : mesure, budget et rétention
 * ==============================================================================
 * Le §3 de `durability_health.md` impose que toute table de croissance soit
 * **mesurée et plafonnée** — « ce qui n'est pas mesuré dérive ». Ce script est la
 * mesure du journal technique `site_activity_logs` créé par
 * `scripts/migration_apply_activity_logs.sql`.
 *
 * Deux usages :
 *   npm run audit:logs            # mesure seule, échoue si le plafond est dépassé
 *   npm run cms:purge:logs        # mesure puis applique la rétention
 *
 * La politique de rétention n'est **pas** redéfinie ici : elle est importée de
 * `src/lib/logging/retention.ts`, seule source des durées (règle « une seule
 * source par sujet », `durability_health.md` § 4). Modifier la politique dans le
 * code suffit donc à changer le comportement de la purge.
 *
 * Garde-fous :
 *  - refus d'effacer la totalité du journal sans `--force` : une purge qui vide
 *    toute la table est presque toujours une erreur de configuration ;
 *  - `--keep-days=N` force une durée unique, pour un besoin ponctuel ;
 *  - code de sortie 3 si le volume dépasse le plafond déclaré.
 * ==============================================================================
 */

import * as dotenv from 'dotenv';
import pg from 'pg';
import { DEFAULT_RETENTION, buildPurgeThresholds } from '../src/lib/logging/retention.ts';

dotenv.config({ path: '.env.local' });

const WRITE = process.argv.includes('--write');
const FORCE = process.argv.includes('--force');
const keepDaysArg = process.argv.find((arg) => arg.startsWith('--keep-days='));
const TABLE = 'site_activity_logs';

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!databaseUrl || /\[YOUR-PASSWORD\]|\[MOT_DE_PASSE\]/.test(databaseUrl)) {
    console.error('DATABASE_URL manquant ou placeholder dans .env.local — mesure impossible.');
    process.exit(1);
}

/** Politique appliquée : celle du code, ou une durée unique imposée en ligne. */
function resolveThresholds(nowMs) {
    if (!keepDaysArg) return buildPurgeThresholds(nowMs, DEFAULT_RETENTION);

    const days = Number.parseInt(keepDaysArg.split('=')[1] ?? '', 10);
    if (!Number.isFinite(days) || days <= 0) {
        console.error('--keep-days attend un nombre de jours positif.');
        process.exit(1);
    }
    const before = new Date(nowMs - days * 24 * 60 * 60 * 1000).toISOString();
    return ['info', 'warning', 'error', 'critical'].map((level) => ({ level, before }));
}

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

async function tableExists() {
    const { rows } = await client.query(
        `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
        [TABLE],
    );
    return rows.length > 0;
}

async function measure() {
    const { rows: totals } = await client.query(
        `SELECT
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE occurred_at >= now() - interval '24 hours')::int AS last24h,
            MIN(occurred_at) AS oldest,
            MAX(occurred_at) AS newest
         FROM public.${TABLE}`,
    );
    const { rows: byLevel } = await client.query(
        `SELECT level, COUNT(*)::int AS n FROM public.${TABLE} GROUP BY level ORDER BY n DESC`,
    );
    const { rows: bySource } = await client.query(
        `SELECT source, COUNT(*)::int AS n FROM public.${TABLE} GROUP BY source ORDER BY n DESC`,
    );
    const { rows: size } = await client.query(
        `SELECT pg_size_pretty(pg_total_relation_size('public.${TABLE}')) AS pretty`,
    );
    return { ...totals[0], byLevel, bySource, size: size[0]?.pretty ?? '—' };
}

async function purgeableCount(thresholds) {
    const rows = [];
    for (const { level, before } of thresholds) {
        const { rows: result } = await client.query(
            `SELECT COUNT(*)::int AS n FROM public.${TABLE} WHERE level = $1 AND occurred_at < $2`,
            [level, before],
        );
        rows.push({ level, before, count: result[0]?.n ?? 0 });
    }
    return rows;
}

async function main() {
    await client.connect();

    if (!(await tableExists())) {
        console.error(
            `${TABLE} absente — appliquez d'abord la migration :\n` +
            '  npm run db:migrate:activity-logs\n' +
            '  npm run db:migrate:activity-logs:write',
        );
        await client.end();
        process.exit(1);
    }

    const state = await measure();
    console.log(`=== Journal d'activité (${TABLE}) — ${WRITE ? 'RÉTENTION' : 'MESURE'} ===`);
    console.log(`Volume : ${state.total} ligne(s) · ${state.size} · +24 h : ${state.last24h}`);
    console.log(`Plus ancien : ${state.oldest ?? '—'}`);
    console.log(`Plus récent : ${state.newest ?? '—'}`);
    console.log('');
    console.log('Par gravité :');
    for (const row of state.byLevel) console.log(`  ${row.level.padEnd(9)} ${row.n}`);
    console.log('');
    console.log('Par domaine :');
    for (const row of state.bySource) console.log(`  ${row.source.padEnd(10)} ${row.n}`);

    const nowMs = Date.now();
    const thresholds = resolveThresholds(nowMs);
    const purgeable = await purgeableCount(thresholds);
    const purgeableTotal = purgeable.reduce((sum, row) => sum + row.count, 0);

    console.log('');
    console.log(
        `Purgeables au-delà de la rétention${keepDaysArg ? ` (${keepDaysArg})` : ''} : ${purgeableTotal}`,
    );
    for (const row of purgeable) {
        console.log(`  ${row.level.padEnd(9)} ${String(row.count).padStart(5)}  (avant ${row.before.slice(0, 10)})`);
    }

    if (state.total > DEFAULT_RETENTION.maxRows) {
        console.error('');
        console.error(
            `ÉCHEC : ${state.total} lignes dépassent le plafond de ${DEFAULT_RETENTION.maxRows}. ` +
            'Appliquez la rétention (npm run cms:purge:logs) pour revenir sous le budget.',
        );
        await client.end();
        process.exit(3);
    }

    if (!WRITE) {
        console.log('');
        console.log('Aucune écriture. Appliquer avec : npm run cms:purge:logs');
        await client.end();
        return;
    }

    if (purgeableTotal === 0) {
        console.log('');
        console.log('Rien à purger : la rétention est déjà respectée.');
        await client.end();
        return;
    }

    /**
     * Garde-fou : vider intégralement le journal est presque toujours le signe
     * d'une durée de conservation mal saisie, pas d'une intention. La trace est
     * justement ce qui permet de comprendre un incident passé.
     */
    if (purgeableTotal >= state.total && !FORCE) {
        console.error('');
        console.error(
            `REFUS : la purge effacerait la totalité du journal (${purgeableTotal}/${state.total}). ` +
            'Relancez avec --force si c’est réellement voulu.',
        );
        await client.end();
        process.exit(1);
    }

    let deleted = 0;
    for (const { level, before } of thresholds) {
        const { rowCount } = await client.query(
            `DELETE FROM public.${TABLE} WHERE level = $1 AND occurred_at < $2`,
            [level, before],
        );
        deleted += rowCount ?? 0;
    }

    const after = await measure();
    console.log('');
    console.log(`${deleted} ligne(s) effacée(s). Volume après purge : ${after.total} · ${after.size}`);
    console.log('Relancer sans --write pour vérifier l’état.');
    await client.end();
}

main().catch(async (error) => {
    console.error(`Erreur : ${error instanceof Error ? error.message : error}`);
    try {
        await client.end();
    } catch {
        // connexion déjà fermée
    }
    process.exit(1);
});
