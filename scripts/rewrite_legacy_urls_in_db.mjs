/**
 * ==============================================================================
 * ⚠️  SCRIPT HISTORIQUE — NE PAS RELANCER TEL QUEL
 * ==============================================================================
 * Ce script réécrit les URLs `wp-content` en base. La réécriture a été appliquée
 * (15 lignes, 161 remplacements) et la base vérifiée propre
 * (`node scripts/verify_no_legacy_urls_in_db.mjs` → 0 URL legacy).
 * Conservé pour traçabilité (doctrine : marquer plutôt que supprimer).
 * ==============================================================================
 *
 * RÉÉCRITURE DES URLs LEGACY EN BASE SUPABASE
 * ===========================================
 *
 * Les seeds SQL ont été purgés, mais les lignes DÉJÀ présentes en base
 * conservent les URLs `campus-universcascades.com/wp-content/...` injectées
 * avant la purge. Ce script réécrit ces URLs **en place**, récursivement, dans
 * les tables `site_*`.
 *
 * Correspondances :
 *   1. `scripts/media_url_mapping.json` (originalUrl → publicUrl Supabase).
 *   2. `PARTNER_LOGOS` (logos partenaires → `/images/partenaires/*.svg|png`).
 *
 * Les URLs mortes connues (`DEAD_URL_REMAP`) sont également réécrites.
 *
 * Usage :
 *   node scripts/rewrite_legacy_urls_in_db.mjs --dry-run   # simulation
 *   node scripts/rewrite_legacy_urls_in_db.mjs             # application
 */

import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const DRY_RUN = process.argv.includes('--dry-run');

const MAPPING_JSON = path.join('scripts', 'media_url_mapping.json');

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

if (!SERVICE_KEY) {
    console.error('❌ Clé Supabase manquante.');
    process.exit(1);
}

/** Tables à réécrire, avec leur clé primaire. */
const TABLES = [
    { name: 'site_pages', pk: 'slug' },
    { name: 'site_settings', pk: 'key' },
    { name: 'site_team', pk: 'id' },
    { name: 'site_films', pk: 'id' },
    { name: 'site_partners', pk: 'id' },
    { name: 'site_events', pk: 'id' },
    { name: 'site_campus_pois', pk: 'id' },
    { name: 'site_sessions', pk: 'id' },
    { name: 'site_announcements', pk: 'id' },
    { name: 'site_navigation', pk: 'id' },
    { name: 'site_footer', pk: 'id' },
    { name: 'site_social_links', pk: 'id' },
];

/**
 * Regex SANS flag `g` : utilisée pour les tests (`test()`), afin d'éviter tout
 * état résiduel `lastIndex` qui ferait manquer des correspondances.
 */
