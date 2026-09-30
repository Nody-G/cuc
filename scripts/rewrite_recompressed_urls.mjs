/**
 * RÉÉCRITURE DES RÉFÉRENCES VERS LES MÉDIAS RECOMPRESSÉS
 * ======================================================
 *
 * Étape 4 puis 5 de l'ordre canonique de `.agents/rules/media_compression.md` § 6 :
 *
 *   mesurer → déposer le dérivé → **vérifier le 200** → **réécrire les
 *   références** → supprimer l'ancien.
 *
 * Prend en entrée `scripts/media_recompression_report.json` (produit par
 * `recompress_bucket_media.mjs --write`) et remplace, partout, le chemin de
 * l'ancien objet par celui du dérivé WebP :
 *
 *   1. BASE DE DONNÉES — tables `site_*`, colonnes texte et JSONB (remplacement
 *      en profondeur, patch par diff de colonnes, idempotent).
 *   2. CODE SOURCE — fichiers sous `src/` et `scripts/`.
 *
 * GARDE-FOUS :
 *  - **Aucune réécriture vers un fichier absent** : chaque cible est vérifiée
 *    par un HEAD ; une cible qui ne répond pas 200 est écartée, jamais écrite.
 *    Sans cela, une panne de dépôt produirait un site entier d'images cassées.
 *  - **Aucune suppression sans preuve** : `--purge-replaced` ne retire un objet
 *    que si le dérivé est vérifié **et** que l'ancien chemin ne compte plus
 *    aucune référence après réécriture (rescan code + base).
 *  - Le préfixe `_originals/` et la corbeille `_trash/` ne sont jamais touchés.
 *  - **Marche arrière réelle** : en écriture, chaque fichier source modifié est
 *    copié sous `.staging/media-rewrite-backup/` et chaque colonne modifiée en
 *    base est enregistrée dans le rapport (valeur d'avant incluse). Une
 *    réécriture en masse sans retour possible n'est pas acceptable.
 *
 * Lecture seule par défaut.
 *
 * Usage :
 *   npm run media:rewrite                        # inventaire, n'écrit rien
 *   npm run media:rewrite:write                  # réécrit code + base
 *   npm run media:rewrite:purge                  # + supprime les anciens objets
 */

import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

import { ORIGINALS_ROOT, TRASH_ROOT } from '../src/lib/media-library/media-policy.ts';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const BUCKET = 'cuc-vitrine-assets';
const REPORT_IN = path.join('scripts', 'media_recompression_report.json');
const REPORT_OUT = path.join('scripts', 'media_rewrite_report.json');
const BACKUP_DIR = path.join('.staging', 'media-rewrite-backup');

const WRITE = process.argv.includes('--write');
const PURGE = process.argv.includes('--purge-replaced');

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.css', '.sql', '.md']);
const SOURCE_EXCLUDE_DIRS = new Set(['node_modules', '.next', '.git', '.staging', '.cache']);
/**
 * Fichiers de traçabilité à ne JAMAIS réécrire : ils contiennent par nature les
 * anciens chemins, et les réécrire effacerait la preuve de ce qui a été fait
 * (le mapping lui-même deviendrait impossible à auditer).
 */
const SOURCE_EXCLUDE_FILES = new Set([
    'media_recompression_report.json',
    'media_rewrite_report.json',
    'media_url_mapping.json',
    // Outil historique (WordPress → Supabase) : son mapping littéral documente
    // une opération terminée, le réécrire falsifierait la trace.
    'rewrite_media_urls.mjs',
]);
const SITE_TABLES = [
    'site_pages',
    'site_team',
    'site_events',
    'site_settings',
    'site_films',
    'site_campus_pois',
    'site_partners',
    'site_sessions',
];
/**
 * Clés candidates pour viser une ligne. `site_pages` et `site_settings` n'ont
 * pas de colonne `id` (leur clé est `slug` / `key`) : sans cette détection, la
 * réécriture échouait silencieusement sur les tables qui portent le contenu des
 * pages — exactement la surface la plus visible du site.
 */
const PRIMARY_KEY_CANDIDATES = ['id', 'slug', 'key', 'name'];

function primaryKeyOf(row) {
    return (
        PRIMARY_KEY_CANDIDATES.find(
            (column) => row[column] !== undefined && row[column] !== null,
        ) ?? null
    );
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY || 'anon', { auth: { persistSession: false } });

