import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { imdb } from './lib/imdb-client.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scrapedPath = path.join(__dirname, 'coaches_scraped_full_imdb.json');
const scraped = JSON.parse(fs.readFileSync(scrapedPath, 'utf8'));

// Filter out character names, generic roles, or non-actors
const excludeList = new Set([
  'Policier En Civil', 'Porte', 'Sentinelle', 'Tony', 'Ronan', 'Fabrice',
  'Jojo', 'Matthieu', 'Christophe', 'Kamel', 'Marc Laroche', 'Joseph Bellegarde',
  'Manu', 'Adolescent', 'Harold', 'Joseph', 'Jp', 'JP', 'Laurent Le Suicidé',
  'Hakan', 'Cara', 'Albana', 'Selma', 'Christa', 'Cléa', 'Loïe', 'Père Xavier',
  'José', 'Adil', 'Benjamin De La Fere', 'Benjamin De La Fère', 'Nacim Beliouz',
  'Malik', 'Samir', 'Liu', 'Myo Leong', 'Ezio Burntwood', 'Kenji Sakaguchi'
]);

// Map of verified actors: name -> { id, name, coachDoubles: Set, productions: Set, imdbUrl, photo, stuntSpecialty }
async function curate() {
  console.log('Total raw doubled actors detected:', scraped.aggregatedDoubledActors.length);
  
  const verifiedActors = [];

  for (const raw of scraped.aggregatedDoubledActors) {
    if (excludeList.has(raw.name)) {
      continue;
    }
    // Check if it's a known actor or looks like a real person name (Firstname Lastname)
    const parts = raw.name.split(' ');
    if (parts.length < 2) continue; // single names are usually characters like "Ramzy" unless resolved

    console.log(`Resolving actor: ${raw.name} (Doubled by: ${raw.coachesList.join(', ')})...`);
    
    // Resolve IMDb for this actor
    let imdbUrl = '';
    let photoUrl = '';
    try {
      const sug = await imdb.suggest(raw.name);
      const top = sug[0];
      if (top && top.imdbId) {
        imdbUrl = `https://www.imdb.com/name/${top.imdbId}/`;
        const q = `query { name(id: "${top.imdbId}") { primaryImage { url } } }`;
        const res = await imdb.graphql(q);
        photoUrl = res?.data?.name?.primaryImage?.url || '';
      }
    } catch (e) {
      console.warn(`  Warning resolving ${raw.name}:`, e.message);
    }

    const slug = raw.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if local photo exists in public/images/actors/
    const localPhoto = `/images/actors/${slug}.jpg`;
    const localPhotoPath = path.resolve('public', 'images', 'actors', `${slug}.jpg`);
    const hasLocal = fs.existsSync(localPhotoPath);

    verifiedActors.push({
      id: slug,
      name: raw.name,
      photo: hasLocal ? localPhoto : (photoUrl || `/images/actors/${slug}.jpg`),
      photoRemote: photoUrl,
      productions: raw.productions,
      stuntDoubles: `Doublé par ${raw.coachesList.join(', ')}`,
      coaches: raw.coachesList,
      imdbUrl: imdbUrl || `https://www.imdb.com/find?q=${encodeURIComponent(raw.name)}`,
      stuntSpecialty: `Cascades physiques, doublure d'action et combats chorégraphiés réglés par le CUC.`
    });
  }

  // Also check Ramzy Bédia
  verifiedActors.push({
    id: 'ramzy-bedia',
    name: 'Ramzy Bedia',
    photo: 'https://m.media-amazon.com/images/M/MV5BMTgzMDkyNzE1M15BMl5BanBnXkFtZTcwNzY3MTY1OA@@._V1_.jpg',
    productions: ['Les Blagues de Toto'],
    stuntDoubles: 'Doublé par Kefi Abrikh',
    coaches: ['Kefi Abrikh'],
    imdbUrl: 'https://www.imdb.com/name/nm0066060/',
    stuntSpecialty: 'Cascades physiques et comédie d\'action.'
  });

  console.log(`\nCurated ${verifiedActors.length} verified doubled actors!`);
  fs.writeFileSync('scripts/curated_doubled_celebrities.json', JSON.stringify(verifiedActors, null, 2), 'utf8');

  verifiedActors.forEach(a => {
    console.log(`- ${a.name} (${a.id}) | ${a.stuntDoubles} | Prods: ${a.productions.join(', ')}`);
  });
}

curate().catch(console.error);
