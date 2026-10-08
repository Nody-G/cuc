/**
 * APPLICATION DE LA MIGRATION : site_disciplines
 * ==============================================
 *
 * Contexte (preuve) :
 *   `node scripts/deep_audit_interconnection.mjs` a retourné « site_disciplines : 0 rows ».
 *   Une requête directe confirme :
 *     select id limit 1 => ERR: Could not find the table 'public.site_disciplines' in the schema cache
 *   alors que `scripts/migration_sync_cuc_cockpit.sql` (L36-60) déclare cette table.
 *   Conséquence : `getDisciplines()` (src/lib/data/site-service.ts) tombait sur son
 *   fallback `site_settings.disciplines` puis `localStorage` — violation de la doctrine
 *   « Zéro Texte ni Valeur Orpheline » (AGENTS.md).
 *
 * Ce script :
 *   1. Applique le DDL `site_disciplines` via l'API Management Supabase
 *      (`/v1/projects/{ref}/database/query`), IDEMPOTENT (`CREATE TABLE IF NOT EXISTS`).
 *   2. Amorce la table depuis `src/data/disciplines.ts` (CUC_DISCIPLINES, 10 entrées).
 *   3. Vérifie la lecture publique.
 *
 * Prérequis : `SUPABASE_ACCESS_TOKEN` (Personal Access Token) dans .env.local.
 *   → https://supabase.com/dashboard/account/tokens
 *
 * Usage :
 *   node scripts/apply_site_disciplines_migration.mjs --dry-run
 *   node scripts/apply_site_disciplines_migration.mjs
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const DRY_RUN = process.argv.includes('--dry-run');

const PROJECT_REF = new URL(SUPABASE_URL).hostname.split('.')[0];

// ---------------------------------------------------------------------------
// DDL — extrait de scripts/migration_sync_cuc_cockpit.sql (L36-60, L106, L130-146, L189, L204-206)
// ---------------------------------------------------------------------------
const DDL = `
CREATE TABLE IF NOT EXISTS public.site_disciplines (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Mouvement & Déplacement',
    level TEXT NOT NULL DEFAULT 'Tous Niveaux',
    duration TEXT,
    short_desc TEXT NOT NULL,
    full_desc TEXT,
    objectives TEXT[] DEFAULT '{}',
    equipment TEXT[] DEFAULT '{}',
    safety_rules TEXT[] DEFAULT '{}',
    prerequisites TEXT[] DEFAULT '{}',
    instructor_ids TEXT[] DEFAULT '{}',
    film_ids TEXT[] DEFAULT '{}',
    program_ids TEXT[] DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_site_disciplines_active ON public.site_disciplines(is_active, order_index);

ALTER TABLE public.site_disciplines ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public read access for site_disciplines" ON public.site_disciplines;
    CREATE POLICY "Public read access for site_disciplines" ON public.site_disciplines
        FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Admin write access for site_disciplines" ON public.site_disciplines;
    CREATE POLICY "Admin write access for site_disciplines" ON public.site_disciplines
        FOR ALL TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('admin', 'directeur')
            )
        );
END $$;

ALTER TABLE IF EXISTS public.site_disciplines REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'site_disciplines') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.site_disciplines;
    END IF;
END $$;
`;

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
    console.log('🛠️  Application de la migration site_disciplines\n');
    console.log(`   Projet Supabase : ${PROJECT_REF}`);
    console.log(`   Mode            : ${DRY_RUN ? 'DRY-RUN' : 'APPLICATION'}\n`);

    if (!ACCESS_TOKEN) {
        console.error('❌ SUPABASE_ACCESS_TOKEN manquant dans .env.local');
        console.error('   → https://supabase.com/dashboard/account/tokens');
        process.exit(1);
    }
    if (!SERVICE_KEY) {
        console.error('❌ SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
        process.exit(1);
    }

    if (DRY_RUN) {
        console.log('--- DDL qui serait appliqué ---');
        console.log(DDL);
        console.log('--- Fin DDL ---\n');
        console.log('DRY-RUN : aucune écriture effectuée.');
        return;
    }

    // 1. Appliquer le DDL
    console.log('1️⃣  Application du DDL…');
    await runSql(DDL);
    console.log('   ✅ DDL appliqué (table + index + RLS + realtime).');

    // 1b. Recharger le cache de schéma PostgREST (sinon « Could not find the table … in the schema cache »)
    console.log('   🔄 Rechargement du cache de schéma PostgREST…');
    await runSql("NOTIFY pgrst, 'reload schema';");
    // Laisser le temps au cache de se rafraîchir
    await new Promise((r) => setTimeout(r, 3000));
    console.log('   ✅ Cache rechargé.\n');

    // 2. Charger les disciplines canoniques (JSON dérivé de src/data/disciplines.ts)
    console.log('2️⃣  Chargement des disciplines canoniques…');
    const { readFileSync } = await import('node:fs');
    const raw = readFileSync(new URL('./disciplines_seed.json', import.meta.url), 'utf8');
    const disciplines = JSON.parse(raw);
    console.log(`   ${disciplines.length} disciplines chargées.\n`);

    // 3. Upsert en base
    console.log('3️⃣  Upsert dans site_disciplines…');
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { persistSession: false },
    });

    const rows = disciplines.map((d, idx) => ({
        id: d.id,
        number: d.number,
        name: d.name,
        category: d.category || 'Mouvement & Déplacement',
        level: d.level || 'Tous Niveaux',
        duration: d.duration || null,
        short_desc: d.shortDesc,
        full_desc: d.fullDesc || null,
        objectives: d.objectives || [],
        equipment: d.equipment || [],
        safety_rules: d.safetyRules || [],
        prerequisites: d.prerequisites || [],
        instructor_ids: d.instructorIds || [],
        film_ids: d.filmIds || [],
        program_ids: d.programIds || [],
        order_index: idx,
        is_active: true,
        metadata: { iconName: d.iconName, cinemaContext: d.cinemaContext, heroImage: d.heroImage },
    }));

    const { error } = await supabase.from('site_disciplines').upsert(rows, { onConflict: 'id' });
    if (error) {
        console.error(`   ❌ Upsert échoué : ${error.message}`);
        process.exit(1);
    }
    console.log(`   ✅ ${rows.length} disciplines écrites.\n`);

    // 4. Vérification
    console.log('4️⃣  Vérification de lecture…');
    const { data, error: readErr } = await supabase
        .from('site_disciplines')
        .select('id, number, name, is_active')
        .eq('is_active', true)
        .order('order_index');
    if (readErr) {
        console.error(`   ❌ Lecture échouée : ${readErr.message}`);
        process.exit(1);
    }
    console.log(`   ✅ ${data.length} disciplines actives lues :`);
    for (const d of data) {
        console.log(`      ${d.number} — ${d.name}`);
    }
    console.log('\n✅ Migration site_disciplines terminée.');
}

main().catch((err) => {
    console.error('❌ Erreur fatale :', err.message);
    process.exit(1);
});
