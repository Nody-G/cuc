/**
 * UPLOAD DES MÉDIAS STAGÉS → SUPABASE STORAGE
 * ===========================================
 *
 * Lit `scripts/media_download_manifest.json` (produit par
 * `download_original_media.mjs`) et téléverse chaque fichier local vers le
 * bucket public `cuc-vitrine-assets` de Supabase, sous le préfixe :
 *
 *   media/<categorie>/<nom-de-fichier>
 *
 * Exemple :
 *   media/cuc-visual/CUC-5.0-586.jpg
 *   media/film-poster/John-Wick-4.jpg
 *   media/document/Presentation-Campus-Univers-Cascades.pdf
 *
 * Il produit ensuite la **table de correspondance** ancienne URL WordPress →
 * nouvelle URL Supabase publique :
 *   - scripts/media_url_mapping.json
 *   - scripts/media_url_mapping.md
 *
 * Idempotent : un fichier déjà présent dans le bucket (même chemin) est écrasé
 * (`upsert: true`), ce qui garantit la convergence sans doublons.
 *
 * Prérequis : `SUPABASE_SERVICE_ROLE_KEY` (ou la clé anon en repli) doit être
 * disponible dans l'environnement, comme pour les autres scripts du projet.
 *
 * Usage :
 *   node scripts/upload_media_to_supabase.mjs
 *   node scripts/upload_media_to_supabase.mjs --dry-run   # n'écrit rien
 */

import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const MANIFEST_PATH = path.join('scripts', 'media_download_manifest.json');
const MAPPING_JSON = path.join('scripts', 'media_url_mapping.json');
const MAPPING_MD = path.join('scripts', 'media_url_mapping.md');

const BUCKET = 'cuc-vitrine-assets';
const PREFIX = 'media';
const DRY_RUN = process.argv.includes('--dry-run');

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';

const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Manifeste introuvable : ${MANIFEST_PATH}`);
    console.error('Lancez d\'abord : node scripts/download_original_media.mjs');
    process.exit(1);
}

if (!SERVICE_KEY && !DRY_RUN) {
    console.error('Aucune clé Supabase disponible (SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY).');
    process.exit(1);
}

const supabase = DRY_RUN
    ? null
    : createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));

const CONTENT_TYPES = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.avif': 'image/avif',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
};

function contentTypeFor(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return CONTENT_TYPES[ext] || 'application/octet-stream';
}

function publicUrlFor(objectPath) {
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

async function run() {
    const files = manifest.files.filter((f) => f.status !== 'failed' && f.localPath);
    console.log(`=== UPLOAD DE ${files.length} MÉDIAS VERS SUPABASE ===`);
    console.log(`Bucket : ${BUCKET} | Préfixe : ${PREFIX}/`);
    if (DRY_RUN) console.log('(mode --dry-run : aucune écriture)');
    console.log('');

    const mapping = [];
    let ok = 0;
    let failed = 0;
    let totalBytes = 0;

    for (let i = 0; i < files.length; i++) {
        const entry = files[i];
        const localPath = entry.localPath;
        const category = entry.category;
        const filename = path.basename(localPath);
        const objectPath = `${PREFIX}/${category}/${filename}`;
        const publicUrl = publicUrlFor(objectPath);
        const label = `[${i + 1}/${files.length}] ${objectPath}`;

        if (!fs.existsSync(localPath)) {
            failed++;
            mapping.push({
                originalUrl: entry.url,
                category,
                objectPath,
                publicUrl,
                bytes: null,
                status: 'missing-local',
            });
            process.stdout.write(`${label} — FICHIER LOCAL ABSENT\n`);
            continue;
        }

        const buf = fs.readFileSync(localPath);

        if (DRY_RUN) {
            ok++;
            totalBytes += buf.length;
            mapping.push({
                originalUrl: entry.url,
                category,
                objectPath,
                publicUrl,
                bytes: buf.length,
                status: 'dry-run',
            });
            continue;
        }

        const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buf, {
            contentType: contentTypeFor(localPath),
            upsert: true,
            cacheControl: '31536000',
        });

        if (error) {
            failed++;
            mapping.push({
                originalUrl: entry.url,
                category,
                objectPath,
                publicUrl,
                bytes: buf.length,
                status: 'failed',
                error: error.message,
            });
            process.stdout.write(`${label} — ÉCHEC: ${error.message}\n`);
        } else {
            ok++;
            totalBytes += buf.length;
            mapping.push({
                originalUrl: entry.url,
                category,
                objectPath,
                publicUrl,
                bytes: buf.length,
                status: 'uploaded',
            });
            if ((i + 1) % 10 === 0 || i === files.length - 1) {
                process.stdout.write(`${label} — OK (${(buf.length / 1024).toFixed(0)} Ko)\n`);
            }
        }
    }

    const out = {
        generatedAt: new Date().toISOString(),
        bucket: BUCKET,
        prefix: PREFIX,
        supabaseUrl: SUPABASE_URL,
        totals: {
            total: files.length,
            uploaded: ok,
            failed,
            totalBytes,
            totalHuman: `${(totalBytes / (1024 * 1024)).toFixed(2)} Mo`,
        },
        mapping,
    };

    fs.writeFileSync(MAPPING_JSON, JSON.stringify(out, null, 2), 'utf-8');

    // Rapport Markdown
    const md = [];
    md.push('# Table de correspondance — ancienne URL WordPress → Supabase Storage\n');
    md.push(`Généré le ${out.generatedAt}\n`);
    md.push(`Bucket : \`${BUCKET}\` — préfixe \`${PREFIX}/\`\n`);
    md.push(`Téléversés : **${ok}** / ${files.length} — Échecs : **${failed}** — Poids : **${out.totals.totalHuman}**\n`);
    md.push('| Catégorie | Ancienne URL | Nouvelle URL Supabase |');
    md.push('| --- | --- | --- |');
    for (const m of mapping) {
        md.push(`| ${m.category} | \`${m.originalUrl}\` | \`${m.publicUrl}\` |`);
    }
    fs.writeFileSync(MAPPING_MD, md.join('\n'), 'utf-8');

    console.log('\n=== RÉSULTAT ===');
    console.log(`Téléversés : ${ok}`);
    console.log(`Échecs : ${failed}`);
    console.log(`Poids total : ${out.totals.totalHuman}`);
    console.log(`\nTable de correspondance : ${MAPPING_JSON}`);
    console.log(`Rapport lisible : ${MAPPING_MD}`);
}

run().catch((e) => {
    console.error('Échec de l\'upload :', e);
    process.exit(1);
});
