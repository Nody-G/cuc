#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Codemod : ajout des alternances `hreflang` aux métadonnées de page
 * ==============================================================================
 * Chaque `canonical: '/slug'` déclaré sous `src/app/(site)/[locale]` reçoit un
 * bloc `languages` (fr → '/slug', en → '/en/slug'), afin que les pages EN ne se
 * canonicalisent pas vers le FR.
 *
 * Idempotent : les fichiers contenant déjà `languages:` sont ignorés.
 *
 * Usage :
 *   node scripts/add_hreflang_to_page_layouts.mjs --dry
 *   node scripts/add_hreflang_to_page_layouts.mjs
 * ==============================================================================
 */
import fs from 'node:fs';
import path from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = path.join('src', 'app', '(site)', '[locale]');

function walk(dir, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
    }
    return out;
}

let touched = 0;
for (const file of walk(ROOT)) {
    let c = fs.readFileSync(file, 'utf8');
    if (!c.includes('canonical:')) continue;
    if (c.includes('languages:')) continue;

    const before = c;
    c = c.replace(/canonical:\s*(['"])([^'"]+)\1/g, (_m, q, p) => {
        const normalized = p.startsWith('/') ? p : `/${p}`;
        return `canonical: ${q}${normalized}${q}, languages: { fr: ${q}${normalized}${q}, en: ${q}/en${normalized}${q} }`;
    });

    if (c !== before) {
        touched += 1;
        console.log(`${DRY ? '[dry] ' : ''}${file}`);
        if (!DRY) fs.writeFileSync(file, c, 'utf8');
    }
}

console.log(`\n${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — ${touched} fichier(s).\n`);
