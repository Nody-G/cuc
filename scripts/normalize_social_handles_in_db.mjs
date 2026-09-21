#!/usr/bin/env node
/**
 * Normalisation des handles sociaux en base Supabase.
 *
 * Doctrine « Zéro Texte ni Valeur Orpheline » : les handles sociaux doivent
 * être identiques partout (code + base). Source de vérité :
 *   src/data/navigation.ts → DEFAULT_SOCIAL_LINKS
 *
 *   - Instagram / Facebook : @campus.univers.cascades  (avec points)
 *   - YouTube / TikTok     : @campusuniverscascades    (sans point)
 *
 * Corrige les occurrences divergentes dans :
 *   - site_settings (clé `contact`, `social`, `footer`…)
 *   - site_pages    (sections JSON contenant des URLs sociales)
 *
 * Usage :
 *   node scripts/normalize_social_handles_in_db.mjs --dry-run
 *   node scripts/normalize_social_handles_in_db.mjs
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const DRY_RUN = process.argv.includes('--dry-run');

const SUPABASE_URL =
    process.env.SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SERVICE_KEY) {
    console.error('❌ Clé Supabase manquante (SUPABASE_SERVICE_ROLE_KEY).');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
});

/**
 * Réécritures canoniques : toute variante divergente → valeur officielle.
 * L'ordre importe peu (les motifs sont disjoints).
 */
const REWRITES = [
    // TikTok : handle officiel SANS point
    [
        /https:\/\/www\.tiktok\.com\/@campus\.univers\.cascades/g,
        'https://www.tiktok.com/@campusuniverscascades',
    ],
    // Instagram : handle officiel AVEC points
    [
        /https:\/\/www\.instagram\.com\/campusuniverscascades\/?/g,
        'https://www.instagram.com/campus.univers.cascades/',
    ],
    // Facebook : handle officiel AVEC points
    [
        /https:\/\/www\.facebook\.com\/campusuniverscascades\/?/g,
        'https://www.facebook.com/campus.univers.cascades/',
    ],
];

/** Applique les réécritures à une chaîne ; renvoie null si inchangée. */
function rewriteString(str) {
    let out = str;
    for (const [re, to] of REWRITES) out = out.replace(re, to);
    return out === str ? null : out;
}

/** Applique les réécritures récursivement à une valeur JSON. */
function rewriteValue(value) {
    if (typeof value === 'string') return rewriteString(value);
    if (Array.isArray(value)) {
        let changed = false;
        const next = value.map((v) => {
            const r = rewriteValue(v);
            if (r !== null) changed = true;
            return r === null ? v : r;
        });
        return changed ? next : null;
    }
    if (value && typeof value === 'object') {
        let changed = false;
        const next = {};
        for (const [k, v] of Object.entries(value)) {
            const r = rewriteValue(v);
            if (r !== null) changed = true;
            next[k] = r === null ? v : r;
        }
        return changed ? next : null;
    }
    return null;
}

async function main() {
    console.log(
        `🔎 Normalisation des handles sociaux en base${DRY_RUN ? ' (DRY-RUN)' : ''}…\n`
    );

    let totalRows = 0;
    let totalRewrites = 0;

    // ---- site_settings -------------------------------------------------------
    const { data: settings, error: sErr } = await supabase
        .from('site_settings')
        .select('key,value');
    if (sErr) {
        console.error('❌ site_settings :', sErr.message);
        process.exit(1);
    }

    for (const row of settings || []) {
        const next = rewriteValue(row.value);
        if (next === null) continue;
        totalRows++;
        totalRewrites++;
        console.log(`  • site_settings[${row.key}]`);
        if (!DRY_RUN) {
            const { error } = await supabase
                .from('site_settings')
                .update({ value: next })
                .eq('key', row.key);
            if (error) console.error(`    ❌ ${error.message}`);
            else console.log('    ✅ mis à jour');
        }
    }

    // ---- site_pages ----------------------------------------------------------
    const { data: pages, error: pErr } = await supabase
        .from('site_pages')
        .select('slug,sections');
    if (pErr) {
        console.error('❌ site_pages :', pErr.message);
        process.exit(1);
    }

    for (const row of pages || []) {
        const next = rewriteValue(row.sections);
        if (next === null) continue;
        totalRows++;
        totalRewrites++;
        console.log(`  • site_pages[${row.slug}]`);
        if (!DRY_RUN) {
            const { error } = await supabase
                .from('site_pages')
                .update({ sections: next })
                .eq('slug', row.slug);
            if (error) console.error(`    ❌ ${error.message}`);
            else console.log('    ✅ mis à jour');
        }
    }

    console.log(
        `\n${DRY_RUN ? '🧪 DRY-RUN' : '✅'} ${totalRewrites} ligne(s) à corriger / corrigée(s).`
    );
}

main().catch((e) => {
    console.error('❌ Erreur fatale :', e);
    process.exit(1);
});
