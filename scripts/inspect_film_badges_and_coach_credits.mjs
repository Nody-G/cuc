#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Inspection : étiquettes de jaquettes et comptage des crédits des coachs
 * ==============================================================================
 * Lecture seule. Établit l'état réel avant toute correction :
 *
 *   1. `site_team` : nombre de crédits par coach, doublons, limite d'affichage,
 *      crédits mis en avant — le compteur public vient de `notableCredits.length` ;
 *   2. `site_films` : toutes les valeurs de `tag` (étiquettes de jaquette) avec
 *      leur fréquence, et les titres suspects (année, parenthèses, « CUC »,
 *      « tournage ») ;
 *   3. `site_translations` : surcharge EN des badges (`tag`, `badge`, `category`).
 *
 * Usage : node scripts/inspect_film_badges_and_coach_credits.mjs
 * ==============================================================================
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function rest(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
    return res.json();
}

/* ------------------------------------------------------------------ *
 * 1. Coachs : comptage des crédits
 * ------------------------------------------------------------------ */
const team = await rest(
    'site_team?select=id,name,notable_credits,featured_credits,credits_display_limit,is_published&order=order_index.asc'
);

console.log('=== CRÉDITS PAR COACH (site_team) ===');
console.log(
    `${'id'.padEnd(22)} ${'crédits'.padStart(8)} ${'uniques'.padStart(8)} ${'limite'.padStart(6)} ${'mis en avant'.padStart(12)}  nom`
);
for (const member of team) {
    const credits = Array.isArray(member.notable_credits) ? member.notable_credits : [];
    const uniques = new Set(credits.map((c) => String(c).trim().toLowerCase()));
    console.log(
        `${String(member.id).padEnd(22)} ${String(credits.length).padStart(8)} ${String(
            uniques.size
        ).padStart(8)} ${String(member.credits_display_limit ?? '—').padStart(6)} ${String(
            (member.featured_credits || []).length
        ).padStart(12)}  ${member.name}${member.is_published === false ? ' (non publié)' : ''}`
    );
}

/* Doublons et crédits non parsables */
console.log('\n--- Doublons et anomalies de libellé ---');
for (const member of team) {
    const credits = Array.isArray(member.notable_credits) ? member.notable_credits : [];
    const seen = new Map();
    const duplicates = [];
    const noYear = [];
    for (const credit of credits) {
        const key = String(credit).trim().toLowerCase();
        if (seen.has(key)) duplicates.push(credit);
        else seen.set(key, true);
        if (!/\(\d{4}\)/.test(String(credit))) noYear.push(credit);
    }
    if (duplicates.length > 0) {
        console.log(`  ⚠️ ${member.id} : ${duplicates.length} doublon(s) — ex. « ${duplicates[0]} »`);
    }
    if (noYear.length > 0) {
        console.log(
            `  ℹ️ ${member.id} : ${noYear.length} crédit(s) sans année — ex. « ${noYear[0]} »`
        );
    }
}

/* ------------------------------------------------------------------ *
 * 2. Films : étiquettes et titres suspects
 * ------------------------------------------------------------------ */
const films = await rest('site_films?select=id,title,year,tag,category,is_published');

console.log(`\n=== ÉTIQUETTES DE JAQUETTE (site_films.tag) — ${films.length} films ===`);
const tagCounts = new Map();
for (const film of films) {
    const tag = (film.tag ?? '').trim();
    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
}
for (const [tag, count] of [...tagCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`${String(count).padStart(4)} × ${tag === '' ? '(vide)' : `« ${tag} »`}`);
}

console.log('\n--- Étiquettes suspectes (parenthèses, CUC, tournage, année) ---');
const SUSPECT = /(\(|\)|cuc|tournage|paris|\b(19|20)\d{2}\b)/i;
const suspectFilms = films.filter((f) => SUSPECT.test((f.tag ?? '').trim()));
for (const film of suspectFilms) {
    console.log(`  • ${film.id} | « ${film.title} » | tag : « ${film.tag} »`);
}
if (suspectFilms.length === 0) console.log('  (aucune)');

