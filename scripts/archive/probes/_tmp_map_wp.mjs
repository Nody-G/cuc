import fs from 'node:fs';

const mapping = JSON.parse(fs.readFileSync('scripts/media_url_mapping.json', 'utf8'));
const byOriginal = new Map();
for (const e of mapping.mapping) {
    if (e.originalUrl) byOriginal.set(e.originalUrl, e);
}

const FILES = [
    'scripts/setup_complete_vitrine.sql',
    'scripts/seed_site_vitrine.sql',
    'scripts/seed_pages_content.sql',
];

const RE = /https:\/\/www\.campus-universcascades\.com\/wp-content\/[^'"\s)]+/g;

const all = new Set();
for (const f of FILES) {
    const t = fs.readFileSync(f, 'utf8');
    for (const m of t.matchAll(RE)) all.add(m[0]);
}

let missing = 0;
for (const url of [...all].sort()) {
    const e = byOriginal.get(url);
    if (e) {
        console.log(`OK   ${url}\n  -> ${e.supabaseUrl || e.publicUrl || JSON.stringify(e)}`);
    } else {
        missing++;
        console.log(`MISS ${url}`);
    }
}
console.log(`\nTotal uniques: ${all.size} | manquants: ${missing}`);
