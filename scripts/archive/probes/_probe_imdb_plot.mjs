/** Sonde ponctuelle : synopsis IMDb (EN) des films sans overlay anglais. */
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
import { imdb } from './lib/imdb-client.mjs';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function rest(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`${pathname} → ${res.status}`);
    return res.json();
}

const films = await rest('site_films?select=id,title,year,description,imdb_url,metadata');
const overlays = await rest('site_translations?select=entity_id,payload&entity=eq.film&locale=eq.en');
const overlayIndex = new Map(overlays.map((row) => [row.entity_id, row.payload || {}]));

const looksFrench = (value) =>
    typeof value === 'string' &&
    /[a-z]/i.test(value) &&
    (/[àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/.test(value) ||
        /\b(le|la|les|des|une|un|et|pour|avec|sur|dans|est|sont|du|au|aux|par|qui|que|son|sa|ses)\b/i.test(
            value
        ));

const missing = films.filter(
    (film) => looksFrench(film.description) && !overlayIndex.get(film.id)?.description
);
const ttOf = (film) => {
    const fromMeta = film.metadata?.imdb_id;
    if (typeof fromMeta === 'string' && fromMeta.startsWith('tt')) return fromMeta;
    const fromUrl = String(film.imdb_url || '').match(/tt\d{6,}/);
    return fromUrl ? fromUrl[0] : null;
};

console.log(`Films sans overlay EN : ${missing.length}`);
const withTt = missing.filter((film) => ttOf(film));
const withoutTt = missing.filter((film) => !ttOf(film));
console.log(`  · avec identifiant IMDb : ${withTt.length}`);
console.log(`  · sans identifiant IMDb : ${withoutTt.length}`);
if (withoutTt.length) console.log(`    ${withoutTt.map((f) => f.id).join(', ')}`);

const PLOT_QUERY = `
query TitlePlot($id: ID!) {
  title(id: $id) {
    id
    titleText { text }
    plot { plotText { plainText language { id } } }
  }
}`;

const SUMMARIES_QUERY = `
query TitleSummaries($id: ID!) {
  title(id: $id) {
    id
    titleText { text }
    plotSummaries(first: 1) { edges { node { text { plainText } } } }
  }
}`;

for (const film of withTt.slice(0, 3)) {
    const tt = ttOf(film);
    console.log(`\n=== ${film.id} (${film.title}) — ${tt}`);
    try {
        const data = await imdb.graphql(PLOT_QUERY, { id: tt }, {
            headers: { 'x-imdb-user-language': 'en-US', 'x-imdb-user-country': 'US' },
        });
        const plot = data?.data?.title?.plot?.plotText;
        console.log(`  plot : lang=${plot?.language?.id ?? '—'}`);
        console.log(`  texte : ${(plot?.plainText ?? '—').slice(0, 220)}`);
    } catch (error) {
        console.log(`  plot → échec : ${String(error.message).slice(0, 160)}`);
    }
    try {
        const data = await imdb.graphql(SUMMARIES_QUERY, { id: tt }, {
            headers: { 'x-imdb-user-language': 'en-US', 'x-imdb-user-country': 'US' },
        });
        const summary = data?.data?.title?.plotSummaries?.edges?.[0]?.node?.text?.plainText;
        console.log(`  summary : ${(summary ?? '—').slice(0, 220)}`);
    } catch (error) {
        console.log(`  summary → échec : ${String(error.message).slice(0, 160)}`);
    }
}
