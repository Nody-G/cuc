#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — PURGE DU VOCABULAIRE MARKETING DES CATÉGORIES DE FILMS
 * ==============================================================================
 * Doctrines appliquées :
 *  - « Zéro gadget UI creux » : plus de `Blockbuster`, `Cinéma International`,
 *    `Film Culte`, `Streaming Global`, `Série / Plateforme`,
 *    `Show & Événement`. Une seule distinction FACTUELLE subsiste :
 *    `Film` · `Série` · `Court métrage`.
 *  - « Un lien FAUX est pire qu'un lien » (décliné ici) : une catégorie fausse
 *    est pire qu'une catégorie absente. La classification n'est donc appliquée
 *    que sur PREUVE, jamais au jugé :
 *      1. `metadata.title_type` (typologie IMDb, 562 lignes) ;
 *      2. `allocine_url` (`fichefilm` → Film, `ficheserie` → Série) ;
 *      3. l'ancienne catégorie `Série / Plateforme` → `Série` (fait explicite).
 *    Toute ligne sans preuve conserve une catégorie VIDE (aucun badge affiché).
 *
 * Cibles : `site_films.category`, le miroir `site_settings.films`, et le fichier
 * source `src/data/filmography.ts`.
 *
 * Usage :
 *   node scripts/purge_marketing_film_categories.mjs          # simulation
 *   node scripts/purge_marketing_film_categories.mjs --apply  # écrit réellement
 * ==============================================================================
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');
const URL_BASE = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const JSON_HEADERS = { ...HEADERS, 'Content-Type': 'application/json' };

/** Seule distinction autorisée (cf. `src/lib/film-category.ts`). */
const FILM_CATEGORIES = ['Film', 'Série', 'Court métrage'];

/** Typologie IMDb (`metadata.title_type`) → catégorie factuelle. */
const TITLE_TYPE_MAP = {
    movie: 'Film',
    tvMovie: 'Film',
    video: 'Film',
    tvSeries: 'Série',
    tvMiniSeries: 'Série',
    tvSpecial: 'Série',
    short: 'Court métrage',
    tvShort: 'Court métrage',
};

/** Ancien vocabulaire → catégorie factuelle (repli ultime, fait explicite). */
const LEGACY_MAP = {
    Blockbuster: 'Film',
    'Blockbuster US': 'Film',
    'Cinéma Français': 'Film',
    'Cinéma International': 'Film',
    'Film Culte': 'Film',
    'Streaming Global': 'Film',
    'Show & Événement': 'Film',
    Cinéma: 'Film',
    'Série / Plateforme': 'Série',
};

const FORBIDDEN_WORDS = [
    'Blockbuster',
    'Cinéma International',
    'Film Culte',
    'Streaming Global',
    'Série / Plateforme',
    'Show & Événement',
];

/** Détection insensible à la casse (badges : `BLOCKBUSTER`, `Blockbuster`…). */
const FORBIDDEN_RE = new RegExp(
    FORBIDDEN_WORDS.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
    'i'
);

const seenTypes = new Map();
const unknownTypes = new Set();

function bump(map, key) {
    map.set(key, (map.get(key) || 0) + 1);
}

