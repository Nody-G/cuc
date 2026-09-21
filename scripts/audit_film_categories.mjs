#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — AUDIT DES CATÉGORIES DE FILMS (base + sources locales)
 * ==============================================================================
 * Le site n'affiche plus qu'une seule distinction factuelle :
 *   `Film` | `Série` | `Court métrage`
 *
 * Ce script inventorie TOUT ce qui porte encore l'ancien vocabulaire marketing
 * (`Blockbuster`, `Cinéma International`, `Cinéma Français`, `Film Culte`,
 * `Streaming Global`, `Série / Plateforme`, `Show & Événement`) et propose une
 * classification **adossée à une preuve** :
 *
 *   - Allociné : `fichefilm_gen_cfilm=` → Film, `ficheserie_gen_cserie=` → Série
 *   - sinon, la valeur d'origine est conservée et signalée « à vérifier »
 *
 * Aucune donnée n'est écrite ici : le script écrit un rapport JSON dans plans/.
 *
 * Usage :
 *   node scripts/audit_film_categories.mjs
 * ==============================================================================
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const LEGACY = [
    'Blockbuster',
    'Blockbuster US',
    'Cinéma Français',
    'Cinéma International',
    'Film Culte',
    'Streaming Global',
    'Série / Plateforme',
    'Show & Événement',
    'Cinéma',
];