function human(bytes) {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

/** Mapping ancien chemin → dérivé, restreint aux entrées réellement déposées. */
function loadMapping() {
    if (!fs.existsSync(REPORT_IN)) {
        console.error(`Rapport introuvable : ${REPORT_IN}`);
        console.error('Lancez d’abord : npm run media:recompress:write');
        process.exit(1);
    }

    const report = JSON.parse(fs.readFileSync(REPORT_IN, 'utf8'));
    const pairs = report.entries
        .filter((entry) => entry.applicable && entry.targetPath)
        .filter((entry) => !entry.path.startsWith(`${ORIGINALS_ROOT}/`))
        .filter((entry) => !entry.path.startsWith(`${TRASH_ROOT}/`))
        .map((entry) => ({
            from: entry.path,
            to: entry.targetPath,
            applied: Boolean(entry.applied),
            verified: Boolean(entry.verified),
            savedBytes: entry.savedBytes || 0,
        }));

    return { pairs, generatedAt: report.generatedAt, write: report.write };
}

/**
 * Un dérivé répond-il réellement ? (dernier verrou avant toute écriture)
 *
 * Réessai nécessaire, constaté le 2026-09-29 : sur 100 requêtes HEAD lancées
 * d'affilée, 11 revenaient en échec (limitation de rafale du CDN) sans qu'aucun
 * fichier ne manque. Sans réessai, la réécriture écarterait des médias valides
 * et les laisserait en version lourde — un faux négatif coûteux.
 */
async function verifyRemote(pair, attempt = 1) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(pair.to);
    const retryable = (status) => status === 429 || status >= 500;

    try {
        const response = await fetch(data.publicUrl, { method: 'HEAD' });
        if (response.ok) return true;
        if (attempt < 3 && retryable(response.status)) {
            await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
            return verifyRemote(pair, attempt + 1);
        }
        return false;
    } catch {
        if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
            return verifyRemote(pair, attempt + 1);
        }
        return false;
    }
}

/**
 * Marqueur d'URL de stockage. Un chemin n'est remplacé que s'il est **porté par
 * une URL du bucket** (`.../cuc-vitrine-assets/<chemin>`).
 *
 * Leçon du 2026-09-29 : un remplacement sur le chemin nu (`media/cuc-visual/001.jpg`)
 * touchait aussi les exemples en commentaire et le script historique de
 * réécriture WordPress, dont il falsifiait le mapping. Un outil de maintenance
 * ne doit pas réécrire de la documentation.
 */
const URL_MARKER = `/${BUCKET}/`;

/** Remplace le chemin dans les URL du bucket ; renvoie le texte et le nombre de coups. */
function replaceInText(text, pair) {
    const forms = [
        { from: URL_MARKER + encodeURI(pair.from), to: URL_MARKER + encodeURI(pair.to) },
        { from: URL_MARKER + pair.from, to: URL_MARKER + pair.to },
    ];
    let out = text;
    let hits = 0;
    for (const form of forms) {
        if (form.from === form.to) continue;
        const parts = out.split(form.from);
        if (parts.length > 1) {
            hits += parts.length - 1;
            out = parts.join(form.to);
        }
    }
    return { text: out, hits };
}

/** Occurrences d'un chemin porté par une URL du bucket. */
function countInText(text, pair) {
    let count = 0;
    const forms = new Set([URL_MARKER + encodeURI(pair.from), URL_MARKER + pair.from]);
    for (const from of forms) count += text.split(from).length - 1;
    return count;
}

function replaceDeep(node, pairs, stats) {
    if (typeof node === 'string') {
        let value = node;
        for (const pair of pairs) {
            const { text, hits } = replaceInText(value, pair);
            if (hits > 0) {
                value = text;
                stats.replacements += hits;
            }
        }
        return value;
    }
    if (Array.isArray(node)) return node.map((item) => replaceDeep(item, pairs, stats));
    if (node && typeof node === 'object') {
        const out = {};
        for (const [key, value] of Object.entries(node)) out[key] = replaceDeep(value, pairs, stats);
        return out;
    }
    return node;
}

function walkSourceFiles(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SOURCE_EXCLUDE_DIRS.has(entry.name)) continue;
        if (SOURCE_EXCLUDE_FILES.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walkSourceFiles(full, files);
        else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(full);
    }
    return files;
}

/** Nouvelle référence restante pour un chemin, dans le code. */
function countInSources(pair) {
    const hits = [];
    for (const file of walkSourceFiles('src').concat(walkSourceFiles('scripts'))) {
        const text = fs.readFileSync(file, 'utf8');
        const count = countInText(text, pair);
        if (count > 0) hits.push({ file, count });
    }
    return hits;
}

/**
 * Extensions balayées par le verrou de suppression — **plus large** que celles
 * réécrites : une URL de média peut vivre dans `messages/`, un rapport HTML ou
 * une note de projet. Le verrou doit tout voir ; la réécriture, elle, reste
 * volontairement limitée au code.
 */
