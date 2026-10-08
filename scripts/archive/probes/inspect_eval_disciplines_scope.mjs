/**
 * INSPECTION DE LA PORTÉE DE evaluation_disciplines
 * =================================================
 *
 * Question : `evaluation_disciplines` est-elle une table de RÉFÉRENTIEL
 * (catalogue global de disciplines) ou une table d'INSTANCE (disciplines
 * évaluées dans une session donnée) ?
 *
 * Le schéma montre une colonne `session_id NOT NULL` + `coach_id` + `order_index`,
 * ce qui suggère fortement une table d'instance. Ce script le confirme :
 *   - combien de sessions distinctes portent des disciplines
 *   - si les mêmes noms de disciplines se répètent d'une session à l'autre
 *   - la structure de la table `sessions` (référentiel des sessions CUC Sign)
 *
 * LECTURE SEULE.
 *
 * Usage : node scripts/inspect_eval_disciplines_scope.mjs
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
    console.log('🔍 Portée de evaluation_disciplines\n');

    console.log('── Nombre de sessions distinctes portant des disciplines ──');
    console.table(
        await runSql(`
            SELECT COUNT(DISTINCT session_id) AS sessions_distinctes,
                   COUNT(*) AS lignes_total,
                   COUNT(DISTINCT name) AS noms_distincts
            FROM public.evaluation_disciplines;
        `)
    );

    console.log('\n── Répartition par session ──');
    console.table(
        await runSql(`
            SELECT session_id, COUNT(*) AS nb_disciplines,
                   string_agg(name, ', ' ORDER BY order_index) AS disciplines
            FROM public.evaluation_disciplines
            GROUP BY session_id
            ORDER BY nb_disciplines DESC;
        `)
    );

    console.log('\n── Schéma de la table `sessions` (référentiel CUC Sign) ──');
    console.table(
        await runSql(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'sessions'
            ORDER BY ordinal_position;
        `)
    );

    console.log('\n── Contenu de `sessions` ──');
    console.table(
        await runSql(`
            SELECT id, name, created_at
            FROM public.sessions
            ORDER BY created_at DESC
            LIMIT 20;
        `)
    );

    console.log('\n── Autres tables de référentiel de disciplines ? ──');
    console.table(
        await runSql(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND (table_name ILIKE '%discipline%' OR table_name ILIKE '%categor%')
            ORDER BY table_name;
        `)
    );
}

main().catch((err) => {
    console.error('❌ Erreur fatale :', err.message);
    process.exit(1);
});
