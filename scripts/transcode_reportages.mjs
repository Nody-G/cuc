/**
 * TRANSCODAGE DES REPORTAGES TV POUR SUPABASE STORAGE
 * ===================================================
 *
 * Contexte : le plan Supabase impose une limite dure de 50 Mo par objet,
 * indépendante de `storage.buckets.file_size_limit` (vérifié : 45 Mo passe,
 * 55 Mo échoue). Les deux reportages d'origine (82.09 Mo et 119.62 Mo) ne
 * peuvent donc pas être téléversés tels quels.
 *
 * Ce script les réencode en H.264/AAC 720p avec un débit cible calculé pour
 * rester sous un plafond de sécurité (par défaut 45 Mo), sans dégrader
 * sensiblement la lisibilité d'un reportage TV.
 *
 * Le débit vidéo est dérivé de la durée réelle :
 *   videoBitrate = (plafondOctets * 8 / durée) - audioBitrate - margeMux
 *
 * Sortie : `.staging/media/video/optimized/<nom>.mp4`
 *
 * Prérequis : `ffmpeg` et `ffprobe` dans le PATH.
 *
 * Usage :
 *   node scripts/transcode_reportages.mjs
 *   node scripts/transcode_reportages.mjs --max-mo 45
 *   node scripts/transcode_reportages.mjs --dry-run
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const VIDEO_DIR = path.join('.staging', 'media', 'video');
const OUT_DIR = path.join(VIDEO_DIR, 'optimized');

const maxArgIdx = process.argv.indexOf('--max-mo');
const MAX_MO = maxArgIdx !== -1 ? Number(process.argv[maxArgIdx + 1]) : 45;
const DRY_RUN = process.argv.includes('--dry-run');

const AUDIO_BITRATE_KBPS = 96;
const MUX_MARGIN_KBPS = 40;

/**
 * Paliers de résolution, du plus haut au plus bas. On retient le premier
 * palier dont le débit vidéo cible reste au-dessus du seuil de lisibilité
 * (`MIN_VIDEO_KBPS`). Un reportage TV de 21 min ne peut pas tenir sous 45 Mo
 * en 720p ; il bascule alors en 480p, voire 360p.
 */
const LADDER = [
    { height: 720, minKbps: 900 },
    { height: 576, minKbps: 600 },
    { height: 480, minKbps: 400 },
    { height: 360, minKbps: 220 },
];
const MIN_VIDEO_KBPS = 220;

/**
 * Découpage : un reportage trop long pour tenir sous le plafond à qualité
 * lisible est scindé en segments de durée égale. Chaque segment est encodé
 * indépendamment, ce qui permet de conserver une résolution correcte.
 */
const SEGMENT_TARGET_MO = 42;

const SOURCES = [
    'TF1-JT-20h-CUC-reportage-1.mp4',
    '20h30-A-LECOLE-DES-CASCADEURS-FRANCE2-VWeb2-1.mp4',
];

function probe(filePath) {
    const raw = execFileSync(
        'ffprobe',
        [
            '-v', 'error',
            '-show_entries', 'format=duration,size',
            '-of', 'json',
            filePath,
        ],
        { encoding: 'utf-8' }
    );
    const json = JSON.parse(raw);
    return {
        duration: Number(json.format.duration),
        size: Number(json.format.size),
    };
}

