#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Overlays EN des FICHES FILMS (`site_films` → `site_translations`)
 * ==============================================================================
 * Les synopsis de `site_films.description` sont des DONNÉES rédigées en français
 * (import AlloCiné/IMDb) : ils s'affichaient tels quels dans la fiche film
 * anglaise. La source anglaise FACTUELLE de ces synopsis est TMDB (`overview`
 * en `en-US`), résolue par identifiant IMDb (`metadata.imdb_id`) — donc sans
 * ambiguïté de titre ni d'homonyme, et sans rien inventer.
 *
 * Doctrine :
 *   - jamais de traduction inventée : si TMDB n'a pas d'`overview` anglaise, la
 *     fiche est SIGNALÉE et laissée en français ;
 *   - idempotent : l'overlay est fusionné dans le payload EN existant ;
 *   - revue écrite à chaque exécution (`plans/revue-traductions-films-en.md`).
 *
 * Usage :
 *   node scripts/seed_films_translations_en.mjs --dry --limit=20
 *   node scripts/seed_films_translations_en.mjs --limit=120
 *   node scripts/seed_films_translations_en.mjs
 * ==============================================================================
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';
import { tmdb } from './lib/tmdb-client.mjs';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const DRY = process.argv.includes('--dry');
const LIMIT = Number(
    (process.argv.find((arg) => arg.startsWith('--limit=')) || '').split('=')[1] || 0
);

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
};

async function rest(pathname, init = {}) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, {
        ...init,
        headers: { ...HEADERS, ...(init.headers || {}) },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${body.slice(0, 200)}`);
    return body ? JSON.parse(body) : null;
}

const films =
    (await rest('site_films?select=id,title,year,description,metadata&order=id.asc')) || [];
const overlays =
    (await rest('site_translations?select=entity_id,payload&entity=eq.film&locale=eq.en')) || [];
const overlayIndex = new Map(overlays.map((row) => [row.entity_id, row.payload || {}]));

const hasLatinLetters = (value) => typeof value === 'string' && /[a-z]/i.test(value);
const looksFrench = (value) =>
    hasLatinLetters(value) &&
    (/[àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/.test(value) ||
        /\b(le|la|les|des|une|un|et|pour|avec|sur|dans|est|sont|du|au|aux|par|qui|que|son|sa|ses)\b/i.test(
            value
        ));

const review = [];
review.push('# Revue — Traductions EN des fiches films (`film`)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/seed_films_translations_en.mjs\`.`);
review.push('');
review.push(`Mode : **${DRY ? 'dry-run (aucune écriture)' : 'application en base'}**${LIMIT ? ` — limite ${LIMIT} fiches` : ''}`);
review.push('');

const todo = [];
for (const film of films) {
    const description = film.description;
    if (!hasLatinLetters(description)) continue;
    if (!looksFrench(description)) continue;
    if (overlayIndex.get(film.id)?.description) continue;
    todo.push(film);
}

const batch = LIMIT > 0 ? todo.slice(0, LIMIT) : todo;
console.log(`Fiches films à traiter : ${todo.length}${LIMIT ? ` (lot de ${batch.length})` : ''}`);

let seeded = 0;
const unresolved = [];
const resolved = [];

for (const film of batch) {
    const imdbId = film.metadata?.imdb_id;
    try {
        let tmdbMovieId = film.metadata?.tmdb_id ?? null;

        if (!tmdbMovieId && imdbId) {
            const found = await tmdb.get(`/find/${imdbId}`, { external_source: 'imdb_id' });
            tmdbMovieId = found?.movie_results?.[0]?.id ?? null;
        }
        if (!tmdbMovieId) {
            const search = await tmdb.get('/search/movie', {
                query: film.title,
                year: film.year || undefined,
                language: 'en-US',
            });
            tmdbMovieId = search?.results?.[0]?.id ?? null;
        }
        if (!tmdbMovieId) {
            // Titre français : la recherche en français retrouve la fiche TMDB,
            // l'`overview` reste demandée en anglais (aucune traduction inventée).
            const searchFr = await tmdb.get('/search/movie', {
                query: film.title,
                language: 'fr-FR',
            });
            tmdbMovieId = searchFr?.results?.[0]?.id ?? null;
        }
        if (!tmdbMovieId) {
            unresolved.push({ id: film.id, title: film.title, reason: 'film TMDB introuvable' });
            continue;
        }

        const movie = await tmdb.get(`/movie/${tmdbMovieId}`, { language: 'en-US' });
        const overview = typeof movie?.overview === 'string' ? movie.overview.trim() : '';
        if (!overview) {
            unresolved.push({
                id: film.id,
                title: film.title,
                reason: 'aucune overview anglaise chez TMDB',
            });
            continue;
        }

        const payload = {
            ...(overlayIndex.get(film.id) || {}),
            description: overview,
        };

        if (!DRY) {
            await rest('site_translations?on_conflict=entity,entity_id,locale', {
                method: 'POST',
                headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
                body: JSON.stringify({
                    entity: 'film',
                    entity_id: film.id,
                    locale: 'en',
                    payload,
                    is_published: true,
                }),
            });
        }

        seeded += 1;
        resolved.push({ id: film.id, title: film.title, tmdb: tmdbMovieId });
        if (seeded % 25 === 0) console.log(`  … ${seeded} fiche(s) traitée(s)`);
    } catch (error) {
        unresolved.push({ id: film.id, title: film.title, reason: String(error.message).slice(0, 120) });
    }
}

console.log(`\n${DRY ? '[dry] ' : ''}${seeded} synopsis EN écrits · ${unresolved.length} non résolu(s) · reste ${todo.length - batch.length} fiche(s).`);

review.push(`Fiches FR restantes au total : **${todo.length}**. Lot traité : **${batch.length}**.`);
review.push('');
review.push(`Synopsis EN écrits : **${seeded}**. Non résolus : **${unresolved.length}**. Reste à traiter : **${todo.length - batch.length}**.`);
review.push('');
if (resolved.length) {
    review.push('## Résolus dans ce lot');
    review.push('');
    review.push('| id | titre | TMDB |');
    review.push('|---|---|---|');
    for (const item of resolved) review.push(`| \`${item.id}\` | ${item.title} | ${item.tmdb} |`);
    review.push('');
}
if (unresolved.length) {
    review.push('## Non résolus (laissés en français, jamais inventés)');
    review.push('');
    review.push('| id | titre | motif |');
    review.push('|---|---|---|');
    for (const item of unresolved) review.push(`| \`${item.id}\` | ${item.title} | ${item.reason} |`);
    review.push('');
}

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-traductions-films-en.md', review.join('\n'), 'utf8');
console.log('Revue : plans/revue-traductions-films-en.md\n');
