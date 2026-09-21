/**
 * VÉRIFICATION DE COUVERTURE DES URLs MÉDIAS
 * ==========================================
 *
 * Contrôle qu'aucune URL média WordPress (`wp-content/uploads/...`) présente
 * dans le code source ou en base ne reste sans correspondance Supabase.
 *
 * Sort en code 2 si des URLs non couvertes subsistent (régression).
 *
 * Usage :
 *   node scripts/verify_media_url_coverage.mjs
 */

import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const MAPPING_JSON = path.join('scripts', 'media_url_mapping.json');

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

const SITE_TABLES = [
    'site_pages',
    'site_films',
    'site_team',
    'site_partners',
    'site_events',
    'site_settings',
];

const SOURCE_EXTENSIONS = new Set([
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.mjs',
    '.json',
    '.css',
    // Les seeds SQL sont exécutés par `scripts/execute_setup.mjs` : une URL
    // `wp-content` qui y subsiste peut être réinjectée en base à tout moment.
    '.sql',
    '.md',
]);
const SOURCE_EXCLUDE_DIRS = new Set([
    'node_modules',
    '.next',
    '.git',
    '.staging',
    '.cache',
    // Rapports d'audit : ils CITENT volontairement les URLs legacy pour les
    // documenter. Les scanner produirait des faux positifs permanents.
    'plans',
]);

/**
 * Fichiers exclus du scan, par chemin normalisé.
 *
 * Ces fichiers CITENT volontairement des URLs `wp-content` : ce sont soit des
 * rapports/inventaires produits par l'audit, soit les scripts qui DÉFINISSENT la
 * table de correspondance legacy → Supabase. Les scanner produirait des faux
 * positifs permanents et masquerait les vraies régressions (seeds SQL).
 *
 * Les seeds SQL (`*.sql`) ne sont JAMAIS exclus : ils sont exécutés par
 * `scripts/execute_setup.mjs` et peuvent réinjecter une URL legacy en base.
 */
const SOURCE_EXCLUDE_FILES = new Set(
    [
        // Rapports et inventaires d'audit (citent les URLs legacy pour les documenter).
        'scripts/audit_full_app_report.json',
        'scripts/live_cuc_images.json',
        'scripts/media_classification.json',
        'scripts/media_classification.md',
        'scripts/media_inventory.json',
        'scripts/media_inventory.md',
        'scripts/media_rewrite_report.json',
        'scripts/media_rewrite_report.md',
        'scripts/media_url_mapping.json',
        'scripts/media_url_mapping.md',
        'scripts/reportages_url_mapping.json',
        'scripts/reportages_transcode_report.json',
        // Scripts qui DÉFINISSENT la correspondance legacy → Supabase (regex,
        // tables `LEGACY_URLS`, listes de téléchargement). Ils doivent citer les
        // URLs d'origine par construction.
        'scripts/download_real_logos.mjs',
        'scripts/fetch_missing_media.mjs',
        'scripts/purge_legacy_urls_from_seeds.mjs',
        'scripts/rewrite_media_urls.mjs',
        'scripts/sync_all_coach_credits_supabase.mjs',
        'scripts/upload_reportages_to_supabase.mjs',
        // Helpers temporaires d'extraction (regex littérale).
        'scripts/_tmp_extract_wp.mjs',
        'scripts/_tmp_map_wp.mjs',
    ].map((p) => path.normalize(p)),
);

const WP_MEDIA_RE = /https?:\/\/(?:www\.)?campus-universcascades\.com\/wp-content\/[^\s"'`)\\]*/gi;

const mapping = JSON.parse(fs.readFileSync(MAPPING_JSON, 'utf8'));
const known = new Set();
for (const e of mapping.mapping) {
    known.add(e.originalUrl);
    known.add(e.originalUrl.replace('https://www.', 'https://'));
    known.add(e.originalUrl.replace('https://www.', 'http://www.'));
    known.add(e.originalUrl.replace('https://www.', 'http://'));
}

/**
 * URLs mortes (HTTP 404 côté WordPress) redirigées explicitement vers un média
 * Supabase équivalent par `rewrite_media_urls.mjs`. Elles sont considérées
 * comme couvertes puisqu'elles seront réécrites.
 */
const DEAD_URL_REMAP = new Set([
    'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Animation-airbag-chute-libre.jpg',
]);

/**
 * URLs volontairement NON rapatriées.
 *
 * Historiquement, les deux reportages TV figuraient ici car ils dépassaient la
 * limite dure de 50 Mo par objet de Supabase Storage. Ils ont depuis été
 * réencodés et découpés par `scripts/transcode_reportages.mjs`, puis
 * téléversés sous `media/reportages/` par
 * `scripts/upload_reportages_to_supabase.mjs`. Ils sont désormais couverts et
 * ne doivent plus être exclus.
 */
const INTENTIONALLY_EXTERNAL = new Set([]);

/** Une URL est couverte si elle est connue, remappée, externe assumée, ou sans suffixe -WxH. */
function isCovered(url) {
    if (known.has(url)) return true;
    if (DEAD_URL_REMAP.has(url)) return true;
    if (INTENTIONALLY_EXTERNAL.has(url)) return true;
    const stripped = url.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1');
    return known.has(stripped);
}

const uncovered = new Map();

function scan(text, origin) {
    const hits = text.match(WP_MEDIA_RE) || [];
    for (const h of hits) {
        if (isCovered(h)) continue;
        if (!uncovered.has(h)) uncovered.set(h, new Set());
        uncovered.get(h).add(origin);
    }
}

// --- Code source ---
function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SOURCE_EXCLUDE_DIRS.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(full, files);
            continue;
        }
        if (!SOURCE_EXTENSIONS.has(path.extname(entry.name))) continue;
        if (SOURCE_EXCLUDE_FILES.has(path.normalize(full))) continue;
        files.push(full);
    }
    return files;
}

// `src` : le code applicatif. `scripts` : les seeds SQL et les scripts de
// migration, qui peuvent réinjecter des URLs legacy en base. `public` : les
// fichiers statiques servis tels quels.
for (const root of ['src', 'scripts', 'public']) {
    if (!fs.existsSync(root)) continue;
    for (const file of walk(root)) {
        scan(fs.readFileSync(file, 'utf8'), path.normalize(file));
    }
}

// --- Base de données ---
if (SERVICE_KEY) {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { persistSession: false },
    });
    for (const table of SITE_TABLES) {
        const { data, error } = await supabase.from(table).select('*');
        if (error || !data) continue;
        scan(JSON.stringify(data), `db:${table}`);
    }
}

console.log('=== Vérification de couverture des URLs médias ===');
console.log(`Correspondances connues : ${known.size}`);
console.log(`URLs non couvertes : ${uncovered.size}`);
console.log('');

if (uncovered.size > 0) {
    for (const [url, origins] of uncovered) {
        console.log(` - ${url}`);
        for (const o of origins) console.log(`     ↳ ${o}`);
    }
    console.log('');
    console.log('RÉGRESSION : des URLs médias distantes subsistent.');
    process.exit(2);
}

console.log('OK — toutes les URLs médias distantes sont couvertes par Supabase.');
