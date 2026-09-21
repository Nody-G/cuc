/**
 * ⚠️ SCRIPT HISTORIQUE — NE PAS RELANCER TEL QUEL
 * ================================================
 * Ce script a servi à la réécriture initiale des URLs WordPress vers Supabase
 * Storage (37 fichiers source, 310 remplacements ; 15 lignes en base, 161
 * remplacements — cf. `scripts/media_rewrite_report.md`). La réécriture est
 * TERMINÉE : la base ne contient plus aucune URL `wp-content` (vérifié par
 * `scripts/verify_no_legacy_urls_in_db.mjs`). Conservé pour traçabilité.
 *
 * RÉÉCRITURE DES URLs MÉDIAS DISTANTES → SUPABASE STORAGE
 * ======================================================
 *
 * Lit `scripts/media_url_mapping.json` (produit par
 * `upload_media_to_supabase.mjs`) et remplace, partout, les anciennes URLs
 * WordPress (`https://www.campus-universcascades.com/wp-content/uploads/...`)
 * par leur nouvelle URL publique Supabase.
 *
 * Deux cibles :
 *   1. BASE DE DONNÉES — tables `site_*` (colonnes JSONB et texte).
 *   2. CODE SOURCE — fichiers sous `src/` (données de repli / valeurs par défaut).
 *
 * GARDE-FOUS (ne JAMAIS réécrire) :
 *   - `SITE_URL` canonique (`src/lib/seo.ts`) : c'est le domaine du site, pas un média.
 *   - Les adresses e-mail (`@campus-universcascades.com`).
 *   - Les liens de navigation internes (`/wp-content/...` sans domaine) : ils
 *     pointent vers des ressources servies localement, on ne les touche pas.
 *
 * Idempotent : une URL déjà migrée n'est pas retouchée.
 *
 * Usage :
 *   node scripts/rewrite_media_urls.mjs --dry-run   # rapport seul, n'écrit rien
 *   node scripts/rewrite_media_urls.mjs --db        # base de données uniquement
 *   node scripts/rewrite_media_urls.mjs --src       # code source uniquement
 *   node scripts/rewrite_media_urls.mjs             # les deux
 */

import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const MAPPING_JSON = path.join('scripts', 'media_url_mapping.json');
const REPORT_JSON = path.join('scripts', 'media_rewrite_report.json');
const REPORT_MD = path.join('scripts', 'media_rewrite_report.md');

const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_DB = process.argv.includes('--db');
const ONLY_SRC = process.argv.includes('--src');
const DO_DB = ONLY_DB || (!ONLY_DB && !ONLY_SRC);
const DO_SRC = ONLY_SRC || (!ONLY_DB && !ONLY_SRC);

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';

const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

/** Tables du site vitrine à balayer (colonnes JSONB et texte). */
const SITE_TABLES = [
    'site_pages',
    'site_films',
    'site_team',
    'site_partners',
    'site_events',
    'site_settings',
    'site_disciplines',
    'site_campus_pois',
    'site_navigation',
    'site_footer',
    'site_social_links',
];

/** Fichiers source à NE JAMAIS réécrire (domaine canonique, pas un média). */
const SOURCE_EXCLUDE_FILES = new Set([
    path.normalize('src/lib/seo.ts'),
    path.normalize('src/app/robots.ts'),
    path.normalize('src/app/sitemap.ts'),
]);

/** Extensions de fichiers source balayées. */
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.css']);

/** Dossiers ignorés lors du balayage du code source. */
const SOURCE_EXCLUDE_DIRS = new Set(['node_modules', '.next', '.git', '.staging', '.cache']);

// ---------------------------------------------------------------------------
// Chargement de la table de correspondance
// ---------------------------------------------------------------------------

if (!fs.existsSync(MAPPING_JSON)) {
    console.error(`Table de correspondance introuvable : ${MAPPING_JSON}`);
    console.error('Lancez d\'abord : node scripts/upload_media_to_supabase.mjs');
    process.exit(1);
}

const mappingFile = JSON.parse(fs.readFileSync(MAPPING_JSON, 'utf8'));
const entries = (mappingFile.mapping || []).filter((e) => e.status === 'uploaded');

if (entries.length === 0) {
    console.error('Aucune entrée « uploaded » dans la table de correspondance.');
    process.exit(1);
}

/**
 * Construit la liste des paires (ancienne URL → nouvelle URL), triée par
 * longueur d'URL décroissante afin d'éviter qu'une URL courte ne remplace
 * prématurément un préfixe d'URL plus longue.
 */
const pairs = entries
    .map((e) => ({ from: e.originalUrl, to: e.publicUrl, category: e.category }))
    .sort((a, b) => b.from.length - a.from.length);

/** Index exact pour les remplacements directs. */
const exactMap = new Map(pairs.map((p) => [p.from, p.to]));

/**
 * Variantes d'URL à couvrir : le domaine peut apparaître avec ou sans `www.`,
 * en `http` ou `https`, et avec des suffixes de redimensionnement WordPress
 * (`-300x200`) qui pointent vers une variante non téléchargée.
 */
