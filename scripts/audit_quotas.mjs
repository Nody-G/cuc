#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Garde-fou de quota Supabase (lecture seule)
 * ==============================================================================
 * Le 2026-09-23, un **dépassement de quota de stockage** a coupé l'API Data
 * (HTTP 402) pendant plusieurs heures, résolu à la main en changeant de plan.
 * La leçon n'est pas « surveiller » mais **mesurer et plafonner** : ce script
 * compare l'empreinte réelle à des budgets déclarés et échoue s'ils sont
 * franchis.
 *
 * Ce qu'il mesure (et rien d'autre) :
 *  - taille de la base (`pg_database_size`) et des plus grosses relations ;
 *  - empreinte du **stockage objet** par bucket (lue dans `storage.objects`,
 *    `metadata->>'size'`) — c'est le poste qui a causé l'incident ;
 *  - nombre de lignes des tables qui **grossissent seules** (historique de pages,
 *    télémétrie, journal d'audit, demandes de contact), pour voir la dérive
 *    avant qu'elle ne devienne un quota.
 *
 * Ce qu'il ne peut **pas** mesurer, et le dit : les plafonds du plan (ils vivent
 * dans le tableau de bord Supabase), l'egress et les connexions Realtime.
 *
 * Usage :
 *   npm run audit:quotas
 *   node scripts/audit_quotas.mjs --json      (sortie machine)
 *
 * Sortie : `plans/revue-quotas-supabase.md` — code 2 si un budget est franchi,
 * **code 0 « IGNORÉ »** si la chaîne de connexion est absente (CI sans secrets :
 * un contrôle manquant ne doit jamais ressembler à un contrôle vert).
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: '.env.local' });

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = path.join(ROOT, 'plans', 'revue-quotas-supabase.md');
const AS_JSON = process.argv.includes('--json');

const MB = 1024 * 1024;

/**
 * Budgets déclarés — chacun avec sa raison, pour qu'un dépassement se discute
 * sur des faits et non sur un chiffre sorti de nulle part.
 */
const BUDGETS = {
    /** Base : une vitrine éditoriale se compte en mégaoctets. 200 Mo = dérive. */
    databaseBytes: 200 * MB,
    /** Stockage objet : 90 Mo après la purge du 23/09, plafond volontaire à 150 Mo. */
    storageBytes: 150 * MB,
    /** Aucune table ne doit dominer : au-delà, la dérive est localisée. */
    largestTableBytes: 50 * MB,
    /** Tables qui grossissent seules : au-delà, la rétention ne joue plus. */
    growthTableRows: 20_000,
};

/** Tables dont la croissance est attendue (et donc à surveiller explicitement). */
const GROWTH_TABLES = ['site_page_revisions', 'site_vitals', 'site_audit_logs', 'site_inquiries'];

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!databaseUrl || /\[YOUR-PASSWORD\]|\[MOT_DE_PASSE\]/.test(databaseUrl)) {
    console.log(
        '[audit:quotas] IGNORÉ — DATABASE_URL absent de .env.local (aucune mesure possible ; ce n’est pas un feu vert).'
    );
    process.exit(0);
}

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

function mb(bytes) {
    return `${(Number(bytes) / MB).toFixed(2)} Mo`;
}

