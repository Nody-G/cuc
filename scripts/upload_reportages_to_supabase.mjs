/**
 * TÉLÉVERSEMENT DES REPORTAGES TV VERS SUPABASE STORAGE
 * =====================================================
 *
 * Contexte : les deux reportages TV étaient historiquement servis depuis
 * l'ancien site WordPress (`campus-universcascades.com/wp-content/...`).
 * Ils sont désormais rapatriés dans le bucket `cuc-vitrine-assets`, sous le
 * préfixe `media/reportages/`, afin de supprimer toute dépendance à l'ancien
 * site (doctrine « Zéro Texte ni Valeur Orpheline »).
 *
 * Contrainte : Supabase Storage impose une limite dure de 50 Mo par objet
 * (indépendante de `storage.buckets.file_size_limit`). Les sources brutes
 * (82.09 Mo et 119.62 Mo) dépassent ce plafond ; elles sont donc d'abord
 * réencodées et découpées par `scripts/transcode_reportages.mjs`, qui produit
 * un rapport dans `scripts/reportages_transcode_report.json`.
 *
 * Ce script consomme ce rapport et téléverse chaque segment.
 *
 * Usage :
 *   node scripts/upload_reportages_to_supabase.mjs --dry-run
 *   node scripts/upload_reportages_to_supabase.mjs
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'cuc-vitrine-assets';
const PREFIX = 'media/reportages';
const VIDEO_DIR = path.join('.staging', 'media', 'video');
const OUT_DIR = path.join(VIDEO_DIR, 'optimized');
const REPORT_PATH = path.join('scripts', 'reportages_transcode_report.json');
const MAPPING_PATH = path.join('scripts', 'reportages_url_mapping.json');

const DRY_RUN = process.argv.includes('--dry-run');

/**
 * URL publique d'origine (ancien site WordPress) pour chaque reportage.
 * Sert de clé de correspondance dans le mapping final.
 */
const LEGACY_URLS = {
    'TF1-JT-20h-CUC-reportage-1.mp4':
        'https://www.campus-universcascades.com/wp-content/uploads/2023/02/TF1-JT-20h-CUC-reportage-1.mp4',
    '20h30-A-LECOLE-DES-CASCADEURS-FRANCE2-VWeb2-1.mp4':
        'https://www.campus-universcascades.com/wp-content/uploads/2023/02/20h30-A-LECOLE-DES-CASCADEURS-FRANCE2-VWeb2-1.mp4',
};

function loadEnv() {
    const envPath = path.join('.env.local');
    if (!fs.existsSync(envPath)) return;
    for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (!m) continue;
        const key = m[1];
        let value = m[2].trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
    }
}

function formatMo(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(2)} Mo`;
}

async function run() {
    loadEnv();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
        console.error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
        process.exit(1);
    }

    if (!fs.existsSync(REPORT_PATH)) {
        console.error(`Rapport de transcodage introuvable : ${REPORT_PATH}`);
        console.error('Lancez d\'abord : node scripts/transcode_reportages.mjs --max-mo 49');
        process.exit(1);
    }

    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'));
    const supabase = createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    console.log('=== TÉLÉVERSEMENT DES REPORTAGES TV ===');
    console.log(`Bucket : ${BUCKET} | Préfixe : ${PREFIX}`);
    if (DRY_RUN) console.log('(mode --dry-run : aucun téléversement)');
    console.log('');

    const mapping = [];
    let uploaded = 0;
    let failed = 0;

    for (const entry of report.results) {
        if (entry.status !== 'ok') {
            console.error(`[SKIP] ${entry.name} — statut « ${entry.status} »`);
            failed++;
            continue;
        }

        const legacyUrl = LEGACY_URLS[entry.name] || null;
        const segments = [];

        for (const out of entry.outputs) {
            const localPath = path.join(OUT_DIR, out.file);
            if (!fs.existsSync(localPath)) {
                console.error(`  ✗ Segment introuvable : ${localPath}`);
                failed++;
                continue;
            }

            const bytes = fs.statSync(localPath).size;
            const objectPath = `${PREFIX}/${out.file}`;
            const publicUrl = `${url}/storage/v1/object/public/${BUCKET}/${objectPath}`;

            console.log(`  ${out.file} — ${formatMo(bytes)}`);

            if (DRY_RUN) {
                console.log(`    → ${publicUrl}`);
                segments.push({ file: out.file, bytes, objectPath, publicUrl });
                continue;
            }

            const buffer = fs.readFileSync(localPath);
            const { error } = await supabase.storage
                .from(BUCKET)
                .upload(objectPath, buffer, {
                    contentType: 'video/mp4',
                    cacheControl: '31536000',
                    upsert: true,
                });

            if (error) {
                console.error(`    ✗ Échec : ${error.message}`);
                failed++;
                continue;
            }

            console.log(`    ✓ ${publicUrl}`);
            uploaded++;
            segments.push({ file: out.file, bytes, objectPath, publicUrl });
        }

        mapping.push({
            source: entry.name,
            legacyUrl,
            height: entry.height,
            videoKbps: entry.videoKbps,
            segments,
        });
    }

    console.log('');
    console.log(
        DRY_RUN
            ? `Résultat (dry-run) : ${mapping.reduce((n, m) => n + m.segments.length, 0)} segment(s) planifié(s)`
            : `Résultat : ${uploaded} segment(s) téléversé(s), ${failed} échec(s)`
    );

    fs.writeFileSync(
        MAPPING_PATH,
        JSON.stringify(
            {
                generatedAt: new Date().toISOString(),
                bucket: BUCKET,
                prefix: PREFIX,
                mapping,
            },
            null,
            2
        ) + '\n',
        'utf-8'
    );
    console.log(`Mapping écrit : ${MAPPING_PATH}`);

    if (failed > 0) process.exit(1);
}

run().catch((err) => {
    console.error('Erreur fatale :', err);
    process.exit(1);
});