function formatMo(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(2)} Mo`;
}

async function run() {
    console.log('=== TRANSCODAGE DES REPORTAGES TV ===');
    console.log(`Plafond cible : ${MAX_MO} Mo | Audio : ${AUDIO_BITRATE_KBPS} kbps AAC`);
    if (DRY_RUN) console.log('(mode --dry-run : aucun encodage)');
    console.log('');

    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    const results = [];

    for (let i = 0; i < SOURCES.length; i++) {
        const name = SOURCES[i];
        const input = path.join(VIDEO_DIR, name);
        const label = `[${i + 1}/${SOURCES.length}] ${name}`;

        if (!fs.existsSync(input)) {
            console.error(`${label} — SOURCE INTROUVABLE : ${input}`);
            results.push({ name, status: 'missing' });
            continue;
        }

        const { duration, size } = probe(input);
        const maxBytes = MAX_MO * 1024 * 1024;

        // Détermine si le fichier tient en un seul segment à qualité lisible.
        const wholeKbps = Math.floor((maxBytes * 8) / duration / 1000) - AUDIO_BITRATE_KBPS - MUX_MARGIN_KBPS;
        const wholeRung = LADDER.find((r) => wholeKbps >= r.minKbps) || null;

        // Sinon, on découpe en N segments de durée égale.
        const segBytes = SEGMENT_TARGET_MO * 1024 * 1024;
        const segments = wholeRung
            ? 1
            : Math.max(2, Math.ceil((duration * 8 * 1000) / (segBytes * 8 / 1000) / 1000));
        const segDuration = duration / segments;
        const segKbps = Math.floor((segBytes * 8) / segDuration / 1000) - AUDIO_BITRATE_KBPS - MUX_MARGIN_KBPS;
        const segRung = LADDER.find((r) => segKbps >= r.minKbps) || null;

        const videoKbps = wholeRung ? wholeKbps : segKbps;
        const rung = wholeRung || segRung;

        console.log(`${label}`);
        console.log(`  source : ${formatMo(size)} | durée ${duration.toFixed(1)} s`);

        if (!rung) {
            console.error(
                `  ✗ Aucun palier lisible (${videoKbps} kbps < ${MIN_VIDEO_KBPS} kbps) — relever le plafond.`
            );
            results.push({ name, status: 'infeasible', videoKbps, duration, size });
            continue;
        }

        console.log(
            `  découpage : ${segments} segment(s) de ${segDuration.toFixed(1)} s | ${rung.height}p @ ${videoKbps} kbps`
        );

        if (DRY_RUN) {
            results.push({
                name,
                status: 'dry-run',
                videoKbps,
                height: rung.height,
                segments,
                segmentDuration: segDuration,
                duration,
                size,
            });
            continue;
        }

        const outputs = [];
        let allOk = true;

        for (let s = 0; s < segments; s++) {
            const start = s * segDuration;
            const outName =
                segments === 1
                    ? name
                    : name.replace(/\.mp4$/i, `-part${s + 1}.mp4`);
            const output = path.join(OUT_DIR, outName);

            const args = [
                '-y',
                '-ss', start.toFixed(3),
                '-t', segDuration.toFixed(3),
                '-i', input,
                '-c:v', 'libx264',
                '-preset', 'slow',
                '-profile:v', 'high',
                '-level', '4.0',
                '-b:v', `${videoKbps}k`,
                '-maxrate', `${Math.round(videoKbps * 1.25)}k`,
                '-bufsize', `${Math.round(videoKbps * 2)}k`,
                '-vf', `scale=-2:${rung.height}`,
                '-pix_fmt', 'yuv420p',
                '-c:a', 'aac',
                '-b:a', `${AUDIO_BITRATE_KBPS}k`,
                '-ac', '2',
                '-movflags', '+faststart',
                output,
            ];

            try {
                execFileSync('ffmpeg', args, { stdio: ['ignore', 'ignore', 'pipe'] });
            } catch (err) {
                console.error(`  ✗ Échec ffmpeg (segment ${s + 1}) : ${err.message}`);
                allOk = false;
                break;
            }

            const outSize = fs.statSync(output).size;
            const okSize = outSize <= maxBytes;
            if (!okSize) allOk = false;
            console.log(
                `    segment ${s + 1}/${segments} : ${formatMo(outSize)} ${okSize ? '✓' : '⚠ DÉPASSE'}`
            );
            outputs.push({ file: outName, bytes: outSize, start, duration: segDuration });
        }

        results.push({
            name,
            status: allOk ? 'ok' : 'failed',
            inputBytes: size,
            videoKbps,
            height: rung.height,
            segments,
            duration,
            outputs,
        });
    }

    console.log('');
    // En mode --dry-run, un plan valide (`dry-run`) compte comme un succès :
    // le but de la simulation est de prouver qu'un découpage lisible existe.
    const okCount = results.filter(
        (r) => r.status === 'ok' || (DRY_RUN && r.status === 'dry-run')
    ).length;
    console.log(
        `Résultat : ${okCount}/${SOURCES.length} source(s) ${DRY_RUN ? 'planifiée(s)' : 'découpée(s)'} sous le plafond de ${MAX_MO} Mo`
    );

    const reportPath = path.join('scripts', 'reportages_transcode_report.json');
    fs.writeFileSync(
        reportPath,
        JSON.stringify(
            {
                generatedAt: new Date().toISOString(),
                maxMo: MAX_MO,
                audioKbps: AUDIO_BITRATE_KBPS,
                results,
            },
            null,
            2
        ) + '\n',
        'utf-8'
    );
    console.log(`Rapport écrit : ${reportPath}`);

    if (okCount !== SOURCES.length) process.exit(1);
}

run().catch((err) => {
    console.error('Erreur fatale :', err);
    process.exit(1);
});