async function rest(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
    if (res.status === 204) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

/** Classification factuelle à partir de l'URL Allociné (preuve vérifiable). */
function classifyFromAllocine(url) {
    if (typeof url !== 'string' || url.length === 0) return null;
    if (/ficheserie_gen_cserie/i.test(url) || /\/series\//i.test(url)) return 'Série';
    if (/fichefilm_gen_cfilm/i.test(url)) return 'Film';
    return null;
}

function bump(map, key) {
    const k = key === null || key === undefined || key === '' ? '(vide)' : String(key);
    map.set(k, (map.get(k) || 0) + 1);
}

function table(map) {
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

const report = { generatedAt: new Date().toISOString(), database: {}, local: {} };

// --- 1. Base de données : site_films --------------------------------------
const films = await rest(
    'site_films?select=id,title,year,category,is_published,allocine_url,imdb_url,metadata&order=title.asc'
);

if (!films) {
    console.error('site_films introuvable');
    process.exit(1);
}

const dbCats = new Map();
const dbProposed = new Map();
const unresolved = [];
const samples = [];

for (const f of films) {
    bump(dbCats, f.is_published ? f.category : `${f.category} [non publié]`);
    const proposed = classifyFromAllocine(f.allocine_url);
    bump(dbProposed, proposed || '(preuve absente)');
    if (proposed && proposed !== f.category) {
        samples.push({ id: f.id, title: f.title, year: f.year, from: f.category, to: proposed });
    }
    if (LEGACY.includes(f.category) && !proposed) {
        unresolved.push({ id: f.id, title: f.title, year: f.year, category: f.category });
    }
}

report.database = {
    totalRows: films.length,
    columnsSample: Object.keys(films[0] || {}),
    categoryDistribution: table(dbCats),
    proofDistribution: table(dbProposed),
    reclassifications: samples.length,
    reclassificationSamples: samples.slice(0, 40),
    unresolvedCount: unresolved.length,
    unresolvedSamples: unresolved.slice(0, 40),
};

// --- 2. Base de données : miroirs site_settings ----------------------------
const settings = await rest(
    'site_settings?select=key,value&key=in.(filmography_credits,celebrities,films)'
);

const mirrors = {};
for (const row of settings || []) {
    const value = row.value;
    const cats = new Map();
    const roleTypes = new Map();
    const walk = (node) => {
        if (Array.isArray(node)) return node.forEach(walk);
        if (node && typeof node === 'object') {
            if (typeof node.category === 'string') bump(cats, node.category);
            if (typeof node.roleType === 'string') bump(roleTypes, node.roleType);
            Object.values(node).forEach(walk);
        }
    };
    walk(value);
    mirrors[row.key] = {
        categoryDistribution: table(cats),
        roleTypeDistribution: table(roleTypes),
    };
}
report.database.settingsMirrors = mirrors;

// --- 3. Inventaire des métadonnées (piste de preuve pour les lignes vides) --
const allMetaKeys = new Map();
const emptyMetaKeys = new Map();
const emptyProbe = [];
const emptyRows = films.filter((f) => !f.category);

for (const f of films) {
    const m = f.metadata && typeof f.metadata === 'object' ? f.metadata : null;
    if (!m) bump(allMetaKeys, '(aucune)');
    else for (const k of Object.keys(m)) bump(allMetaKeys, k);
}
for (const f of emptyRows) {
    const m = f.metadata && typeof f.metadata === 'object' ? f.metadata : null;
    if (!m) bump(emptyMetaKeys, '(aucune)');
    else for (const k of Object.keys(m)) bump(emptyMetaKeys, k);
    if (emptyProbe.length < 3) {
        emptyProbe.push({
            id: f.id,
            title: f.title,
            imdb_url: f.imdb_url,
            allocine_url: f.allocine_url,
            metadata: m,
        });
    }
}

report.database.metadataKeys = table(allMetaKeys);
report.database.emptyCategoryCount = emptyRows.length;
report.database.emptyCategoryMetaKeys = table(emptyMetaKeys);
report.database.emptyCategoryProbe = emptyProbe;

// --- 4. Sources locales ----------------------------------------------------
const localSources = [
    'src/data/filmography.ts',
    'src/data/celebrities.ts',
    'src/data/all_official_films.ts',
];

report.local = {};
for (const file of localSources) {
    try {
        const src = readFileSync(file, 'utf8');
        const cats = new Map();
        for (const m of src.matchAll(/"category":\s*"([^"]+)"/g)) bump(cats, m[1]);
        for (const m of src.matchAll(/category:\s*'([^']+)'/g)) bump(cats, m[1]);
        const roles = new Map();
        for (const m of src.matchAll(/roleType:\s*'([^']+)'/g)) bump(roles, m[1]);
        report.local[file] = {
            categoryDistribution: table(cats),
            roleTypeDistribution: table(roles),
        };
    } catch (err) {
        report.local[file] = { error: String(err.message || err) };
    }
}

mkdirSync('plans', { recursive: true });
const out = 'plans/audit-categories-films.json';
writeFileSync(out, JSON.stringify(report, null, 2));

console.log('=== site_films : catégories en base ===');
for (const [k, v] of table(dbCats)) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log('\n=== Classement proposé (preuve Allociné) ===');
for (const [k, v] of table(dbProposed)) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log(`\nReclassifications : ${samples.length} · À vérifier (sans preuve) : ${unresolved.length}`);
console.log('\n=== Miroirs site_settings ===');
for (const [key, value] of Object.entries(mirrors)) {
    console.log(`  ${key} :`);
    for (const [k, v] of value.categoryDistribution) console.log(`      ${String(v).padStart(4)}  cat=${k}`);
    for (const [k, v] of value.roleTypeDistribution)
        console.log(`      ${String(v).padStart(4)}  roleType=${k}`);
}
console.log('\n=== Métadonnées : clés présentes (toutes lignes) ===');
for (const [k, v] of table(allMetaKeys)) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log(`\n=== Lignes SANS catégorie : ${emptyRows.length} ===`);
for (const [k, v] of table(emptyMetaKeys)) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log('\nExemples de métadonnées (lignes sans catégorie) :');
console.log(JSON.stringify(emptyProbe, null, 2).slice(0, 1800));

console.log('\n=== Sources locales ===');
for (const [file, value] of Object.entries(report.local)) {
    console.log(`  ${file} :`);
    if (value.error) {
        console.log(`      erreur : ${value.error}`);
        continue;
    }
    for (const [k, v] of value.categoryDistribution) console.log(`      ${String(v).padStart(4)}  cat=${k}`);
    for (const [k, v] of value.roleTypeDistribution) console.log(`      ${String(v).padStart(4)}  roleType=${k}`);
}
console.log(`\nRapport écrit : ${out}`);
