/**
 * INSPECTION DE LA CLÉ ÉTRANGÈRE evaluation_disciplines.session_id
 * ================================================================
 *
 * `evaluation_disciplines.session_id` est NOT NULL mais `public.sessions`
 * n'existe pas. Ce script identifie la vraie table parente via les contraintes
 * PostgreSQL, et liste les tables de session/formation de CUC Sign.
 *
 * LECTURE SEULE.
 *
 * Usage : node scripts/inspect_eval_disciplines_fk.mjs
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split('.')[0];

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
    console.log('🔍 Clés étrangères de evaluation_disciplines\n');

    console.log('── Contraintes FK sortantes ──');
    console.table(
        await runSql(`
            SELECT
                tc.constraint_name,
                kcu.column_name,
                ccu.table_schema AS ref_schema,
                ccu.table_name   AS ref_table,
                ccu.column_name  AS ref_column,
                rc.delete_rule
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
               AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage ccu
                ON ccu.constraint_name = tc.constraint_name
               AND ccu.table_schema = tc.table_schema
            JOIN information_schema.referential_constraints rc
                ON rc.constraint_name = tc.constraint_name
               AND rc.constraint_schema = tc.table_schema
            WHERE tc.table_schema = 'public'
              AND tc.table_name = 'evaluation_disciplines'
              AND tc.constraint_type = 'FOREIGN KEY';
        `)
    );

    console.log('\n── Tables CUC Sign liées aux sessions / formations ──');
    console.table(
        await runSql(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND (table_name ILIKE '%session%'
                   OR table_name ILIKE '%formation%'
                   OR table_name ILIKE '%promo%'
                   OR table_name ILIKE '%cohort%')
            ORDER BY table_name;
        `)
    );

    console.log('\n── La session parente 3435c984… existe-t-elle ? ──');
    console.table(
        await runSql(`
            SELECT table_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND column_name = 'id'
              AND table_name IN (
                  SELECT table_name FROM information_schema.tables
                  WHERE table_schema = 'public'
              )
              AND table_name ILIKE '%session%';
        `)
    );
}

main().catch((err) => {
    console.error('❌ Erreur fatale :', err.message);
    process.exit(1);
});
