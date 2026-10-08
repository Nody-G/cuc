/**
 * ==============================================================================
 * CUC — Diagnostic : overrides `site_pages` vs constantes canoniques
 * ==============================================================================
 * Vérifie si des lignes `site_pages` existent pour les slugs donnés et si leur
 * `hero.title` / `meta_title` divergent des valeurs par défaut du code.
 *
 * Une ligne `site_pages` NON NULLE écrase le défaut de `site-service.ts` :
 * c'est la cause classique d'un « changement invisible » en production.
 *
 * Usage : node scripts/inspect_page_content_overrides.mjs [slug...]
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

const slugs = process.argv.slice(2);
const targets = slugs.length > 0 ? slugs : ['equipe-cascadeurs-pro', 'cuc-team-cascadeur'];

async function main() {
    console.log('— Diagnostic des overrides site_pages —\n');

    const { data, error } = await supabase
        .from('site_pages')
        .select('slug, title, meta_title, hero, is_published, updated_at')
        .in('slug', targets);

    if (error) {
        console.error('❌ Lecture site_pages :', error.message);
        process.exit(1);
    }

    if (!data || data.length === 0) {
        console.log('ℹ️  Aucune ligne site_pages pour ces slugs → les défauts du code s’appliquent.');
        return;
    }

    for (const row of data) {
        console.log(`• ${row.slug}`);
        console.log(`    title      : ${row.title ?? '(null)'}`);
        console.log(`    meta_title : ${row.meta_title ?? '(null)'}`);
        console.log(`    hero.title : ${row.hero?.title ?? '(null)'}`);
        console.log(`    hero.badge : ${row.hero?.badge ?? '(null)'}`);
        console.log(`    published  : ${row.is_published}  (maj ${row.updated_at ?? '?'})`);
        console.log('');
    }

    console.log('⚠️  Toute valeur NON NULLE ci-dessus écrase le défaut du code.');
}

main().catch((err) => {
    console.error('Erreur inattendue :', err);
    process.exit(1);
});
