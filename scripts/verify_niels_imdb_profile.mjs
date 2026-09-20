/**
 * Vérifie la fiche IMDb de Niels Dalery (nm9102434).
 * Lecture seule. Dump brut pour diagnostic.
 */
import * as dotenv from 'dotenv';
import { imdb } from './lib/imdb-client.mjs';

dotenv.config({ path: '.env.local' });

const NAME_QUERY = `
  query {
    name(id: "nm9102434") {
      id
      nameText { text }
      credits(first: 250) {
        edges {
          node {
            title { id titleText { text } releaseYear { year } titleType { id text } }
            category { id text }
          }
        }
      }
    }
  }
`;

let payload;
try {
    payload = await imdb.graphql(NAME_QUERY, {});
} catch (e) {
    console.log(`Requête échouée : ${e.message}`);
    process.exit(1);
}

console.log('--- Payload brut ---');
console.log(JSON.stringify(payload, null, 2).slice(0, 4000));
