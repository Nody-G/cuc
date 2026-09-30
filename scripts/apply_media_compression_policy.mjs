/**
 * POLITIQUE MÉDIA DU BUCKET SUPABASE STORAGE
 * ==========================================
 *
 * Pose, sur le bucket `cuc-vitrine-assets`, la liste des types MIME autorisés
 * (aujourd'hui absente : `allowed_mime_types = null`, donc n'importe quel
 * fichier peut être stocké) et rapporte le plafond de taille en vigueur.
 *
 * Ce que ce script ne fait **pas**, volontairement :
 *
 *  - Il ne baisse pas `file_size_limit`. Le plafond du bucket est *global* :
 *    le ramener à 45 Mo pour cadrer la vidéo refuserait aussi un PDF légitime
 *    de 60 Mo. Les plafonds par nature (image 8 Mo, document 20 Mo, vidéo
 *    45 Mo) vivent dans `media-policy.ts` et sont appliqués par le ticket
 *    serveur — seul endroit capable d'exprimer une règle par nature.
 *  - Il ne touche pas aux politiques RLS de `storage.objects`. Les dépôts du
 *    Cockpit passent par des URL signées dont la validité tient à la signature
 *    du jeton, et le service role contourne RLS : durcir ces politiques est une
 *    opération à part, qui exige de vérifier d'abord ce qui existe.
 *
 * Idempotent. Lecture seule par défaut.
 *
 * Prérequis : `SUPABASE_ACCESS_TOKEN` dans `.env.local`.
 *
 * Usage :
 *   npm run media:policy              # constat, aucune écriture
 *   npm run media:policy:write        # applique la liste des types MIME
 *   node scripts/apply_media_compression_policy.mjs --limit-mo 60 --write
 */

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const PROJECT_REF = 'xkbkcsypftvspmkfnrfm';
const BUCKET = 'cuc-vitrine-assets';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

const WRITE = process.argv.includes('--write');
const limitArgIdx = process.argv.indexOf('--limit-mo');
const LIMIT_MO = limitArgIdx !== -1 ? Number(process.argv[limitArgIdx + 1]) : null;

/** Union des natures admises par `src/lib/media-library/media-policy.ts`. */
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/svg+xml',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf',
    'text/csv',
    'text/plain',
];

if (!TOKEN) {
    console.error('SUPABASE_ACCESS_TOKEN manquant dans .env.local');
    process.exit(1);
}

if (limitArgIdx !== -1 && (!Number.isFinite(LIMIT_MO) || LIMIT_MO <= 0)) {
    console.error(`Limite invalide : ${LIMIT_MO} Mo`);
    process.exit(1);
}

/** Interroge l'endpoint SQL de l'API Management. */
async function sql(query) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    });
    const text = await res.text();
    let json = null;
    try {
        json = JSON.parse(text);
    } catch {
        /* réponse non JSON : le texte brut sert au diagnostic */
    }
    return { ok: res.ok, status: res.status, json, text };
}

function humanMo(bytes) {
    return bytes == null ? 'null (défaut du projet)' : `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

async function run() {
    console.log('=== POLITIQUE MÉDIA DU BUCKET ===');
    console.log(`Projet : ${PROJECT_REF} | Bucket : ${BUCKET}`);
    console.log(`Mode   : ${WRITE ? 'ÉCRITURE' : 'lecture seule (--write pour appliquer)'}`);
    console.log('');

    const before = await sql(
        `select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = '${BUCKET}';`,
    );
    if (!before.ok) {
        console.error(`Lecture impossible (HTTP ${before.status}) : ${before.text.slice(0, 300)}`);
        process.exit(1);
    }

    const row = Array.isArray(before.json) ? before.json[0] : null;
    if (!row) {
        console.error(`Bucket introuvable : ${BUCKET}`);
        process.exit(1);
    }

    const currentMime = Array.isArray(row.allowed_mime_types) ? row.allowed_mime_types : null;
    const missing = ALLOWED_MIME_TYPES.filter((mime) => !(currentMime || []).includes(mime));
    const extra = (currentMime || []).filter((mime) => !ALLOWED_MIME_TYPES.includes(mime));

    console.log(`public            : ${row.public}`);
    console.log(`file_size_limit   : ${humanMo(row.file_size_limit)}`);
    console.log(`allowed_mime_types: ${currentMime ? currentMime.join(', ') : 'null (aucune restriction)'}`);
    console.log('');

    if (missing.length === 0 && !LIMIT_MO) {
        console.log('✓ Types MIME déjà conformes à la politique média.');
        return;
    }

    if (missing.length > 0) {
        console.log(`Types à autoriser (${missing.length}) : ${missing.join(', ')}`);
        if (extra.length > 0) {
            console.log(`Types hors politique, conservés par prudence : ${extra.join(', ')}`);
        }
    }
    if (LIMIT_MO) {
        console.log(`Nouveau plafond global demandé : ${LIMIT_MO} Mo`);
        if (row.file_size_limit && LIMIT_MO * 1024 * 1024 < row.file_size_limit) {
            console.log(
                '⚠ Ce plafond est INFÉRIEUR à celui en vigueur : des vidéos déjà stockées ' +
                'resteront lisibles, mais tout réimport de même taille sera refusé.',
            );
        }
    }

    if (!WRITE) {
        console.log('\nLecture seule : rien n’a été modifié.');
        console.log('Appliquez avec : npm run media:policy:write');
        return;
    }

    // `extra` est conservé : retirer un type autorisé casserait un usage
    // existant sans preuve qu'il est indésirable.
    const nextMime = [...new Set([...(currentMime || []), ...ALLOWED_MIME_TYPES])];
    const limitSql = LIMIT_MO ? Math.round(LIMIT_MO * 1024 * 1024) : row.file_size_limit;
    const mimeSql = `array[${nextMime.map((mime) => `'${mime}'`).join(',')}]::text[]`;

    const update = await sql(
        `update storage.buckets
            set allowed_mime_types = ${mimeSql},
                file_size_limit = ${limitSql === null ? 'null' : limitSql}
          where id = '${BUCKET}'
          returning id, file_size_limit, allowed_mime_types;`,
    );

    if (!update.ok) {
        console.error(`Écriture refusée (HTTP ${update.status}) : ${update.text.slice(0, 300)}`);
        process.exit(1);
    }

    const after = Array.isArray(update.json) ? update.json[0] : null;
    console.log('\n--- Après ---');
    console.log(`file_size_limit   : ${humanMo(after?.file_size_limit ?? null)}`);
    console.log(`allowed_mime_types: ${(after?.allowed_mime_types || []).join(', ')}`);
    console.log('\n✓ Politique appliquée.');
    console.log(
        'Rappel : les plafonds par nature (image 8 Mo, document 20 Mo, vidéo 45 Mo) sont ' +
        'appliqués par le ticket serveur, pas par le bucket.',
    );
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
