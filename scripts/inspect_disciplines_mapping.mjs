/**
 * INSPECTION DU MAPPING site_disciplines ↔ evaluation_disciplines
 * ==============================================================
 *
 * Objectif : déterminer si un appariement RÉEL existe entre les 10 disciplines
 * du site vitrine (`site_disciplines`) et les disciplines d'évaluation de
 * CUC Sign (`evaluation_disciplines`).
 *
 * Doctrine (AGENTS.md) : « Interconnexion Bidirectionnelle Maximale ».
 * Un lien FAUX est pire qu'aucun lien — on n'écrit rien sans preuve.
 *
 * Ce script est en LECTURE SEULE. Il affiche :
 *   - le schéma réel des deux tables (colonnes)
 *   - le contenu intégral de `evaluation_disciplines`
 *   - le contenu de `site_disciplines` (nom + catégorie + niveau)
 *   - la matrice d'appariement par nom normalisé
 *
 * Usage : node scripts/inspect_disciplines_mapping.mjs
 */
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split('.')[0];

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
});

/** Normalise un libellé pour comparaison souple (accents, casse, ponctuation). */
function norm(s) {
    return String(s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

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
    console.log('🔍 Inspection du mapping site_disciplines ↔ evaluation_disciplines\n');

    // 1. Schéma réel des deux tables
    console.log('── Schéma `evaluation_disciplines` ──');
    const evalCols = await runSql(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'evaluation_disciplines'
        ORDER BY ordinal_position;
    `);
    console.table(evalCols);

    console.log('\n── Schéma `site_disciplines` ──');
    const siteCols = await runSql(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'site_disciplines'
        ORDER BY ordinal_position;
    `);
    console.table(siteCols);

    // 2. Contenu de evaluation_disciplines
    console.log('\n── Contenu `evaluation_disciplines` ──');
    const evalRows = await runSql(`SELECT * FROM public.evaluation_disciplines ORDER BY name;`);
    console.log(`   ${evalRows.length} ligne(s)`);
    console.table(evalRows);

    // 3. Contenu de site_disciplines
    console.log('\n── Contenu `site_disciplines` ──');
    const { data: siteRows, error } = await supabase
        .from('site_disciplines')
        .select('id, number, name, category, level, is_active')
        .order('order_index');
    if (error) throw new Error(`site_disciplines : ${error.message}`);
    console.log(`   ${siteRows.length} ligne(s)`);
    console.table(siteRows);

    // 4. Matrice d'appariement
    console.log('\n── Appariement par nom normalisé ──');
    const evalKeys = new Map(evalRows.map((d) => [norm(d.name), d]));
    let matched = 0;
    for (const d of siteRows) {
        const hit = evalKeys.get(norm(d.name));
        if (hit) matched++;
        console.log(
            `${hit ? '✅' : '❌'} ${d.name.padEnd(38)} → ${hit ? `${hit.name} (${hit.id})` : 'AUCUN'}`,
        );
    }
    console.log(`\n📊 ${matched}/${siteRows.length} disciplines appariées par nom exact normalisé.`);

    // 5. Pistes d'appariement souple (mots-clés communs)
    console.log('\n── Pistes d\'appariement souple (mots-clés partagés) ──');
    for (const d of siteRows) {
        const siteWords = new Set(norm(d.name).split(' ').filter((w) => w.length > 3));
        const candidates = evalRows.filter((e) => {
            const evalWords = norm(e.name).split(' ').filter((w) => w.length > 3);
            return evalWords.some((w) => siteWords.has(w));
        });
        if (candidates.length) {
            console.log(
                `   ${d.name} → ${candidates.map((c) => c.name).join(' | ')}`,
            );
        }
    }
}

main().catch((err) => {
    console.error('❌ Erreur fatale :', err.message);
    process.exit(1);
});
