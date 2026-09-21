#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Audit des affiches & métadonnées de films
 * ==============================================================================
 * Demande client : « j'ai l'impression qu'il y a des affiches qui ne sont pas
 * les bonnes. Vérifie tout ça et globalement les infos qui concernent ces films ».
 *
 * Croise QUATRE sources et détecte des anomalies OBJECTIVES :
 *   1. Supabase `site_films` (source live : titre, année, image, imdb, allocine, trailer)
 *   2. `src/data/all_official_films.ts` (affiches officielles)
 *   3. `src/components/sections/home/HomeTournagesSection.tsx` (affiches mises en avant)
 *   4. `src/data/filmography.ts` (crédits + affiches)
 *
 * + Contrôle TMDB (`/search/multi` → films ET séries) via `TMDB_ACCESS_TOKEN`.
 *
 * Signaux HAUTE priorité (affiche probablement erronée) :
 *   - même URL d'affiche pour DEUX titres non-alias (signature d'un échange) ;
 * - affiche dont le nom de fichier correspond à un AUTRE titre du catalogue.
 * Signaux moindres : affiche manquante, alias partagé, année divergente, introuvable.
 *
 * Produit `plans/revue-affiches-films.md`. Sort en code 2 si anomalie HAUTE.
 *
 * Usage :
 *   node scripts/audit_film_posters.mjs
 *   node scripts/audit_film_posters.mjs --no-tmdb
 * ==============================================================================
 */
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const ROOT = process.cwd();
const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const TMDB = process.env.TMDB_ACCESS_TOKEN;
const NO_TMDB = process.argv.includes('--no-tmdb');
const FIX = process.argv.includes('--fix');

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const norm = (s) =>
    String(s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\(.*?\)/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

const STOP = new Set(['the', 'la', 'le', 'les', 'de', 'des', 'du', 'un', 'une', 'et', 'a', 'of', 'and', 'jpg', 'jpeg', 'png', 'scaled', 'image']);

/** Jetons significatifs d'un nom de fichier d'affiche (hors dossier/extension). */
function fileTokens(url) {
    if (!url) return [];
    const base = decodeURIComponent(String(url).split('/').pop() || '').replace(/\.[a-z0-9]+$/i, '');
    return norm(base)
        .split(' ')
        .filter((t) => t && !STOP.has(t) && !/^\d+$/.test(t));
}

// --- Sources --------------------------------------------------------------------
async function fetchSiteFilms() {
    const res = await fetch(
        `${URL_BASE}/rest/v1/site_films?select=id,title,year,image,imdb_url,allocine_url,trailer_url,director,is_published&is_published=eq.true&order=title.asc`,
        { headers: HEADERS }
    );
    if (!res.ok) throw new Error(`site_films → ${res.status} ${await res.text()}`);
    return res.json();
}

const read = (rel) => (fs.existsSync(path.join(ROOT, rel)) ? fs.readFileSync(path.join(ROOT, rel), 'utf8') : '');

function parseAllOfficial() {
    const src = read('src/data/all_official_films.ts');
    const out = [];
    const re = /\{\s*title:\s*"([^"]+)"\s*,\s*img:\s*"([^"]+)"\s*\}/g;
    let m;
    while ((m = re.exec(src))) out.push({ title: m[1], image: m[2], source: 'all_official_films.ts' });
    return out;
}

function parseHomeTournages() {
    const src = read('src/components/sections/home/HomeTournagesSection.tsx');
    const out = [];
    const re = /title:\s*'([^']+)'[\s\S]{0,120}?poster:\s*'([^']+)'/g;
    let m;
    while ((m = re.exec(src))) out.push({ title: m[1], image: m[2], source: 'HomeTournagesSection' });
    return out;
}

function parseFilmography() {
    const src = read('src/data/filmography.ts');
    const out = [];
    const re = /"title":\s*"([^"]+)"[\s\S]{0,500}?"image":\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(src))) out.push({ title: m[1], image: m[2], source: 'filmography.ts' });
    return out;
}

