/**
 * TÉLÉCHARGEMENT DES MÉDIAS DE L'ANCIEN SITE → STAGING LOCAL
 * ==========================================================
 *
 * Lit `scripts/media_classification.json` et télécharge tous les médias dont la
 * décision est `RAPATRIER` (et, sur option, `CAS PAR CAS`) dans un dossier de
 * staging local : `.staging/media/`.
 *
 * Le nom de fichier local est **déterministe** et dérivé de l'URL d'origine :
 *   <categorie>/<nom-de-fichier-original-assaini>
 * Exemple :
 *   .staging/media/cuc-visual/CUC-5.0-586.jpg
 *   .staging/media/film-poster/John-Wick-4.jpg
 *
 * Un manifeste `scripts/media_download_manifest.json` est produit : il associe
 * chaque URL d'origine à son chemin local, sa taille réelle et son empreinte
 * SHA-256 (utile pour l'upload et la table de correspondance).
 *
 * Idempotent : un fichier déjà présent avec la bonne taille n'est pas retéléchargé.
 *
 * Usage :
 *   node scripts/download_original_media.mjs                 # RAPATRIER uniquement
 *   node scripts/download_original_media.mjs --include-videos # + vidéos (lourd)
 *   node scripts/download_original_media.mjs --force          # retélécharge tout
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CLASSIFICATION_PATH = path.join('scripts', 'media_classification.json');
const STAGING_DIR = path.join('.staging', 'media');
const MANIFEST_PATH = path.join('scripts', 'media_download_manifest.json');

const INCLUDE_VIDEOS = process.argv.includes('--include-videos');
const FORCE = process.argv.includes('--force');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

if (!fs.existsSync(CLASSIFICATION_PATH)) {
    console.error(`Classification introuvable : ${CLASSIFICATION_PATH}`);
    console.error('Lancez d\'abord : node scripts/classify_media_inventory.mjs');
    process.exit(1);
}

const classification = JSON.parse(fs.readFileSync(CLASSIFICATION_PATH, 'utf-8'));

/** Assainit un nom de fichier pour le système de fichiers local. */
function safeFilename(url) {
    let base;
    try {
        const u = new URL(url);
        base = decodeURIComponent(u.pathname.substring(u.pathname.lastIndexOf('/') + 1));
    } catch {
        base = url.substring(url.lastIndexOf('/') + 1);
    }
    base = base.split('?')[0];
    // Remplace les caractères problématiques (Windows) et les accents.
    base = base
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    if (!base) base = 'asset';
    return base;
}

/** Évite les collisions de noms dans un même dossier de catégorie. */
function uniquePath(dir, filename, usedNames) {
    let candidate = filename;
    let i = 1;
    while (usedNames.has(candidate)) {
        const ext = path.extname(filename);
        const stem = path.basename(filename, ext);
        candidate = `${stem}__${i}${ext}`;
        i++;
    }
    usedNames.add(candidate);
    return path.join(dir, candidate);
}

function sha256(buf) {
    return crypto.createHash('sha256').update(buf).digest('hex');
}

async function download(url, destPath) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arrayBuf = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, buf);
    return { bytes: buf.length, sha256: sha256(buf) };
}

async function run() {
    const targets = classification.items.filter((it) => {
        if (it.decision.action === 'RAPATRIER') return true;
        if (INCLUDE_VIDEOS && it.category === 'video') return true;
        return false;
    });

    console.log(`=== TÉLÉCHARGEMENT DE ${targets.length} MÉDIAS ===`);
    console.log(`Staging : ${STAGING_DIR}`);
    if (INCLUDE_VIDEOS) console.log('(vidéos incluses)');
    console.log('');

    const usedByCategory = {};
    const manifest = [];
    let ok = 0;
    let skipped = 0;
    let failed = 0;
    let totalBytes = 0;

    for (let i = 0; i < targets.length; i++) {
        const item = targets[i];
        const category = item.category;
        if (!usedByCategory[category]) usedByCategory[category] = new Set();

        const filename = safeFilename(item.url);
        const destPath = uniquePath(path.join(STAGING_DIR, category), filename, usedByCategory[category]);

        const label = `[${i + 1}/${targets.length}] ${category}/${path.basename(destPath)}`;

        // Idempotence : si le fichier existe déjà avec la bonne taille, on saute.
        if (!FORCE && fs.existsSync(destPath) && item.bytes) {
            const stat = fs.statSync(destPath);
            if (stat.size === item.bytes) {
                const buf = fs.readFileSync(destPath);
                manifest.push({
                    url: item.url,
                    category,
                    localPath: destPath.replace(/\\/g, '/'),
                    bytes: stat.size,
                    sha256: sha256(buf),
                    status: 'cached',
                });
                skipped++;
                totalBytes += stat.size;
                continue;
            }
        }

        try {
            const { bytes, sha256: hash } = await download(item.url, destPath);
            manifest.push({
                url: item.url,
                category,
                localPath: destPath.replace(/\\/g, '/'),
                bytes,
                sha256: hash,
                status: 'downloaded',
            });
            ok++;
            totalBytes += bytes;
            process.stdout.write(`${label} — ${(bytes / 1024).toFixed(0)} Ko\n`);
        } catch (e) {
            failed++;
            manifest.push({
                url: item.url,
                category,
                localPath: destPath.replace(/\\/g, '/'),
                bytes: null,
                sha256: null,
                status: 'failed',
                error: e.message,
            });
            process.stdout.write(`${label} — ÉCHEC: ${e.message}\n`);
        }
    }

    const out = {
        generatedAt: new Date().toISOString(),
        stagingDir: STAGING_DIR.replace(/\\/g, '/'),
        includeVideos: INCLUDE_VIDEOS,
        totals: {
            targets: targets.length,
            downloaded: ok,
            cached: skipped,
            failed,
            totalBytes,
            totalHuman: `${(totalBytes / (1024 * 1024)).toFixed(2)} Mo`,
        },
        files: manifest,
    };

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(out, null, 2), 'utf-8');

    console.log('\n=== RÉSULTAT ===');
    console.log(`Téléchargés : ${ok}`);
    console.log(`Déjà en cache : ${skipped}`);
    console.log(`Échecs : ${failed}`);
    console.log(`Poids total : ${out.totals.totalHuman}`);
    console.log(`\nManifeste : ${MANIFEST_PATH}`);
}

run().catch((e) => {
    console.error('Échec du téléchargement :', e);
    process.exit(1);
});
