const res = await fetch('https://www.campus-universcascades.com/partenaires/');
const html = await res.text();
console.log('HTML length:', html.length);
// Find all images
const imgMatches = [...html.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/gi)];
console.log('Total images on live /partenaires/:', imgMatches.length);
imgMatches.forEach((m, i) => {
  console.log(`[${i}] ${m[1]}`);
});
