#!/usr/bin/env node
/**
 * ==============================================================================
 * SONDE (jetable) — Le titre « International Stunt Workshop » fuit-il vraiment ?
 * ==============================================================================
 * La vérification du miroir a signalé une correspondance anglaise sur la page
 * française `/stunt-workshop-cuc`. Avant de conclure, il faut savoir :
 *   1. ce que contient la ligne FRANÇAISE de `site_pages` (toutes colonnes) ;
 *   2. ce que contient le payload de l'overlay anglais ;
 *   3. où la chaîne apparaît réellement dans le HTML français (`<title>` ? corps ?).
 *
 * Aucune écriture. Usage : node scripts/_probe_stunt_workshop_title.mjs
 * ==============================================================================
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const NEEDLE = 'International Stunt Workshop';
const SLUG = 'stunt-workshop-cuc';

function collectStrings(value, out = []) {
    if (typeof value === 'string') out.push(value);
    else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
    else if (value && typeof value === 'object') {
        Object.values(value).forEach((item) => collectStrings(item, out));
    }
    return out;
}

async function first(path) {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: HEADERS });
    if (!res.ok) {
        console.error(`❌ ${path} → HTTP ${res.status}`);
        process.exit(1);
    }
    const list = await res.json();
    return list[0] ?? null;
}

console.log('=== Ligne FRANÇAISE (site_pages) ===');
const page = await first(`site_pages?slug=eq.${SLUG}&select=*`);
if (!page) {
    console.log('  (introuvable)');
} else {
    for (const [column, value] of Object.entries(page)) {
        const strings = collectStrings(value);
        const hit = strings.find((text) => text.includes(NEEDLE));
        const summary =
            typeof value === 'string'
                ? `« ${value.slice(0, 80)} »`
                : strings.length
                    ? `${strings.length} chaîne(s)`
                    : String(value);
        console.log(`  ${column.padEnd(18)} ${hit ? 'CONTINENT le titre' : '—'}  ${summary}`);
    }
}

console.log('');
console.log('=== Overlay ANGLAIS (site_translations) ===');
const overlay = await first(
    `site_translations?entity=eq.page&entity_id=eq.${SLUG}&locale=eq.en&select=payload`
);
if (!overlay) {
    console.log('  (aucun overlay)');
} else {
    for (const text of collectStrings(overlay.payload)) {
        console.log(`  ${text.includes(NEEDLE) ? '→' : ' '} ${text.slice(0, 110)}`);
    }
}

console.log('');
console.log('=== HTML FRANÇAIS rendu ===');
const res = await fetch('http://localhost:3000/stunt-workshop-cuc');
const html = await res.text();
const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
console.log(`  <title> : ${titleMatch ? titleMatch[1] : '(absent)'}`);

// Occurrences de la chaîne hors balise <title> : signale une fuite visible.
const withoutTitle = html.replace(/<title[^>]*>[^<]*<\/title>/gi, '');
const visibleHit = withoutTitle.includes(NEEDLE);
console.log(`  occurrence hors <title> dans le HTML : ${visibleHit ? 'OUI (fuite visible)' : 'non'}`);

// Contexte des occurrences de la chaîne complète.
const full = 'International Stunt Workshop | Campus Univers Cascades';
const occurrences = html.split(full).length - 1;
console.log(`  occurrences de la chaîne complète : ${occurrences}`);
const contexts = [...html.matchAll(/International Stunt Workshop/g)].slice(0, 4);
for (const context of contexts) {
    const at = context.index ?? 0;
    console.log(`    …${html.slice(Math.max(0, at - 60), at + 60).replace(/\s+/g, ' ')}…`);
}
console.log('');
