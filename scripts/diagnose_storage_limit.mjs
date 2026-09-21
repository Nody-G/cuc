/**
 * DIAGNOSTIC DE LA LIMITE DE TAILLE SUPABASE STORAGE
 * ==================================================
 *
 * L'upload des reportages échoue toujours avec « The object exceeded the
 * maximum allowed size » malgré `storage.buckets.file_size_limit = 200 Mo`.
 *
 * Ce script vérifie :
 *   1. la valeur réellement stockée dans `storage.buckets` ;
 *   2. la limite globale du projet (`storage.buckets` vs config plateforme) ;
 *   3. un upload témoin de 60 Mo pour situer le seuil effectif.
 *
 * Prérequis : `SUPABASE_ACCESS_TOKEN` + `SUPABASE_SERVICE_ROLE_KEY`.
 *
 * Usage :
 *   node scripts/diagnose_storage_limit.mjs
 */

import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const PROJECT_REF = 'xkbkcsypftvspmkfnrfm';
const BUCKET = 'cuc-vitrine-assets';
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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
        /* non JSON */
    }
    return { ok: res.ok, status: res.status, json, text };
}

async function run() {
    console.log('=== DIAGNOSTIC LIMITE STORAGE ===\n');

    console.log('--- 1. storage.buckets ---');
    const buckets = await sql(
        `select id, name, public, file_size_limit, allowed_mime_types from storage.buckets order by id;`
    );
    console.log(JSON.stringify(buckets.json, null, 2));

    console.log('\n--- 2. Limite globale projet (storage.config / settings) ---');
    const cfg = await sql(
        `select * from storage.buckets where id = '${BUCKET}';`
    );
    console.log(JSON.stringify(cfg.json, null, 2));

    console.log('\n--- 3. Test d\'upload témoin ---');
    if (!SERVICE_KEY) {
        console.log('SUPABASE_SERVICE_ROLE_KEY absent — test ignoré.');
        return;
    }
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    const sizesMo = [10, 30, 45, 55, 70];
    for (const mo of sizesMo) {
        const bytes = mo * 1024 * 1024;
        const buf = Buffer.alloc(bytes, 0x41);
        const objectPath = `media/_diag/probe-${mo}mo.bin`;
        const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buf, {
            contentType: 'application/octet-stream',
            upsert: true,
        });
        if (error) {
            console.log(`  ${mo} Mo → ÉCHEC : ${error.message}`);
        } else {
            console.log(`  ${mo} Mo → OK`);
            await supabase.storage.from(BUCKET).remove([objectPath]);
        }
    }
}

run().catch((err) => {
    console.error('Erreur fatale :', err);
    process.exit(1);
});
