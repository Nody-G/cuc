const movies = [
  { title: "The Substance", url: "https://www.imdb.com/title/tt17526714/" },
  { title: "L'Amour Ouf", url: "https://www.imdb.com/title/tt27490099/" },
  { title: "Le Comte de Monte-Cristo", url: "https://www.imdb.com/title/tt26446278/" },
  { title: "John Wick : Chapitre 4", url: "https://www.imdb.com/title/tt10366206/" },
  { title: "The Killer", url: "https://www.imdb.com/title/tt2552882/" },
  { title: "Largo Winch : Le Prix de l'argent", url: "https://www.imdb.com/title/tt23049322/" },
  { title: "Elyas", url: "https://www.imdb.com/title/tt28336131/" },
  { title: "Sous la Seine", url: "https://www.imdb.com/title/tt13964390/" },
  { title: "Fast & Furious 6", url: "https://www.imdb.com/title/tt1905041/" },
  { title: "007 Spectre", url: "https://www.imdb.com/title/tt2379713/" },
  { title: "Lucy", url: "https://www.imdb.com/title/tt2872732/" },
  { title: "Valérian et la Cité des mille planètes", url: "https://www.imdb.com/title/tt2239822/" },
  { title: "Dunkerque (Dunkirk)", url: "https://www.imdb.com/title/tt5013056/" },
  { title: "Yamakasi", url: "https://www.imdb.com/title/tt0267129/" },
];

async function verifyImdb() {
  for (const m of movies) {
    try {
      const res = await fetch(m.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      const html = await res.text();
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      console.log(`EXPECTED: "${m.title}" => GOT TITLE: "${titleMatch ? titleMatch[1].trim() : 'NONE'}" (Status: ${res.status})`);
    } catch (e) {
      console.log(`ERR on ${m.title}: ${e.message}`);
    }
  }
}

verifyImdb();
