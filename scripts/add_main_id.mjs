/**
 * Ajoute `id="contenu-principal"` aux balises <main> des pages
 * afin que le lien d'évitement (skip-to-content) fonctionne.
 *
 * Idempotent : ne modifie pas les fichiers déjà patchés.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'src/app';

function walk(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) out.push(...walk(full));
        else if (entry === 'page.tsx') out.push(full);
    }
    return out;
}

let patched = 0;
let skipped = 0;

for (const file of walk(ROOT)) {
    let text = readFileSync(file, 'utf8');

    if (text.includes('id="contenu-principal"')) {
        skipped++;
        continue;
    }

    // Cible : <main className="flex-grow pt-28..."> (toutes les pages)
    const next = text.replace(
        /<main className="flex-grow pt-28/g,
        '<main id="contenu-principal" className="flex-grow pt-28'
    );

    if (next !== text) {
        writeFileSync(file, next, 'utf8');
        patched++;
        console.log(`PATCHED: ${file}`);
    } else {
        console.log(`NO MATCH: ${file}`);
    }
}

console.log(`\nTotal patched: ${patched} | already had id: ${skipped}`);
