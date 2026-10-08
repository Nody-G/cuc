const movies = [
  { title: "The Substance", url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=300680.html" },
  { title: "L'Amour Ouf", url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=221617.html" },
  { title: "Le Comte de Monte-Cristo", url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=288404.html" },
  { title: "John Wick : Chapitre 4", url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=274387.html" },
  { title: "The Killer", url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=131724.html" },
  { title: "Largo Winch : Le Prix de l'argent", url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=210439.html" },
  { title: "Elyas", url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=317127.html" },
  { title: "Sous la Seine", url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=313341.html" },
  { title: "Fast & Furious 6", url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=189651.html" },
  { title: "007 Spectre", url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=206892.html" },
  { title: "Lucy", url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=186452.html" },
  { title: "Valérian et la Cité des mille planètes", url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=237821.html" },
  { title: "Dunkerque (Dunkirk)", url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=240850.html" },
  { title: "Yamakasi", url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=29366.html" },
];

async function verifyAllocine() {
  for (const m of movies) {
    try {
      const res = await fetch(m.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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

verifyAllocine();
