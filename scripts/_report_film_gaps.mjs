/** Sonde ponctuelle : listes des fiches films encore sans overlay EN. */
import { readFileSync } from 'node:fs';

const coverage = JSON.parse(readFileSync('.cache/entity-coverage.json', 'utf8'));
const films = coverage.results.find((entry) => entry.entity === 'film');
console.log(`Films — couverture ${films.covered}/${films.total} — manques : ${films.missing.length}`);
for (const item of films.missing) {
    console.log(`\n- ${item.id} (${item.path})`);
    console.log(`  FR : ${String(item.frText).slice(0, 200)}`);
}

const en = JSON.parse(readFileSync('messages/en.json', 'utf8'));
console.log(`\nCatalogues EN : ${Object.keys(en).length} namespaces`);
