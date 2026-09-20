/**
 * APPLICATION DE LA MIGRATION : site_campus_pois + site_audit_logs
 * ================================================================
 *
 * Contexte (preuve) : `node scripts/probe_system_health.mjs` a retourné
 *   ⚠️  site_audit_logs injoignable — Could not find the table 'public.site_audit_logs'
 *   ⚠️  Colonnes POI manquantes : Could not find the table 'public.site_campus_pois'
 * alors que `scripts/migration_sync_cuc_cockpit.sql` déclare ces tables.
 * Conséquence : les écritures de `CampusZonesView` échouaient silencieusement
 * (try/catch) et le Moniteur Système ne pouvait pas lire la dernière écriture.
 *
 * Ce script applique le DDL via l'API Management Supabase (endpoint
 * `/v1/projects/{ref}/database/query`), qui accepte le SQL arbitraire.
 * Il est IDEMPOTENT : `CREATE TABLE IF NOT EXISTS` + `ADD COLUMN IF NOT EXISTS`.
 *
 * Prérequis : `SUPABASE_ACCESS_TOKEN` (Personal Access Token) dans .env.local.
 *   → https://supabase.com/dashboard/account/tokens
 *
 * Usage :
 *   node scripts/apply_campus_pois_audit_logs_migration.mjs --dry-run
 *   node scripts/apply_campus_pois_audit_logs_migration.mjs
 */
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

dotenv.config({ path: '.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const DRY_RUN = process.argv.includes('--dry-run');

// Le ref du projet est le sous-domaine de l'URL Supabase.
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split('.')[0];

const SQL_FILE = join(__dirname, 'migration_apply_campus_pois_audit_logs.sql');

async function runSql(sql) {
    const res = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: sql }),
        }
    );

    const text = await res.text();
    let payload;
    try {
        payload = JSON.parse(text);
    } catch {
        payload = text;
    }

    if (!res.ok) {
        const message =
            typeof payload === 'object' && payload?.message
                ? payload.message
                : typeof payload === 'string'
                    ? payload
                    : JSON.stringify(payload);
        throw new Error(`HTTP ${res.status} — ${message}`);
    }

    return payload;
}

async function main() {
    console.log('🛠️  Application de la migration site_campus_pois + site_audit_logs\n');
    console.log(`   Projet Supabase : ${PROJECT_REF}`);

    if (!ACCESS_TOKEN) {
        console.error(
            '\n❌ SUPABASE_ACCESS_TOKEN manquant dans .env.local.\n' +
            '   Créez un Personal Access Token : https://supabase.com/dashboard/account/tokens\n' +
            '   puis ajoutez la ligne : SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxx\n'
        );
        process.exit(1);
    }

    const sql = readFileSync(SQL_FILE, 'utf8');
    console.log(`   Fichier SQL     : ${SQL_FILE}`);
    console.log(`   Taille          : ${sql.length} caractères\n`);

    if (DRY_RUN) {
        console.log('🔎 Mode --dry-run : aucune écriture. SQL qui serait appliqué :\n');
        console.log(sql);
        return;
    }

    try {
        const result = await runSql(sql);
        console.log('✅ Migration appliquée avec succès.');
        if (Array.isArray(result) && result.length > 0) {
            console.log('\n📊 Vérification (colonnes par table) :');
            for (const row of result) {
                console.log(`   • ${row.table_name} : ${row.column_count} colonnes`);
            }
        }
    } catch (err) {
        console.error(`\n❌ Échec de la migration : ${err.message}`);
        process.exit(2);
    }
}

main();
