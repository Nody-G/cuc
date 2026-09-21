#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Synchronisation Supabase : retrait des mentions « 6 ha »
 * ==============================================================================
 * Doctrine « zéro texte orphelin » : les miroirs DB (`site_*`) doivent refléter
 * exactement le nettoyage effectué dans `src/` par `purge_6ha_mentions.mjs`.
 *
 * Stratégie CONSERVATRICE :
 *   - Remplacements de phrases explicites (identiques au codemod src).
 *   - Repli générique : suppression de « 6 hectares / 6 Ha / 6 HECTARES » avec
 *     nettoyage des espaces résiduels, UNIQUEMENT dans les chaînes qui
 *     contiennent le motif.
 *   - Cas particuliers : hero de la page `visite-guidee` + `site_settings.campus_surface`.
 *   - Aucune écriture si la valeur est inchangée.
 *
 * Usage :
 *   node scripts/sync_6ha_removal_supabase.mjs --dry
 *   node scripts/sync_6ha_removal_supabase.mjs
 * ==============================================================================
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const DRY = process.argv.includes('--dry');

if (!URL_BASE || !SERVICE_KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant (.env.local).');
    process.exit(1);
}

const HEADERS = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
};

/** Remplacements de phrases contextuels (avant le repli générique). */
const PHRASES = [
    ['Sur notre domaine de 6 hectares ou sur le lieu de votre séminaire', 'Sur notre domaine ou sur le lieu de votre séminaire'],
    ['Immersion entreprise sur le domaine de 6 hectares du CUC', 'Immersion entreprise sur le domaine du CUC'],
    ['Hébergement et restauration sur site (domaine 6 Ha)', 'Hébergement et restauration sur site'],
    ['Le Domaine CUC de 6 hectares est situé', 'Le Domaine CUC est situé'],
    ['sur un domaine privé de 6 hectares au Cateau-Cambrésis', 'au Cateau-Cambrésis'],
    ["6 hectares d'installations de pointe.", 'des installations de pointe.'],
    ["6 hectares d'installations uniques", 'des installations uniques'],
    ["Découvrez les 6 hectares d'infrastructures", 'Découvrez les infrastructures'],
    ["sur 6 hectares d'infrastructures", 'sur nos infrastructures'],
    ["sur 6 hectares d'installations", 'sur nos installations'],
    ['11 000 m² (Domaine de 6 hectares)', '11 000 m²'],
    ['parc arboré de 6 hectares', 'parc arboré'],
    ['parc de 6 hectares', 'parc du campus'],
    ['domaine de 6 hectares du CUC', 'domaine du CUC'],
    ['domaine privé de 6 hectares', 'domaine privé'],
    ['domaine de 6 hectares', 'domaine'],
    ['campus de 6 hectares', 'campus'],
    ['Domaine arboré clos de 6 hectares', 'Domaine arboré clos'],
    ['CAMPUS PRINCIPAL (6 HECTARES)', 'CAMPUS PRINCIPAL'],
    ['DOMAINE DE 6 HECTARES • LE CATEAU-CAMBRÉSIS', 'DOMAINE PRIVÉ • LE CATEAU-CAMBRÉSIS'],
    ['INFRASTRUCTURES DE FORMATION • 6 HECTARES', 'INFRASTRUCTURES DE FORMATION'],
    ['IMMERSION 360° & PLAN 3D • 6 HECTARES', 'IMMERSION 360° & PLAN 3D'],
    ['6 HECTARES • LE CATEAU-CAMBRÉSIS', 'LE CATEAU-CAMBRÉSIS'],
    ['Domaine de 6 hectares', 'Domaine privé'],
    ['Visite Guidée des 6 Ha', 'Visite Guidée du Campus'],
    ['visite-guidee-6ha', 'visite-guidee-campus'],
    ['Découvrez les 6 hectares', 'Découvrez le campus'],
];

const GENERIC = /\s*6\s?(?:ha|hectares)\b/gi;

