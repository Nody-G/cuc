/**
 * Nettoie les descriptions composées restantes (doctrine "Zéro Invention").
 *
 * Pour chaque ligne site_films dont la description est composée (générée),
 * on récupère la VRAIE description + la VRAIE jaquette depuis IMDb via son
 * `imdb_url` existant. Si IMDb ne fournit rien, la description est mise à NULL
 * (jamais de texte inventé).
 *
 * Usage : node scripts/clean_remaining_composed_descriptions.mjs [--apply]
 */
import { Client } from 'pg';
import * as dotenv from 'dotenv';

import { imdb } from './lib/imdb-client.mjs';

dotenv.config({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');

function buildTitleQuery(titleId) {
    return `
    query {
      title(id: "${titleId}") {
        id
        titleText { text }
        releaseYear { year }
        plot { plotText { plainText } }
        primaryImage { url }
      }
    }
  `;
}

async function fetchReal(titleId) {
    if (!/^tt\d+$/.test(String(titleId || ''))) return null;
    try {
        const payload = await imdb.graphql(buildTitleQuery(titleId), {});
        const t = payload?.data?.title;
        if (!t) return null;
        return {
            description: (t.plot?.plotText?.plainText || '').trim() || null,
            poster: t.primaryImage?.url || null,
        };
    } catch {
        return null;
    }
}

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
await client.connect();

const suspects = await client.query(
    `select id, title, year, imdb_url, description, image
   from site_films
   where description ilike '%Interventions CUC%'
      or description ilike '%Cascades d''action urbaine%'
      or description ilike '%Projections t%'
      or description ilike '%chutes surnaturelles%'
      or description ilike '%Film réalisé par%'
      or description ilike '%Série réalisée par%'`
);

console.log(`Descriptions composées détectées : ${suspects.rows.length}`);
console.log(`Mode : ${APPLY ? 'APPLY' : 'DRY-RUN'}\n`);

let fixed = 0;
let nulled = 0;

for (const row of suspects.rows) {
    const match = row.imdb_url ? String(row.imdb_url).match(/(tt\d+)/) : null;
    const real = match ? await fetchReal(match[1]) : null;

    const newDescription = real?.description || null;
    const newImage = real?.poster || row.image || null;

    console.log(`  ${row.title} (${row.year}) [${row.id}]`);
    console.log(`    IMDb   : ${match ? match[1] : '—'}`);
    console.log(`    AVANT  : ${String(row.description).slice(0, 90)}`);
    console.log(`    APRES  : ${newDescription ? newDescription.slice(0, 90) : '(NULL — aucune source IMDb)'}`);

    if (newDescription) fixed += 1;
    else nulled += 1;

    if (APPLY) {
        const { error } = await client.query(
            'update site_films set description = $1, image = $2, updated_at = now() where id = $3',
            [newDescription, newImage, row.id]
        );
        if (error) console.error('    ❌', error.message);
    }
    console.log('');
}

console.log(`Résumé : ${fixed} description(s) réelle(s) récupérée(s), ${nulled} mise(s) à NULL.`);

if (!APPLY) {
    console.log('\nℹ️  DRY-RUN. Relancer avec --apply pour écrire.');
}

await client.end();
