#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Correspondance « visuels hérités » → « vraies affiches »
 * ==============================================================================
 * Pour chaque visuel encore servi depuis `media/film-poster/` (ancien site),
 * retrouve la VRAIE affiche en s'appuyant d'abord sur le catalogue `site_films`
 * (570 fiches déjà pourvues d'affiches officielles), puis, à défaut, sur TMDB.
 *
 * Aucune écriture : ce script produit la liste de travail et signale les cas
 * non résolus (à traiter à la main, jamais remplacés par un visuel hérité).
 *
 * Usage : node scripts/map_legacy_to_real_posters.mjs
 * ==============================================================================
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const TOKEN = process.env.TMDB_ACCESS_TOKEN;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const LEGACY_RE = /\/media\/film-poster\//i;

async function rest(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
    return res.json();
}

/** Clé de titre alignée sur `src/lib/credit-title.ts` (année retirée, accents, ponctuation). */
function titleKey(title) {
    return String(title)
        .replace(/\s*\((?:19|20)\d{2}(?:[-–]\d{4})?\)\s*$/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

/* --- Sources --------------------------------------------------------------- */
const settings = await rest('site_settings?select=key,value&key=eq.films');
const mirror = Array.isArray(settings[0]?.value) ? settings[0].value : [];
const legacyMirror = mirror.filter((f) => LEGACY_RE.test(f.image || ''));

const films = await rest('site_films?select=id,title,year,image,imdb_url,is_published');
const byKey = new Map();
for (const f of films) {
    const key = `${titleKey(f.title)}|${f.year}`;
    if (!byKey.has(key)) byKey.set(key, f);
    const loose = titleKey(f.title);
    if (!byKey.has(`~${loose}`)) byKey.set(`~${loose}`, f);
}

console.log(`Miroir site_settings.films : ${mirror.length} entrées, dont ${legacyMirror.length} avec visuel hérité`);
console.log(`Catalogue site_films       : ${films.length} fiches\n`);

const resolved = [];
const unresolved = [];

for (const entry of legacyMirror) {
    const exact = byKey.get(`${titleKey(entry.title)}|${entry.year}`);
    const loose = byKey.get(`~${titleKey(entry.title)}`);
    const match = exact || loose;
    if (match && !LEGACY_RE.test(match.image || '')) {
        resolved.push({
            legacyTitle: entry.title,
            legacyYear: entry.year,
            legacyImage: entry.image,
            realTitle: match.title,
            realYear: match.year,
            realImage: match.image,
            how: exact ? 'titre+année' : 'titre',
        });
    } else {
        unresolved.push({ title: entry.title, year: entry.year, image: entry.image });
    }
}

console.log(`Résolus via le catalogue : ${resolved.length}`);
for (const r of resolved) {
    console.log(`  « ${r.legacyTitle} » (${r.legacyYear}) → « ${r.realTitle} » (${r.realYear}) [${r.how}]`);
    console.log(`     ${r.realImage}`);
}

console.log(`\nNon résolus : ${unresolved.length}`);
for (const u of unresolved) console.log(`  « ${u.title} » (${u.year})\n     ${u.image}`);

/* --- TMDB en secours (sans écriture) -------------------------------------- */
if (TOKEN && unresolved.length) {
    console.log('\n=== Recherche TMDB pour les non résolus');
    for (const u of unresolved) {
        const url = new URL('https://api.themoviedb.org/3/search/multi');
        url.searchParams.set('query', u.title);
        url.searchParams.set('language', 'fr-FR');
        if (u.year) url.searchParams.set('year', String(u.year));
        const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
        if (!res.ok) {
            console.log(`  « ${u.title} » → TMDB HTTP ${res.status}`);
            continue;
        }
        const data = await res.json();
        const best = (data.results || []).find((r) => r.poster_path);
        if (!best) {
            console.log(`  « ${u.title} » → aucune affiche TMDB`);
            continue;
        }
        const date = best.release_date || best.first_air_date || '';
        console.log(
            `  « ${u.title} » (${u.year}) → ${best.title || best.name} (${date.slice(0, 4)}) poster=${best.poster_path}`
        );
    }
}

console.log('');

/* --- Export JSON pour la revue -------------------------------------------- */
const out = {
    generatedAt: new Date().toISOString(),
    legacyCount: legacyMirror.length,
    resolvedViaCatalogue: resolved.length,
    unresolved: unresolved.length,
    resolved,
    pending: unresolved,
};
const { writeFileSync } = await import('node:fs');
writeFileSync('.cache/legacy-poster-mapping.json', JSON.stringify(out, null, 2), 'utf8');
console.log('Détail exporté : .cache/legacy-poster-mapping.json\n');
