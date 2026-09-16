const trailers = [
  { title: "The Substance", url: "https://www.youtube.com/watch?v=mcEFQwRbBZg" },
  { title: "L'Amour Ouf", url: "https://www.youtube.com/watch?v=bSbA6Aeydbs" },
  { title: "Le Comte de Monte-Cristo", url: "https://www.youtube.com/watch?v=u0YnbsyvGS0" },
  { title: "John Wick : Chapitre 4", url: "https://www.youtube.com/watch?v=JjBZ2iEBcxM" },
  { title: "The Killer", url: "https://www.youtube.com/watch?v=ooNWWB0S1KM" },
  { title: "Largo Winch : Le Prix de l'argent", url: "https://www.youtube.com/watch?v=3-Dm59tR_rM" },
  { title: "Elyas", url: "https://www.youtube.com/watch?v=CurKNMuYof8" },
  { title: "Sous la Seine", url: "https://www.youtube.com/watch?v=HPfkQ9gMLMY" },
  { title: "Fast & Furious 6", url: "https://www.youtube.com/watch?v=Ewu0WTPbOVY" },
  { title: "007 Spectre", url: "https://www.youtube.com/watch?v=NlZS1pSF2hU" },
  { title: "Lucy", url: "https://www.youtube.com/watch?v=7gPrNpHaFX8" },
  { title: "Valérian et la Cité des mille planètes", url: "https://www.youtube.com/watch?v=FPcRK7MvTn4" },
  { title: "Dunkerque (Dunkirk)", url: "https://www.youtube.com/watch?v=chRUCIk3K94" },
  { title: "Yamakasi", url: "https://www.youtube.com/watch?v=aA0wW7E-Wok" },
];

async function verifyYoutubeTrailers() {
  let allOk = true;
  for (const t of trailers) {
    try {
      const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(t.url)}&format=json`;
      const res = await fetch(oembed);
      if (res.ok) {
        const data = await res.json();
        console.log(`OK: "${t.title}" => "${data.title}"`);
      } else {
        console.log(`FAILED (${res.status}): "${t.title}"`);
        allOk = false;
      }
    } catch (e) {
      console.log(`ERR on "${t.title}": ${e.message}`);
      allOk = false;
    }
  }
  console.log(`\nResult: ${allOk ? 'ALL 14 TRAILERS VERIFIED AND WORKING!' : 'SOME FAILED'}`);
}

verifyYoutubeTrailers();
