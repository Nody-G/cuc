import fs from 'node:fs';

const FILES = [
    'scripts/setup_complete_vitrine.sql',
    'scripts/seed_site_vitrine.sql',
    'scripts/seed_pages_content.sql',
];

const RE = /https:\/\/www\.campus-universcascades\.com\/wp-content\/[^'"\s)]+/g;

for (const f of FILES) {
    const t = fs.readFileSync(f, 'utf8');
    const m = [...t.matchAll(RE)].map((x) => x[0]);
    const u = [...new Set(m)];
    console.log(`=== ${f} (${m.length} occurrences, ${u.length} uniques) ===`);
    u.forEach((x) => console.log('  ' + x));
}