console.log('\n--- Titres suspects (année ou parenthèses dans le titre) ---');
const suspectTitles = films.filter((f) => /(\(|\)|\b(19|20)\d{2}\b)/.test(f.title ?? ''));
for (const film of suspectTitles.slice(0, 40)) {
    console.log(`  • ${film.id} | « ${film.title} » | année : ${film.year ?? '—'}`);
}
if (suspectTitles.length === 0) console.log('  (aucun)');

/* ------------------------------------------------------------------ *
 * 3. Overlays EN : badges traduits ou manquants
 * ------------------------------------------------------------------ */
const translations = await rest(
    'site_translations?select=entity,entity_id,payload,is_published&locale=eq.en'
);

console.log(`\n=== OVERLAYS EN (site_translations) — ${translations.length} lignes ===`);
const badgePaths = [];
for (const row of translations) {
    const walk = (node, prefix = '') => {
        if (node === null || typeof node !== 'object' || Array.isArray(node)) return;
        for (const [key, value] of Object.entries(node)) {
            const path = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'object' && value !== null) {
                walk(value, path);
                continue;
            }
            if (/^(tag|badge|category|step_badge|.*_badge)$/i.test(key)) {
                badgePaths.push({ entity: row.entity, entity_id: row.entity_id, path, value });
            }
        }
    };
    walk(row.payload);
}

const byEntity = new Map();
for (const b of badgePaths) {
    byEntity.set(b.entity, (byEntity.get(b.entity) || 0) + 1);
}
console.log('--- Badges traduits, par entité ---');
for (const [entity, count] of [...byEntity.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`${String(count).padStart(4)} × ${entity}`);
}

/* Badges FR présents en base mais absents de l'overlay EN correspondant */
const overlayIndex = new Map(
    translations.map((t) => [`${t.entity}::${t.entity_id}`, t.payload || {}])
);

function collectTagSources(node, prefix = '', out = {}) {
    if (node === null || node === undefined) return out;
    if (Array.isArray(node)) {
        node.forEach((item, i) => collectTagSources(item, `${prefix}[${i}]`, out));
        return out;
    }
    if (typeof node === 'object') {
        for (const [key, value] of Object.entries(node)) {
            collectTagSources(value, prefix ? `${prefix}.${key}` : key, out);
        }
        return out;
    }
    if (typeof node === 'string' && /(^|\.)(tag|badge|category|step_badge|[a-z_]*_badge)$/i.test(prefix)) {
        out[prefix] = node;
    }
    return out;
}

console.log('\n--- Badges FR sans traduction EN (échantillon de 30) ---');
let missingCount = 0;
const missing = [];
for (const film of films) {
    const fr = collectTagSources({ tag: film.tag, category: film.category, title: film.title });
    const overlay = overlayIndex.get(`film::${film.id}`) || {};
    for (const [path, value] of Object.entries(fr)) {
        if (!value || String(value).trim().length < 2) continue;
        const en = path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), overlay);
        if (en === undefined || en === null || String(en).trim() === '') {
            missingCount += 1;
            if (missing.length < 30) missing.push(`${film.id} · ${path} = « ${value} »`);
        }
    }
}
for (const line of missing) console.log(`  • ${line}`);
console.log(`  Total badges FR sans EN (films) : ${missingCount}`);

const pages = await rest(
    'site_pages?select=slug,title,meta_title,meta_description,hero,sections_data'
);
console.log('\n--- Badges de page (hero.badge, *.badge) sans traduction EN (échantillon de 20) ---');
let pageMissing = 0;
const pageMissingLines = [];
for (const page of pages) {
    const fr = collectTagSources({
        hero: page.hero,
        sections_data: page.sections_data,
    });
    const overlay = overlayIndex.get(`page::${page.slug}`) || {};
    for (const [path, value] of Object.entries(fr)) {
        if (!value || String(value).trim().length < 2) continue;
        const en = path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), overlay);
        if (en === undefined || en === null || String(en).trim() === '') {
            pageMissing += 1;
            if (pageMissingLines.length < 20) {
                pageMissingLines.push(`${page.slug} · ${path} = « ${value} »`);
            }
        }
    }
}
for (const line of pageMissingLines) console.log(`  • ${line}`);
console.log(`  Total badges FR sans EN (pages) : ${pageMissing}`);