// --- TMDB (films + séries) -------------------------------------------------------
async function tmdbLookup(title, year) {
    if (!TMDB || NO_TMDB) return null;
    const stored = Number(String(year || '').match(/\d{4}/)?.[0]) || 0;
    const url = new URL('https://api.themoviedb.org/3/search/multi');
    url.searchParams.set('query', title);
    url.searchParams.set('language', 'fr-FR');
    try {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${TMDB}`, accept: 'application/json' } });
        if (!res.ok) return { error: `HTTP ${res.status}` };
        const data = await res.json();
        const results = (Array.isArray(data.results) ? data.results : []).filter(
            (r) => r.media_type === 'movie' || r.media_type === 'tv'
        );
        if (!results.length) return { found: false };
        const pick = (r) => r.title || r.name || '';
        const pickOrig = (r) => r.original_title || r.original_name || '';
        const yearOf = (r) => Number(String(r.release_date || r.first_air_date || '').slice(0, 4)) || 0;
        const exactMatches = results.filter(
            (r) => norm(pick(r)) === norm(title) || norm(pickOrig(r)) === norm(title)
        );
        const candidates = exactMatches.length ? exactMatches : results;
        const best = [...candidates].sort((a, b) => Math.abs(yearOf(a) - stored) - Math.abs(yearOf(b) - stored))[0];
        const tmdbYear = yearOf(best);
        return {
            found: true,
            exactTitle: exactMatches.length > 0,
            mediaType: best.media_type,
            tmdbTitle: pick(best),
            tmdbYear: tmdbYear ? String(tmdbYear) : '',
            yearMatch: exactMatches.some((r) => stored && Math.abs(yearOf(r) - stored) <= 1),
            poster: best.poster_path ? `https://image.tmdb.org/t/p/w500${best.poster_path}` : null,
        };
    } catch (e) {
        return { error: String(e.message || e) };
    }
}

/** Exécute `fn` sur `items` avec une concurrence bornée. */
async function pool(items, limit, fn) {
    const out = new Array(items.length);
    let i = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (i < items.length) {
            const idx = i++;
            out[idx] = await fn(items[idx], idx);
        }
    });
    await Promise.all(workers);
    return out;
}

// --- Analyse --------------------------------------------------------------------
const films = await fetchSiteFilms();
const allOfficial = parseAllOfficial();
const homeTournages = parseHomeTournages();
const filmography = parseFilmography();

const sources = [
    ...films.map((f) => ({ title: f.title, image: f.image, source: 'site_films' })),
    ...allOfficial,
    ...homeTournages,
    ...filmography,
];

const issues = [];

// 1) Affiche partagée par plusieurs titres
const byImage = new Map();
for (const s of sources) {
    if (!s.image) continue;
    const k = s.image.trim();
    if (!byImage.has(k)) byImage.set(k, new Set());
    byImage.get(k).add(norm(s.title));
}
for (const [image, titles] of byImage.entries()) {
    if (titles.size > 1) {
        const list = [...titles];
        const isAlias = list.some((a) => list.some((b) => a !== b && (a.includes(b) || b.includes(a))));
        issues.push({
            severity: isAlias ? 'info' : 'haute',
            type: isAlias ? 'affiche partagée (alias probable)' : 'affiche partagée par plusieurs titres',
            detail: list.join(' | '),
            image,
        });
    }
}

// 2) Affiche dont le nom de fichier évoque un AUTRE titre du catalogue (échange probable)
const titleTokens = films.map((f) => ({ id: f.id, title: f.title, tokens: new Set(norm(f.title).split(' ').filter((t) => t && !STOP.has(t))) }));
for (const f of films) {
    const ft = fileTokens(f.image);
    if (!ft.length) continue;
    const own = titleTokens.find((t) => t.id === f.id);
    const ownHit = ft.some((t) => own.tokens.has(t));
    if (ownHit) continue;
    const other = titleTokens.find((t) => t.id !== f.id && ft.some((tok) => t.tokens.has(tok)));
    if (other) {
        issues.push({
            severity: 'haute',
            type: 'affiche possiblement échangée',
            detail: `« ${f.title} » utilise une affiche nommée comme « ${other.title} »`,
            image: f.image,
        });
    }
}