function sanitize(str) {
    let s = str;
    for (const [from, to] of PHRASES) s = s.split(from).join(to);
    s = s.replace(GENERIC, '');
    // Nettoyage des espaces résiduels créés par la coupe.
    s = s
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/\s+([,.;:!?•)\]])/g, '$1')
        .replace(/([([])\s+/g, '$1')
        .trim();
    return s;
}

/** Applique `sanitize` récursivement ; renvoie [valeur, modifié]. */
function mapValue(value) {
    if (typeof value === 'string') {
        const next = sanitize(value);
        return [next, next !== value];
    }
    if (Array.isArray(value)) {
        let changed = false;
        const next = value.map((v) => {
            const [n, c] = mapValue(v);
            changed = changed || c;
            return n;
        });
        return [next, changed];
    }
    if (value && typeof value === 'object') {
        let changed = false;
        const next = {};
        for (const k of Object.keys(value)) {
            const [n, c] = mapValue(value[k]);
            next[k] = n;
            changed = changed || c;
        }
        return [next, changed];
    }
    return [value, false];
}

const TABLES = [
    { table: 'site_pages', pk: 'slug' },
    { table: 'site_settings', pk: 'key' },
    { table: 'site_campus_pois', pk: 'id' },
    { table: 'site_navigation', pk: 'id' },
    { table: 'site_footer', pk: 'id' },
    { table: 'site_programs', pk: 'id' },
    { table: 'site_events', pk: 'id' },
    { table: 'site_partners', pk: 'id' },
];

const SKIP_KEYS = new Set(['created_at', 'updated_at']);

/** Cas particuliers : valeur forcée quelle que soit la donnée d'origine. */
function specialOverride(table, pkValue, row, patch) {
    if (table === 'site_pages' && pkValue === 'visite-guidee') {
        patch.hero = {
            ...(row.hero || {}),
            badge: 'INFRASTRUCTURES DE FORMATION',
            title: 'LE CAMPUS',
            subtitle:
                "Découvrez les infrastructures du CUC : tour de saut 21m, 1300 m² de hangars, dojos, hébergement et studio parisien.",
            cta_primary_text: 'Infrastructures',
            cta_primary_link: '#installations-detail',
            cta_secondary_text: 'Visite 360°',
            cta_secondary_link: '#visite-virtuelle-360',
        };
    }
    if (table === 'site_settings' && pkValue === 'campus_surface') {
        patch.value = '11 000 m²';
    }
}

async function rest(path, init) {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: HEADERS, ...init });
    const text = await res.text();
    if (!res.ok) throw new Error(`${init?.method || 'GET'} ${path} → ${res.status} ${text}`);
    return text ? JSON.parse(text) : null;
}

let totalChanged = 0;
let totalRows = 0;

for (const { table, pk } of TABLES) {
    let rows;
    try {
        rows = await rest(`${table}?select=*`);
    } catch (err) {
        console.warn(`⚠️  ${table} ignorée : ${err.message}`);
        continue;
    }
    if (!Array.isArray(rows)) continue;

    for (const row of rows) {
        const patch = {};
        for (const key of Object.keys(row)) {
            if (SKIP_KEYS.has(key) || key === pk) continue;
            const [next, changed] = mapValue(row[key]);
            if (changed) patch[key] = next;
        }
        specialOverride(table, row[pk], row, patch);

        const effective = Object.keys(patch).filter(
            (k) => JSON.stringify(patch[k]) !== JSON.stringify(row[k])
        );
        if (!effective.length) continue;

        const reduced = {};
        for (const k of effective) reduced[k] = patch[k];
        totalChanged += effective.length;
        totalRows += 1;

        const idEnc = encodeURIComponent(String(row[pk]));
        console.log(`${DRY ? '[dry] ' : ''}${table} (${pk}=${row[pk]}) → ${effective.join(', ')}`);
        if (!DRY) {
            await rest(`${table}?${pk}=eq.${idEnc}`, {
                method: 'PATCH',
                headers: { ...HEADERS, Prefer: 'return=minimal' },
                body: JSON.stringify(reduced),
            });
        }
    }
}

console.log(
    `\n${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — ${totalRows} ligne(s), ${totalChanged} champ(s) modifié(s).\n`
);
