/**
 * ==============================================================================
 * CUC — Application : renommage « L'équipe » / « Tournage » dans site_pages
 * ==============================================================================
 * Les lignes `site_pages` de `equipe-cascadeurs-pro` et `cuc-team-cascadeur`
 * portent d'ANCIENS libellés qui écrasent les défauts du code. Ce script met à
 * jour UNIQUEMENT les champs éditoriaux concernés (title, meta_title, hero),
 * sans toucher aux `layout_sections`, `sections_data` ni à l'état de publication.
 *
 * Idempotent : ré-exécutable sans effet de bord.
 *
 * Usage : node scripts/apply_nav_rename_page_content.mjs
 * ==============================================================================
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

function loadEnv() {
    try {
        const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
        for (const line of raw.split(/\r?\n/)) {
            const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
            if (m && !process.env[m[1]]) {
                process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
            }
        }
    } catch {
        /* environnement déjà fourni */
    }
}
loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('Variables manquantes : NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const UPDATES = [
    {
        slug: 'equipe-cascadeurs-pro',
        title: "L'équipe",
        meta_title: "L'équipe | Coachs & Professionnels du Cinéma — Campus Univers Cascades",
        hero: {
            badge: 'COACHS & PROFESSIONNELS DU CINÉMA',
            title: "L'ÉQUIPE",
        },
    },
    {
        slug: 'cuc-team-cascadeur',
        title: 'Tournage',
        meta_title: 'Tournage | CUC Stunt Team & Coordination de Cascades',
        hero: {
            badge: 'COORDINATION DE CASCADES • CINÉMA',
            title: 'TOURNAGE',
        },
    },
];

async function main() {
    console.log('— Renommage des pages « L’équipe » / « Tournage » —\n');

    for (const upd of UPDATES) {
        const { data: existing, error: readError } = await supabase
            .from('site_pages')
            .select('slug, hero')
            .eq('slug', upd.slug)
            .maybeSingle();

        if (readError) {
            console.error(`❌ Lecture ${upd.slug} :`, readError.message);
            process.exit(1);
        }

        if (!existing) {
            console.log(`ℹ️  ${upd.slug} : aucune ligne site_pages → défauts du code appliqués.`);
            continue;
        }

        // Fusion : on ne remplace que les clés éditoriales, on préserve le reste du hero.
        const mergedHero = { ...(existing.hero ?? {}), ...upd.hero };

        const { error: writeError } = await supabase
            .from('site_pages')
            .update({
                title: upd.title,
                meta_title: upd.meta_title,
                hero: mergedHero,
                updated_at: new Date().toISOString(),
            })
            .eq('slug', upd.slug);

        if (writeError) {
            console.error(`❌ Écriture ${upd.slug} :`, writeError.message);
            process.exit(1);
        }

        console.log(`✅ ${upd.slug} → title="${upd.title}" hero.title="${upd.hero.title}"`);
    }

    // Contrôle de non-régression.
    const { data: check } = await supabase
        .from('site_pages')
        .select('slug, title, hero')
        .in('slug', UPDATES.map((u) => u.slug));

    console.log('\n— Contrôle de non-régression —');
    let ok = true;
    for (const row of check ?? []) {
        const expected = UPDATES.find((u) => u.slug === row.slug);
        const match = row.title === expected.title && row.hero?.title === expected.hero.title;
        if (!match) ok = false;
        console.log(`  ${row.slug}: title="${row.title}" hero.title="${row.hero?.title}" ${match ? '✅' : '❌'}`);
    }

    if (!ok) {
        console.error('\n❌ Régression : site_pages ne reflète pas les nouveaux libellés.');
        process.exit(2);
    }

    console.log('\n✅ site_pages aligné sur les nouveaux libellés.');
}

main().catch((err) => {
    console.error('Erreur inattendue :', err);
    process.exit(1);
});
