#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Correctif d'ordre de l'équipe (`site_team.order_index`)
 * ==============================================================================
 * Constat (production) : `lucas-dollfus` et `michel-bouis` avaient TOUS DEUX
 * `order_index = 0`. En tri `order_index ASC`, l'égalité est départagée de façon
 * arbitraire → Michel Bouis s'affichait EN PREMIER.
 *
 * Objectif client :
 *   - Lucas Dollfus en 1ʳᵉ position ;
 *   - Michel Bouis au moins en 6ᵉ position.
 *
 * Ce script applique un ordre canonique déterministe (1..N), aligné sur
 * l'ordre de `src/data/team.ts`. Idempotent.
 *
 * Usage :
 *   node scripts/fix_team_order.mjs --dry
 *   node scripts/fix_team_order.mjs
 * ==============================================================================
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const DRY = process.argv.includes('--dry');

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant (.env.local).');
    process.exit(1);
}

const HEADERS = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
};

/** Ordre canonique 1-based (aligné sur `src/data/team.ts`). */
const CANONICAL_ORDER = [
    'lucas-dollfus',
    'jerome-gaspard',
    'vincent-bouillon',
    'malik-diouf',
    'franck-blanc',
    'kefi-abrikh',
    'maurice-chan',
    'michel-bouis',
    'amedeo-cazzella',
    'niels-dalery',
    'bastien-trouve',
    'alan-cueff',
];

const FIRST_ID = 'lucas-dollfus';
const MICHEL_ID = 'michel-bouis';
const MICHEL_MIN_POSITION = 6; // 1-based

async function rest(path, init) {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: HEADERS, ...init });
    const text = await res.text();
    if (!res.ok) throw new Error(`${init?.method || 'GET'} ${path} → ${res.status} ${text}`);
    return text ? JSON.parse(text) : null;
}

const rows = await rest('site_team?select=id,name,order_index&order=order_index.asc');
const byId = new Map(rows.map((r) => [r.id, r]));

const missing = CANONICAL_ORDER.filter((id) => !byId.has(id));
const extra = rows.map((r) => r.id).filter((id) => !CANONICAL_ORDER.includes(id));
if (missing.length) {
    console.error('❌ Identifiants absents en base :', missing.join(', '));
    process.exit(1);
}
if (extra.length) {
    console.warn('⚠️  Identifiants hors référentiel (placés en fin) :', extra.join(', '));
}

const updates = [];
let position = 0;
for (const id of CANONICAL_ORDER) {
    position += 1;
    const row = byId.get(id);
    if (row.order_index !== position) updates.push({ id, from: row.order_index, to: position });
}
for (const id of extra) {
    position += 1;
    const row = byId.get(id);
    if (row.order_index !== position) updates.push({ id, from: row.order_index, to: position });
}

if (!updates.length) {
    console.log('\n✅ Ordre déjà conforme — aucune mise à jour nécessaire.\n');
} else {
    for (const u of updates) {
        console.log(`${DRY ? '[dry] ' : ''}${u.id}: order_index ${u.from} → ${u.to}`);
        if (!DRY) {
            await rest(`site_team?id=eq.${encodeURIComponent(u.id)}`, {
                method: 'PATCH',
                headers: { ...HEADERS, Prefer: 'return=minimal' },
                body: JSON.stringify({ order_index: u.to }),
            });
        }
    }
}

// --- Vérification finale -------------------------------------------------------
const finalRows = DRY
    ? CANONICAL_ORDER.map((id, i) => ({ id, order_index: i + 1 }))
    : await rest('site_team?select=id,order_index&order=order_index.asc');

const ordered = finalRows.map((r) => r.id);
const lucasPos = ordered.indexOf(FIRST_ID) + 1;
const michelPos = ordered.indexOf(MICHEL_ID) + 1;

console.log('\nOrdre final :');
finalRows.forEach((r, i) => console.log(`  ${String(i + 1).padStart(2)}. ${r.id}`));
console.log(`\nLucas Dollfus : position ${lucasPos} (attendu 1)`);
console.log(`Michel Bouis  : position ${michelPos} (attendu ≥ ${MICHEL_MIN_POSITION})`);

if (lucasPos !== 1 || michelPos < MICHEL_MIN_POSITION) {
    console.error('\n❌ Ordre non conforme.');
    process.exit(2);
}

console.log(`\n${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — ${updates.length} mise(s) à jour.\n`);
