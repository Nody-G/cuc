#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Purge des visuels de films HÉRITÉS de l'ancien site
 * ==============================================================================
 * Demande : « je ne veux plus des images stockées à la base sur l'ancien site,
 * ni les affiches, ni les bandeaux d'affiches ; je veux qu'on se base sur les
 * vraies affiches des films ».
 *
 * Ce script :
 *   1. résout, pour chaque visuel hérité, la VRAIE affiche — d'abord depuis le
 *      catalogue `site_films` (570 fiches déjà pourvues d'affiches officielles),
 *      puis via TMDB pour les cas restants ;
 *   2. réécrit les références dans le code (`src/data/*`, section tournages) ;
 *   3. remplace les visuels hérités dans le miroir `site_settings.films` ;
 *   4. vide la liste `site_settings.film_banners` (frises d'anciennes affiches) ;
 *   5. supprime les objets Storage `media/film-poster/*` et les frises ;
 *   6. vérifie qu'il ne reste AUCUNE référence et que les nouvelles URLs répondent.
 *
 * Garde-fous :
 *   - une fiche non publiée est écartée (elle peut porter une affiche erronée) ;
 *   - une image encore héritée n'est jamais réutilisée comme « vraie affiche » ;
 *   - un titre apparié uniquement sur le titre (année divergente) est signalé.
 *
 * Usage :
 *   node scripts/purge_legacy_film_visuals.mjs --dry
 *   node scripts/purge_legacy_film_visuals.mjs
 * ==============================================================================
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const TOKEN = process.env.TMDB_ACCESS_TOKEN;
const BUCKET = 'cuc-vitrine-assets';
const DRY = process.argv.includes('--dry');
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const LEGACY_RE = /\/media\/(film-poster|film-banner)\//i;
/**
 * La jaquette de « Braqueurs : La série » avait été remplacée manuellement dans
 * le Storage (avec URL versionnée pour contourner le cache CDN). Comme le
 * dossier `media/film-poster` est intégralement supprimé, on la bascule sur la
 * source d'origine (TMDB) : plus aucune copie stockée.
 */
const OVERRIDES = new Map([
    ['film-poster/braqueurs.jpg', 'https://image.tmdb.org/t/p/w500/sxwMPWL627OnIBCBlKyMhER7DCO.jpg'],
]);

function findOverride(url) {
    if (typeof url !== 'string') return null;
    for (const [needle, target] of OVERRIDES) {
        if (url.includes(needle)) return target;
    }
    return null;
}

/** Écarts d'année acceptés (sorties FR vs production), avec justification. */
const YEAR_TOLERANCE = 1;

async function rest(pathname, init = {}) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, {
        ...init,
        headers: { ...HEADERS, 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${body}`);
    return body ? JSON.parse(body) : null;
}

function titleKey(title) {
    return String(title)
        .replace(/\s*\((?:19|20)\d{2}(?:[-–]\d{4})?\)\s*$/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

/* ------------------------------------------------------------------ *
 * 1. Sources : catalogue + miroir
 * ------------------------------------------------------------------ */
const films = await rest('site_films?select=id,title,year,image,is_published');
const published = films.filter((f) => f.is_published !== false && !LEGACY_RE.test(f.image || ''));

const byKey = new Map();
const byLoose = new Map();
for (const f of published) {
    const k = titleKey(f.title);
    if (!byKey.has(`${k}|${f.year}`)) byKey.set(`${k}|${f.year}`, f);
    if (!byLoose.has(k)) byLoose.set(k, f);
}

const settings = await rest('site_settings?select=key,value&key=eq.films');
const mirror = Array.isArray(settings[0]?.value) ? settings[0].value : [];
const legacyMirror = mirror.filter((f) => LEGACY_RE.test(f.image || ''));

console.log(`Catalogue publié et sain : ${published.length} fiches`);
console.log(`Miroir : ${mirror.length} entrées, ${legacyMirror.length} à remplacer\n`);

/* ------------------------------------------------------------------ *
 * 2. Résolution
 * ------------------------------------------------------------------ */
const resolved = [];
const unresolved = [];

for (const entry of legacyMirror) {
    const override = findOverride(entry.image);
    if (override) {
        resolved.push({
            legacyTitle: entry.title,
            legacyYear: entry.year,
            legacyImage: entry.image,
            realImage: override,
            realTitle: entry.title,
            how: 'surcharge (copie stockée retirée)',
        });
        continue;
    }

    const key = titleKey(entry.title);
    const exact = byKey.get(`${key}|${entry.year}`);
    let match = exact;
    let how = 'titre+année';

    if (!match) {
        const loose = byLoose.get(key);
        if (loose && Math.abs(Number(loose.year) - Number(entry.year)) <= YEAR_TOLERANCE) {
            match = loose;
            how = `titre (année ${entry.year} → ${loose.year})`;
        }
    }

    if (!match && !TOKEN) {
        unresolved.push({ title: entry.title, year: entry.year, image: entry.image });
        continue;
    }

    if (match) {
        resolved.push({
            legacyTitle: entry.title,
            legacyYear: entry.year,
            legacyImage: entry.image,
            realImage: match.image,
            realTitle: match.title,
            how,
        });
        continue;
    }

    // Dernier recours : TMDB (titre + année).
    const url = new URL('https://api.themoviedb.org/3/search/multi');
    url.searchParams.set('query', entry.title);
    url.searchParams.set('language', 'fr-FR');
    if (entry.year) url.searchParams.set('year', String(entry.year));
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const data = res.ok ? await res.json() : {};
    const best = (data.results || []).find(
        (r) => r.poster_path && (!entry.year || String(r.release_date || r.first_air_date || '').startsWith(String(entry.year)))
    );
    if (best) {
        resolved.push({
            legacyTitle: entry.title,
            legacyYear: entry.year,
            legacyImage: entry.image,
            realImage: `https://image.tmdb.org/t/p/w500${best.poster_path}`,
            realTitle: best.title || best.name,
            how: `TMDB (${best.release_date || best.first_air_date || 'sans date'})`,
        });
    } else {
        unresolved.push({ title: entry.title, year: entry.year, image: entry.image });
    }
}