// 3) Métadonnées par film publié + contrôle TMDB
const rows = await pool(films, 8, async (f) => {
    const flags = [];
    if (!f.image) flags.push('affiche manquante');
    if (f.imdb_url && !/\/title\/tt\d+/.test(f.imdb_url)) flags.push('imdb_url mal formée');
    if (f.trailer_url && !/youtube\.com|youtu\.be/.test(f.trailer_url)) flags.push('trailer non-YouTube');

    const tmdb = await tmdbLookup(f.title, f.year);
    const storedYear = String(f.year || '').match(/\d{4}/)?.[0];
    if (tmdb && tmdb.found) {
        if (tmdb.exactTitle && storedYear && tmdb.tmdbYear && !tmdb.yearMatch) {
            flags.push(`année divergente (base ${storedYear} vs TMDB ${tmdb.tmdbYear})`);
        } else if (!tmdb.exactTitle) {
            flags.push('correspondance TMDB à confirmer');
        }
    } else if (tmdb && tmdb.found === false) {
        flags.push('introuvable sur TMDB');
    } else if (tmdb && tmdb.error) {
        flags.push(`TMDB erreur (${tmdb.error})`);
    }

    if (flags.some((x) => x.startsWith('année divergente'))) {
        issues.push({ severity: 'moyenne', type: 'métadonnées', detail: `${f.title} (${f.year || 'année ?'}) → ${flags.join(' ; ')}`, image: f.image });
    }
    return { film: f, tmdb, flags };
});

