/**
 * MIGRATION : création de la table public.site_inquiries
 * ======================================================
 *
 * BUG P1 CORRIGÉ : le code ([`getInquiries()`](src/lib/data/site-service.ts:1548),
 * [`submitInquiry()`](src/app/admin/actions.ts:1167), CockpitApp realtime) interroge
 * `site_inquiries`, mais la table n'existait PAS en base. Conséquence : chaque
 * candidature / demande de contact était silencieusement perdue (l'insert était
 * enveloppé dans un try/catch qui avalait l'erreur), et l'onglet « Candidatures »
 * du Cockpit retombait sur `SAMPLE_INQUIRIES` (données factices).
 *
 * Ce script :
 *   1. Crée la table `site_inquiries` (schéma aligné sur l'interface SiteInquiry).
 *   2. Active RLS + policies (lecture publique des inserts, écriture admin).
 *   3. Ajoute la table à la publication realtime.
 *   4. Recharge le cache de schéma PostgREST.
 *   5. Migre les candidatures existantes depuis `site_settings.inquiries`.
 *
 * Usage :
 *   node scripts/apply_site_inquiries_migration.mjs --dry-run
 *   node scripts/apply_site_inquiries_migration.mjs
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const DRY_RUN = process.argv.includes('--dry-run');

if (!SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
    process.exit(1);
}
if (!ACCESS_TOKEN) {
    console.error('❌ SUPABASE_ACCESS_TOKEN manquant dans .env.local');
    process.exit(1);
}

const PROJECT_REF = new URL(SUPABASE_URL).hostname.split('.')[0];

const DDL = `
CREATE TABLE IF NOT EXISTS public.site_inquiries (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    program_id TEXT NOT NULL DEFAULT 'general',
    program_title TEXT,
    age TEXT,
    sport_background TEXT,
    session_date TEXT,
    afdas_status TEXT,
    message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'nouveau',
    admin_notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_site_inquiries_status ON public.site_inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_inquiries_created ON public.site_inquiries(created_at DESC);

ALTER TABLE public.site_inquiries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'site_inquiries' AND policyname = 'site_inquiries_public_insert'
    ) THEN
        CREATE POLICY site_inquiries_public_insert ON public.site_inquiries
            FOR INSERT TO anon, authenticated WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'site_inquiries' AND policyname = 'site_inquiries_admin_all'
    ) THEN
        CREATE POLICY site_inquiries_admin_all ON public.site_inquiries
            FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

ALTER TABLE public.site_inquiries REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'site_inquiries'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.site_inquiries;
    END IF;
END $$;
`;

async function runSql(sql) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
    });
    const text = await res.text();
    if (!res.ok) {
        throw new Error(`Management API ${res.status} : ${text}`);
    }
    return text ? JSON.parse(text) : null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
    console.log('🛠️  Migration site_inquiries\n');

    if (DRY_RUN) {
        console.log('--- DDL (dry-run, non appliqué) ---');
        console.log(DDL);
        console.log('--- Fin DDL ---\n');
    } else {
        console.log('1. Application du DDL…');
        await runSql(DDL);
        console.log('   ✅ Table + index + RLS + realtime créés.');

        console.log('2. Rechargement du cache de schéma PostgREST…');
        await runSql("NOTIFY pgrst, 'reload schema';");
        await sleep(3000);
        console.log('   ✅ Cache rechargé.');
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    // 3. Migration des candidatures existantes depuis site_settings.inquiries
    console.log('3. Migration depuis site_settings.inquiries…');
    const { data: settingRow, error: setErr } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'inquiries')
        .maybeSingle();
    if (setErr) throw new Error(`site_settings : ${setErr.message}`);

    const legacy = Array.isArray(settingRow?.value?.list) ? settingRow.value.list : [];
    console.log(`   ${legacy.length} candidature(s) héritée(s) trouvée(s).`);

    if (legacy.length > 0 && !DRY_RUN) {
        const rows = legacy.map((i) => ({
            id: i.id || `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            full_name: i.full_name || 'Inconnu',
            email: i.email || '',
            phone: i.phone || '',
            program_id: i.program_id || 'general',
            program_title: i.program_title || null,
            age: i.age || null,
            sport_background: i.sport_background || null,
            session_date: i.session_date || null,
            afdas_status: i.afdas_status || null,
            message: i.message || '',
            status: i.status || 'nouveau',
            admin_notes: i.admin_notes || null,
            metadata: i.metadata || {},
            created_at: i.created_at || new Date().toISOString(),
            updated_at: i.updated_at || i.created_at || new Date().toISOString(),
        }));
        const { error: upErr } = await supabase.from('site_inquiries').upsert(rows, { onConflict: 'id' });
        if (upErr) throw new Error(`upsert site_inquiries : ${upErr.message}`);
        console.log(`   ✅ ${rows.length} candidature(s) migrée(s).`);
    } else if (DRY_RUN) {
        console.log('   (dry-run : migration non exécutée)');
    }

    // 4. Vérification
    if (!DRY_RUN) {
        const { data, error } = await supabase
            .from('site_inquiries')
            .select('id, full_name, status, created_at')
            .order('created_at', { ascending: false })
            .limit(5);
        if (error) throw new Error(`vérification : ${error.message}`);
        console.log(`\n✅ site_inquiries opérationnelle — ${data.length} ligne(s) lue(s) :`);
        for (const r of data) console.log(`   • ${r.full_name} [${r.status}] ${r.created_at}`);
    }

    console.log('\n✅ Migration terminée.');
}

main().catch((err) => {
    console.error('❌ Erreur fatale :', err.message);
    process.exit(1);
});
