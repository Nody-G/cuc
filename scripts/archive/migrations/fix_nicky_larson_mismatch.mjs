/**
 * Corrige la description erronée de "Nicky Larson" (mauvais imdb_url en base).
 * Le vrai titre est "Nicky Larson et le Parfum de Cupidon" (2019).
 *
 * Usage : node scripts/fix_nicky_larson_mismatch.mjs [--apply]
 */
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { imdb } from './lib/imdb-client.mjs';

dotenv.config({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');

const SEARCH_QUERY = `
  query {
    mainSearch(first: 10, options: { searchTerm: "Nicky Larson et le Parfum de Cupidon", type: TITLE, includeAdult: false }) {
      edges {
        node {
          entity {
            ... on Title {
              id
              titleText { text }
              releaseYear { year }
            }
          }
        }
      }
    }
  }
`;

const TITLE_QUERY = (id) => `
  query {
    title(id: "${id}") {
      id
      titleText { text }
      originalTitleText { text }
      releaseYear { year }
      plot { plotText { plainText } }
      primaryImage { url }
    }
  }
`;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
await client.connect();

const row = await client.query(
    "select id, title, year, imdb_url, description, image from site_films where id = 'nicky-larson'"
);
if (!row.rows.length) {
    console.log('Aucune ligne nicky-larson.');
    await client.end();
    process.exit(0);
}
console.log('Ligne actuelle :');
console.log(JSON.stringify(row.rows[0], null, 1));

let candidates = [];
try {
    const search = await imdb.graphql(SEARCH_QUERY, {});
    const edges = search?.data?.mainSearch?.edges || [];
    candidates = edges
        .map((e) => e?.node?.entity)
        .filter((t) => t && /^tt\d+$/.test(t.id || ''));
} catch (err) {
    console.log('Recherche GraphQL échouée :', err.message);
}

console.log('\nCandidats IMDb :');
for (const c of candidates) {
    console.log(`  ${c.id}  ${c.titleText?.text}  (${c.releaseYear?.year || '—'})`);
}

const best =
    candidates.find((c) => /nicky\s*larson/i.test(c.titleText?.text || '')) || candidates[0];

if (!best) {
    console.log('\nAucun candidat. La description erronée sera mise à NULL.');
    if (APPLY) {
        await client.query(
            'update site_films set description = null, updated_at = now() where id = $1',
            ['nicky-larson']
        );
        console.log('✓ Description mise à NULL.');
    }
    await client.end();
    process.exit(0);
}

const payload = await imdb.graphql(TITLE_QUERY(best.id), {});
const t = payload?.data?.title;
const description = (t?.plot?.plotText?.plainText || '').trim() || null;
const poster = t?.primaryImage?.url || null;

console.log('\nCorrection proposée :');
console.log(`  imdb_url    : https://www.imdb.com/title/${best.id}/`);
console.log(`  description : ${description ? description.slice(0, 140) : '(NULL)'}`);
console.log(`  image       : ${poster ? poster.slice(0, 70) : '(inchangée)'}`);

if (APPLY) {
    await client.query(
        'update site_films set imdb_url = $1, description = $2, image = coalesce($3, image), updated_at = now() where id = $4',
        [`https://www.imdb.com/title/${best.id}/`, description, poster, 'nicky-larson']
    );
    console.log('\n✓ Corrigé.');
} else {
    console.log('\nℹ️  DRY-RUN. Relancer avec --apply.');
}

await client.end();
