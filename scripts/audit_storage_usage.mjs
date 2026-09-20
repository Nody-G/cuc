/**
 * AUDIT DE L'OCCUPATION DU STOCKAGE SUPABASE
 * ==========================================
 *
 * Répond à la question : « la base est-elle surchargée ? peut-on supprimer
 * les affiches de films pour ne garder que celles réellement affichées ? »
 *
 * Le script mesure, sans rien supprimer :
 *   1. Le nombre d'objets et le poids total du bucket `cuc-vitrine-assets`,
 *      ventilé par dossier de premier niveau (media/film-poster, media/team, …).
 *   2. Les URLs Supabase Storage réellement référencées par le code source
 *      (`src/**`) et par les tables du site (`site_films`, `site_team`, …).
 *   3. Les objets du bucket qui ne sont référencés NULLE PART (orphelins
 *      candidats à la suppression) et leur poids cumulé.
 *
 * Aucune écriture, aucune suppression : lecture seule.
 *
 * Usage :
 *   node scripts/audit_storage_usage.mjs
 *   node scripts/audit_storage_usage.mjs --json   # sortie machine
 */

import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

const BUCKET = 'cuc-vitrine-assets';
const JSON_OUT = process.argv.includes('--json');

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.css', '.sql', '.md']);
const SOURCE_EXCLUDE_DIRS = new Set(['node_modules', '.next', '.git', '.staging', '.cache']);
// Tables du site susceptibles de référencer un média du bucket.
// `site_disciplines` n'y figure pas : la table n'existe pas dans le schéma
// (les disciplines sont stockées dans `site_settings`).
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

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
});

/** Formate un nombre d'octets en unité lisible. */
function human(bytes) {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

/** Liste récursivement tous les objets d'un dossier du bucket. */
async function listAll(prefix = '') {
    const out = [];
    const PAGE = 100;
    let offset = 0;

    for (; ;) {
        const { data, error } = await supabase.storage
            .from(BUCKET)
            .list(prefix, { limit: PAGE, offset, sortBy: { column: 'name', order: 'asc' } });

        if (error) throw new Error(`list(${prefix || '/'}) : ${error.message}`);
        if (!data || data.length === 0) break;

        for (const entry of data) {
            const full = prefix ? `${prefix}/${entry.name}` : entry.name;
            // Supabase renvoie `id: null` ET `metadata: null` pour un dossier.
            // On teste les deux : un fichier a toujours un `id` non nul.
            const isFolder = entry.id === null && entry.metadata === null;
            if (isFolder) {
                out.push(...(await listAll(full)));
            } else {
                out.push({
                    // On décode le chemin pour pouvoir le comparer aux URLs
                    // collectées (qui sont, elles, décodées) : les noms de
                    // fichiers contiennent des accents et des espaces encodés.
                    path: decodeURIComponent(full),
                    size: entry.metadata?.size ?? 0,
                    mimetype: entry.metadata?.mimetype ?? '',
                });
            }
        }

        if (data.length < PAGE) break;
        offset += PAGE;
    }

    return out;
}

/**
 * Construit le motif de capture des URLs Storage du bucket.
 * Le groupe 1 capture le CHEMIN RELATIF à la racine du bucket
 * (`media/film-poster/x.jpg`), qui est la clé utilisée par `storage.list()`.
 */
function storageUrlRegex() {
    const escaped = SUPABASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(
        `${escaped}/storage/v1/object/public/${BUCKET}/([^\\s"'\`)\\\\]+)`,
        'g',
    );
}

/** Parcourt le code source et collecte tous les chemins Storage référencés. */
function collectSourceUrls() {
    const urls = new Set();
    const re = storageUrlRegex();

    function walk(dir, files = []) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            if (SOURCE_EXCLUDE_DIRS.has(entry.name)) continue;
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) walk(full, files);
            else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(full);
        }
        return files;
    }

    for (const dir of ['src', 'scripts', 'public']) {
        if (!fs.existsSync(dir)) continue;
        for (const file of walk(dir)) {
            const text = fs.readFileSync(file, 'utf8');
            // IMPORTANT : on ajoute le groupe de capture (chemin relatif),
            // jamais l'URL complète — sinon la comparaison avec les chemins
            // renvoyés par `storage.list()` échoue systématiquement.
            for (const m of text.matchAll(re)) urls.add(decodeURIComponent(m[1]));
        }
    }

    return urls;
}

