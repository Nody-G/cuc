/**
 * RATTRAPAGE DES MÉDIAS MANQUANTS
 * ===============================
 *
 * Le crawler initial (`audit_original_media.mjs`) n'explore que les pages
 * publiques. Certaines URLs référencées uniquement dans le code source ou en
 * base (affiches de films, vidéos de reportage, visuels de repli) n'ont donc
 * pas été inventoriées.
 *
 * Ce script télécharge ces URLs orphelines, les classe, puis les téléverse
 * dans Supabase Storage en réutilisant exactement la même convention que le
 * pipeline principal (`media/<categorie>/<fichier>`), et **complète** la table
 * de correspondance `scripts/media_url_mapping.json`.
 *
 * Usage :
 *   node scripts/fetch_missing_media.mjs --dry-run
 *   node scripts/fetch_missing_media.mjs
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const MAPPING_JSON = path.join('scripts', 'media_url_mapping.json');
const STAGING_ROOT = path.join('.staging', 'media');

const BUCKET = 'cuc-vitrine-assets';
const PREFIX = 'media';
const DRY_RUN = process.argv.includes('--dry-run');

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

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

/**
 * URLs orphelines détectées par `verify_media_url_coverage.mjs`.
 * Catégorie assignée manuellement selon la nature du média.
 */
const MISSING = [
    // Reportages TV — vidéos lourdes, hébergées telles quelles.
    { url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/TF1-JT-20h-CUC-reportage-1.mp4', category: 'video' },
    { url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/20h30-A-LECOLE-DES-CASCADEURS-FRANCE2-VWeb2-1.mp4', category: 'video' },
    // Flux Instagram mis en cache par le plugin WordPress.
    { url: 'https://www.campus-universcascades.com/wp-content/uploads/sb-instagram-feed-images/campus.univers.cascades.webp', category: 'cuc-visual' },
    // Affiches de films (filmographie).
    { url: 'https://www.campus-universcascades.com/wp-content/uploads/2024/12/Bagarre.jpg', category: 'film-poster' },
    { url: 'https://www.campus-universcascades.com/wp-content/uploads/2024/12/Nouveaux-riches.jpg', category: 'film-poster' },
    { url: 'https://www.campus-universcascades.com/wp-content/uploads/2024/12/Athena.jpg', category: 'film-poster' },
    { url: 'https://www.campus-universcascades.com/wp-content/uploads/2024/12/Le-Pacte-des-Loups.jpg', category: 'film-poster' },
    // Visuels de repli du site.
    { url: 'https://www.campus-universcascades.com/wp-content/uploads/2017/11/img-campus.jpg', category: 'cuc-visual' },
    { url: 'https://www.campus-universcascades.com/wp-content/uploads/2021/07/Animation-airbag-chute-libre.jpg', category: 'cuc-visual' },
];

function safeFilename(url) {
    const base = decodeURIComponent(url.split('/').pop().split('?')[0]);
    return base
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-');
}

function sha256(buf) {
    return crypto.createHash('sha256').update(buf).digest('hex');
}

async function download(url) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return buf;
}

async function main() {
    console.log('=== Rattrapage des médias manquants ===');
    console.log(`Mode : ${DRY_RUN ? 'DRY-RUN' : 'ÉCRITURE'}`);
    console.log(`URLs à traiter : ${MISSING.length}`);
    console.log('');

    const mappingFile = JSON.parse(fs.readFileSync(MAPPING_JSON, 'utf8'));
    const existing = new Set(mappingFile.mapping.map((e) => e.originalUrl));

    const supabase = SERVICE_KEY
        ? createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
        : null;

    let added = 0;
    let failed = 0;

    for (const item of MISSING) {
        if (existing.has(item.url)) {
            console.log(`↷ déjà présent : ${item.url}`);
            continue;
        }

        const filename = safeFilename(item.url);
        const objectPath = `${PREFIX}/${item.category}/${filename}`;
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`;
        const ext = path.extname(filename).toLowerCase();
        const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';

        try {
            const buf = await download(item.url);
            const hash = sha256(buf);
            console.log(`✓ ${filename} — ${(buf.length / 1024 / 1024).toFixed(2)} Mo`);

            if (!DRY_RUN) {
                const dir = path.join(STAGING_ROOT, item.category);
                fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(path.join(dir, filename), buf);

                if (supabase) {
                    const { error } = await supabase.storage
                        .from(BUCKET)
                        .upload(objectPath, buf, {
                            contentType,
                            upsert: true,
                            cacheControl: '31536000',
                        });
                    if (error) throw new Error(error.message);
                }

                mappingFile.mapping.push({
                    originalUrl: item.url,
                    category: item.category,
                    objectPath,
                    publicUrl,
                    bytes: buf.length,
                    sha256: hash,
                    status: 'uploaded',
                });
                existing.add(item.url);
            }

            added += 1;
        } catch (err) {
            failed += 1;
            console.error(`✗ ${item.url} — ${err.message}`);
        }
    }

    if (!DRY_RUN) {
        mappingFile.totals = {
            ...mappingFile.totals,
            total: mappingFile.mapping.length,
            uploaded: mappingFile.mapping.filter((e) => e.status === 'uploaded').length,
            failed: mappingFile.mapping.filter((e) => e.status !== 'uploaded').length,
            totalBytes: mappingFile.mapping.reduce((s, e) => s + (e.bytes || 0), 0),
        };
        mappingFile.totals.totalHuman = `${(mappingFile.totals.totalBytes / 1024 / 1024).toFixed(2)} Mo`;
        mappingFile.generatedAt = new Date().toISOString();
        fs.writeFileSync(MAPPING_JSON, JSON.stringify(mappingFile, null, 2), 'utf8');
    }

    console.log('');
    console.log(`Ajoutés : ${added} — Échecs : ${failed}`);
    console.log(`Table de correspondance : ${mappingFile.mapping.length} entrées`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
