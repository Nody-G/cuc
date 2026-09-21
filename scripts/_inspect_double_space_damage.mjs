#!/usr/bin/env node
/**
 * ==============================================================================
 * CONTRÔLE D'INCIDENT — la réparation des doubles espaces a-t-elle abîmé le texte ?
 * ==============================================================================
 * Le motif utilisé pour la réparation était `/\S {2,}\S/g` (caractère + espaces +
 * caractère) : avec `.replace(motif, ' ')` il **consomme les deux caractères de
 * bord** en plus de la suite d'espaces. Vérification immédiate sur les 7 fiches
 * concernées, et recherche des textes d'origine dans le cache IMDb.
 *
 * Aucune écriture. Usage : node scripts/_inspect_double_space_damage.mjs
 * ==============================================================================
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

/** Fiches réparées + fragment distinctif pour retrouver l'original. */
const FICHES = [
    { id: 'furies', needle: 'death of her family' },
    { id: 'gloria', needle: 'needs an orgasm' },
    { id: 'le-jardinier', needle: 'Matignon List' },
    { id: 'les-blagues-de-toto', needle: 'prove his innocence' },
    { id: 'les-envoutes', needle: 'resists but falls in love' },
    { id: 'un-triomphe', needle: 'theater workshop in a prison' },
    { id: 'zorro', needle: "town's hotels" },
];

/** Parcourt récursivement toutes les chaînes d'une valeur JSON. */
function collectStrings(value, out = []) {
    if (typeof value === 'string') out.push(value);
    else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
    else if (value && typeof value === 'object') {
        Object.values(value).forEach((item) => collectStrings(item, out));
    }
    return out;
}

const url = `${URL_BASE}/rest/v1/site_translations?select=entity_id,payload&locale=eq.en&entity=eq.film&entity_id=in.(${FICHES.map((f) => f.id).join(',')})`;
const res = await fetch(url, { headers: HEADERS });
const rows = await res.json();

console.log('=== TEXTE ACTUEL EN BASE ===');
const byId = new Map(rows.map((row) => [row.entity_id, row]));
for (const fiche of FICHES) {
    const row = byId.get(fiche.id);
    console.log('');
    console.log(`--- ${fiche.id} ---`);
    if (!row) {
        console.log('  (introuvable)');
        continue;
    }
    for (const text of collectStrings(row.payload)) console.log(`  ${text}`);
}

console.log('');
console.log('=== CACHE IMDB (texte d’origine) ===');
const cacheDir = join('.cache', 'imdb');
if (!existsSync(cacheDir)) {
    console.log(`  cache absent : ${cacheDir}`);
} else {
    const files = readdirSync(cacheDir);
    console.log(`  ${files.length} fichier(s) dans ${cacheDir}`);
    for (const fiche of FICHES) {
        const hits = [];
        for (const file of files) {
            let raw;
            try {
                raw = readFileSync(join(cacheDir, file), 'utf8');
            } catch {
                continue;
            }
            if (!raw.includes(fiche.needle)) continue;
            let parsed;
            try {
                parsed = JSON.parse(raw);
            } catch {
                continue;
            }
            for (const text of collectStrings(parsed)) {
                if (text.includes(fiche.needle)) hits.push({ file, text });
            }
        }
        console.log('');
        console.log(`--- ${fiche.id} — ${hits.length} correspondance(s) ---`);
        for (const hit of hits.slice(0, 3)) {
            console.log(`  [${hit.file}] ${hit.text.slice(0, 200)}`);
        }
    }
}
console.log('');
