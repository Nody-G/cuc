/**
 * RECOMPRESSION DES MÉDIAS DÉJÀ STOCKÉS
 * =====================================
 *
 * Mesure puis dépose un dérivé WebP léger pour chaque image du bucket
 * `cuc-vitrine-assets`, en appliquant exactement la même politique que le
 * téléversement du Cockpit — les seuils viennent de
 * `src/lib/media-library/media-policy.ts`, importé ici via `tsx` : une seule
 * source de vérité, aucune copie de constantes.
 *
 * Ordre canonique, inviolable (`.agents/rules/media_compression.md` § 6) :
 *
 *   1. mesurer          → ce script, lecture seule par défaut ;
 *   2. déposer le dérivé → `--write` ;
 *   3. vérifier le 200  → fait par ce script après chaque dépôt ;
 *   4. réécrire les références (code + base) → étape séparée, revue à la main ;
 *   5. supprimer l'ancien objet → étape séparée, après (4).
 *
 * Ce script **ne supprime rien** et **ne réécrit aucune URL**. Un objet
 * supprimé avant réécriture casse la vitrine sans avertissement : la
 * suppression est délibérément laissée à une décision humaine.
 *
 * Prérequis : `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`, et `sharp`.
 *
 * Usage :
 *   npm run media:recompress                      # constat chiffré
 *   npm run media:recompress:write                # dépose les dérivés
 *   node scripts/recompress_bucket_media.mjs --json
 *   node scripts/recompress_bucket_media.mjs --include-reserved   # _trash, _originals
 */

import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

import {
    ORIGINALS_ROOT,
    TRASH_ROOT,
    profileForPath,
} from '../src/lib/media-library/media-policy.ts';
import {
    compressionGain,
    extensionOf,
    planCompression,
    replaceExtension,
    shouldKeepCompressed,
} from '../src/lib/media-library/image-compression.plan.ts';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const BUCKET = 'cuc-vitrine-assets';
const WRITE = process.argv.includes('--write');
const JSON_OUT = process.argv.includes('--json');
const INCLUDE_RESERVED = process.argv.includes('--include-reserved');
const REPORT_PATH = path.join('scripts', 'media_recompression_report.json');

const COMPRESSIBLE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

