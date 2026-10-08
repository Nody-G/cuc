/** Sonde ponctuelle : noms des partenaires statiques vs copies du catalogue. */
import { readFileSync } from 'node:fs';

const data = readFileSync('src/components/sections/partenaires/partenaires.data.tsx', 'utf8');
const staticNames = [...data.matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1]);
console.log(`STATIQUES (${staticNames.length}) :`);
console.log(staticNames.join('\n'));

const en = JSON.parse(readFileSync('messages/en.json', 'utf8'));
const catalogNames = (en.partenaires?.partners ?? []).map((p) => p.name);
console.log(`\nCATALOGUE (${catalogNames.length}) :`);
console.log(catalogNames.join('\n'));

const normalize = (v) => v.toLowerCase().trim();
const catalogSet = new Set(catalogNames.map(normalize));
const missing = staticNames.filter((name) => !catalogSet.has(normalize(name)));
console.log('\nSANS COPIE EN :');
console.log(missing.length ? missing.join('\n') : '—');
