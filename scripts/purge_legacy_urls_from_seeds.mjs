/**
 * Purge des URLs legacy `wp-content` des seeds SQL.
 *
 * Contexte
 * --------
 * Les trois seeds SQL historiques (`setup_complete_vitrine.sql`,
 * `seed_site_vitrine.sql`, `seed_pages_content.sql`) contiennent encore des URLs
 * pointant vers l'ancien site WordPress
 * (`https://www.campus-universcascades.com/wp-content/...`).
 *
 * Or `seed_site_vitrine.sql` est TOUJOURS EXÉCUTÉ par
 * `scripts/execute_setup.mjs` (étape « Injection des Données Initiales ») : ces
 * URLs peuvent donc être réinjectées en base à tout moment et ressusciter la
 * dépendance à l'ancien site. C'est une violation directe de la doctrine
 * « Zéro Texte ni Valeur Orpheline ».
 *
 * Stratégie
 * ---------
 * 1. Les médias rapatriés (photos d'équipe, affiches de films, PDF) sont
 *    réécrits vers Supabase Storage via `scripts/media_url_mapping.json`.
 * 2. Les logos partenaires, absents du mapping (ils vivent dans le dépôt sous
 *    `public/images/partenaires/`), sont réécrits vers leur chemin local.
 * 3. Toute URL `wp-content` non résolue fait ÉCHOUER le script (code 2) : on ne
 *    laisse jamais passer une dépendance legacy silencieuse.
 *
 * Usage
 * -----
 *   node scripts/purge_legacy_urls_from_seeds.mjs [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';

const DRY_RUN = process.argv.includes('--dry-run');

const SEED_FILES = [
    'scripts/setup_complete_vitrine.sql',
    'scripts/seed_site_vitrine.sql',
    'scripts/seed_pages_content.sql',
];

const MAPPING_PATH = 'scripts/media_url_mapping.json';
const PARTNER_DIR = 'public/images/partenaires';

const WP_RE = /https:\/\/www\.campus-universcascades\.com\/wp-content\/[^'"\s)]+/g;

/**
 * Logos partenaires : l'ancien site servait `logo-afdas.png`, `logo-gaumont.png`,
 * etc. Le dépôt les héberge sous `public/images/partenaires/` avec un nom
 * normalisé (`afdas.svg`, `gaumont.svg`, ...). On mappe explicitement pour ne
 * pas dépendre d'une heuristique fragile.
 */
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

function loadMapping() {
    const raw = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf8'));
    const byOriginal = new Map();
    for (const entry of raw.mapping) {
        if (entry.originalUrl) byOriginal.set(entry.originalUrl, entry);
    }
    return byOriginal;
}

function resolveTarget(url, byOriginal) {
    const entry = byOriginal.get(url);
    if (entry) {
        const target = entry.supabaseUrl || entry.publicUrl;
        if (target) return { target, kind: 'supabase' };
    }

    const basename = url.split('/').pop();
    const localName = PARTNER_LOGOS[basename];
    if (localName) {
        const localPath = path.join(PARTNER_DIR, localName);
        if (fs.existsSync(localPath)) {
            return { target: `/images/partenaires/${localName}`, kind: 'local' };
        }
    }

    return null;
}

function main() {
    const byOriginal = loadMapping();
    let totalRewrites = 0;
    const unresolved = [];

    for (const file of SEED_FILES) {
        const original = fs.readFileSync(file, 'utf8');
        let rewritten = original;
        let fileRewrites = 0;

        const urls = [...new Set([...original.matchAll(WP_RE)].map((m) => m[0]))];

        for (const url of urls) {
            const resolved = resolveTarget(url, byOriginal);
            if (!resolved) {
                unresolved.push({ file, url });
                continue;
            }
            const occurrences = rewritten.split(url).length - 1;
            if (occurrences === 0) continue;
            rewritten = rewritten.split(url).join(resolved.target);
            fileRewrites += occurrences;
        }

        if (fileRewrites > 0 && !DRY_RUN) {
            fs.writeFileSync(file, rewritten, 'utf8');
        }

        totalRewrites += fileRewrites;
        console.log(
            `${DRY_RUN ? '[dry-run] ' : ''}${file} : ${fileRewrites} URL(s) réécrite(s)`
        );
    }

    console.log('');
    console.log(
        `Total : ${totalRewrites} occurrence(s) réécrite(s) sur ${SEED_FILES.length} fichier(s)`
    );

    if (unresolved.length > 0) {
        console.error('');
        console.error(`❌ ${unresolved.length} URL(s) legacy non résolue(s) :`);
        for (const u of unresolved) {
            console.error(`   ${u.file} → ${u.url}`);
        }
        process.exit(2);
    }

    console.log('✅ Aucune URL wp-content résiduelle dans les seeds SQL.');
}

main();
