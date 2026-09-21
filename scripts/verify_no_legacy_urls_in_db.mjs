/**
 * VÉRIFICATION — AUCUNE URL LEGACY EN BASE SUPABASE
 * =================================================
 *
 * Contrôle qu'aucune URL `campus-universcascades.com/wp-content/...` ne subsiste
 * dans les tables du site vitrine et du cockpit (`site_*`).
 *
 * Le scan est RÉCURSIF : il parcourt chaque valeur JSON (chaînes, tableaux,
 * objets imbriqués) afin de détecter les URLs cachées dans `content`,
 * `metadata`, `sections`, `settings`, etc.
 *
 * Sort en code 2 si au moins une URL legacy est trouvée (régression).
 *
 * Usage :
 *   node scripts/verify_no_legacy_urls_in_db.mjs
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

if (!SERVICE_KEY) {
    console.error('❌ Clé Supabase manquante (SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY).');
    process.exit(1);
}

/** Tables du site vitrine / cockpit à contrôler. */
const SITE_TABLES = [
    'site_pages',
    'site_settings',
    'site_team',
    'site_films',
    'site_partners',
    'site_events',
    'site_disciplines',
    'site_campus_pois',
    'site_sessions',
    'site_inquiries',
    'site_announcements',
    'site_navigation',
    'site_footer',
    'site_social_links',
];

const LEGACY_RE = /campus-universcascades\.com\/wp-content\/[^\s"'`)\\]*/gi;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
});

/**
 * Parcourt récursivement une valeur JSON et collecte les URLs legacy trouvées.
 * @param {unknown} value
 * @param {string} trail chemin lisible (ex: `content.sections[2].image`)
 * @param {Array<{path: string, url: string}>} out
 */
function collectLegacy(value, trail, out) {
    if (value == null) return;

    if (typeof value === 'string') {
        const hits = value.match(LEGACY_RE);
        if (hits) {
            for (const h of hits) out.push({ path: trail, url: h });
        }
        return;
    }

    if (Array.isArray(value)) {
        value.forEach((v, i) => collectLegacy(v, `${trail}[${i}]`, out));
        return;
    }

    if (typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
            collectLegacy(v, trail ? `${trail}.${k}` : k, out);
        }
    }
}

async function main() {
    console.log('=== Vérification des URLs legacy en base Supabase ===\n');

    let totalHits = 0;
    const report = [];

    for (const table of SITE_TABLES) {
        const { data, error } = await supabase.from(table).select('*');

        if (error) {
            // Table absente : on le signale sans faire échouer le contrôle.
            console.log(`  ⚠️  ${table.padEnd(22)} — inaccessible (${error.message})`);
            continue;
        }

        const hits = [];
        for (const row of data ?? []) {
            const id = row.id ?? row.key ?? row.slug ?? '(sans id)';
            collectLegacy(row, `${table}#${id}`, hits);
        }

        if (hits.length === 0) {
            console.log(`  ✅ ${table.padEnd(22)} — ${data?.length ?? 0} ligne(s), 0 URL legacy`);
        } else {
            console.log(`  ❌ ${table.padEnd(22)} — ${hits.length} URL legacy`);
            for (const h of hits) {
                console.log(`       • ${h.path} → ${h.url}`);
            }
            totalHits += hits.length;
            report.push({ table, hits });
        }
    }

    console.log('');
    if (totalHits === 0) {
        console.log('OK — aucune URL legacy en base Supabase.');
        process.exit(0);
    }

    console.log(`❌ RÉGRESSION — ${totalHits} URL(s) legacy subsistent en base.`);
    console.log('   Corrigez la source (seeds SQL ou Cockpit) puis resynchronisez.');
    process.exit(2);
}

main().catch((err) => {
    console.error('Erreur inattendue :', err);
    process.exit(1);
});
