import fs from 'fs';

const content = fs.readFileSync('src/data/filmography.ts', 'utf8');

const titleRegex = /title:\s*['"]([^'"]+)['"]/g;
const imdbRegex = /imdbUrl:\s*['"]([^'"]+)['"]/g;
const allocineRegex = /allocineUrl:\s*['"]([^'"]+)['"]/g;
const trailerRegex = /trailerUrl:\s*['"]([^'"]+)['"]/g;

const titles = [...content.matchAll(titleRegex)].map(m => m[1]);
const imdbs = [...content.matchAll(imdbRegex)].map(m => m[1]);
const allocines = [...content.matchAll(allocineRegex)].map(m => m[1]);
const trailers = [...content.matchAll(trailerRegex)].map(m => m[1]);

console.log(`Found ${titles.length} movies.`);

for (let i = 0; i < titles.length; i++) {
  console.log(`${titles[i]}:`);
  console.log(`  IMDb:     ${imdbs[i]}`);
  console.log(`  Allociné: ${allocines[i]}`);
  console.log(`  Trailer:  ${trailers[i]}`);
}