const LEGACY_TEST_RE = /https?:\/\/(?:www\.)?campus-universcascades\.com\/wp-content\/[^\s"'`)\\]*/i;

/** Regex AVEC flag `g` : utilisée uniquement pour `replace()`. */
const LEGACY_RE = /https?:\/\/(?:www\.)?campus-universcascades\.com\/wp-content\/[^\s"'`)\\]*/gi;

/** Logos partenaires : pas d'équivalent Supabase, servis en local. */
const PARTNER_LOGOS = {
    'logo-afdas.png': 'afdas.svg',
    'logo-europacorp.png': 'europacorp.svg',
    'logo-gaumont.png': 'gaumont.svg',
    'logo-pathe.png': 'pathe.svg',
    'logo-pole-emploi.png': 'france-travail.svg',
    'logo-region.png': 'hauts-de-france.svg',
    'logo-studiocanal.png': 'studiocanal.png',
    'qualiopi.png': 'qualiopi.png',
};

/** URLs mortes (404 WordPress) remappées explicitement. */
const DEAD_URL_REMAP = {
    'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Animation-airbag-chute-libre.jpg':
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Animation-airbag-chute-libre.jpg',
};

// --- Construction de la table de correspondance ---
const mapping = JSON.parse(fs.readFileSync(MAPPING_JSON, 'utf8'));
const byOriginal = new Map();
for (const e of mapping.mapping) {
    if (e.status !== 'uploaded' || !e.publicUrl) continue;
    byOriginal.set(e.originalUrl, e.publicUrl);
    // Variantes de protocole / www.
    byOriginal.set(e.originalUrl.replace('https://www.', 'https://'), e.publicUrl);
    byOriginal.set(e.originalUrl.replace('https://www.', 'http://www.'), e.publicUrl);
    byOriginal.set(e.originalUrl.replace('https://www.', 'http://'), e.publicUrl);
}

/**
 * Résout une URL legacy vers sa cible Supabase ou locale.
 * @param {string} url
 * @returns {string|null}
 */
function resolveTarget(url) {
    if (byOriginal.has(url)) return byOriginal.get(url);
    if (DEAD_URL_REMAP[url]) return DEAD_URL_REMAP[url];

    // Suffixe de taille WordPress `-1024x768` : on retente sans.
    const stripped = url.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1');
    if (stripped !== url && byOriginal.has(stripped)) return byOriginal.get(stripped);

    // Logos partenaires → fichiers locaux.
    const base = url.split('/').pop();
    if (base && PARTNER_LOGOS[base]) return `/images/partenaires/${PARTNER_LOGOS[base]}`;

    return null;
}

const unresolved = new Set();
let rewriteCount = 0;

/**
 * Réécrit récursivement une valeur JSON. Retourne la valeur transformée.
 * @param {unknown} value
 * @returns {unknown}
 */
function rewriteValue(value) {
    if (typeof value === 'string') {
        if (!LEGACY_TEST_RE.test(value)) return value;
        return value.replace(LEGACY_RE, (match) => {
            const target = resolveTarget(match);
            if (!target) {
                unresolved.add(match);
                return match;
            }
            rewriteCount++;
            return target;
        });
    }

    if (Array.isArray(value)) return value.map(rewriteValue);

    if (value && typeof value === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(value)) out[k] = rewriteValue(v);
        return out;
    }

    return value;
}

/** Détecte si une valeur contient au moins une URL legacy. */
function hasLegacy(value) {
    if (typeof value === 'string') {
        return LEGACY_TEST_RE.test(value);
    }
    if (Array.isArray(value)) return value.some(hasLegacy);
    if (value && typeof value === 'object') return Object.values(value).some(hasLegacy);
    return false;
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
});

async function main() {
    console.log(`=== Réécriture des URLs legacy en base ${DRY_RUN ? '(DRY-RUN)' : ''} ===\n`);

    let rowsUpdated = 0;

    for (const { name, pk } of TABLES) {
        const { data, error } = await supabase.from(name).select('*');
        if (error) {
            console.log(`  ⚠️  ${name.padEnd(22)} — inaccessible (${error.message})`);
            continue;
        }

        let tableUpdates = 0;

        for (const row of data ?? []) {
            // On ne réécrit que les colonnes contenant réellement une URL legacy.
            const patch = {};
            for (const [col, val] of Object.entries(row)) {
                if (col === pk) continue;
                if (!hasLegacy(val)) continue;
                patch[col] = rewriteValue(val);
            }

            if (Object.keys(patch).length === 0) continue;

            tableUpdates++;
            if (DRY_RUN) continue;

            const { error: upErr } = await supabase
                .from(name)
                .update(patch)
                .eq(pk, row[pk]);

            if (upErr) {
                console.error(`  ❌ ${name}#${row[pk]} — ${upErr.message}`);
                continue;
            }
            rowsUpdated++;
        }

        if (tableUpdates === 0) {
            console.log(`  ✅ ${name.padEnd(22)} — 0 ligne à réécrire`);
        } else {
            console.log(
                `  ${DRY_RUN ? '🔎' : '✏️'}  ${name.padEnd(22)} — ${tableUpdates} ligne(s) ${DRY_RUN ? 'à réécrire' : 'réécrite(s)'}`,
            );
        }
    }

    console.log('');
    console.log(`Occurrences réécrites : ${rewriteCount}`);
    if (!DRY_RUN) console.log(`Lignes mises à jour   : ${rowsUpdated}`);

    if (unresolved.size > 0) {
        console.log(`\n❌ ${unresolved.size} URL(s) non résolue(s) :`);
        for (const u of unresolved) console.log(`   • ${u}`);
        process.exit(2);
    }

    console.log('\nOK — aucune URL legacy non résolue.');
}

main().catch((err) => {
    console.error('Erreur inattendue :', err);
    process.exit(1);
});
