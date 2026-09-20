/**
 * Recherche "Niels Dalery" sur IMDb (personnes) et teste des variantes.
 * Lecture seule.
 */
import * as dotenv from 'dotenv';
import { imdb } from './lib/imdb-client.mjs';

dotenv.config({ path: '.env.local' });

const TERMS = ['Niels Dalery', 'Niels Dalery cascadeur', 'Dalery Niels', 'Niels Dalery stunt'];

for (const term of TERMS) {
    const q = `
    query {
      mainSearch(first: 10, options: { searchTerm: "${term}", type: NAME, includeAdult: false }) {
        edges {
          node {
            entity {
              ... on Name {
                id
                nameText { text }
              }
            }
          }
        }
      }
    }
  `;
    try {
        const s = await imdb.graphql(q, {});
        const names = (s?.data?.mainSearch?.edges || [])
            .map((e) => e?.node?.entity)
            .filter(Boolean);
        console.log(`\n=== "${term}" : ${names.length} résultat(s) ===`);
        for (const n of names) {
            console.log(`  ${n.nameText?.text} (${n.id})`);
        }
    } catch (e) {
        console.log(`\n"${term}" → erreur : ${e.message}`);
    }
}
