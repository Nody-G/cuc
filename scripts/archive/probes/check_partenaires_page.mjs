const res = await fetch('http://localhost:3000/partenaires');
const html = await res.text();
const decoded = decodeURIComponent(html);
const imgMatches = [...decoded.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
console.log('Decoded img src count:', imgMatches.length);
imgMatches.filter(src => src.includes('/images/partenaires/')).forEach(s => console.log('Found:', s));