const COUNT_EXTENSIONS = new Set([
    ...SOURCE_EXTENSIONS,
    '.html',
    '.yml',
    '.yaml',
    '.xml',
    '.txt',
    '.svg',
]);

function walkAllFiles(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SOURCE_EXCLUDE_DIRS.has(entry.name)) continue;
        if (SOURCE_EXCLUDE_FILES.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walkAllFiles(full, files);
        else if (COUNT_EXTENSIONS.has(path.extname(entry.name))) files.push(full);
    }
    return files;
}

/** Références restantes au chemin, où qu'elles soient dans le dépôt. */
function countInRepository(pair) {
    const hits = [];
    for (const file of walkAllFiles('.')) {
        const count = countInText(fs.readFileSync(file, 'utf8'), pair);
        if (count > 0) hits.push({ file, count });
    }
    return hits;
}

async function rewriteSources(pairs) {
    const files = walkSourceFiles('src').concat(walkSourceFiles('scripts'));
    const changed = [];

    for (const file of files) {
        const before = fs.readFileSync(file, 'utf8');
        let after = before;
        let replacements = 0;
        for (const pair of pairs) {
            const { text, hits } = replaceInText(after, pair);
            if (hits > 0) {
                replacements += hits;
                after = text;
            }
        }
        if (replacements === 0) continue;
        changed.push({ file, replacements });
        if (WRITE) {
            // Copie d'avant écriture : la marche arrière est un simple retour de
            // fichier, sans dépendre de git ni d'une reconstruction.
            const backup = path.join(BACKUP_DIR, file);
            fs.mkdirSync(path.dirname(backup), { recursive: true });
            fs.writeFileSync(backup, before, 'utf8');
            fs.writeFileSync(file, after, 'utf8');
        }
    }

    return changed;
}

async function rewriteDatabase(pairs) {
    const report = { tables: [], rowsUpdated: 0, replacements: 0, errors: [], reversals: [] };
    if (!SERVICE_KEY) {
        report.errors.push('Clé de service absente : base ignorée.');
        return report;
    }

    for (const table of SITE_TABLES) {
        const line = { table, scanned: 0, updated: 0, replacements: 0, skipped: null };
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            line.skipped = error.message;
            report.tables.push(line);
            continue;
        }
        if (!data || data.length === 0) {
            line.skipped = 'table vide ou inexistante';
            report.tables.push(line);
            continue;
        }

        line.scanned = data.length;
        for (const row of data) {
            const stats = { replacements: 0 };
            const updated = replaceDeep(row, pairs, stats);
            if (stats.replacements === 0) continue;

            line.replacements += stats.replacements;
            report.replacements += stats.replacements;

            if (!WRITE) {
                line.updated += 1;
                report.rowsUpdated += 1;
                continue;
            }

            const patch = {};
            const before = {};
            for (const [key, value] of Object.entries(updated)) {
                if (key === 'id' || key === 'created_at') continue;
                if (JSON.stringify(value) !== JSON.stringify(row[key])) {
                    patch[key] = value;
                    // Valeur d'avant, pour pouvoir annuler la réécriture.
                    before[key] = row[key];
                }
            }
            if (Object.keys(patch).length === 0) continue;

            const key = primaryKeyOf(row);
            if (!key) {
                report.errors.push(`${table} : clé primaire inconnue (id, slug, key, name)`);
                continue;
            }

            const { error: updateError } = await supabase.from(table).update(patch).eq(key, row[key]);
            if (updateError) {
                report.errors.push(`${table}#${row[key]} : ${updateError.message}`);
                continue;
            }
            report.reversals.push({ table, key, value: row[key], columns: before });
            line.updated += 1;
            report.rowsUpdated += 1;
        }
        report.tables.push(line);
    }

    return report;
}

/**
 * Références restantes à un ancien chemin dans les tables du site.
 *
 * Indispensable au verrou de suppression : ne contrôler que le code laisserait
 * supprimer un fichier encore référencé par une ligne de base — donc une image
 * cassée sur une page publique. Le cas s'est présenté le 2026-09-29 avec
 * `site_pages` et `site_settings`, dont la clé primaire n'est pas `id`.
 */
async function countInDatabase(pair) {
    const hits = [];
    if (!SERVICE_KEY) return hits;

    for (const table of SITE_TABLES) {
        const { data, error } = await supabase.from(table).select('*');
        if (error || !data) continue;
        let count = 0;
        for (const row of data) count += countInText(JSON.stringify(row), pair);
        if (count > 0) hits.push({ table, count });
    }
    return hits;
}

