/** Sonde ponctuelle : chaînes FR en dur restantes, fichier par fichier. */
import { readFileSync, existsSync } from 'node:fs';

const ACCENTS = /[àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/;
const FR_HINT =
    /\b(le|la|les|des|une|un|et|pour|avec|sur|dans|notre|nos|vos|est|sont|vous|nous|du|au|aux|par|plus|tout|tous|depuis|entre|ce|cette|ces|qui|que)\b/i;
const isFrench = (s) => typeof s === 'string' && s.trim().length > 3 && (ACCENTS.test(s) || FR_HINT.test(s));

const cache = existsSync('.cache/translation-surface.json')
    ? JSON.parse(readFileSync('.cache/translation-surface.json', 'utf8'))
    : null;
const uiFiles = (cache?.uiFiles ?? cache?.ui ?? []).map((entry) =>
    typeof entry === 'string' ? { file: entry } : entry
);

const TARGETS = uiFiles
    .map((entry) => String(entry.file).replace(/\\/g, '/'))
    .filter((file) => !file.includes('3d/ui/') && !file.endsWith('.test.tsx'));

console.log(`${TARGETS.length} fichier(s) hors éditeur 3D et tests :\n`);

for (const file of TARGETS) {
    let src;
    try {
        src = readFileSync(file, 'utf8');
    } catch {
        continue;
    }
    const found = [];
    for (const m of src.matchAll(/>\s*([^<>{}\n]{4,160})\s*</g)) {
        if (isFrench(m[1])) found.push({ kind: 'texte', value: m[1].trim() });
    }
    for (const m of src.matchAll(
        /(?:label|title|badge|subtitle|placeholder|alt|aria-label|description|text|ctaText)=["']([^"']{4,200})["']/g
    )) {
        if (isFrench(m[1])) found.push({ kind: 'attribut', value: m[1].trim() });
    }
    if (!found.length) continue;
    console.log(`### ${file} (${found.length})`);
    for (const item of found) console.log(`  [${item.kind}] ${item.value}`);
    console.log('');
}