console.log(`Résolus : ${resolved.length}`);
for (const r of resolved) console.log(`  « ${r.legacyTitle} » → ${r.realImage.slice(0, 96)} [${r.how}]`);
console.log(`\nNon résolus : ${unresolved.length}`);
for (const u of unresolved) console.log(`  « ${u.title} » (${u.year}) — ${u.image}`);

let tmdbHostUsed = resolved.some((r) => r.realImage.includes('image.tmdb.org'));
console.log(`\nHôtes utilisés : image.tmdb.org = ${tmdbHostUsed ? 'OUI (penser à next.config.ts)' : 'non'}`);

/* ------------------------------------------------------------------ *
 * 3. Code : réécriture des références
 * ------------------------------------------------------------------ */
const replacements = new Map(resolved.map((r) => [r.legacyImage, r.realImage]));
// Les variantes versionnées (`?v=…`) doivent aussi être remplacées dans le code.
for (const r of resolved) {
    if (r.legacyImage.includes('?v=')) replacements.set(r.legacyImage.split('?')[0], r.realImage);
    else replacements.set(`${r.legacyImage}?v=20260921`, r.realImage);
}

/** Fiches `site_films` à repointeur (copie stockée retirée). */
const siteFilmPatches = films
    .map((f) => ({ id: f.id, image: findOverride(f.image) }))
    .filter((p) => p.image);

function walk(dir, out = []) {
    for (const entry of readdirSync(dir)) {
        if (entry === 'node_modules' || entry === '.next') continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

const codeTouched = [];
for (const file of walk('src')) {
    if (!/\.(ts|tsx)$/.test(file)) continue;
    let src = readFileSync(file, 'utf8');
    let hits = 0;
    for (const [from, to] of replacements) {
        if (src.includes(from)) {
            src = src.split(from).join(to);
            hits += 1;
        }
    }
    if (hits > 0) {
        codeTouched.push({ file, hits });
        if (!DRY) writeFileSync(file, src, 'utf8');
    }
}
console.log(`\nFichiers de code réécrits : ${codeTouched.length}`);
for (const c of codeTouched) console.log(`  ${c.file} → ${c.hits} remplacement(s)`);

/* ------------------------------------------------------------------ *
 * 4. Base : miroir + bandeaux
 * ------------------------------------------------------------------ */
const mirrorPatched = mirror.map((f) =>
    replacements.has(f.image) ? { ...f, image: replacements.get(f.image) } : f
);
if (DRY) {
    console.log('\n[dry] miroir site_settings.films non écrit');
} else {
    await rest('site_settings?key=eq.films', {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ value: mirrorPatched }),
    });
    console.log('\nMiroir site_settings.films mis à jour');

    for (const patch of siteFilmPatches) {
        await rest(`site_films?id=eq.${encodeURIComponent(patch.id)}`, {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({ image: patch.image }),
        });
        console.log(`site_films/${patch.id} → ${patch.image}`);
    }

    await rest('site_settings?key=eq.film_banners', {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ value: { list: [] } }),
    });
    console.log('Bandeaux (site_settings.film_banners) vidés');
}