function buildVariants(url) {
    const variants = new Set([url]);
    variants.add(url.replace('https://www.', 'https://'));
    variants.add(url.replace('https://www.', 'http://www.'));
    variants.add(url.replace('https://www.', 'http://'));
    return [...variants];
}

/** Table finale : variante exacte → URL Supabase. */
const variantMap = new Map();
for (const p of pairs) {
    for (const v of buildVariants(p.from)) {
        if (!variantMap.has(v)) variantMap.set(v, p.to);
    }
}

/**
 * Table des variantes redimensionnées : pour une URL `.../image-300x200.jpg`
 * absente du mapping, on retombe sur l'original `.../image.jpg` s'il existe.
 */
const resizeFallback = new Map();
for (const p of pairs) {
    const m = p.from.match(/^(.*?)(-\d+x\d+)(\.[a-z0-9]+)$/i);
    if (m) {
        const base = `${m[1]}${m[3]}`;
        if (exactMap.has(base)) {
            resizeFallback.set(p.from, exactMap.get(base));
        }
    }
}

/**
 * REMAPPAGE DES URLs MORTES
 * -------------------------
 * Certaines URLs WordPress référencées en base renvoient HTTP 404 sur le site
 * d'origine (médias supprimés côté WordPress). Elles ne peuvent donc pas être
 * rapatriées. On les redirige vers un média équivalent déjà hébergé sur
 * Supabase, afin de ne laisser aucune image cassée.
 *
 * Vérifié le 2026-09-20 : ces URLs renvoient bien 404 côté WordPress.
 */
const DEAD_URL_REMAP = new Map([
    [
        'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Animation-airbag-chute-libre.jpg',
        `${SUPABASE_URL}/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/Airbag-vert.jpg`,
    ],
]);
for (const [from, to] of DEAD_URL_REMAP) {
    for (const v of buildVariants(from)) {
        if (!variantMap.has(v)) variantMap.set(v, to);
    }
}

// ---------------------------------------------------------------------------
// Moteur de remplacement
// ---------------------------------------------------------------------------

const WP_HOST_RE = /https?:\/\/(?:www\.)?campus-universcascades\.com\/wp-content\/[^\s"'`)\\]*/gi;

/**
 * Remplace toutes les URLs médias WordPress connues dans une chaîne.
 * Retourne `{ value, replacements }`.
 */
function rewriteString(input) {
    if (typeof input !== 'string' || !input.includes('campus-universcascades.com')) {
        return { value: input, replacements: 0 };
    }

    let replacements = 0;

    const value = input.replace(WP_HOST_RE, (match) => {
        // 1. Correspondance exacte (ou variante de protocole/www).
        const direct = variantMap.get(match);
        if (direct) {
            replacements += 1;
            return direct;
        }

        // 2. Variante redimensionnée connue.
        const resized = resizeFallback.get(match);
        if (resized) {
            replacements += 1;
            return resized;
        }

        // 3. Variante redimensionnée non listée : on tente de retomber sur
        //    l'original en retirant le suffixe `-WxH`.
        const stripped = match.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1');
        const strippedHit = variantMap.get(stripped);
        if (strippedHit) {
            replacements += 1;
            return strippedHit;
        }

        // 4. Inconnue : on laisse intacte et on la signale.
        return match;
    });

    return { value, replacements };
}

/** Parcours récursif d'une structure JSON et réécriture de toutes les chaînes. */
function rewriteDeep(node, stats) {
    if (typeof node === 'string') {
        const { value, replacements } = rewriteString(node);
        stats.replacements += replacements;
        return value;
    }
    if (Array.isArray(node)) {
        return node.map((item) => rewriteDeep(item, stats));
    }
    if (node && typeof node === 'object') {
        const out = {};
        for (const [k, v] of Object.entries(node)) {
            out[k] = rewriteDeep(v, stats);
        }
        return out;
    }
    return node;
}

// ---------------------------------------------------------------------------
// Cible 1 — Base de données
// ---------------------------------------------------------------------------

async function rewriteDatabase() {
    const report = { tables: [], rowsUpdated: 0, replacements: 0, errors: [] };

    if (!SERVICE_KEY) {
        report.errors.push('Clé Supabase absente — base de données ignorée.');
        return report;
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { persistSession: false },
    });

    for (const table of SITE_TABLES) {
        const tableReport = { table, scanned: 0, updated: 0, replacements: 0, skipped: null };

        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            tableReport.skipped = error.message;
            report.tables.push(tableReport);
            continue;
        }
        if (!data || data.length === 0) {
            tableReport.skipped = 'table vide ou inexistante';
            report.tables.push(tableReport);
            continue;
        }

        tableReport.scanned = data.length;

        for (const row of data) {
            const stats = { replacements: 0 };
            const updated = rewriteDeep(row, stats);

            if (stats.replacements === 0) continue;

            tableReport.replacements += stats.replacements;
            report.replacements += stats.replacements;

            if (DRY_RUN) {
                tableReport.updated += 1;
                report.rowsUpdated += 1;
                continue;
            }

            // On ne renvoie que les colonnes modifiées, identifiées par diff.
            const patch = {};
            for (const [k, v] of Object.entries(updated)) {
                if (k === 'id' || k === 'created_at') continue;
                if (JSON.stringify(v) !== JSON.stringify(row[k])) {
                    patch[k] = v;
                }
            }

            if (Object.keys(patch).length === 0) continue;

            const { error: upErr } = await supabase.from(table).update(patch).eq('id', row.id);
            if (upErr) {
                report.errors.push(`${table}#${row.id} : ${upErr.message}`);
                continue;
            }

            tableReport.updated += 1;
            report.rowsUpdated += 1;
        }

        report.tables.push(tableReport);
    }

    return report;
}

