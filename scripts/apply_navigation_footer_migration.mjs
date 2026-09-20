/**
 * APPLICATION DE LA MIGRATION : site_navigation + site_footer + site_social_links
 * ==============================================================================
 *
 * Contexte (preuve) : les logs console navigateur de production montrent
 *   GET .../rest/v1/site_social_links?select=*&is_active=eq.true... 404 (Not Found)
 *   GET .../rest/v1/site_navigation?select=structure%2Cis_published&id=eq.main... 404 (Not Found)
 *   GET .../rest/v1/site_footer?select=structure%2Cis_published&id=eq.main... 404 (Not Found)
 * alors que `scripts/schema_navigation_footer.sql` déclare ces tables.
 *
 * Conséquence : `useNavigation()`, `useFooter()` et `useSocialLinks()` échouaient
 * silencieusement (aucune donnée), et le canal Realtime `site_social_links:all`
 * provoquait l'exception client non capturée qui cassait tout le site vitrine.
 *
 * Ce script applique le DDL via l'API Management Supabase (endpoint
 * `/v1/projects/{ref}/database/query`), qui accepte le SQL arbitraire.
 * Il est IDEMPOTENT : `CREATE TABLE IF NOT EXISTS` + `ADD COLUMN IF NOT EXISTS`.
 *
 * Prérequis : `SUPABASE_ACCESS_TOKEN` (Personal Access Token) dans .env.local.
 *   → https://supabase.com/dashboard/account/tokens
 *
 * Usage :
 *   node scripts/apply_navigation_footer_migration.mjs --dry-run
 *   node scripts/apply_navigation_footer_migration.mjs
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

const SQL_FILE = join(__dirname, 'schema_navigation_footer.sql');

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
    console.log('🛠️  Application de la migration site_navigation + site_footer + site_social_links\n');
    console.log(`   Projet Supabase : ${PROJECT_REF}`);

    if (!ACCESS_TOKEN) {
        console.error(
            '\n❌ SUPABASE_ACCESS_TOKEN manquant.\n' +
            '   Ajoutez-le dans .env.local :\n' +
            '   SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxx\n' +
            '   → https://supabase.com/dashboard/account/tokens\n'
        );
        process.exit(1);
    }

    const sql = readFileSync(SQL_FILE, 'utf8');
    console.log(`   Fichier SQL     : ${SQL_FILE}`);
    console.log(`   Taille          : ${sql.length} caractères\n`);

    if (DRY_RUN) {
        console.log('🔍 Mode --dry-run : aucune écriture.\n');
        console.log('--- SQL qui serait appliqué ---\n');
        console.log(sql);
        return;
    }

    console.log('⏳ Application du DDL...');
    await runSql(sql);
    console.log('✅ DDL appliqué.\n');

    // Vérification : les 3 tables doivent être interrogeables.
    console.log('🔎 Vérification des tables...');
    const check = await runSql(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('site_navigation', 'site_footer', 'site_social_links')
        ORDER BY table_name;
    `);

    const found = Array.isArray(check) ? check.map((r) => r.table_name) : [];
    const expected = ['site_footer', 'site_navigation', 'site_social_links'];
    const missing = expected.filter((t) => !found.includes(t));

    for (const t of expected) {
        console.log(`   ${found.includes(t) ? '✅' : '❌'} ${t}`);
    }

    if (missing.length > 0) {
        console.error(`\n❌ Tables manquantes après migration : ${missing.join(', ')}`);
        process.exit(1);
    }

    console.log('\n✅ Migration terminée. Lancez maintenant :');
    console.log('   node scripts/seed_navigation_footer.mjs\n');
}

main().catch((err) => {
    console.error('\n❌ Échec de la migration :', err.message);
    process.exit(1);
});