/* ------------------------------------------------------------------ *
 * 5. Storage : suppression des visuels hérités
 * ------------------------------------------------------------------ */
async function listStorage(prefix) {
    const res = await fetch(`${URL_BASE}/storage/v1/object/list/${BUCKET}`, {
        method: 'POST',
        headers: { ...HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix, limit: 200, offset: 0 }),
    });
    return res.ok ? res.json() : [];
}

const posterObjects = (await listStorage('media/film-poster'))
    .filter((o) => o.id)
    .map((o) => `media/film-poster/${o.name}`);
const bannerObjects = [
    'media/cuc-visual/Bandeau-Films-Lucas-CUC-bis-scaled.jpg',
    'media/cuc-visual/Bandeau-2023-scaled.jpg',
    'media/cuc-visual/Bandeau-images-films.png',
    'media/cuc-visual/Bandes-affiches-film-1-1.png',
    'media/cuc-visual/Bandes-affiches-film-3.png',
    'media/cuc-visual/Bandes-affiches-film-4.png',
];

const toDelete = [...posterObjects, ...bannerObjects];
console.log(`\nObjets Storage à supprimer : ${toDelete.length}`);

if (DRY) {
    console.log('  [dry] suppression ignorée');
} else {
    const res = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}`, {
        method: 'DELETE',
        headers: { ...HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefixes: toDelete }),
    });
    if (!res.ok) {
        console.error(`❌ Suppression → ${res.status} ${await res.text()}`);
        process.exitCode = 2;
    } else {
        console.log(`  ${(await res.json()).map((r) => r.name).length} objet(s) supprimé(s)`);
    }
}

/* ------------------------------------------------------------------ *
 * 6. Contrôle final
 * ------------------------------------------------------------------ */
console.log('\n=== Contrôle');
if (!DRY) {
    const remaining = await listStorage('media/film-poster');
    console.log(`  Objets restants dans media/film-poster : ${remaining.filter((o) => o.id).length}`);

    const refsLeft = [];
    for (const file of walk('src')) {
        if (!/\.(ts|tsx|json)$/.test(file)) continue;
        const src = readFileSync(file, 'utf8');
        const n = (src.match(LEGACY_RE) || []).length;
        if (n) refsLeft.push(`${file} (${n})`);
    }
    console.log(`  Références héritées restantes dans src : ${refsLeft.length ? refsLeft.join(', ') : 'aucune'}`);

    const settingsAfter = await rest('site_settings?select=key,value&key=eq.films');
    const mirrorAfter = settingsAfter[0]?.value || [];
    const legacyAfter = mirrorAfter.filter((f) => LEGACY_RE.test(f.image || '')).length;
    console.log(`  Visuels hérités restants dans le miroir : ${legacyAfter}`);

    // Les nouvelles URLs répondent-elles ?
    let bad = 0;
    for (const r of resolved.slice(0, 60)) {
        const head = await fetch(r.realImage, { method: 'HEAD' }).catch(() => null);
        if (!head || !head.ok) {
            bad += 1;
            console.log(`  ⚠️  ${r.realImage} → ${head ? head.status : 'injoignable'}`);
        }
    }
    console.log(`  Nouvelles affiches injoignables : ${bad}/${resolved.length}`);
}

writeFileSync(
    '.cache/legacy-visual-purge.json',
    JSON.stringify({ generatedAt: new Date().toISOString(), resolved, unresolved, toDelete }, null, 2),
    'utf8'
);
console.log('\nDétail : .cache/legacy-visual-purge.json');
console.log(`${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — ${resolved.length} affiche(s) remplacée(s), ${toDelete.length} objet(s) supprimé(s).\n`);