/** Suppression : uniquement quand plus rien ne pointe vers l'ancien objet. */
async function purgeReplaced(pairs) {
    const removed = [];
    const kept = [];

    for (const pair of pairs) {
        const sourceHits = countInRepository(pair);
        const databaseHits = await countInDatabase(pair);
        if (sourceHits.length > 0 || databaseHits.length > 0) {
            const sources = sourceHits.length > 0 ? `${sourceHits.length} fichier(s) du dépôt` : '';
            const tables = databaseHits.length > 0 ? `${databaseHits.length} table(s)` : '';
            kept.push({
                path: pair.from,
                reason: `encore référencé par ${[sources, tables].filter(Boolean).join(' et ')}`,
            });
            continue;
        }

        const { error } = await supabase.storage.from(BUCKET).remove([pair.from]);
        if (error) kept.push({ path: pair.from, reason: error.message });
        else removed.push({ path: pair.from, savedBytes: pair.savedBytes });
    }

    return { removed, kept };
}

async function run() {
    const mapping = loadMapping();
    console.log('=== RÉÉCRITURE DES RÉFÉRENCES RECOMPRESSÉES ===');
    console.log(`Rapport de recompression : ${mapping.generatedAt}`);
    console.log(`Mapping chargé           : ${mapping.pairs.length} couple(s) ancien → dérivé`);
    console.log(`Mode                     : ${WRITE ? 'écriture' : 'lecture seule'}${PURGE ? ' + purge' : ''}`);
    console.log('');

    const notApplied = mapping.pairs.filter((pair) => !pair.applied);
    if (notApplied.length > 0) {
        console.log(
            `⚠ ${notApplied.length} dérivé(s) n’ont pas été déposés (rapport en lecture seule) : ` +
            'lancez d’abord npm run media:recompress:write',
        );
    }

    // Verrou : on ne réécrit que vers ce qui répond réellement.
    const eligible = [];
    const unverified = [];
    for (const pair of mapping.pairs) {
        if (await verifyRemote(pair)) eligible.push(pair);
        else unverified.push(pair.to);
    }

    console.log(`Dérivés vérifiés (HTTP 200) : ${eligible.length}/${mapping.pairs.length}`);
    if (unverified.length > 0) {
        console.log(`Écartés faute de réponse       : ${unverified.length}`);
        for (const target of unverified.slice(0, 5)) console.log(`   · ${target}`);
        if (unverified.length > 5) console.log(`   · … et ${unverified.length - 5} autres`);
    }
    console.log('');

    if (eligible.length === 0) {
        console.log('Aucun dérivé vérifié : rien à réécrire, rien n’a été touché.');
        return;
    }

    const sourceChanges = await rewriteSources(eligible);
    const dbReport = await rewriteDatabase(eligible);

    const payload = {
        generatedAt: new Date().toISOString(),
        write: WRITE,
        eligible: eligible.length,
        unverified: unverified.length,
        source: { files: sourceChanges.length, changes: sourceChanges },
        database: dbReport,
    };

    if (PURGE && WRITE) {
        payload.purge = await purgeReplaced(eligible);
    }

    fs.writeFileSync(REPORT_OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

    console.log(`Code source : ${sourceChanges.length} fichier(s) concerné(s)${WRITE ? ' — réécrits' : ' — inventaire seulement'}`);
    for (const change of sourceChanges.slice(0, 10)) console.log(`   · ${change.file} (${change.replacements})`);
    if (sourceChanges.length > 10) console.log(`   · … et ${sourceChanges.length - 10} autres`);

    console.log(`Base        : ${dbReport.rowsUpdated} ligne(s), ${dbReport.replacements} remplacement(s)`);
    for (const line of dbReport.tables.filter((item) => item.replacements > 0)) {
        console.log(`   · ${line.table} : ${line.updated}/${line.scanned} ligne(s)`);
    }
    for (const error of dbReport.errors.slice(0, 5)) console.log(`   ! ${error}`);

    if (payload.purge) {
        const savedBytes = payload.purge.removed.reduce((total, item) => total + item.savedBytes, 0);
        console.log(`Purge      : ${payload.purge.removed.length} objet(s) supprimé(s) — ${human(savedBytes)} libérés`);
        for (const entry of payload.purge.kept) console.log(`   · conservé ${entry.path} — ${entry.reason}`);
    }

    console.log(`\nRapport écrit dans ${REPORT_OUT}`);
    if (!WRITE) {
        console.log('\nLecture seule : rien n’a été modifié. Appliquez avec npm run media:rewrite:write');
    } else if (!PURGE) {
        console.log('\nÉtape suivante : vérifier la vitrine, puis npm run media:rewrite:purge');
        console.log('  npm run media:verify:reachable && npm run content:verify:live');
    }
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