if (!SERVICE_KEY) {
    console.error('SUPABASE_SERVICE_ROLE_KEY manquante dans .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

/** Octets lisibles. */
function human(bytes) {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

/** Liste récursivement tous les objets du bucket. */
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
            const isFolder = entry.id === null && entry.metadata === null;
            if (isFolder) {
                if (!INCLUDE_RESERVED && (entry.name === TRASH_ROOT || entry.name === ORIGINALS_ROOT)) {
                    continue;
                }
                out.push(...(await listAll(full)));
            } else {
                out.push({
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

/** Type MIME déduit de l'extension quand le stockage n'en annonce aucun. */
function mimeFromExtension(name) {
    const ext = extensionOf(name);
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'png') return 'image/png';
    if (ext === 'webp') return 'image/webp';
    return '';
}

/** Analyse un objet et renvoie son plan de recompression, sans rien écrire. */
async function analyse(object) {
    const profile = profileForPath(object.path);
    const extension = extensionOf(object.path);
    if (!COMPRESSIBLE_EXTENSIONS.has(extension)) {
        return { ...object, applicable: false, reason: 'not-a-raster-image', profile: profile.id };
    }

    const { data, error } = await supabase.storage.from(BUCKET).download(object.path);
    if (error || !data) {
        return { ...object, applicable: false, reason: `download-failed`, profile: profile.id };
    }

    const source = Buffer.from(await data.arrayBuffer());
    const metadata = await sharp(source).metadata();
    const info = {
        bytes: source.length,
        width: metadata.width ?? 0,
        height: metadata.height ?? 0,
        mime: object.mimetype || mimeFromExtension(object.path),
        name: object.path,
    };

    const decision = planCompression(info, profile);
    if (!decision.compress) {
        return { ...object, applicable: false, reason: decision.reason, profile: profile.id };
    }

    const output = await sharp(source)
        .rotate()
        .resize({
            width: decision.box.width,
            height: decision.box.height,
            fit: 'inside',
            withoutEnlargement: true,
        })
        .webp({ quality: Math.round(profile.quality * 100) })
        .toBuffer();

    if (!shouldKeepCompressed(source.length, output.length)) {
        return { ...object, applicable: false, reason: 'no-gain', profile: profile.id };
    }

    const gain = compressionGain(source.length, output.length);
    return {
        ...object,
        applicable: true,
        profile: profile.id,
        targetPath: replaceExtension(object.path, 'webp'),
        bytesBefore: source.length,
        bytesAfter: output.length,
        gain,
        width: decision.box.width,
        height: decision.box.height,
        output,
    };
}

/** Dépose le dérivé puis vérifie qu'il répond réellement, avant tout constat de succès. */
async function apply(object) {
    const { data, error } = await supabase.storage.from(BUCKET).upload(object.targetPath, object.output, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false,
    });
    if (error) return { applied: false, verified: false, error: error.message };

    const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    try {
        const response = await fetch(publicUrl.publicUrl, { method: 'HEAD' });
        return {
            applied: true,
            verified: response.ok,
            publicUrl: publicUrl.publicUrl,
            error: response.ok ? undefined : `HTTP ${response.status} sur le dérivé`,
        };
    } catch (err) {
        return { applied: true, verified: false, publicUrl: publicUrl.publicUrl, error: String(err) };
    }
}

async function run() {
    if (!JSON_OUT) {
        console.log('=== RECOMPRESSION DES MÉDIAS DU BUCKET ===');
        console.log(`Bucket : ${BUCKET} | Mode : ${WRITE ? 'ÉCRITURE (aucune suppression)' : 'lecture seule'}`);
        console.log('');
    }

    const objects = await listAll('');
    const images = objects.filter((object) =>
        COMPRESSIBLE_EXTENSIONS.has(extensionOf(object.path)),
    );

    if (!JSON_OUT) {
        console.log(`${objects.length} objet(s) parcouru(s), ${images.length} image(s) candidate(s).`);
    }

    const entries = [];
    let examined = 0;

    for (const object of images) {
        examined += 1;
        if (!JSON_OUT && examined % 25 === 0) {
            console.log(`  … ${examined}/${images.length}`);
        }

        let analysis;
        try {
            analysis = await analyse(object);
        } catch (err) {
            entries.push({ path: object.path, applicable: false, reason: `analyse-failed: ${err.message}` });
            continue;
        }

        if (!analysis.applicable) {
            entries.push({
                path: object.path,
                applicable: false,
                reason: analysis.reason,
                profile: analysis.profile,
                bytesBefore: analysis.size,
            });
            continue;
        }

        const entry = {
            path: object.path,
            targetPath: analysis.targetPath,
            applicable: true,
            reason: 'compressible',
            profile: analysis.profile,
            bytesBefore: analysis.bytesBefore,
            bytesAfter: analysis.bytesAfter,
            savedBytes: analysis.gain.savedBytes,
            gain: analysis.gain.label,
        };

        if (WRITE) {
            const result = await apply(analysis);
            entry.applied = result.applied;
            entry.verified = result.verified;
            entry.publicUrl = result.publicUrl;
            if (result.error) entry.error = result.error;
            if (!JSON_OUT) {
                console.log(
                    `  ${result.verified ? '✓' : '!'} ${object.path} → ${analysis.targetPath} ` +
                    `(${human(analysis.bytesBefore)} → ${human(analysis.bytesAfter)}, ${entry.gain})`,
                );
            }
        }

        entries.push(entry);
    }

    const candidates = entries.filter((entry) => entry.applicable);
    const savedBytes = candidates.reduce((total, entry) => total + (entry.savedBytes || 0), 0);
    const verified = candidates.filter((entry) => entry.verified).length;
    const report = {
        generatedAt: new Date().toISOString(),
        bucket: BUCKET,
        write: WRITE,
        scannedObjects: objects.length,
        scannedImages: images.length,
        candidates: candidates.length,
        savedBytes,
        entries,
    };

    fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    if (JSON_OUT) {
        console.log(JSON.stringify(report));
        return;
    }

    console.log('');
    console.log(`Candidats à la recompression : ${candidates.length}/${images.length}`);
    console.log(`Gain mesuré                 : ${human(savedBytes)}`);
    if (WRITE) {
        console.log(`Dérivés déposés et vérifiés : ${verified}/${candidates.length}`);
    }
    console.log(`Rapport écrit dans          : ${REPORT_PATH}`);

    const heaviest = [...candidates].sort((a, b) => b.savedBytes - a.savedBytes).slice(0, 10);
    if (heaviest.length > 0) {
        console.log('\n--- Dix plus gros gains ---');
        for (const entry of heaviest) {
            console.log(
                `  ${entry.gain.padStart(7)}  ${human(entry.bytesBefore).padStart(9)} → ` +
                `${human(entry.bytesAfter).padStart(9)}  ${entry.path}`,
            );
        }
    }

    console.log('\n--- Étape suivante (manuelle, jamais automatique) ---');
    console.log(
        '  1. Réécrire les références vers les chemins `targetPath` (code + base) — ' +
        'aucun remplacement automatique n’est fait ici.',
    );
    console.log('  2. Vérifier la vitrine : npm run media:verify:reachable && npm run content:verify:live');
    console.log('  3. Mesurer : npm run media:audit && npm run audit:quotas');
    console.log('  4. Seulement alors, supprimer les anciens objets (hors périmètre de ce script).');
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
