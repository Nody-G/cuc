import fs from 'fs';
import https from 'https';
import http from 'http';

const films = JSON.parse(fs.readFileSync('scripts/all_63_films_resolved.json', 'utf8'));

// Apply the 14 fixes
const allocineFixes = {
  'gtmax': 'https://www.allocine.fr/film/fichefilm_gen_cfilm=310532.html',
  'fiasco': 'https://www.allocine.fr/series/ficheserie_gen_cserie=34019.html',
  'le-salaire-de-la-peur': 'https://www.allocine.fr/film/fichefilm_gen_cfilm=315125.html',
  'alibi-com-2': 'https://www.allocine.fr/film/fichefilm_gen_cfilm=281261.html',
  'murder-mystery-2': 'https://www.allocine.fr/film/fichefilm_gen_cfilm=278052.html',
  'family-business': 'https://www.allocine.fr/series/ficheserie_gen_cserie=24218.html',
  'dune': 'https://www.allocine.fr/film/fichefilm_gen_cfilm=235875.html',
  'police': 'https://www.allocine.fr/film/fichefilm_gen_cfilm=259500.html',
  '6-underground': 'https://www.allocine.fr/film/fichefilm_gen_cfilm=261474.html',
  'alibi-com': 'https://www.allocine.fr/film/fichefilm_gen_cfilm=247411.html',
  'raid-dingue': 'https://www.allocine.fr/film/fichefilm_gen_cfilm=238378.html',
  'jason-bourne': 'https://www.allocine.fr/film/fichefilm_gen_cfilm=231615.html',
  '3-days-to-kill': 'https://www.allocine.fr/film/fichefilm_gen_cfilm=208084.html',
  'largo-winch': 'https://www.allocine.fr/film/fichefilm_gen_cfilm=128357.html'
};

films.forEach(f => {
  if (allocineFixes[f.id]) {
    f.allocine_url = allocineFixes[f.id];
  }
});

async function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const isHttps = url.startsWith('https:');
      const client = isHttps ? https : http;
      client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'fr-FR,fr;q=0.9',
          'Cookie': 'CONSENT=YES+1; SOCS=CAESEwgDEgk2OTcyMTY4NjgaAmZyIAEaBgiA_LyaBg'
        },
        timeout: 8000
      }, res => {
        resolve({ url, status: res.statusCode });
      }).on('error', e => resolve({ url, error: e.message }))
        .on('timeout', () => resolve({ url, error: 'TIMEOUT' }));
    } catch (e) {
      resolve({ url, error: e.message });
    }
  });
}

async function run() {
  console.log('Verifying all 63 Allocine URLs with fixes...');
  const allocineResults = await Promise.all(films.map(f => checkUrl(f.allocine_url)));
  const failedAllocine = allocineResults.filter(r => !r.status || r.status >= 400);
  console.log(`Allocine: ${allocineResults.length - failedAllocine.length} OK, ${failedAllocine.length} Failed`);
  if (failedAllocine.length > 0) {
    console.log('Failed:', failedAllocine);
  }

  console.log('Verifying all 63 IMDb URLs...');
  const imdbResults = await Promise.all(films.map(f => checkUrl(f.imdb_url)));
  const failedImdb = imdbResults.filter(r => !r.status || r.status >= 400);
  console.log(`IMDb: ${imdbResults.length - failedImdb.length} OK, ${failedImdb.length} Failed`);
  if (failedImdb.length > 0) {
    console.log('Failed IMDb:', failedImdb);
  }

  console.log('Verifying all 63 YouTube Trailers...');
  const ytResults = await Promise.all(films.map(f => checkUrl(f.trailer_url)));
  const failedYt = ytResults.filter(r => !r.status || r.status >= 400);
  console.log(`YouTube: ${ytResults.length - failedYt.length} OK, ${failedYt.length} Failed`);
  if (failedYt.length > 0) {
    console.log('Failed YouTube:', failedYt);
  }

  if (failedAllocine.length === 0 && failedImdb.length === 0 && failedYt.length === 0) {
    console.log('🎉 100% OF ALL 63 FILMS HAVE VALID, VERIFIED URLS!');
    // save updated
    fs.writeFileSync('scripts/all_63_films_resolved.json', JSON.stringify(films, null, 2));
  }
}

run();
