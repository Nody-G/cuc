#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Vérification du MIROIR : aucun texte anglais ne doit fuir côté FRANÇAIS
 * ==============================================================================
 * La campagne i18n a mesuré « les pages anglaises sont-elles en anglais ? »
 * (crawler : 0 français résiduel sur 27 routes EN). Le contrôle INVERSE n'avait
 * jamais été fait, alors qu'il protège l'audience **principale** du campus :
 * « les pages françaises restent-elles en français ? »
 *
 * RISQUE VISÉ : les 579 overlays EN vivent dans `site_translations`, à côté du
 * contenu source français. Une résolution qui ignorerait la locale afficherait
 * la traduction anglaise sur le site français — un défaut très visible et
 * exactement l'inverse du problème d'origine.
 *
 * MÉTHODE (sans aucune écriture) :
 *   1. extraire du contenu STRICTEMENT anglais : chaînes ≥ 40 caractères des
 *      overlays EN qui **n'existent pas** dans la ligne française correspondante
 *      (sinon on comparerait « Waiting for Godot » ou un titre de film) ;
 *   2. télécharger les pages FRANÇAISES ;
 *   3. chercher ces chaînes dans le HTML rendu.
 * Un résultat en base ne suffit pas : c'est le HTML RÉEL qui compte.
 *
 * LIMITE DOCUMENTÉE : seuls les overlays rendus côté serveur sont couverts. Les
 * textes affichés uniquement dans une modale cliente (synopsis de film) ne
 * figurent pas dans le HTML initial et ne peuvent donc pas être vérifiés ici.
 *
 * Usage : node scripts/verify_overlay_locale_leak.mjs [baseUrl]
 *   baseUrl par défaut : http://localhost:3000
 * Sort en code 2 si une fuite est détectée (régression bloquante).
 * ==============================================================================
 */
import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BASE = process.argv[2] || 'http://localhost:3000';
const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

/** Longueur minimale d'un extrait jugé distinctif. */
const MIN_LEN = 40;

/** Pages françaises à inspecter (mêmes routes que la sonde publique). */
const ROUTES_FR = [
    '/',
    '/formation-de-cascadeur',
    '/stages-cascades-parkour-2',
    '/equipe-cascadeurs-pro',
    '/cuc-team-cascadeur',
    '/partenaires',
    '/visite-guidee',
    '/visite-virtuelle',
    '/videos-cascadeur',
    '/contact-cuc',
    '/team-building-cascades',
    '/animations-airbag-parkour',
    '/spectacles-cascadeurs-yamakasi',
    '/stunt-workshop-cuc',
    '/cuc-events-agence',
];

/**
 * Normalisation de comparaison : accents retirés, minuscules, tout ce qui n'est
 * pas alphanumérique remplacé par un espace, espaces compactés. Rend la
 * comparaison insensible à la typographie.
 */
function normalize(value) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

/** Décode les échappements `\uXXXX` présents dans les charges RSC du HTML. */
function decodeUnicodeEscapes(html) {
    return html.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/** Collecte récursivement toutes les chaînes d'une valeur JSON. */
function collectStrings(value, out = []) {
    if (typeof value === 'string') out.push(value);
    else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
    else if (value && typeof value === 'object') {
        Object.values(value).forEach((item) => collectStrings(item, out));
    }
    return out;
}

async function rows(path) {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: HEADERS });
    if (!res.ok) {
        console.error(`❌ ${path} → HTTP ${res.status}`);
        process.exit(1);
    }
    return res.json();
}

/**
 * Textes français de référence, par entité puis par identifiant : sert à écarter
 * les chaînes identiques dans les deux langues (noms propres, titres, et pages
 * volontairement bilingues).
 *
 * ⚠️  `select=*` ET PAS UN SOUS-ENSEMBLE DE COLONNES : la première version ne
 * lisait que `sections_data` et a produit un faux positif sur
 * `/stunt-workshop-cuc`, dont le `meta_title` et les sections sont en anglais
 * **dans la ligne française** (atelier international assumé bilingue).
 */
const FR_SOURCES = [
    { entity: 'film', path: 'site_films?select=*' },
    { entity: 'team', path: 'site_team?select=*' },
    { entity: 'partner', path: 'site_partners?select=*' },
    { entity: 'event', path: 'site_events?select=*' },
    { entity: 'program', path: 'site_programs?select=*' },
    { entity: 'discipline', path: 'site_disciplines?select=*' },
    { entity: 'page', path: 'site_pages?select=*' },
];

const frIndex = new Map();
for (const source of FR_SOURCES) {
    const list = await rows(source.path);
    const byId = new Map();
    for (const row of list) {
        byId.set(String(row.id ?? row.slug), normalize(collectStrings(row).join(' ')));
    }
    frIndex.set(source.entity, byId);
}

/**
 * Deuxième réservoir de français : les CATALOGUES. Une grande partie des pages
 * est alimentée par `messages/fr.json` et non par la base — ne comparer qu'à la
 * base ferait passer du texte français légitime pour une fuite.
 */
const frCatalogPool = normalize(
    collectStrings(JSON.parse(readFileSync('messages/fr.json', 'utf8'))).join(' ')
);

const overlays = await rows('site_translations?select=entity,entity_id,payload&locale=eq.en');

/** Candidats strictement anglais, avec la fiche d'origine pour le diagnostic. */
const candidates = [];
for (const overlay of overlays) {
    const frText = frIndex.get(overlay.entity)?.get(String(overlay.entity_id)) ?? '';
    for (const text of collectStrings(overlay.payload)) {
        if (text.length < MIN_LEN) continue;
        const normalized = normalize(text);
        if (!normalized) continue;
        // Déjà présent dans la source française (base) : nom propre, titre, ou
        // page bilingue assumée — ce n'est pas une fuite.
        if (frText.includes(normalized)) continue;
        // Idem côté catalogues.
        if (frCatalogPool.includes(normalized)) continue;
        candidates.push({
            entity: overlay.entity,
            entityId: overlay.entity_id,
            normalized,
            sample: text.slice(0, 90),
        });
    }
}

console.log(`Overlays EN            : ${overlays.length}`);
console.log(`Extraits anglais nets   : ${candidates.length} (≥ ${MIN_LEN} caractères, absents du français)`);
console.log('');

const leaks = [];
let checked = 0;

for (const route of ROUTES_FR) {
    let html;
    try {
        const res = await fetch(`${BASE}${route}`, { headers: { 'Accept-Language': 'fr' } });
        if (!res.ok) {
            console.error(`  ⚠️  ${route} → HTTP ${res.status} (page ignorée)`);
            continue;
        }
        html = await res.text();
    } catch (error) {
        console.error(`  ⚠️  ${route} → ${error.message} (page ignorée)`);
        continue;
    }

    checked += 1;
    const haystack = normalize(decodeUnicodeEscapes(html));
    const hits = candidates.filter((candidate) => haystack.includes(candidate.normalized));

    for (const hit of hits) {
        leaks.push({ route, ...hit });
    }

    console.log(
        `${route.padEnd(32)} ${hits.length ? `FUITE : ${hits.length}` : 'aucun texte anglais'}`
    );
}

console.log('');
if (leaks.length) {
    console.log(`❌ ${leaks.length} fuite(s) d'anglais sur ${checked} page(s) française(s) :`);
    for (const leak of leaks.slice(0, 20)) {
        console.log(`   [${leak.route}] ${leak.entity}/${leak.entityId} → ${leak.sample}`);
    }
    console.log('');
    process.exit(2);
}

console.log(`✅ Aucune fuite d'anglais sur ${checked} page(s) française(s) — miroir vérifié.`);
console.log('');
