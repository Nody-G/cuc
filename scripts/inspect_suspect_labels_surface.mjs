#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Recherche d'étiquettes interdites sur TOUTE la surface publique
 * ==============================================================================
 * Localise précisément où vit un libellé du type « Cascadeurs CUC (Tournage
 * Paris) », badge ou étiquette marketing qui ne doit jamais s'afficher
 * (doctrine « Zéro AI Slop » / « Zéro invention »).
 *
 * Surface balayée :
 *   - `site_films` (toutes colonnes), `site_team`, `site_pages`,
 *     `site_translations` (overlays FR **et** EN) ;
 *   - les données statiques du dépôt (`src/data/*.ts`) ;
 *   - les catalogues de messages (`messages/*.json`).
 *
 * Lecture seule.
 * Usage : node scripts/inspect_suspect_labels_surface.mjs
 * ==============================================================================
 */
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

/**
 * Motifs interdits : auto-références au campus, tournage géographique,
 * étiquettes marketing creuses. On ne cherche pas « CUC » seul (nom du campus,
 * légitime), mais les tournures qui ne décrivent aucun fait vérifiable.
 */
const SUSPECT =
    /(Équipe cascades CUC|Cascadeurs CUC|Doublures cascades CUC|CUC Performers|CUC Team|Performers de Combat|Spécialistes Rigging|Co-fondateur CUC|Stunt Support|Stunt Doubling|Enforcers|\(Tournage|Tournage Paris|tournage paris|HOLLYWOOD|WORLDWIDE|ÉLITE|ELITE|BLOCKBUSTER|BOX-OFFICE|SUCCÈS MONDIAL)/i;

async function rest(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
    return res.json();
}

/** Extrait les chaînes contenant un motif, avec le chemin JSON. */
function hunt(node, entity, out, prefix = '') {
    if (node === null || node === undefined) return out;
    if (typeof node === 'string') {
        const matches = node.match(new RegExp(`.{0,90}${SUSPECT.source}.{0,90}`, 'gi')) || [];
        for (const m of matches) out.push({ entity, path: prefix || '(racine)', value: m.trim() });
        return out;
    }
    if (Array.isArray(node)) {
        node.forEach((item, i) => hunt(item, entity, out, `${prefix}[${i}]`));
        return out;
    }
    if (typeof node === 'object') {
        for (const [key, value] of Object.entries(node)) {
            hunt(value, entity, out, prefix ? `${prefix}.${key}` : key);
        }
    }
    return out;
}

const found = [];

/* ---------------- Base de données ---------------- */
const tables = [
    { table: 'site_films', label: 'site_films' },
    { table: 'site_team', label: 'site_team' },
    { table: 'site_pages', label: 'site_pages' },
    { table: 'site_programs', label: 'site_programs' },
    { table: 'site_events', label: 'site_events' },
    { table: 'site_partners', label: 'site_partners' },
    { table: 'site_campus_pois', label: 'site_campus_pois' },
    { table: 'site_disciplines', label: 'site_disciplines' },
];

for (const { table, label } of tables) {
    const rows = await rest(`${table}?select=*`);
    for (const row of rows) {
        hunt(row, label, found);
    }
    console.log(`🔎 ${label} : ${rows.length} ligne(s) balayée(s)`);
}

const translations = await rest('site_translations?select=entity,entity_id,locale,payload');
for (const row of translations) {
    hunt(row.payload, `site_translations:${row.entity}:${row.entity_id}:${row.locale}`, found);
}
console.log(`🔎 site_translations : ${translations.length} overlay(s) balayé(s)`);

const settings = await rest('site_settings?select=key,value');
for (const row of settings) {
    hunt(row.value, `site_settings:${row.key}`, found);
}
console.log(`🔎 site_settings : ${settings.length} clé(s) balayée(s)`);

/* ---------------- Dépôt ---------------- */
const dataDir = path.join('src', 'data');
for (const file of fs.readdirSync(dataDir)) {
    if (!file.endsWith('.ts')) continue;
    const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (SUSPECT.test(line)) {
            found.push({
                entity: `src/data/${file}`,
                path: `ligne ${i + 1}`,
                value: line.trim().slice(0, 160),
            });
        }
    });
}
console.log('🔎 src/data/*.ts balayé(s)');

for (const file of fs.readdirSync('messages')) {
    if (!file.endsWith('.json')) continue;
    const content = fs.readFileSync(path.join('messages', file), 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (SUSPECT.test(line)) {
            found.push({
                entity: `messages/${file}`,
                path: `ligne ${i + 1}`,
                value: line.trim().slice(0, 160),
            });
        }
    });
}
console.log('🔎 messages/*.json balayé(s)');

/* ---------------- Rapport ---------------- */
console.log(`\n=== OCCURRENCES : ${found.length} ===`);
const byEntity = new Map();
for (const f of found) {
    byEntity.set(f.entity, (byEntity.get(f.entity) || 0) + 1);
}
for (const [entity, count] of [...byEntity.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`${String(count).padStart(5)} × ${entity}`);
}

console.log('\n--- Détail (120 premières) ---');
for (const f of found.slice(0, 120)) {
    console.log(`  • [${f.entity}] ${f.path} → « ${f.value} »`);
}

if (found.length === 0) {
    console.log('\n✅ Aucune étiquette interdite détectée sur la surface balayée.');
}
