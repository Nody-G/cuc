/**
 * INSPECTION DU BUCKET SUPABASE STORAGE
 * =====================================
 *
 * Interroge l'API Management Supabase pour lire la configuration du bucket
 * `cuc-vitrine-assets` : `public`, `file_size_limit`, `allowed_mime_types`.
 *
 * Objectif : diagnostiquer l'échec d'upload des 2 reportages TV
 * (« The object exceeded the maximum allowed size ») et déterminer la limite
 * exacte à relever.
 *
 * Prérequis : `SUPABASE_ACCESS_TOKEN` dans `.env.local`.
 *
 * Usage :
 *   node scripts/inspect_storage_bucket.mjs
 */

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const PROJECT_REF = 'xkbkcsypftvspmkfnrfm';
const BUCKET = 'cuc-vitrine-assets';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';

if (!TOKEN) {
    console.error('SUPABASE_ACCESS_TOKEN manquant dans .env.local');
    process.exit(1);
}

async function api(pathname) {
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}${pathname}`, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
        },
    });
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
    console.log('=== INSPECTION DU BUCKET SUPABASE STORAGE ===');
    console.log(`Projet : ${PROJECT_REF} | Bucket : ${BUCKET}`);
    console.log('');

    const list = await api('/storage/buckets');
    if (!list.ok) {
        console.error(`Échec de lecture des buckets (HTTP ${list.status})`);
        console.error(list.text.slice(0, 500));
        process.exit(1);
    }

    const buckets = Array.isArray(list.json) ? list.json : [];
    console.log(`Buckets trouvés : ${buckets.length}`);
    for (const b of buckets) {
        const marker = b.name === BUCKET || b.id === BUCKET ? ' ← CIBLE' : '';
        console.log(
            `  - ${b.name || b.id} | public=${b.public} | file_size_limit=${b.file_size_limit ?? 'null (défaut global)'} | mime=${b.allowed_mime_types ? b.allowed_mime_types.join(',') : 'null'}${marker}`
        );
    }

    const target = buckets.find((b) => b.name === BUCKET || b.id === BUCKET);
    if (!target) {
        console.error(`\nBucket « ${BUCKET} » introuvable.`);
        process.exit(1);
    }

    console.log('\n--- Configuration cible (JSON) ---');
    console.log(JSON.stringify(target, null, 2));

    const limit = target.file_size_limit;
    console.log('\n--- Diagnostic ---');
    if (limit == null) {
        console.log('file_size_limit = null → la limite globale du projet s\'applique.');
    } else {
        console.log(`file_size_limit = ${limit} octets (${(limit / 1024 / 1024).toFixed(2)} Mo)`);
    }
    console.log('Vidéos à téléverser : 82.09 Mo (TF1) et 119.62 Mo (France 2).');
}

run().catch((err) => {
    console.error('Erreur fatale :', err);
    process.exit(1);
});
