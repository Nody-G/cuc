/**
 * RELÈVEMENT DE LA LIMITE DE TAILLE DU BUCKET SUPABASE STORAGE
 * ============================================================
 *
 * Le bucket `cuc-vitrine-assets` a `file_size_limit = null`, ce qui laisse
 * s'appliquer la limite globale du projet (50 Mo sur l'offre gratuite). Les
 * deux reportages TV (82.09 Mo et 119.62 Mo) sont donc rejetés avec
 * « The object exceeded the maximum allowed size ».
 *
 * L'API Management Supabase n'expose pas de `PUT /storage/buckets/{id}`
 * (HTTP 404). On met donc à jour la table `storage.buckets` directement via
 * l'endpoint SQL de l'API Management — c'est la source de vérité lue par le
 * service Storage.
 *
 * Idempotent : relancer le script réapplique la même configuration.
 *
 * Prérequis : `SUPABASE_ACCESS_TOKEN` dans `.env.local`.
 *
 * Usage :
 *   node scripts/raise_bucket_size_limit.mjs
 *   node scripts/raise_bucket_size_limit.mjs --limit-mo 250
 */

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const PROJECT_REF = 'xkbkcsypftvspmkfnrfm';
const BUCKET = 'cuc-vitrine-assets';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

const limitArgIdx = process.argv.indexOf('--limit-mo');
const LIMIT_MO = limitArgIdx !== -1 ? Number(process.argv[limitArgIdx + 1]) : 200;
const LIMIT_BYTES = Math.round(LIMIT_MO * 1024 * 1024);

if (!TOKEN) {
    console.error('SUPABASE_ACCESS_TOKEN manquant dans .env.local');
    process.exit(1);
}

if (!Number.isFinite(LIMIT_MO) || LIMIT_MO <= 0) {
    console.error(`Limite invalide : ${LIMIT_MO} Mo`);
    process.exit(1);
}

async function sql(query) {
    const res = await fetch(
        `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        }
    );
    const text = await res.text();
    let json = null;
    try {
        json = JSON.parse(text);
    } catch {
        /* réponse non JSON */
    }
    return { ok: res.ok, status: res.status, json, text };
}

async function run() {
    console.log('=== RELÈVEMENT DE LA LIMITE DU BUCKET ===');
    console.log(`Projet : ${PROJECT_REF} | Bucket : ${BUCKET}`);
    console.log(`Nouvelle limite : ${LIMIT_MO} Mo (${LIMIT_BYTES} octets)`);
    console.log('');

    const before = await sql(
        `select id, name, public, file_size_limit, allowed_mime_types from storage.buckets where id = '${BUCKET}';`
    );
    if (!before.ok) {
        console.error(`Lecture impossible (HTTP ${before.status})`);
        console.error(before.text.slice(0, 500));
        process.exit(1);
    }
    console.log('Avant :', JSON.stringify(before.json));

    const update = await sql(
        `update storage.buckets set file_size_limit = ${LIMIT_BYTES} where id = '${BUCKET}';`
    );
    if (!update.ok) {
        console.error(`\nÉchec de la mise à jour (HTTP ${update.status})`);
        console.error(update.text.slice(0, 800));
        process.exit(1);
    }
    console.log('\nMise à jour appliquée.');

    const after = await sql(
        `select id, name, public, file_size_limit, allowed_mime_types from storage.buckets where id = '${BUCKET}';`
    );
    console.log('Après :', JSON.stringify(after.json));

    const row = Array.isArray(after.json) ? after.json[0] : null;
    if (row && Number(row.file_size_limit) === LIMIT_BYTES) {
        console.log(`\n✓ file_size_limit = ${row.file_size_limit} octets (${LIMIT_MO} Mo)`);
    } else {
        console.error('\n✗ La limite n\'a pas été appliquée comme attendu.');
        process.exit(1);
    }
}

run().catch((err) => {
    console.error('Erreur fatale :', err);
    process.exit(1);
});
