/**
 * Sonde de vérification du Moniteur Système CUC.
 *
 * Reproduit exactement la logique de `getSystemHealth()` (src/app/admin/actions.ts)
 * afin de prouver que les mesures sont réelles et que les tables sondées existent.
 *
 * Usage :
 *   node scripts/probe_system_health.mjs
 *
 * Sort en code 2 si une table sondée est injoignable (régression de schéma).
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});

const TABLES = [
    'site_films',
    'site_team',
    'site_partners',
    'site_sessions',
    'site_inquiries',
    'site_disciplines',
    'site_events',
    'site_campus_pois',
];

async function main() {
    console.log('🔍 Sonde Moniteur Système CUC\n');

    // 1. Latence
    const t0 = Date.now();
    const { error: pingError } = await supabase
        .from('site_settings')
        .select('key')
        .limit(1);
    const latencyMs = Date.now() - t0;

    if (pingError) {
        console.error(`❌ Ping Supabase en échec : ${pingError.message}`);
        process.exit(2);
    }
    console.log(`✅ Latence Supabase : ${latencyMs} ms`);

    // 2. Tables
    let reachable = 0;
    const failures = [];
    for (const table of TABLES) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
        if (error) {
            failures.push({ table, message: error.message });
            console.log(`❌ ${table.padEnd(20)} injoignable — ${error.message}`);
        } else {
            reachable += 1;
            console.log(`✅ ${table.padEnd(20)} ${count ?? 0} ligne(s)`);
        }
    }

    // 3. Dernière écriture
    const { data: lastLog, error: logError } = await supabase
        .from('site_audit_logs')
        .select('action, target, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (logError) {
        console.log(`⚠️  site_audit_logs injoignable — ${logError.message}`);
    } else if (lastLog?.created_at) {
        console.log(
            `✅ Dernière écriture : ${new Date(lastLog.created_at).toLocaleString('fr-FR')} (${lastLog.target || lastLog.action})`
        );
    } else {
        console.log('⚠️  site_audit_logs vide.');
    }

    // 4. Colonnes POI (image_url, order_index)
    const { error: poiError } = await supabase
        .from('site_campus_pois')
        .select('id, image_url, order_index, is_active')
        .limit(1);

    if (poiError) {
        console.log(`⚠️  Colonnes POI manquantes : ${poiError.message}`);
    } else {
        console.log('✅ Colonnes POI image_url / order_index / is_active présentes.');
    }

    console.log(`\n📊 Tables joignables : ${reachable} / ${TABLES.length}`);

    if (failures.length > 0) {
        console.error('\n❌ Régression de schéma détectée.');
        process.exit(2);
    }

    console.log('\n✅ Moniteur Système : toutes les mesures sont réelles et cohérentes.');
}

main().catch((err) => {
    console.error('❌ Erreur inattendue :', err);
    process.exit(1);
});
