/** Sonde ponctuelle : intrigues IMDb des 3 premières fiches non résolues. */
import dotenv from 'dotenv';
import { imdb } from './lib/imdb-client.mjs';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const EN_HEADERS = { 'x-imdb-user-country': 'US', 'x-imdb-user-language': 'en-US' };

const QUERY = `
query TitlePlot($id: ID!) {
  title(id: $id) {
    id
    titleText { text }
    plot { plotText { plainText } }
    plots(first: 10) { edges { node { plotText { plainText } } } }
  }
}`;

const ids = process.argv.slice(2);
for (const tt of ids) {
    const data = await imdb.graphql(QUERY, { id: tt }, { headers: EN_HEADERS });
    const title = data?.data?.title;
    console.log(`\n=== ${tt} — ${title?.titleText?.text ?? '?'}`);
    console.log(`  plot: ${JSON.stringify(title?.plot?.plotText?.plainText ?? null).slice(0, 300)}`);
    const edges = title?.plots?.edges ?? [];
    console.log(`  plots (${edges.length}) :`);
    edges.forEach((edge, idx) => {
        console.log(`   [${idx}] ${JSON.stringify(edge?.node?.plotText?.plainText ?? null).slice(0, 240)}`);
    });
}

// Vérifie aussi ce que renvoient les fiches en base pour ces titres.
const res = await fetch(
    `${URL_BASE}/rest/v1/site_films?select=id,title,imdb_url,metadata&id=in.(6-x-confine-e-s,alex-hugo,avis-de-tempete)`,
    { headers: HEADERS }
);
console.log('\nLignes en base :', JSON.stringify(await res.json(), null, 1).slice(0, 900));
