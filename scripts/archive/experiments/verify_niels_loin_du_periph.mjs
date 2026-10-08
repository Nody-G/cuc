/**
 * Vérification de la véracité du crédit de Niels Dalery sur
 * "Loin du périph" (The Takedown, 2022, tt13822738).
 *
 * Lecture seule.
 */
import * as dotenv from 'dotenv';
import { imdb } from './lib/imdb-client.mjs';

dotenv.config({ path: '.env.local' });

const CREDITS_QUERY = `
  query {
    title(id: "tt13822738") {
      id
      titleText { text }
      releaseYear { year }
      credits(first: 250, filter: { categories: ["stunts"] }) {
        edges {
          node {
            name { id nameText { text } }
          }
        }
      }
    }
  }
`;

const SEARCH_QUERY = `
  query {
    mainSearch(first: 10, options: { searchTerm: "Niels Dalery", type: NAME, includeAdult: false }) {
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

let payload;
try {
    payload = await imdb.graphql(CREDITS_QUERY, {});
} catch (e) {
    console.log(`Requête crédits échouée : ${e.message}`);
    process.exit(1);
}

const title = payload?.data?.title;
if (!title) {
    console.log('Film tt13822738 introuvable.');
    process.exit(1);
}

console.log(`\n=== ${title.titleText.text} (${title.releaseYear?.year}) — ${title.id} ===`);
const edges = title.credits?.edges || [];
console.log(`Crédits "stunts" : ${edges.length}\n`);

const matches = [];
for (const e of edges) {
    const name = e?.node?.name?.nameText?.text || '';
    if (/dalery|niels/i.test(name)) {
        matches.push({ name, id: e?.node?.name?.id });
    }
}

console.log('--- Correspondances "Dalery" / "Niels" dans les crédits stunts ---');
if (matches.length === 0) {
    console.log('  AUCUNE correspondance.');
} else {
    for (const m of matches) {
        console.log(`  ${m.name} (${m.id})`);
    }
}

console.log('\n--- Tous les crédits stunts ---');
for (const e of edges) {
    console.log(`  ${e?.node?.name?.nameText?.text || '?'}`);
}

try {
    const s = await imdb.graphql(SEARCH_QUERY, {});
    const names = (s?.data?.mainSearch?.edges || [])
        .map((e) => e?.node?.entity)
        .filter(Boolean);
    console.log(`\n=== Recherche personne "Niels Dalery" : ${names.length} résultat(s) ===`);
    for (const n of names) {
        console.log(`  ${n.nameText?.text} (${n.id})`);
    }
} catch (e) {
    console.log(`\nRecherche personne échouée : ${e.message}`);
}
