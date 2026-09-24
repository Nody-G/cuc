#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Performance réellement vécue : mesure et rétention (`site_vitals`)
 * ==============================================================================
 * Les budgets du dépôt mesurent le **poids** et le **nombre de requêtes** ; ce
 * script mesure ce que les visiteurs **subissent** : LCP, INP, CLS, FCP et TTFB
 * par page, sur une fenêtre glissante.
 *
 * Doctrine (voir `durability_health.md` § 6) :
 *  - **mesure d'abord** : volumes réels, percentiles par page et par métrique,
 *    avant toute décision ; un rapport vide doit le dire clairement plutôt
 *    qu'afficher des zéros trompeurs ;
 *  - **la rétention est bornée** : `--keep-days=N --write` purge les mesures
 *    plus anciennes (180 jours par défaut). Une table de télémétrie qui grossit
 *    sans plafond est un défaut, même si les volumes sont faibles ;
 *  - aucune autre écriture : ce script ne fait que mesurer, sauf `--write`
 *    explicitement passé pour la purge.
 *
 * Usage :
 *   npm run audit:vitals
 *   node scripts/audit_web_vitals.mjs --days=7
 *   npm run cms:purge:vitals
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: '.env.local' });

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = path.join(ROOT, 'plans', 'revue-performance-terrain.md');
const TABLE = 'site_vitals';
const DEFAULT_WINDOW_DAYS = 30;
const DEFAULT_KEEP_DAYS = 180;

const args = process.argv.slice(2);
const WRITE = args.includes('--write');
const windowArg = args.find((arg) => arg.startsWith('--days='));
const keepArg = args.find((arg) => arg.startsWith('--keep-days='));
const WINDOW_DAYS = windowArg ? Number.parseInt(windowArg.split('=')[1], 10) : DEFAULT_WINDOW_DAYS;
const KEEP_DAYS = keepArg ? Number.parseInt(keepArg.split('=')[1], 10) : DEFAULT_KEEP_DAYS;

if (!Number.isInteger(WINDOW_DAYS) || WINDOW_DAYS < 1) {
    console.error(`--days attendu en entier >= 1 (reçu : ${windowArg ?? 'aucun'}).`);
    process.exit(2);
}
if (!Number.isInteger(KEEP_DAYS) || KEEP_DAYS < 1) {
    console.error(`--keep-days attendu en entier >= 1 (reçu : ${keepArg ?? 'aucun'}).`);
    process.exit(2);
}

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!databaseUrl || /\[YOUR-PASSWORD\]|\[MOT_DE_PASSE\]/.test(databaseUrl)) {
    console.error('DATABASE_URL manquant ou placeholder dans .env.local — mesure impossible.');
    process.exit(2);
}

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

/** Mise en forme d'une durée en millisecondes, lisible dans un rapport. */
function ms(value) {
    if (value === null || value === undefined) return '—';
    return `${Math.round(Number(value))} ms`;
}

/** Un score CLS n'est pas une durée : pas d'unité en millisecondes. */
function metricValue(metric, value) {
    if (value === null || value === undefined) return '—';
    return metric === 'CLS' ? Number(value).toFixed(3) : ms(value);
}