// --- Correctifs sûrs (optionnels) ------------------------------------------------
// On ne corrige QUE les affiches manquantes dont la correspondance TMDB est
// certaine (titre exact + année concordante). Les divergences d'année ne sont
// jamais corrigées automatiquement : elles exigent une validation humaine
// (doctrine « un lien FAUX est pire qu'aucun lien »).
if (FIX) {
    const fillable = rows.filter(
        (r) => !r.film.image && r.tmdb?.found && r.tmdb.exactTitle && r.tmdb.yearMatch && r.tmdb.poster
    );
    for (const r of fillable) {
        const res = await fetch(`${URL_BASE}/rest/v1/site_films?id=eq.${encodeURIComponent(r.film.id)}`, {
            method: 'PATCH',
            headers: { ...HEADERS, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
            body: JSON.stringify({ image: r.tmdb.poster }),
        });
        if (res.ok) {
            console.log(`[fix] affiche complétée : ${r.film.title} → ${r.tmdb.poster}`);
            r.film.image = r.tmdb.poster;
        } else {
            console.warn(`[fix] ⚠️ échec (${res.status}) : ${r.film.title}`);
        }
    }
    console.log(`[fix] ${fillable.length} affiche(s) manquante(s) complétée(s).`);
}

// --- Rapport --------------------------------------------------------------------
const now = new Date().toISOString();
const high = issues.filter((i) => i.severity === 'haute');
const mid = issues.filter((i) => i.severity === 'moyenne');
const info = issues.filter((i) => i.severity === 'info');
const missing = rows.filter((r) => !r.film.image);
const unverified = rows.filter((r) => r.flags.includes('introuvable sur TMDB'));

const lines = [];
lines.push('# Revue — Affiches & métadonnées des films');
lines.push('');
lines.push(`Généré le ${now} par [\`audit_film_posters.mjs\`](scripts/audit_film_posters.mjs:1).`);
lines.push('');
lines.push(`- Films \`site_films\` publiés : **${films.length}**`);
lines.push(`- Sources croisées : \`all_official_films.ts\` (${allOfficial.length}), \`HomeTournagesSection\` (${homeTournages.length}), \`filmography.ts\` (${filmography.length})`);
lines.push(`- Contrôle TMDB : ${TMDB && !NO_TMDB ? 'actif (films + séries)' : 'désactivé'}`);
lines.push(`- Anomalies : **${high.length} haute**, ${mid.length} moyenne, ${info.length} info`);
lines.push('');

lines.push('## 🔴 HAUTE priorité — affiche probablement erronée');
lines.push('');
if (high.length) {
    lines.push('| Type | Détail | Affiche |');
    lines.push('|---|---|---|');
    for (const i of high) lines.push(`| ${i.type} | ${i.detail} | ${i.image} |`);
} else {
    lines.push('_Aucune._');
}
lines.push('');

lines.push('## 🟠 MOYENNE priorité — métadonnées à vérifier');
lines.push('');
if (mid.length) {
    lines.push('| Détail |');
    lines.push('|---|');
    for (const i of mid) lines.push(`| ${i.detail} |`);
} else {
    lines.push('_Aucune._');
}
lines.push('');

lines.push('## ℹ️ Info — affiches partagées (alias probables)');
lines.push('');
if (info.length) {
    lines.push('| Titres | Affiche |');
    lines.push('|---|---|');
    for (const i of info) lines.push(`| ${i.detail} | ${i.image} |`);
} else {
    lines.push('_Aucune._');
}
lines.push('');

lines.push('## Affiches manquantes');
lines.push('');
lines.push(missing.length ? missing.map((r) => `- ${r.film.title} (${r.film.year || '—'})`).join('\n') : '_Aucune._');
lines.push('');

lines.push('## Non vérifiables automatiquement (introuvables sur TMDB)');
lines.push('');
lines.push(
    unverified.length
        ? `${unverified.length} titres (souvent des séries, téléfilms, contenus web ou productions confidentielles) :\n\n` +
        unverified.slice(0, 80).map((r) => `- ${r.film.title} (${r.film.year || '—'})`).join('\n')
        : '_Aucun._'
);
lines.push('');

lines.push('## Détail par film (`site_films` publiés)');
lines.push('');
lines.push('| Titre | Année | Affiche | TMDB | Alertes |');
lines.push('|---|---|---|---|---|');
for (const r of rows) {
    const img = r.film.image ? r.film.image.split('/').pop() : '—';
    const t = r.tmdb && r.tmdb.found ? `${r.tmdb.tmdbTitle} (${r.tmdb.tmdbYear || '?'})` : r.tmdb?.found === false ? 'introuvable' : '—';
    lines.push(`| ${r.film.title} | ${r.film.year || '—'} | ${img} | ${t} | ${r.flags.join(' ; ') || '✅'} |`);
}
lines.push('');
lines.push('## Méthode');
lines.push('');
lines.push('- Une **affiche partagée par deux titres NON alias** est le signal d’erreur le plus fiable.');
lines.push('- Une **affiche dont le nom de fichier évoque un autre titre** signale un échange/erreur de mapping.');
lines.push('- Une **année divergente** avec TMDB trahit souvent une confusion film/suite/remake.');
lines.push('- Les titres **introuvables sur TMDB** ne sont pas fautifs par nature : à confirmer visuellement.');
lines.push('');

fs.writeFileSync(path.join(ROOT, 'plans', 'revue-affiches-films.md'), lines.join('\n'), 'utf8');

console.log(`\nAudit affiches — ${films.length} films publiés.`);
console.log(`  HAUTE: ${high.length} | MOYENNE: ${mid.length} | INFO: ${info.length}`);
for (const i of high) console.log(`  [HAUTE] ${i.type} — ${i.detail}`);
for (const i of mid) console.log(`  [MOYENNE] ${i.detail}`);
console.log(`\nRapport écrit : plans/revue-affiches-films.md\n`);

if (high.length) process.exitCode = 2;
