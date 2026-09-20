/**
 * VÉRIFICATION D'ACCESSIBILITÉ DES MÉDIAS SUPABASE
 * ===============================================
 *
 * Contrôle que toutes les URLs Supabase Storage référencées en base et dans le
 * code source répondent bien en HTTP 200. Détecte les images cassées après la
 * migration.
 *
 * Sort en code 2 si au moins une URL est inaccessible.
 *
 * Usage :
 *   node scripts/verify_supabase_media_reachable.mjs
 */

import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

const SITE_TABLES = ['site_pages', 'site_team', 'site_events', 'site_settings', 'site_films'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.css']);
const SOURCE_EXCLUDE_DIRS = new Set(['node_modules', '.next', '.git', '.staging', '.cache']);

const STORAGE_RE = new RegExp(
    `${SUPABASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/storage/v1/object/public/[^\\s"'\`)\\\\]+`,
    'g',
);

const urls = new Set();

function collect(text) {
    for (const m of text.match(STORAGE_RE) || []) urls.add(m);
}

function walk(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (SOURCE_EXCLUDE_DIRS.has(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, files);
        else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(full);
    }
    return files;
}

for (const file of walk('src')) collect(fs.readFileSync(file, 'utf8'));

if (SERVICE_KEY) {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { persistSession: false },
    });
    for (const table of SITE_TABLES) {
        const { data } = await supabase.from(table).select('*');
        if (data) collect(JSON.stringify(data));
    }
}

const list = [...urls];
console.log('=== Accessibilité des médias Supabase ===');
console.log(`URLs distinctes référencées : ${list.length}`);
console.log('');

let ok = 0;
const broken = [];

// Contrôle par lots pour éviter la surcharge réseau.
const BATCH = 12;
for (let i = 0; i < list.length; i += BATCH) {
    const slice = list.slice(i, i + BATCH);
    const results = await Promise.all(
        slice.map(async (u) => {
            try {
                const r = await fetch(u, { method: 'HEAD' });
                return { u, status: r.status };
            } catch (err) {
                return { u, status: 0, err: err.message };
            }
        }),
    );
    for (const r of results) {
        if (r.status === 200) ok += 1;
        else broken.push(r);
    }
}

console.log(`OK (HTTP 200) : ${ok}`);
console.log(`Cassées : ${broken.length}`);
console.log('');

if (broken.length > 0) {
    for (const b of broken) {
        console.log(` - [${b.status}] ${b.u}`);
    }
    console.log('');
    console.log('RÉGRESSION : des médias Supabase sont inaccessibles.');
    process.exit(2);
}

console.log('OK — tous les médias Supabase référencés sont accessibles.');
