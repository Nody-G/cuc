#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — LOT 0.1 : MESURE de la surface à traduire (périmètre « complet visible »)
 * ==============================================================================
 * Chiffre, sans rien modifier :
 *   A. la copie d'INTERFACE écrite en dur dans les composants (hors Cockpit) ;
 *   B. les valeurs FRANÇAISES présentes dans les entités de données, d'après le
 *      registre `src/lib/i18n/entities.json` (source de vérité unique) ;
 *   C. la couverture actuelle des catalogues `messages/*.json`.
 *
 * Produit `plans/revue-surface-traduction.md` et `.cache/translation-surface.json`.
 *
 * Usage : node scripts/audit_translation_surface.mjs
 * ==============================================================================
 */
import { readdirSync, readFileSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const REGISTRY = JSON.parse(readFileSync('src/lib/i18n/entities.json', 'utf8'));

const ACCENTS = /[àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/;
const FR_HINT =
    /\b(le|la|les|des|une|un|et|pour|avec|sur|dans|notre|nos|vos|est|sont|vous|nous|du|au|aux|par|plus|tout|tous|depuis|entre|ce|cette|ces|qui|que)\b/i;
const isFrench = (s) => typeof s === 'string' && s.trim().length > 3 && (ACCENTS.test(s) || FR_HINT.test(s));

async function rest(pathname) {
    try {
        const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

function walk(dir, out = []) {
    for (const entry of readdirSync(dir)) {
        if (entry === 'node_modules' || entry === '.next') continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

/* --- A. Interface ---------------------------------------------------------- */
const uiFiles = [];
let uiTotal = 0;
for (const file of walk('src')) {
    if (!file.endsWith('.tsx')) continue;
    if (relative('src', file).includes('(admin)')) continue;
    const src = readFileSync(file, 'utf8');
    let count = 0;
    for (const m of src.matchAll(/>\s*([^<>{}\n]{4,160})\s*</g)) if (isFrench(m[1])) count += 1;
    for (const m of src.matchAll(
        /(?:label|title|badge|subtitle|placeholder|alt|aria-label|description|text|ctaText)=["']([^"']{4,200})["']/g
    ))
        if (isFrench(m[1])) count += 1;
    if (count) {
        uiFiles.push({ file: relative('.', file), count });
        uiTotal += count;
    }
}
uiFiles.sort((a, b) => b.count - a.count);

/* --- B. Entités ------------------------------------------------------------ */
const entityRows = [];
let entityTotal = 0;
for (const def of REGISTRY.entities) {
    // Entité « overlay seul » : aucune table source (miroir JSON `site_settings`).
    if (!def.table) continue;

    const rows = await rest(`${def.table}?select=*`);
    if (!rows) {
        entityRows.push({ ...def, table: def.table, rows: 0, total: 0, perField: [], missing: true });
        continue;
    }
    const perField = [];
    for (const field of def.fields) {
        let count = 0;
        for (const row of rows) {
            const value = row[field.name];
            if (typeof value === 'string') {
                if (isFrench(value)) count += 1;
            } else if (Array.isArray(value)) {
                if (value.some((v) => isFrench(typeof v === 'string' ? v : JSON.stringify(v)))) count += 1;
            } else if (value && typeof value === 'object' && isFrench(JSON.stringify(value))) count += 1;
        }
        if (count) perField.push({ field: field.name, count });
    }
    const total = perField.reduce((s, f) => s + f.count, 0);
    entityTotal += total;
    entityRows.push({ entity: def.entity, label: def.label, table: def.table, rows: rows.length, total, perField });
}

/* --- C. Catalogues --------------------------------------------------------- */
const countKeys = (obj, prefix = '') =>
    Object.entries(obj).flatMap(([k, v]) =>
        v && typeof v === 'object' ? countKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
    );
const frCatalog = JSON.parse(readFileSync('messages/fr.json', 'utf8'));
const enCatalog = JSON.parse(readFileSync('messages/en.json', 'utf8'));
const frKeys = countKeys(frCatalog);
const enKeys = countKeys(enCatalog);

/* --- Rapport --------------------------------------------------------------- */
const lines = [];
lines.push('# Revue — Surface de traduction (périmètre « complet visible »)');
lines.push('');
lines.push(`Généré le ${new Date().toISOString()} par [\`audit_translation_surface.mjs\`](scripts/audit_translation_surface.mjs:1).`);
lines.push('');
lines.push('## Synthèse');
lines.push('');
lines.push(`- Copie d’interface en dur : **${uiTotal} chaînes** dans **${uiFiles.length} fichiers**`);
lines.push(`- Valeurs françaises en base (périmètre public) : **${entityTotal}**`);
lines.push(`- Catalogue UI actuel : **${frKeys.length} clés** (EN : ${enKeys.length})`);
lines.push('');
lines.push('## A. Interface — fichiers les plus chargés');
lines.push('');
lines.push('| Fichier | Chaînes |');
lines.push('|---|---|');
for (const f of uiFiles) lines.push(`| \`${f.file}\` | ${f.count} |`);
lines.push('');
lines.push('## B. Entités de données');
lines.push('');
lines.push('| Entité | Table | Lignes | Valeurs FR | Détail champs |');
lines.push('|---|---|---|---|---|');
for (const e of entityRows) {
    lines.push(
        `| ${e.label} | \`${e.table}\` | ${e.rows} | ${e.total} | ${e.perField.map((f) => `${f.field} : ${f.count}`).join(', ') || (e.missing ? 'table non lisible' : '—')} |`
    );
}
lines.push('');
lines.push('## C. Catalogues de messages');
lines.push('');
lines.push(`- \`messages/fr.json\` : ${frKeys.length} clés`);
lines.push(`- \`messages/en.json\` : ${enKeys.length} clés`);
lines.push(`- Clés présentes en FR mais absentes en EN : ${frKeys.filter((k) => !enKeys.includes(k)).length}`);
lines.push('');

mkdirSync('plans', { recursive: true });
mkdirSync('.cache', { recursive: true });
writeFileSync('plans/revue-surface-traduction.md', lines.join('\n'), 'utf8');
writeFileSync(
    '.cache/translation-surface.json',
    JSON.stringify({ generatedAt: new Date().toISOString(), uiTotal, uiFiles, entityTotal, entityRows }, null, 2),
    'utf8'
);

console.log('');
console.log(`Interface en dur  : ${uiTotal} chaînes dans ${uiFiles.length} fichiers`);
console.log(`Entités (base)    : ${entityTotal} valeurs FR`);
console.log(`Catalogue UI      : ${frKeys.length} clés FR / ${enKeys.length} EN`);
console.log('');
console.log('Top 10 fichiers à externaliser :');
for (const f of uiFiles.slice(0, 10)) console.log(`  ${String(f.count).padStart(3)}  ${f.file}`);
console.log('');
console.log('Entités par volume :');
for (const e of entityRows.sort((a, b) => b.total - a.total)) {
    console.log(`  ${String(e.total).padStart(4)}  ${e.label.padEnd(22)} ${e.rows} ligne(s)`);
}
console.log('\nRapports : plans/revue-surface-traduction.md et .cache/translation-surface.json\n');
