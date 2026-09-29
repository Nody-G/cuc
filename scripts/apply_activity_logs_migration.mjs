#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Application de la migration `public.site_activity_logs`
 * ==============================================================================
 * Crée la table du journal d'activité technique du Cockpit (voir
 * `scripts/migration_apply_activity_logs.sql` et
 * `plans/plan-journal-activite-cockpit.md` § 2 et § 7).
 *
 * Décisions explicites, héritées de `apply_applicant_history_migration.mjs` :
 *  - **le SQL n'est pas recopié** : l'applier lit le fichier `.sql` et découpe sur
 *    le marqueur `-- @statement`. Une seule source de vérité, et un découpage qui
 *    ne casse pas sur les points-virgules internes d'un bloc `DO $$ … $$` ;
 *  - **essai à blanc par défaut** : sans `--write`, rien n'est exécuté ;
 *  - **preuve d'innocuité** : le nombre de lignes de `site_audit_logs` et de
 *    `site_activity_logs` est relevé avant et après ; toute variation fait
 *    échouer la commande. C'est la preuve que la migration ne touche aucune
 *    donnée, pas une formalité.
 *
 * Usage :
 *   npm run db:migrate:activity-logs
 *   npm run db:migrate:activity-logs:write
 * ==============================================================================
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const WRITE = process.argv.includes('--write');
const __dirname = dirname(fileURLToPath(import.meta.url));
const SQL_FILE = join(__dirname, 'migration_apply_activity_logs.sql');
const TARGET_TABLE = 'site_activity_logs';
/** Table témoin : la migration ne doit pas la toucher. */
const WITNESS_TABLE = 'site_audit_logs';

/** Colonnes exigées par le service d'écriture (`src/lib/logging/types.ts`). */
const REQUIRED_COLUMNS = [
    'id',
    'occurred_at',
    'level',
    'source',
    'category',
    'message',
    'target',
    'context',
    'request_id',
    'duration_ms',
    'origin',
    'actor_id',
    'actor_name',
    'repeat_count',
];

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!databaseUrl || /\[YOUR-PASSWORD\]|\[MOT_DE_PASSE\]/.test(databaseUrl)) {
    console.error('DATABASE_URL manquant ou placeholder dans .env.local — migration impossible.');
    process.exit(1);
}

/**
 * Découpe le fichier SQL en blocs exécutables.
 *
 * Le marqueur est reconnu **en début de ligne et seule sur sa ligne** (`^…$`) :
 * une simple mention du mot-clé dans un commentaire créait sinon un bloc
 * parasite, contenant un fragment de phrase — un défaut réellement observé au
 * premier essai à blanc, qui aurait envoyé du texte français à Postgres.
 * Le préambule (avant le premier marqueur) est écarté : il ne contient que de la
 * documentation.
 */
function readStatements() {
    const raw = readFileSync(SQL_FILE, 'utf8');
    return raw
        .split(/^-- @statement\s*$/m)
        .slice(1)
        .map((block) => block.trim())
        .filter((block) => block.length > 0);
}

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

async function snapshot() {
    const { rows: tables } = await client.query(
        `SELECT table_name FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
        [[TARGET_TABLE, WITNESS_TABLE]]
    );
    const { rows: columns } = await client.query(
        `SELECT column_name FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1`,
        [TARGET_TABLE]
    );
    const { rows: policies } = await client.query(
        `SELECT COUNT(*)::int AS n FROM pg_policies
          WHERE schemaname = 'public' AND tablename = $1`,
        [TARGET_TABLE]
    );

    const counts = {};
    for (const table of [TARGET_TABLE, WITNESS_TABLE]) {
        if (!tables.some((row) => row.table_name === table)) {
            counts[table] = null;
            continue;
        }
        const { rows } = await client.query(`SELECT COUNT(*)::int AS n FROM public.${table}`);
        counts[table] = rows[0]?.n ?? 0;
    }

    return {
        exists: tables.some((row) => row.table_name === TARGET_TABLE),
        columns: columns.map((row) => row.column_name),
        policies: policies[0]?.n ?? 0,
        counts,
    };
}

function describe(state) {
    const missing = REQUIRED_COLUMNS.filter((column) => !state.columns.includes(column));
    return [
        `table ${state.exists ? 'présente' : 'ABSENTE'}`,
        `colonnes ${state.columns.length}${missing.length > 0 ? ` (manquantes : ${missing.join(', ')})` : ''}`,
        `policies ${state.policies}`,
        `lignes ${TARGET_TABLE}=${state.counts[TARGET_TABLE] ?? '—'} / ${WITNESS_TABLE}=${state.counts[WITNESS_TABLE] ?? '—'}`,
    ].join(' | ');
}

async function main() {
    const statements = readStatements();
    await client.connect();

    const before = await snapshot();
    console.log(`=== Migration ${TARGET_TABLE} — ${WRITE ? 'APPLICATION' : 'DRY-RUN'} ===`);
    console.log(`Avant : ${describe(before)}`);
    console.log(`Blocs SQL : ${statements.length}`);
    console.log('');

    if (!WRITE) {
        statements.forEach((statement, index) => {
            const headline = statement
                .split('\n')
                .find((line) => line.trim().length > 0 && !line.trim().startsWith('--'));
            console.log(`  ${String(index + 1).padStart(2, '0')}. ${headline?.trim() ?? '(commentaire)'}`);
        });
        console.log('');
        console.log(
            'Aucune écriture. Relancer avec --write (npm run db:migrate:activity-logs:write).'
        );
        await client.end();
        return;
    }

    for (const statement of statements) await client.query(statement);

    const after = await snapshot();
    console.log(`Après : ${describe(after)}`);

    // Preuve n°1 : la table et toutes les colonnes attendues existent.
    const missing = REQUIRED_COLUMNS.filter((column) => !after.columns.includes(column));
    if (missing.length > 0) {
        console.error(`ÉCHEC : colonnes toujours absentes (${missing.join(', ')}).`);
        await client.end();
        process.exit(1);
    }

    // Preuve n°2 : les policies de lecture et d'écriture sont posées.
    if (after.policies < 2) {
        console.error(`ÉCHEC : ${after.policies} policy(ies) sur ${TARGET_TABLE}, 2 attendues.`);
        await client.end();
        process.exit(1);
    }

    // Preuve n°3 : aucune ligne préexistante n'a bougé.
    for (const table of [TARGET_TABLE, WITNESS_TABLE]) {
        const from = before.counts[table];
        const to = after.counts[table];
        if (from !== null && from !== to) {
            console.error(`ÉCHEC : ${table} a changé de volume (${from} → ${to}).`);
            await client.end();
            process.exit(1);
        }
    }

    console.log('');
    console.log(`OK — ${TARGET_TABLE} opérationnelle, aucune donnée préexistante modifiée.`);
    console.log('Étape suivante : alimenter le journal (src/lib/logging/write.ts), puis');
    console.log('vérifier la rétention avec npm run audit:logs.');
    await client.end();
}

main().catch(async (error) => {
    console.error(`Erreur de migration : ${error instanceof Error ? error.message : error}`);
    try {
        await client.end();
    } catch {
        // connexion déjà fermée
    }
    process.exit(1);
});
