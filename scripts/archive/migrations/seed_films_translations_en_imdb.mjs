#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Synospis EN des films via IMDb (complément de TMDB)
 * ==============================================================================
 * TMDB ne publie pas d'`overview` anglaise pour ~55 fiches (séries et téléfilms
 * français surtout). IMDb, lui, expose l'intrigue de référence en anglais via son
 * API GraphQL publique : `title(id:) { plots { edges { node { plotText … } } } }`.
 * Le client IMDb du dépôt est utilisé (cache disque + rate-limit 20 req/10 s),
 * avec l'en-tête `x-imdb-user-language: en-US` — sans lui, IMDb renvoie la
 * version française.
 *
 * Doctrine :
 *   - jamais d'invention : aucune intrigue n'est rédigée, seulement reprise ;
 *   - une intrigue qui « sent le français » est REJETÉE (elle serait pire que
 *     le repli FR existant) et la fiche est signalée ;
 *   - idempotent, revue écrite à chaque exécution.
 *
 * Usage :
 *   node scripts/seed_films_translations_en_imdb.mjs --dry
 *   node scripts/seed_films_translations_en_imdb.mjs
 * ==============================================================================
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';
import { imdb } from './lib/imdb-client.mjs';

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

/** En-têtes IMDb : intrigue de référence en anglais. */
const EN_HEADERS = { 'x-imdb-user-country': 'US', 'x-imdb-user-language': 'en-US' };

async function rest(pathname, init = {}) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, {
        ...init,
        headers: { ...HEADERS, ...(init.headers || {}) },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${body.slice(0, 200)}`);
    return body ? JSON.parse(body) : null;
}

/**
 * Une intrigue est retenue si l'ANGLAIS DOMINE — pas si elle est « sans
 * marqueur français ». Les intrigues anglaises d'IMDb citent en effet des noms
 * propres français (« Alex Hugo, nicknamed "La Tendresse" », « André Malraux »,
 * « Charles de Gaulle ») : un simple test d'accents ou de mots-outils rejetait
 * des textes parfaitement anglais.
 */
const ENGLISH_MARKERS =
    /\b(the|of|and|to|in|a|an|is|are|was|were|with|for|his|her|their|who|that|when|after|from|by|on|at|as|it|he|she|they|while|into|between|years|life|story|finds|must|has|have)\b/gi;
const FRENCH_MARKERS =
    /\b(le|la|les|des|une|un|et|pour|avec|sur|dans|est|sont|du|au|aux|par|qui|que|son|sa|ses|ne|pas|plus|tout|tous|elle|ils|elles|dans|chez)\b/gi;

const isEnglishDominant = (value) => {
    if (typeof value !== 'string' || !/[a-z]/i.test(value)) return false;
    const en = (value.match(ENGLISH_MARKERS) ?? []).length;
    const fr = (value.match(FRENCH_MARKERS) ?? []).length;
    return en >= 2 && en >= fr;
};

const PLOT_QUERY = `
query TitlePlot($id: ID!) {
  title(id: $id) {
    id
    titleText { text }
    plot { plotText { plainText } }
    plots(first: 3) { edges { node { plotText { plainText } } } }
  }
}`;

/** Extrait l'identifiant IMDb : `metadata.imdb_id` puis URL IMDb. */
const imdbIdOf = (film) => {
    const fromMeta = film.metadata?.imdb_id;
    if (typeof fromMeta === 'string' && fromMeta.startsWith('tt')) return fromMeta;
    const fromUrl = String(film.imdb_url || '').match(/tt\d{6,}/);
    return fromUrl ? fromUrl[0] : null;
};

const films =
    (await rest('site_films?select=id,title,year,description,imdb_url,metadata&order=id.asc')) || [];
const overlays =
    (await rest('site_translations?select=entity_id,payload&entity=eq.film&locale=eq.en')) || [];
const overlayIndex = new Map(overlays.map((row) => [row.entity_id, row.payload || {}]));

const todo = films.filter(
    (film) =>
        typeof film.description === 'string' &&
        film.description.trim().length > 0 &&
        !overlayIndex.get(film.id)?.description
);
const batch = LIMIT > 0 ? todo.slice(0, LIMIT) : todo;

console.log(`Fiches films sans synopsis EN : ${todo.length}${LIMIT ? ` (lot de ${batch.length})` : ''}`);

const review = [];
review.push('# Revue — Synopsis EN des films via IMDb (`film`)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/seed_films_translations_en_imdb.mjs\`.`);
review.push('');
review.push(`Mode : **${DRY ? 'dry-run (aucune écriture)' : 'application en base'}**${LIMIT ? ` — limite ${LIMIT}` : ''}`);
review.push('');
review.push(`Fiches sans synopsis EN : **${todo.length}** — lot traité : **${batch.length}**.`);
review.push('');

let seeded = 0;
const resolved = [];
const unresolved = [];

for (const film of batch) {
    const imdbId = imdbIdOf(film);
    if (!imdbId) {
        unresolved.push({ id: film.id, title: film.title, reason: 'aucun identifiant IMDb' });
        continue;
    }

    try {
        const data = await imdb.graphql(PLOT_QUERY, { id: imdbId }, { headers: EN_HEADERS });
        const title = data?.data?.title;
        const candidates = [
            title?.plot?.plotText?.plainText,
            ...((title?.plots?.edges ?? []).map((edge) => edge?.node?.plotText?.plainText)),
        ]
            .map((value) => (typeof value === 'string' ? value.trim() : ''))
            .filter((value) => value.length > 30);

        const english = candidates.find((value) => isEnglishDominant(value));
        if (!english) {
            unresolved.push({
                id: film.id,
                title: film.title,
                reason: candidates.length
                    ? 'intrigue IMDb non anglaise'
                    : 'aucune intrigue IMDb',
            });
            continue;
        }

        const payload = { ...(overlayIndex.get(film.id) || {}), description: english };
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
        resolved.push({ id: film.id, title: film.title, imdb: imdbId });
        if (seeded % 10 === 0) console.log(`  … ${seeded} fiche(s) traitée(s)`);
    } catch (error) {
        unresolved.push({
            id: film.id,
            title: film.title,
            reason: String(error.message).slice(0, 120),
        });
    }
}

console.log(`\n${DRY ? '[dry] ' : ''}${seeded} synopsis EN écrits · ${unresolved.length} non résolu(s).`);

review.push(`Synopsis EN écrits : **${seeded}**. Non résolus : **${unresolved.length}**.`);
review.push('');
if (resolved.length) {
    review.push('## Résolus (source : IMDb, intrigue anglaise)');
    review.push('');
    review.push('| id | titre | IMDb |');
    review.push('|---|---|---|');
    for (const item of resolved) review.push(`| \`${item.id}\` | ${item.title} | ${item.imdb} |`);
    review.push('');
}
if (unresolved.length) {
    review.push('## Non résolus (repli FR conservé, rien inventé)');
    review.push('');
    review.push('| id | titre | motif |');
    review.push('|---|---|---|');
    for (const item of unresolved) review.push(`| \`${item.id}\` | ${item.title} | ${item.reason} |`);
    review.push('');
}
review.push(`Reste à traiter après ce lot : **${todo.length - batch.length}** fiche(s).`);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-traductions-films-imdb-en.md', review.join('\n'), 'utf8');
console.log('Revue : plans/revue-traductions-films-imdb-en.md\n');
