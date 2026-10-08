#!/usr/bin/env node
/**
 * ==============================================================================
 * Application de la migration `site_translations` (couche i18n)
 * ==============================================================================
 * Exécute `scripts/migration_site_translations.sql` via l'API Management Supabase
 * (endpoint `/v1/projects/{ref}/database/query`), qui accepte le SQL arbitraire.
 *
 * Idempotent : `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`,
 * `DROP POLICY IF EXISTS` puis `CREATE POLICY`, `DO $$ … $$` pour le Realtime.
 *
 * Prérequis : `SUPABASE_ACCESS_TOKEN` dans `.env.local`.
 *
 * Usage :
 *   node scripts/apply_site_translations_migration.mjs --dry-run
 *   node scripts/apply_site_translations_migration.mjs
 * ==============================================================================
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

if (!ACCESS_TOKEN) {
    console.error('❌ SUPABASE_ACCESS_TOKEN manquant dans .env.local.');
    process.exit(1);
}

const PROJECT_REF = new URL(SUPABASE_URL).hostname.split('.')[0];
const SQL = readFileSync(join(__dirname, 'migration_site_translations.sql'), 'utf8');

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
            typeof payload === 'object' && payload?.message ? payload.message : String(payload);
        throw new Error(`HTTP ${res.status} — ${message}`);
    }
    return payload;
}

console.log(`Projet : ${PROJECT_REF}`);
console.log(`Mode   : ${DRY_RUN ? 'APERÇU' : 'APPLICATION'}\n`);

if (DRY_RUN) {
    console.log('--- SQL à appliquer ---\n');
    console.log(SQL);
    process.exit(0);
}

try {
    await runSql(SQL);
    console.log('✅ Migration site_translations appliquée.');

    const check = await runSql(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'site_translations' ORDER BY ordinal_position;`
    );
    const rows = Array.isArray(check) ? check : check?.result || [];
    console.log('\nColonnes :');
    for (const c of rows) console.log(`  - ${c.column_name} (${c.data_type})`);
} catch (err) {
    console.error('\n❌ Échec de la migration :', err.message);
    process.exit(2);
}