/** Collecte les chemins Storage référencés dans les tables du site. */
async function collectDbUrls() {
    const urls = new Set();
    const re = storageUrlRegex();

    for (const table of SITE_TABLES) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
            if (!JSON_OUT) console.warn(`   ⚠️  ${table} : ${error.message}`);
            continue;
        }
        const blob = JSON.stringify(data ?? []);
        // Idem : on n'ajoute que le chemin relatif (groupe 1).
        for (const m of blob.matchAll(re)) urls.add(decodeURIComponent(m[1]));
    }

    return urls;
}

async function main() {
    if (!SERVICE_KEY) {
        console.error('❌ Clé Supabase manquante dans .env.local.');
        process.exit(1);
    }

    if (!JSON_OUT) {
        console.log('📦 Audit de l\'occupation du stockage Supabase');
        console.log(`   Bucket : ${BUCKET}\n`);
    }

    const objects = await listAll('');
    const totalBytes = objects.reduce((sum, o) => sum + o.size, 0);

    // Ventilation par dossier de second niveau (media/film-poster,
    // media/cuc-visual, media/document, …) : c'est le grain utile pour
    // décider quoi purger.
    const byFolder = new Map();
    for (const o of objects) {
        const parts = o.path.split('/');
        const top = parts.length >= 2 ? `${parts[0]}/${parts[1]}` : parts[0];
        const acc = byFolder.get(top) ?? { count: 0, bytes: 0 };
        acc.count += 1;
        acc.bytes += o.size;
        byFolder.set(top, acc);
    }

    const sourceUrls = collectSourceUrls();
    const dbUrls = await collectDbUrls();
    const referenced = new Set([...sourceUrls, ...dbUrls]);

    // Un objet est référencé si son chemin apparaît dans une URL collectée.
    const orphans = objects.filter((o) => !referenced.has(o.path));
    const orphanBytes = orphans.reduce((sum, o) => sum + o.size, 0);

    if (JSON_OUT) {
        console.log(
            JSON.stringify(
                {
                    bucket: BUCKET,
                    totalObjects: objects.length,
                    totalBytes,
                    byFolder: Object.fromEntries(
                        [...byFolder.entries()].sort((a, b) => b[1].bytes - a[1].bytes),
                    ),
                    referencedCount: objects.length - orphans.length,
                    orphanCount: orphans.length,
                    orphanBytes,
                    orphans: orphans
                        .sort((a, b) => b.size - a.size)
                        .map((o) => ({ path: o.path, size: o.size })),
                },
                null,
                2,
            ),
        );
        return;
    }

    console.log(`📊 Objets dans le bucket : ${objects.length}`);
    console.log(`📊 Poids total           : ${human(totalBytes)}\n`);

    console.log('📁 Ventilation par dossier :');
    for (const [folder, acc] of [...byFolder.entries()].sort((a, b) => b[1].bytes - a[1].bytes)) {
        const pct = totalBytes > 0 ? ((acc.bytes / totalBytes) * 100).toFixed(1) : '0.0';
        console.log(
            `   • ${folder.padEnd(24)} ${String(acc.count).padStart(5)} objets  ${human(acc.bytes).padStart(10)}  (${pct} %)`,
        );
    }

    console.log(`\n🔗 URLs Storage référencées :`);
    console.log(`   • dans le code source : ${sourceUrls.size}`);
    console.log(`   • dans les tables     : ${dbUrls.size}`);
    console.log(`   • union               : ${referenced.size}`);

    console.log(`\n🗑️  Objets non référencés (candidats à la suppression) :`);
    console.log(`   • ${orphans.length} objet(s) sur ${objects.length}`);
    console.log(`   • ${human(orphanBytes)} récupérables (${totalBytes > 0 ? ((orphanBytes / totalBytes) * 100).toFixed(1) : '0.0'} % du bucket)`);

    if (orphans.length > 0) {
        console.log('\n   Les 20 plus volumineux :');
        for (const o of orphans.sort((a, b) => b.size - a.size).slice(0, 20)) {
            console.log(`     - ${human(o.size).padStart(10)}  ${o.path}`);
        }
    }

    console.log('\nℹ️  Aucune suppression effectuée : ce script est en lecture seule.');
}

main().catch((err) => {
    console.error(`\n❌ Échec de l'audit : ${err.message}`);
    process.exit(2);
});