async function rest(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

async function patch(pathname, body) {
    if (!APPLY) return 'simulé';
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, {
        method: 'PATCH',
        headers: JSON_HEADERS,
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`PATCH ${pathname} → ${res.status} ${await res.text()}`);
    return 'écrit';
}

function classifyFromAllocine(url) {
    if (typeof url !== 'string' || !url) return null;
    if (/ficheserie_gen_cserie/i.test(url) || /\/series\//i.test(url)) return 'Série';
    if (/fichefilm_gen_cfilm/i.test(url)) return 'Film';
    return null;
}

function classify({ titleType, allocineUrl, category }) {
    const t = typeof titleType === 'string' ? titleType.trim() : '';
    if (t) {
        bump(seenTypes, t);
        if (TITLE_TYPE_MAP[t]) return { value: TITLE_TYPE_MAP[t], proof: `imdb:${t}` };
        unknownTypes.add(t);
    }
    const fromAllocine = classifyFromAllocine(allocineUrl);
    if (fromAllocine) return { value: fromAllocine, proof: 'allocine' };
    if (category && LEGACY_MAP[category]) {
        return { value: LEGACY_MAP[category], proof: 'legacy' };
    }
    return { value: null, proof: 'aucune' };
}

// ---------------------------------------------------------------------------
// 1. site_films
// ---------------------------------------------------------------------------
const films = await rest(
    'site_films?select=id,title,year,category,tag,is_published,allocine_url,metadata&order=title.asc'
);
if (!films) {
    console.error('site_films introuvable');
    process.exit(1);
}

const filmUpdates = [];
/** Badges (`tag`) portant encore le vocabulaire marketing : vidés, pas remplacés. */
const tagUpdates = [];
const mirrorTagCleared = [];
const proofCounts = new Map();
/** Index titre normalisé → catégorie, réutilisé pour les miroirs et le source. */
const byTitle = new Map();
let emptyCategoryCount = 0;

for (const f of films) {
    if (!f.category) emptyCategoryCount += 1;
    if (typeof f.tag === 'string' && FORBIDDEN_RE.test(f.tag)) {
        tagUpdates.push({ id: f.id, title: f.title, tag: f.tag });
    }
    const { value, proof } = classify({
        titleType: f.metadata?.title_type,
        allocineUrl: f.allocine_url,
        category: f.category,
    });
    bump(proofCounts, proof);
    const key = `${String(f.title || '').toLowerCase().trim()}|${String(f.year || '').trim()}`;
    if (value && !byTitle.has(key)) byTitle.set(key, value);
    if (!value) continue;
    if (value === f.category) continue;
    filmUpdates.push({ id: f.id, title: f.title, from: f.category || '(vide)', to: value, proof });
}

// ---------------------------------------------------------------------------
// 2. Miroir site_settings.films
// ---------------------------------------------------------------------------
// `site_settings` est une table clé/valeur : sa clé primaire est `key`.
// On charge TOUTES les clés : le miroir des films est mis à jour, et
// l'ensemble sert aussi au balayage de la copie éditoriale.
const settingsRows = await rest('site_settings?select=key,value');
const MIRROR_KEYS = new Set(['films', 'filmography_credits']);
const mirrorReports = [];

for (const row of settingsRows || []) {
    if (!MIRROR_KEYS.has(row.key)) continue;
    const value = row.value;
    const list = Array.isArray(value) ? value : Array.isArray(value?.list) ? value.list : null;
    if (!list) {
        mirrorReports.push({ key: row.key, updated: 0, note: 'structure inattendue, ignorée' });
        continue;
    }
    let updated = 0;
    const next = list.map((item) => {
        // Preuve hiérarchisée : le catalogue (typologie IMDb) d'abord, puis
        // l'URL Allociné de l'entrée, puis l'ancienne catégorie.
        const dbMatch = byTitle.get(
            `${String(item.title || '').toLowerCase().trim()}|${String(item.year || '').trim()}`
        );
        const { value: target } = classify({
            allocineUrl: item.allocineUrl || item.allocine_url,
            category: item.category,
        });
        const resolved = dbMatch || target;
        const cleaned = { ...item };
        let touched = false;

        if (resolved && resolved !== item.category) {
            cleaned.category = resolved;
            touched = true;
        }
        // Badge marketing : vidé plutôt que remplacé (aucune invention de tag).
        if (typeof item.tag === 'string' && FORBIDDEN_RE.test(item.tag)) {
            mirrorTagCleared.push({ key: row.key, title: item.title, tag: item.tag });
            cleaned.tag = '';
            touched = true;
        }
        if (touched) {
            updated += 1;
            return cleaned;
        }
        return item;
    });
    mirrorReports.push({ key: row.key, updated, total: list.length });
    if (APPLY && updated > 0) {
        await patch(`site_settings?key=eq.${encodeURIComponent(row.key)}`, { value: next });
    }
}

// ---------------------------------------------------------------------------
// 2 bis. Miroir site_settings.celebrities : suppression de `roleType`
// ---------------------------------------------------------------------------
// La segmentation « Cinéma Français / International » disparaît de
// l'interface (filtres retirés) ET des données : c'était une étiquette
// marketing sans preuve éditoriale, consommée par aucune vue après la purge.
const celebritiesRow = (settingsRows || []).find((row) => row.key === 'celebrities');
let roleTypeRemoved = 0;

if (celebritiesRow && Array.isArray(celebritiesRow.value?.list)) {
    const list = celebritiesRow.value.list.map((item) => {
        if (!item || typeof item !== 'object') return item;
        const { roleType: _roleType, highlightTag: _highlightTag, ...rest } = item;
        if ('roleType' in item || 'highlightTag' in item) roleTypeRemoved += 1;
        return rest;
    });
    if (APPLY && roleTypeRemoved > 0) {
        await patch('site_settings?key=eq.celebrities', {
            value: { ...celebritiesRow.value, list },
        });
    }
}

// ---------------------------------------------------------------------------
// 3. Copie éditoriale en base (site_pages + site_settings)
// ---------------------------------------------------------------------------
const pageRows = await rest('site_pages?select=*');
const copyHits = [];

/** Chemins exacts des chaînes contenant le mot interdit (pour un correctif ciblé). */
function findPathsWithWord(node, word, prefix = '') {
    const hits = [];
    const walk = (n, p) => {
        if (typeof n === 'string') {
            if (n.includes(word)) hits.push(p);
            return;
        }
        if (Array.isArray(n)) {
            n.forEach((v, i) => walk(v, `${p}[${i}]`));
            return;
        }
        if (n && typeof n === 'object') {
            for (const [k, v] of Object.entries(n)) walk(v, p ? `${p}.${k}` : k);
        }
    };
    walk(node, prefix);
    return hits;
}

for (const page of pageRows || []) {
    const slice = {
        layout_sections: page.layout_sections,
        sections_data: page.sections_data,
        hero: page.hero,
    };
    for (const word of FORBIDDEN_WORDS) {
        for (const path of findPathsWithWord(slice, word)) {
            copyHits.push({ table: 'site_pages', slug: page.slug, locale: page.locale, word, path });
        }
    }
}

for (const row of settingsRows || []) {
    for (const word of FORBIDDEN_WORDS) {
        for (const path of findPathsWithWord(row.value, word)) {
            copyHits.push({ table: 'site_settings', key: row.key, word, path });
        }
    }
}

// ---------------------------------------------------------------------------
// 3 bis. Correctifs ciblés de copie éditoriale (agencements de page)
// ---------------------------------------------------------------------------
// Vestige marketing dans les noms de section des agencements : renommé
// sobrement, sans toucher au reste de la copie éditoriale.
const SECTION_NAME_FIXES = {
    'Affiches & Blockbusters Cinéma': 'Affiches de films',
};
const sectionFixes = [];

for (const page of pageRows || []) {
    const sections = Array.isArray(page.layout_sections) ? page.layout_sections : [];
    let touched = false;
    const next = sections.map((section) => {
        const replacement = SECTION_NAME_FIXES[section?.name];
        if (!replacement) return section;
        touched = true;
        sectionFixes.push({ slug: page.slug, from: section.name, to: replacement });
        return { ...section, name: replacement };
    });
    if (touched && APPLY) {
        await patch(`site_pages?slug=eq.${encodeURIComponent(page.slug)}`, {
            layout_sections: next,
        });
    }
}

// ---------------------------------------------------------------------------
// 4. Source locale : src/data/filmography.ts
// ---------------------------------------------------------------------------
const FILMOGRAPHY = 'src/data/filmography.ts';
const sourceText = readFileSync(FILMOGRAPHY, 'utf8');
const sourceUpdates = [];

// Le dernier élément du tableau n'a pas de virgule finale : `\},?` est requis,
// sinon la toute dernière entrée échappe silencieusement à la conversion.
const nextSource = sourceText.replace(
    /(\{\s*\n\s*"id":\s*"([^"]+)",\s*\n\s*"title":\s*"((?:[^"\\]|\\.)*)",\s*\n\s*"year":\s*"([^"]*)",\s*\n\s*"category":\s*"([^"]*)",)([\s\S]*?)(\n  \},?)/g,
    (match, head, id, title, year, category, body, tail) => {
        const allocine = (body.match(/"allocineUrl":\s*"([^"]*)"/) || [])[1] || '';
        const { value: target } = classify({ allocineUrl: allocine, category });
        const dbMatch = byTitle.get(`${title.toLowerCase().trim()}|${year.trim()}`);
        const resolved = dbMatch || target;
        const proof = dbMatch ? 'catalogue' : 'allocine/legacy';
        if (!resolved || resolved === category) return match;
        sourceUpdates.push({ id, title, year, from: category, to: target, proof });
        return `${head.replace(`"category": "${category}"`, `"category": "${target}"`)}${body}${tail}`;
    }
);

// ---------------------------------------------------------------------------
// Rapport
// ---------------------------------------------------------------------------
const report = {
    applied: APPLY,
    generatedAt: new Date().toISOString(),
    totalFilms: films.length,
    emptyCategoryBefore: emptyCategoryCount,
    proofDistribution: [...proofCounts.entries()].sort((a, b) => b[1] - a[1]),
    imdbTitleTypesSeen: [...seenTypes.entries()].sort((a, b) => b[1] - a[1]),
    unknownTitleTypes: [...unknownTypes],
    filmUpdates: filmUpdates.length,
    filmUpdateSamples: filmUpdates.slice(0, 200),
    mirrorReports,
    roleTypeRemoved,
    tagUpdates: tagUpdates.length,
    tagUpdateSamples: tagUpdates.slice(0, 60),
    mirrorTagCleared,
    sectionFixes,
    copyHits,
    sourceUpdates: sourceUpdates.length,
    sourceUpdateSamples: sourceUpdates.slice(0, 80),
    allowedVocabulary: FILM_CATEGORIES,
};

mkdirSync('plans', { recursive: true });
writeFileSync('plans/rapport-purge-categories-films.json', JSON.stringify(report, null, 2));

console.log(`=== Mode : ${APPLY ? 'APPLICATION' : 'simulation (--apply pour écrire)'} ===`);
console.log(`Lignes site_films : ${films.length}`);
console.log(`Catégorie vide AVANT : ${emptyCategoryCount}`);
console.log('\nTypologie IMDb rencontrée :');
for (const [k, v] of [...seenTypes.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(v).padStart(4)}  ${k} → ${TITLE_TYPE_MAP[k] || '⚠ NON MAPÉ'}`);
}
if (unknownTypes.size) console.log(`Types IMDb non mappés : ${[...unknownTypes].join(', ')}`);
console.log('\nPreuves de classification :');
for (const [k, v] of [...proofCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(v).padStart(4)}  ${k}`);
}
console.log(`\nMises à jour site_films : ${filmUpdates.length}`);
for (const u of filmUpdates.slice(0, 15)) {
    console.log(`  ${u.title} : ${u.from} → ${u.to} (${u.proof})`);
}
console.log('\nMiroirs site_settings :');
for (const m of mirrorReports) console.log(`  ${m.key} : ${m.updated} mis à jour ${m.note || ''}`);
console.log(`Étiquettes marketing retirées du miroir celebrities : ${roleTypeRemoved}`);
console.log(`Badges marketing vidés (site_films.tag) : ${tagUpdates.length}`);
for (const t of tagUpdates.slice(0, 20)) console.log(`  ${t.title} → « ${t.tag} »`);
console.log(`Badges marketing vidés (miroir films) : ${mirrorTagCleared.length}`);
for (const t of mirrorTagCleared.slice(0, 20)) console.log(`  ${t.title} → « ${t.tag} »`);
console.log(`Noms de section corrigés : ${sectionFixes.length}`);
for (const f of sectionFixes) console.log(`  ${f.slug} : « ${f.from} » → « ${f.to} »`);
console.log(`\nCopies éditoriales contenant encore le vocabulaire interdit : ${copyHits.length}`);
for (const h of copyHits.slice(0, 60)) {
    console.log(`  [${h.table}] ${h.slug || h.key} → « ${h.word} » @ ${h.path}`);
}
console.log(`\nMises à jour src/data/filmography.ts : ${sourceUpdates.length}`);
for (const u of sourceUpdates.slice(0, 10)) {
    console.log(`  ${u.title} : ${u.from} → ${u.to} (${u.proof})`);
}

if (APPLY) {
    for (const u of filmUpdates) {
        await patch(`site_films?id=eq.${encodeURIComponent(u.id)}`, { category: u.to });
    }
    for (const u of tagUpdates) {
        await patch(`site_films?id=eq.${encodeURIComponent(u.id)}`, { tag: '' });
    }
    if (nextSource !== sourceText) {
        writeFileSync(FILMOGRAPHY, nextSource);
        console.log(`\n${FILMOGRAPHY} réécrit.`);
    }
    console.log(`\nsite_films : ${filmUpdates.length} ligne(s) mise(s) à jour.`);
} else {
    console.log('\nAucune écriture. Relancer avec --apply.');
}