async function main() {
    await client.connect();

    const { rows: tableRows } = await client.query(`SELECT to_regclass($1) IS NOT NULL AS exists`, [
        `public.${TABLE}`,
    ]);
    if (!tableRowExists(tableRows)) {
        console.error(
            `[audit:vitals] Table ${TABLE} absente — appliquer la migration : npm run db:migrate:site-vitals:write`
        );
        await client.end();
        process.exit(2);
    }

    const { rows: totals } = await client.query(
        `SELECT COUNT(*)::int AS total,
                COUNT(DISTINCT path)::int AS paths,
                MIN(created_at) AS oldest,
                MAX(created_at) AS newest
           FROM ${TABLE}`
    );

    const { rows: perPage } = await client.query(
        `SELECT path, metric,
                COUNT(*)::int AS samples,
                percentile_cont(0.5) WITHIN GROUP (ORDER BY value) AS p50,
                percentile_cont(0.75) WITHIN GROUP (ORDER BY value) AS p75,
                percentile_cont(0.95) WITHIN GROUP (ORDER BY value) AS p95
           FROM ${TABLE}
          WHERE created_at > now() - ($1 || ' days')::interval
          GROUP BY path, metric
          ORDER BY path, metric`,
        [String(WINDOW_DAYS)]
    );

    const { rows: ratings } = await client.query(
        `SELECT metric, rating, COUNT(*)::int AS n
           FROM ${TABLE}
          WHERE created_at > now() - ($1 || ' days')::interval
          GROUP BY metric, rating
          ORDER BY metric, rating`,
        [String(WINDOW_DAYS)]
    );

    const byPath = new Map();
    for (const row of perPage) {
        const entry = byPath.get(row.path) ?? { path: row.path, metrics: {} };
        entry.metrics[row.metric] = row;
        byPath.set(row.path, entry);
    }

    const windowCount = perPage.reduce((sum, row) => sum + row.samples, 0);
    const ratedTotals = ratings.reduce(
        (acc, row) => {
            acc[row.rating] = (acc[row.rating] ?? 0) + row.n;
            return acc;
        },
        { good: 0, 'needs-improvement': 0, poor: 0 }
    );

    let purged = 0;
    if (WRITE) {
        const result = await client.query(
            `DELETE FROM ${TABLE} WHERE created_at < now() - ($1 || ' days')::interval`,
            [String(KEEP_DAYS)]
        );
        purged = result.rowCount ?? 0;
    }

    const lines = [];
    lines.push('# Revue — Performance réellement vécue (Core Web Vitals)');
    lines.push('');
    lines.push(`Généré le ${new Date().toISOString()} par \`scripts/audit_web_vitals.mjs\`.`);
    lines.push('');
    lines.push(
        `- Mesures en base : ${totals[0]?.total ?? 0} (${totals[0]?.paths ?? 0} page(s), du ${formatDate(totals[0]?.oldest)} au ${formatDate(totals[0]?.newest)})`
    );
    lines.push(`- Fenêtre analysée : ${WINDOW_DAYS} jours — ${windowCount} mesure(s)`);
    lines.push(
        `- Notation globale : ${ratedTotals.good} bon · ${ratedTotals['needs-improvement']} à améliorer · ${ratedTotals.poor} mauvais`
    );
    lines.push(
        `- Rétention : ${KEEP_DAYS} jours${WRITE ? ` — ${purged} mesure(s) purgée(s)` : ' (simulation : passer --write pour purger)'}`
    );
    lines.push('');

    if (windowCount === 0) {
        lines.push(
            `> Aucune mesure sur les ${WINDOW_DAYS} derniers jours. La collecte s\'active côté vitrine (un visiteur sur vingt, une écriture par page vue) : c\'est normal après une mise en service, et normal aussi si le trafic est très faible.`
        );
    } else {
        for (const entry of [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path))) {
            lines.push(`## \`${entry.path}\``);
            lines.push('');
            lines.push('| Métrique | Mesures | p50 | p75 | p95 |');
            lines.push('| --- | ---: | ---: | ---: | ---: |');
            for (const metric of ['LCP', 'INP', 'CLS', 'FCP', 'TTFB']) {
                const row = entry.metrics[metric];
                if (!row) continue;
                lines.push(
                    `| ${metric} | ${row.samples} | ${metricValue(metric, row.p50)} | ${metricValue(metric, row.p75)} | ${metricValue(metric, row.p95)} |`
                );
            }
            lines.push('');
        }
        lines.push('## Notation par métrique (fenêtre analysée)');
        lines.push('');
        lines.push('| Métrique | bon | à améliorer | mauvais |');
        lines.push('| --- | ---: | ---: | ---: |');
        for (const metric of ['LCP', 'INP', 'CLS', 'FCP', 'TTFB']) {
            const entries = ratings.filter((row) => row.metric === metric);
            if (entries.length === 0) continue;
            const get = (rating) => entries.find((row) => row.rating === rating)?.n ?? 0;
            lines.push(
                `| ${metric} | ${get('good')} | ${get('needs-improvement')} | ${get('poor')} |`
            );
        }
    }
    lines.push('');

    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.writeFileSync(REPORT, `${lines.join('\n')}\n`, 'utf8');

    console.log(
        `[audit:vitals] ${totals[0]?.total ?? 0} mesure(s) en base — ${windowCount} sur ${WINDOW_DAYS} jours`
    );
    console.log(
        `[audit:vitals] Notation : ${ratedTotals.good} bon · ${ratedTotals['needs-improvement']} à améliorer · ${ratedTotals.poor} mauvais`
    );
    if (WRITE) console.log(`[audit:vitals] Rétention : ${purged} mesure(s) de plus de ${KEEP_DAYS} jours purgée(s)`);
    console.log(`[audit:vitals] Rapport : ${path.relative(ROOT, REPORT)}`);

    await client.end();
    process.exit(0);
}

function tableRowExists(rows) {
    return Boolean(rows[0]?.exists);
}

function formatDate(value) {
    if (!value) return '—';
    return new Date(value).toISOString().slice(0, 16).replace('T', ' ');
}

main().catch(async (error) => {
    console.error(`[audit:vitals] Échec : ${error.message}`);
    try {
        await client.end();
    } catch {
        /* connexion déjà fermée */
    }
    process.exit(2);
});
