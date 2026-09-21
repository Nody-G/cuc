#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Garde éditoriale : interdiction des mentions « 6 ha »
 * ==============================================================================
 * Demande client : « tu marques trop 6ha de partout, retire-en, c'est bien trop ».
 *
 * Ce garde-fou échoue (code 2) si un fichier rendu de `src/` réintroduit
 * « 6 hectares », « 6 Ha » ou « 6 HECTARES ».
 *
 * Usage :
 *   node scripts/check_6ha_mentions.mjs
 * ==============================================================================
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const SRC = join(process.cwd(), 'src');
const FORBIDDEN = /\b6\s?(?:ha|hectares)\b/i;
const ALLOWED_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.md']);
const EXCLUDE = ['no-6ha'];

function walk(dir, out = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

const violations = [];
for (const file of walk(SRC)) {
    if (EXCLUDE.some((x) => file.includes(x))) continue;
    if (!ALLOWED_EXT.has(extname(file))) continue;
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
        if (FORBIDDEN.test(line)) {
            violations.push(`${relative(process.cwd(), file)}:${i + 1}  ${line.trim()}`);
        }
    });
}

if (violations.length) {
    console.error(`\n❌ Mentions « 6 ha » interdites détectées (${violations.length}) :\n`);
    for (const v of violations) console.error(`  • ${v}`);
    console.error('');
    process.exit(2);
}

console.log('\n✅ Aucune mention « 6 ha » dans src/.\n');
