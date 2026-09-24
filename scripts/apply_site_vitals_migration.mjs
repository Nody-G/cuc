#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Migration : table de performance vécue (`site_vitals`)
 * ==============================================================================
 * Ouvre le stockage des mesures Core Web Vitals réellement subies par les
 * visiteurs (LCP, INP, CLS, FCP, TTFB), échantillonnées à un visiteur sur vingt
 * par `VitalsReporter` et reçues par `POST /api/vitals`.
 *
 * Décisions de conception, explicites :
 *  - **RLS activée sans aucune policy** : la table est de la télémétrie, écrite
 *    et lue par le seul service role. Ni `anon` ni `authenticated` n'y ont
 *    accès — aucun surface publique nouvelle ;
 *  - **pas d'ajout à la publication Realtime** : personne n'a besoin d'un
 *    événement temps réel par mesure ; l'agrégation se fait par requête
 *    (`npm run audit:vitals`) ;
 *  - contrôles `CHECK` sur la métrique, la note et la positivité de la valeur :
 *    la validation applicative existe, la base la double.
 *
 * Usage (dry-run par défaut, aucune écriture) :
 *   npm run db:migrate:site-vitals
 *   npm run db:migrate:site-vitals:write
 * ==============================================================================
 */

import * as dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const WRITE = process.argv.includes('--write');
const TABLE = 'site_vitals';

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!databaseUrl || /\[YOUR-PASSWORD\]|\[MOT_DE_PASSE\]/.test(databaseUrl)) {
    console.error('DATABASE_URL manquant ou placeholder dans .env.local — migration impossible.');
    process.exit(1);
}

const STATEMENTS = [
    `CREATE TABLE IF NOT EXISTS public.${TABLE} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path TEXT NOT NULL,
    metric TEXT NOT NULL CHECK (metric IN ('LCP', 'INP', 'CLS', 'FCP', 'TTFB')),
    value DOUBLE PRECISION NOT NULL CHECK (value >= 0),
    rating TEXT NOT NULL CHECK (rating IN ('good', 'needs-improvement', 'poor')),
    locale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
)`,
    `CREATE INDEX IF NOT EXISTS idx_${TABLE}_created ON public.${TABLE} (created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_${TABLE}_metric_path ON public.${TABLE} (metric, path, created_at DESC)`,
    `ALTER TABLE public.${TABLE} ENABLE ROW LEVEL SECURITY`,
];

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

async function snapshot() {
    const { rows: table } = await client.query(
        `SELECT to_regclass($1) IS NOT NULL AS exists`,
        [`public.${TABLE}`]
    );
    const exists = Boolean(table[0]?.exists);
    let rows = 0;
    let policies = 0;
    if (exists) {
        const { rows: count } = await client.query(`SELECT COUNT(*)::int AS n FROM public.${TABLE}`);
        rows = count[0]?.n ?? 0;
        const { rows: policyRows } = await client.query(
            `SELECT COUNT(*)::int AS n FROM pg_policies WHERE schemaname = 'public' AND tablename = $1`,
            [TABLE]
        );
        policies = policyRows[0]?.n ?? 0;
    }
    return { exists, rows, policies };
}

async function main() {
    await client.connect();
    const before = await snapshot();

    console.log(`=== Migration ${TABLE} — ${WRITE ? 'APPLICATION' : 'DRY-RUN'} ===`);
    console.log(
        `Avant : table ${before.exists ? 'présente' : 'ABSENTE'} | lignes : ${before.rows} | policies : ${before.policies}`
    );
    console.log('');
    for (const statement of STATEMENTS) console.log(`${statement};`);
    console.log('');

    if (!WRITE) {
        console.log('Aucune écriture. Relancer avec --write (ou npm run db:migrate:site-vitals:write).');
        await client.end();
        process.exit(0);
    }

    await client.query('BEGIN');
    try {
        for (const statement of STATEMENTS) await client.query(statement);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }

    const after = await snapshot();
    console.log(
        `Après : table ${after.exists ? 'présente' : 'ABSENTE'} | lignes : ${after.rows} | policies : ${after.policies} (RLS activée, sans policy : accès service role uniquement)`
    );
    await client.end();
    process.exit(0);
}

main().catch(async (error) => {
    console.error(`Migration ${TABLE} : échec — ${error.message}`);
    try {
        await client.end();
    } catch {
        /* connexion déjà fermée */
    }
    process.exit(2);
});
