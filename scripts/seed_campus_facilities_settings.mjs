#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Miroir Supabase des INSTALLATIONS DU CAMPUS
 * ==============================================================================
 * Doctrine : « Zéro texte ni valeur orpheline ». Les 9 installations du domaine
 * (nom, gabarit, description, équipements clés, normes) sont lues par
 * `getCampusFacilities()` depuis `site_settings.key = 'campus_facilities'`
 * (`value.list`). Ce miroir était **vide** en base : l'application retombait donc
 * sur la constante `CAMPUS_FACILITIES` et le contenu n'était pas éditable.
 *
 * Ce script réaligne le miroir sur la source de vérité du dépôt
 * (`src/data/campus.ts`) : c'est le seul sens de synchronisation accepté
 * (dépôt → base), et il est idempotent.
 *
 * Usage :
 *   node scripts/seed_campus_facilities_settings.mjs --dry
 *   node scripts/seed_campus_facilities_settings.mjs
 * ==============================================================================
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';
import { CAMPUS_FACILITIES } from '../src/data/campus.ts';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
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

const value = { list: CAMPUS_FACILITIES };

if (!DRY) {
    const res = await fetch(`${URL_BASE}/rest/v1/site_settings?on_conflict=key`, {
        method: 'POST',
        headers: { ...HEADERS, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ key: 'campus_facilities', value }),
    });
    if (!res.ok) {
        console.error(`❌ Upsert site_settings → ${res.status} ${await res.text()}`);
        process.exit(1);
    }
}

const lines = [];
lines.push('# Revue — Miroir Supabase des installations du campus');
lines.push('');
lines.push(`Généré le ${new Date().toISOString()} par \`scripts/seed_campus_facilities_settings.mjs\`.`);
lines.push('');
lines.push(`Mode : **${DRY ? 'dry-run (aucune écriture)' : 'application en base'}**`);
lines.push('');
lines.push(`Clé : \`site_settings.key = 'campus_facilities'\` — \`value.list\` = ${CAMPUS_FACILITIES.length} installation(s).`);
lines.push('');
lines.push('| id | nom (FR) | gabarit | équipements |');
lines.push('|---|---|---|---|');
for (const facility of CAMPUS_FACILITIES) {
    lines.push(
        `| \`${facility.id}\` | ${facility.name} | ${facility.size} | ${(facility.features || []).length} |`
    );
}
lines.push('');
lines.push(
    'Les textes EN correspondants vivent dans `site_translations` (entité `campus_facility`) : voir `plans/revue-traductions-installations-en.md`.'
);
lines.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-miroir-installations-campus.md', lines.join('\n'), 'utf8');

console.log(`${DRY ? '[dry] ' : ''}site_settings.campus_facilities ← ${CAMPUS_FACILITIES.length} installation(s)`);
for (const facility of CAMPUS_FACILITIES) console.log(`  • ${facility.id} — ${facility.name}`);
console.log('');
console.log(`${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — revue : plans/revue-miroir-installations-campus.md`);