async function main() {
    await client.connect();

    const { rows: dbRows } = await client.query(
        `SELECT pg_database_size(current_database())::bigint AS bytes,
                current_database() AS name`
    );
    const databaseBytes = Number(dbRows[0]?.bytes ?? 0);

    const { rows: tableRows } = await client.query(
        `SELECT c.relname AS name, pg_total_relation_size(c.oid)::bigint AS bytes
           FROM pg_class c
           JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relkind = 'r' AND n.nspname = 'public'
          ORDER BY bytes DESC`
    );
    const tables = tableRows.map((row) => ({ name: row.name, bytes: Number(row.bytes) }));

    const { rows: bucketRows } = await client.query(
        `SELECT bucket_id,
                COUNT(*)::int AS objects,
                COALESCE(SUM(CASE WHEN (metadata->>'size') ~ '^[0-9]+$'
                                  THEN (metadata->>'size')::bigint ELSE 0 END), 0)::bigint AS bytes
           FROM storage.objects
          GROUP BY bucket_id
          ORDER BY bytes DESC`
    );
    const storageBytes = bucketRows.reduce((sum, row) => sum + Number(row.bytes), 0);

    const growth = [];
    for (const table of GROWTH_TABLES) {
        const { rows } = await client.query(
            `SELECT to_regclass($1) IS NOT NULL AS exists`,
            [`public.${table}`]
        );
        if (!rows[0]?.exists) continue;
        const { rows: countRows } = await client.query(`SELECT COUNT(*)::int AS n FROM ${table}`);
        growth.push({ table, rows: countRows[0]?.n ?? 0 });
    }

    const largest = tables[0] ?? { name: '—', bytes: 0 };

    const breaches = [];
    if (databaseBytes > BUDGETS.databaseBytes) {
        breaches.push(
            `Base : ${mb(databaseBytes)} > budget ${mb(BUDGETS.databaseBytes)}`
        );
    }
    if (storageBytes > BUDGETS.storageBytes) {
        breaches.push(
            `Stockage objet : ${mb(storageBytes)} > budget ${mb(BUDGETS.storageBytes)}`
        );
    }
    if (largest.bytes > BUDGETS.largestTableBytes) {
        breaches.push(
            `Plus grosse table (\`${largest.name}\`) : ${mb(largest.bytes)} > budget ${mb(BUDGETS.largestTableBytes)}`
        );
    }
    for (const entry of growth) {
        if (entry.rows > BUDGETS.growthTableRows) {
            breaches.push(
                `\`${entry.table}\` : ${entry.rows} lignes > budget ${BUDGETS.growthTableRows} (rétention à appliquer ?)`
            );
        }
    }

    const lines = [];
    lines.push('# Revue — Quotas Supabase (mesure et plafonds)');
    lines.push('');
    lines.push(`Généré le ${new Date().toISOString()} par \`scripts/audit_quotas.mjs\`.`);
    lines.push('');
    lines.push(
        `- Base \`${dbRows[0]?.name ?? '—'}\` : **${mb(databaseBytes)}** (budget ${mb(BUDGETS.databaseBytes)})`
    );
    lines.push(
        `- Stockage objet : **${mb(storageBytes)}** sur ${bucketRows.reduce((sum, row) => sum + Number(row.objects), 0)} objet(s) (budget ${mb(BUDGETS.storageBytes)})`
    );
    lines.push(
        `- Plus grosse table : \`${largest.name}\` — ${mb(largest.bytes)} (budget ${mb(BUDGETS.largestTableBytes)})`
    );
    lines.push('');
    lines.push('## Stockage par bucket');
    lines.push('');
    lines.push('| Bucket | Objets | Empreinte |');
    lines.push('| --- | ---: | ---: |');
    for (const row of bucketRows) {
        lines.push(`| \`${row.bucket_id}\` | ${row.objects} | ${mb(row.bytes)} |`);
    }
    lines.push('');
    lines.push('## Tables les plus volumineuses');
    lines.push('');
    lines.push('| Table | Empreinte |');
    lines.push('| --- | ---: |');
    for (const row of tables.slice(0, 8)) {
        lines.push(`| \`${row.name}\` | ${mb(row.bytes)} |`);
    }
    lines.push('');
    lines.push('## Tables qui grossissent seules');
    lines.push('');
    lines.push('| Table | Lignes | Budget | Rétention |');
    lines.push('| --- | ---: | ---: | --- |');
    const retention = {
        site_page_revisions: '`npm run cms:purge:revisions`',
        site_vitals: '`npm run cms:purge:vitals`',
        site_audit_logs: 'à cadrer (journal d’audit)',
        site_inquiries: 'à cadrer (demandes de contact)',
    };
    for (const entry of growth) {
        lines.push(
            `| \`${entry.table}\` | ${entry.rows} | ${BUDGETS.growthTableRows} | ${retention[entry.table] ?? '—'} |`
        );
    }
    lines.push('');
    lines.push('## Ce que cette mesure ne voit pas');
    lines.push('');
    lines.push(
        '- Les **plafonds du plan** (stockage, egress, connexions Realtime) : ils vivent dans le tableau de bord Supabase, pas dans la base.'
    );
    lines.push(
        '- L’**egress** et le **nombre de connexions simultanées** : mesurés indirectement (poids des routes, `audit:budget`), jamais ici.'
    );
    lines.push('');
    lines.push(
        breaches.length === 0
            ? '✅ Aucun budget franchi.'
            : `❌ ${breaches.length} budget(s) franchi(s) :\n\n${breaches.map((b) => `- ${b}`).join('\n')}`
    );
    lines.push('');

    fs.mkdirSync(path.dirname(REPORT), { recursive: true });
    fs.writeFileSync(REPORT, `${lines.join('\n')}\n`, 'utf8');

    if (AS_JSON) {
        console.log(
            JSON.stringify(
                { databaseBytes, storageBytes, largest, buckets: bucketRows, growth, breaches },
                null,
                2
            )
        );
    } else {
        console.log(
            `[audit:quotas] Base : ${mb(databaseBytes)} / ${mb(BUDGETS.databaseBytes)} · Stockage : ${mb(storageBytes)} / ${mb(BUDGETS.storageBytes)}`
        );
        console.log(
            `[audit:quotas] Plus grosse table : ${largest.name} — ${mb(largest.bytes)} / ${mb(BUDGETS.largestTableBytes)}`
        );
        for (const entry of growth) {
            console.log(`[audit:quotas] ${entry.table} : ${entry.rows} ligne(s)`);
        }
        console.log(
            breaches.length === 0
                ? '[audit:quotas] OK — aucun budget franchi.'
                : `[audit:quotas] ❌ ${breaches.length} budget(s) franchi(s) :\n  - ${breaches.join('\n  - ')}`
        );
        console.log(`[audit:quotas] Rapport : ${path.relative(ROOT, REPORT)}`);
    }

    await client.end();
    process.exit(breaches.length === 0 ? 0 : 2);
}

main().catch(async (error) => {
    console.error(`[audit:quotas] Échec : ${error.message}`);
    try {
        await client.end();
    } catch {
        /* connexion déjà fermée */
    }
    process.exit(2);
});
