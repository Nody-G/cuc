#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Inventaire des visuels de films HISTORIQUES (hérités de l'ancien site)
 * ==============================================================================
 * Objectif : lister tout ce qui doit disparaître au profit des affiches
 * officielles (IMDb / TMDB), sans rien supprimer à l'aveugle.
 *
 * Inventorie :
 *   1. les objets du bucket Storage (préfixes `media/film-poster`, `media/film-banner`) ;
 *   2. les fiches `site_films` dont l'image pointe encore vers ces préfixes ;
 *   3. les références dans `site_settings` (miroirs `films`, `film_banners`) ;
 *   4. les références dans le code (`src/data`, composants).
 *
 * Usage : node scripts/audit_legacy_film_assets.mjs
 * ==============================================================================
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const BUCKET = 'cuc-vitrine-assets';
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

if (!URL_BASE || !KEY) {
    console.error('❌ Clés Supabase manquantes.');
    process.exit(1);
}

async function rest(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
    return res.json();
}

async function listStorage(prefix) {
    const out = [];
    let offset = 0;
    for (; ;) {
        const res = await fetch(`${URL_BASE}/storage/v1/object/list/${BUCKET}`, {
            method: 'POST',
            headers: { ...HEADERS, 'Content-Type': 'application/json' },
            body: JSON.stringify({ prefix, limit: 100, offset }),
        });
        if (!res.ok) throw new Error(`list ${prefix} → ${res.status} ${await res.text()}`);
        const page = await res.json();
        out.push(...page);
        if (page.length < 100) break;
        offset += 100;
    }
    return out;
}

/* --- 1. Bucket ------------------------------------------------------------- */
console.log('=== Bucket : préfixes de visuels de films');
const root = await listStorage('media');
const folders = root.filter((o) => !o.id).map((o) => o.name);
console.log('Sous-dossiers de media/ :', folders.join(', '));

const targets = folders.filter((f) => /film|poster|banner|affiche/i.test(f));
const storageReport = {};
for (const folder of targets) {
    const objects = await listStorage(`media/${folder}`);
    const files = objects.filter((o) => o.id);
    const totalKo = Math.round(
        files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0) / 1024
    );
    storageReport[folder] = files.map((f) => f.name);
    console.log(
        `  media/${folder} → ${files.length} objet(s), ${totalKo} Ko`
    );
    if (files.length) {
        console.log(`     ex. : ${files.slice(0, 5).map((f) => f.name).join(', ')}${files.length > 5 ? ' …' : ''}`);
    }
}

/* --- 2. Fiches films ------------------------------------------------------- */
const LEGACY_RE = /\/media\/(film-poster|film-banner)\//i;
const films = await rest('site_films?select=id,title,year,image&order=title.asc');
const legacyFilms = films.filter((f) => LEGACY_RE.test(f.image || ''));
console.log(`\n=== site_films : ${films.length} fiches, ${legacyFilms.length} avec un visuel historique`);
for (const f of legacyFilms) console.log(`  ${f.year} — ${f.title}\n     ${f.image}`);

/* --- 3. site_settings ----------------------------------------------------- */
console.log('\n=== site_settings : références à ces préfixes');
const settings = await rest('site_settings?select=key,value');
for (const row of settings) {
    const json = JSON.stringify(row.value || {});
    const hits = (json.match(/\/media\/(film-poster|film-banner)\//gi) || []).length;
    if (hits) console.log(`  ${row.key} → ${hits} référence(s)`);
}

/* --- 4. Code -------------------------------------------------------------- */
console.log('\n=== Code : fichiers référençant ces préfixes');
function walk(dir, out = []) {
    for (const entry of readdirSync(dir)) {
        if (entry === 'node_modules' || entry === '.next') continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}
const codeHits = [];
for (const file of walk('src')) {
    if (!/\.(ts|tsx|json|css)$/.test(file)) continue;
    const src = readFileSync(file, 'utf8');
    const hits = (src.match(/\/media\/(film-poster|film-banner)\//gi) || []).length;
    if (hits) codeHits.push({ file, hits });
}
for (const h of codeHits) console.log(`  ${h.file} → ${h.hits}`);

console.log('\n=== Rappel : ces préfixes correspondent aux visuels hérités de l’ancien site.');
console.log('    Cible : les remplacer par les affiches officielles, puis supprimer les objets.\n');