// ---------------------------------------------------------------------------
// Cible 2 — Code source
// ---------------------------------------------------------------------------

function walkSource(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SOURCE_EXCLUDE_DIRS.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkSource(full, files);
        } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
            files.push(full);
        }
    }
    return files;
}

function rewriteSource() {
    const report = { files: [], filesUpdated: 0, replacements: 0, errors: [] };

    const files = walkSource('src');

    for (const file of files) {
        const normalized = path.normalize(file);
        if (SOURCE_EXCLUDE_FILES.has(normalized)) continue;

        let content;
        try {
            content = fs.readFileSync(file, 'utf8');
        } catch (err) {
            report.errors.push(`${file} : ${err.message}`);
            continue;
        }

        if (!content.includes('campus-universcascades.com')) continue;

        const { value, replacements } = rewriteString(content);
        if (replacements === 0) continue;

        report.replacements += replacements;
        report.filesUpdated += 1;
        report.files.push({ file: normalized, replacements });

        if (!DRY_RUN) {
            fs.writeFileSync(file, value, 'utf8');
        }
    }

    return report;
}

// ---------------------------------------------------------------------------
// Rapport
// ---------------------------------------------------------------------------

function writeReport(dbReport, srcReport) {
    const payload = {
        generatedAt: new Date().toISOString(),
        dryRun: DRY_RUN,
        mappingEntries: entries.length,
        database: dbReport,
        source: srcReport,
    };

    fs.writeFileSync(REPORT_JSON, JSON.stringify(payload, null, 2), 'utf8');

    const lines = [];
    lines.push('# Rapport de réécriture des URLs médias');
    lines.push('');
    lines.push(`- Généré : ${payload.generatedAt}`);
    lines.push(`- Mode : ${DRY_RUN ? '**DRY-RUN** (aucune écriture)' : '**ÉCRITURE RÉELLE**'}`);
    lines.push(`- Entrées de correspondance : ${entries.length}`);
    lines.push('');

    if (dbReport) {
        lines.push('## Base de données');
        lines.push('');
        lines.push(`- Lignes mises à jour : **${dbReport.rowsUpdated}**`);
        lines.push(`- Remplacements : **${dbReport.replacements}**`);
        lines.push('');
        lines.push('| Table | Lignes lues | Lignes modifiées | Remplacements | Note |');
        lines.push('| --- | ---: | ---: | ---: | --- |');
        for (const t of dbReport.tables) {
            lines.push(
                `| \`${t.table}\` | ${t.scanned} | ${t.updated} | ${t.replacements} | ${t.skipped || '—'} |`,
            );
        }
        lines.push('');
        if (dbReport.errors.length) {
            lines.push('### Erreurs base');
            lines.push('');
            for (const e of dbReport.errors) lines.push(`- ${e}`);
            lines.push('');
        }
    }

    if (srcReport) {
        lines.push('## Code source');
        lines.push('');
        lines.push(`- Fichiers modifiés : **${srcReport.filesUpdated}**`);
        lines.push(`- Remplacements : **${srcReport.replacements}**`);
        lines.push('');
        if (srcReport.files.length) {
            lines.push('| Fichier | Remplacements |');
            lines.push('| --- | ---: |');
            for (const f of srcReport.files) {
                lines.push(`| \`${f.file}\` | ${f.replacements} |`);
            }
            lines.push('');
        }
        if (srcReport.errors.length) {
            lines.push('### Erreurs source');
            lines.push('');
            for (const e of srcReport.errors) lines.push(`- ${e}`);
            lines.push('');
        }
    }

    fs.writeFileSync(REPORT_MD, lines.join('\n'), 'utf8');
}

// ---------------------------------------------------------------------------
// Exécution
// ---------------------------------------------------------------------------

async function main() {
    console.log('=== Réécriture des URLs médias → Supabase ===');
    console.log(`Mode : ${DRY_RUN ? 'DRY-RUN' : 'ÉCRITURE'}`);
    console.log(`Correspondances : ${entries.length}`);
    console.log('');

    const dbReport = DO_DB ? await rewriteDatabase() : null;
    const srcReport = DO_SRC ? rewriteSource() : null;

    writeReport(dbReport, srcReport);

    if (dbReport) {
        console.log(`Base : ${dbReport.rowsUpdated} ligne(s), ${dbReport.replacements} remplacement(s)`);
    }
    if (srcReport) {
        console.log(`Source : ${srcReport.filesUpdated} fichier(s), ${srcReport.replacements} remplacement(s)`);
    }
    console.log('');
    console.log(`Rapport : ${REPORT_MD}`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
