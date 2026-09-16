/**
 * Ajoute `alternates: { canonical: '/<route>' }` dans les métadonnées
 * de chaque layout de route (sauf le layout racine, déjà traité).
 *
 * Idempotent : ignore les fichiers contenant déjà `alternates`.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = 'src/app';

function walk(dir) {
    const out = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) out.push(...walk(full));
        else if (entry === 'layout.tsx') out.push(full);
    }
    return out;
}

let patched = 0;
let skipped = 0;

for (const file of walk(ROOT)) {
    // Ignorer le layout racine
    if (file === join(ROOT, 'layout.tsx')) continue;

    let text = readFileSync(file, 'utf8');

    if (text.includes('alternates')) {
        skipped++;
        continue;
    }

    // Dériver la route depuis le chemin du dossier
    const routeDir = relative(ROOT, file).split(sep)[0];
    const canonicalPath = `/${routeDir}`;

    // Insérer après la première ligne `description: "...",` du bloc metadata.
    // Gère les fins de ligne CRLF et LF.
    const next = text.replace(
        /(\r?\n\s*description:\s*"[^"]*",\r?\n)/,
        (match, p1) => {
            const eol = p1.includes('\r\n') ? '\r\n' : '\n';
            return `${p1}  alternates: {${eol}    canonical: '${canonicalPath}',${eol}  },${eol}`;
        }
    );

    if (next !== text) {
        writeFileSync(file, next, 'utf8');
        patched++;
        console.log(`PATCHED: ${file} -> ${canonicalPath}`);
    } else {
        console.log(`NO MATCH: ${file}`);
    }
}

console.log(`\nTotal patched: ${patched} | already had alternates: ${skipped}`);
