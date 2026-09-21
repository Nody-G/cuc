#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — LOT 0.2 : GARDE-FOU « aucune copie française dans le JSX »
 * ==============================================================================
 * Toute chaîne visible doit vivre dans `messages/*.json`. Ce scanner interdit la
 * copie française écrite en dur dans les composants de la vitrine (le Cockpit est
 * hors périmètre : il est FR par conception).
 *
 * Politique de dette gelée : le nombre de chaînes par fichier est comparé à une
 * empreinte de référence (`scripts/ui-i18n-baseline.json`).
 *   - une AUGMENTATION échoue (code 2) → impossible de rajouter du texte en dur ;
 *   - une DIMINUTION est signalée et l'empreinte peut être abaissée.
 *
 * Usage :
 *   node scripts/audit_ui_i18n.mjs --init      # fige la dette actuelle
 *   node scripts/audit_ui_i18n.mjs             # contrôle (CI)
 *   node scripts/audit_ui_i18n.mjs --update    # abaisse l'empreinte après un lot
 * ==============================================================================
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const BASELINE_PATH = 'scripts/ui-i18n-baseline.json';
const INIT = process.argv.includes('--init');
const UPDATE = process.argv.includes('--update');

const ACCENTS = /[àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/;
const FR_HINT =
    /\b(le|la|les|des|une|un|et|pour|avec|sur|dans|notre|nos|vos|est|sont|vous|nous|du|au|aux|par|plus|tout|tous|depuis|entre|ce|cette|ces|qui|que)\b/i;
const isFrench = (s) => typeof s === 'string' && s.trim().length > 3 && (ACCENTS.test(s) || FR_HINT.test(s));

function walk(dir, out = []) {
    for (const entry of readdirSync(dir)) {
        if (entry === 'node_modules' || entry === '.next') continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

const counts = {};
let total = 0;
for (const file of walk('src')) {
    if (!file.endsWith('.tsx')) continue;
    const rel = relative('.', file);
    if (rel.includes('(admin)')) continue; // Cockpit : FR par conception
    // Suite d'édition 3D du Cockpit (panneaux, HUD, outils) : jamais rendue sur
    // la vitrine publique, donc hors périmètre EN.
    if (rel.includes('components/3d/ui/') || rel.includes('components\\3d\\ui\\')) continue;
    const src = readFileSync(file, 'utf8');
    let count = 0;
    for (const m of src.matchAll(/>\s*([^<>{}\n]{4,160})\s*</g)) if (isFrench(m[1])) count += 1;
    for (const m of src.matchAll(
        /(?:label|title|badge|subtitle|placeholder|alt|aria-label|description|text|ctaText)=["']([^"']{4,200})["']/g
    ))
        if (isFrench(m[1])) count += 1;
    if (count) {
        counts[rel] = count;
        total += count;
    }
}
const sorted = Object.fromEntries(Object.entries(counts).sort(([, a], [, b]) => b - a));

if (INIT || !existsSync(BASELINE_PATH)) {
    writeFileSync(
        BASELINE_PATH,
        `${JSON.stringify({ note: 'Dette i18n gelée — abaisser avec --update à chaque lot du plan i18n.', total, files: sorted }, null, 2)}\n`,
        'utf8'
    );
    console.log(`\nEmpreinte ${INIT ? 'initialisée' : 'créée'} : ${total} chaînes dans ${Object.keys(sorted).length} fichiers`);
    console.log(`   → ${BASELINE_PATH}\n`);
    process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
const baseFiles = baseline.files || {};

const grown = [];
for (const [file, count] of Object.entries(sorted)) {
    const base = baseFiles[file] ?? 0;
    if (count > base) grown.push({ file, base, count, delta: count - base });
}
const newFiles = Object.keys(sorted).filter((f) => !(f in baseFiles));
const reduced = Object.entries(sorted).filter(([f, c]) => baseFiles[f] && c < baseFiles[f]);

console.log('');
console.log(`Dette i18n : ${total} chaînes (empreinte : ${baseline.total})`);
console.log(`Fichiers concernés : ${Object.keys(sorted).length}`);

if (UPDATE) {
    writeFileSync(
        BASELINE_PATH,
        `${JSON.stringify({ note: 'Dette i18n gelée — abaisser avec --update à chaque lot du plan i18n.', total, files: sorted }, null, 2)}\n`,
        'utf8'
    );
    console.log(`\nEmpreinte abaissée à ${total} chaînes.\n`);
    process.exit(0);
}

if (grown.length || newFiles.length) {
    console.error('\n❌ Des chaînes françaises ont été AJOUTÉES en dur dans le JSX :');
    for (const g of grown) console.error(`   +${g.delta}  ${g.file} (${g.base} → ${g.count})`);
    for (const f of newFiles) console.error(`   nouveau fichier : ${f} (${sorted[f]})`);
    console.error('\n   Ces textes doivent vivre dans messages/fr.json puis être traduits en EN.\n');
    process.exit(2);
}

if (reduced.length) {
    console.log('\nDette réduite sur :');
    for (const [file, count] of reduced) console.log(`   ${file} : ${baseFiles[file]} → ${count}`);
    console.log('\n   Lancer `npm run i18n:audit:ui -- --update` pour abaisser l’empreinte.');
}

console.log('\n✅ Aucune copie française ajoutée en dur.\n');
