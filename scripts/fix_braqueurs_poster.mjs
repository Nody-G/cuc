#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Correctif d'identité : affiche « Braqueurs » et fiche en doublon
 * ==============================================================================
 * Revue préalable obligatoire : `plans/revue-affiche-braqueurs.md`.
 *
 * Ce que corrige ce script :
 *   1. remplace le fichier Storage `media/film-poster/braqueurs.jpg` (9 Ko,
 *      illisible) par la jaquette officielle vérifiée à l'œil (haute qualité) ;
 *   2. rattache cette affiche à la fiche canonique `braqueurs-la-serie`
 *      (IMDb `tt13278100` = la vraie série Netflix) et lui transfère les champs
 *      éditoriaux de la fiche dupliquée ;
 *   3. retire de la publication le doublon `braqueurs`, dont l'`imdb_url`
 *      (`tt13300584`) ne correspond à aucune œuvre et dont l'affiche était une
 *      photo de Ricki Lake. Rien n'est supprimé (traçabilité).
 *
 * Usage :
 *   node scripts/fix_braqueurs_poster.mjs --dry
 *   node scripts/fix_braqueurs_poster.mjs
 * ==============================================================================
 */
import { createHash } from 'node:crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const DRY = process.argv.includes('--dry');

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const BUCKET = 'cuc-vitrine-assets';
const STORAGE_PATH = 'media/film-poster/braqueurs.jpg';

/**
 * Les objets Supabase Storage sont servis avec `max-age=31536000` : après un
 * remplacement de fichier, le CDN continue de servir l'ANCIENNE version sous
 * l'URL nue (constaté : 9 Ko obsolètes contre 311 Ko réels). On versionne donc
 * l'URL publique — c'est le seul moyen fiable de publier un visuel remplacé.
 */
const POSTER_VERSION = '20260921';
const PUBLIC_URL = `${URL_BASE}/storage/v1/object/public/${BUCKET}/${STORAGE_PATH}`;
const PUBLIC_URL_VERSIONED = `${PUBLIC_URL}?v=${POSTER_VERSION}`;

/** Source de l'affiche officielle, déjà présente en base et vérifiée visuellement. */
const SOURCE_POSTER =
    'https://m.media-amazon.com/images/M/MV5BYWJkOWM3NDQtYmQ0Mi00MzliLTg4YzctNDk2ZjY4NDQwYTRmXkEyXkFqcGc@._V1_.jpg';

const CANONICAL_ID = 'braqueurs-la-serie';
const DUPLICATE_ID = 'braqueurs';

const CANONICAL_PATCH = {
    image: PUBLIC_URL_VERSIONED,
    category: 'Série / Plateforme',
    director: 'Julien Leclercq',
    tag: 'NETFLIX',
    allocine_url: 'https://www.allocine.fr/series/ficheserie_gen_cserie=27473.html',
    trailer_url: 'https://www.youtube.com/watch?v=3-M9o1N2d5E',
    is_published: true,
};

const DUPLICATE_PATCH = {
    // Retirée de la grille publique SANS suppression : la ligne reste auditable.
    is_published: false,
    // Identité corrigée pour ne plus propager un identifiant inexistant.
    imdb_url: 'https://www.imdb.com/title/tt13278100/',
};

async function rest(pathname, init = {}) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, {
        ...init,
        headers: { ...HEADERS, 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${body}`);
    return body ? JSON.parse(body) : null;
}

/* --- 1. Récupération et vérification de l'affiche source ------------------- */
console.log('1) Affiche officielle source');
const srcRes = await fetch(SOURCE_POSTER);
if (!srcRes.ok) {
    console.error(`❌ Source injoignable (HTTP ${srcRes.status}).`);
    process.exit(2);
}
const bytes = Buffer.from(await srcRes.arrayBuffer());
const sourceHash = createHash('sha256').update(bytes).digest('hex');
console.log(
    `   ${Math.round(bytes.length / 1024)} Ko — sha256 ${sourceHash.slice(0, 16)} (${srcRes.headers.get('content-type')})`
);

/* --- 2. Remplacement du fichier Storage ----------------------------------- */
console.log(`2) Storage → ${BUCKET}/${STORAGE_PATH}`);
if (DRY) {
    console.log('   [dry] envoi ignoré');
} else {
    const up = await fetch(`${URL_BASE}/storage/v1/object/${BUCKET}/${STORAGE_PATH}`, {
        method: 'POST',
        headers: {
            ...HEADERS,
            'Content-Type': 'image/jpeg',
            'x-upsert': 'true',
            'cache-control': 'max-age=31536000',
        },
        body: bytes,
    });
    if (!up.ok) {
        console.error(`❌ Upload → ${up.status} ${await up.text()}`);
        process.exit(2);
    }
    console.log('   envoyé');
}

/* --- 3. Fiches en base ---------------------------------------------------- */
console.log('3) site_films');
if (DRY) {
    console.log(`   [dry] ${CANONICAL_ID} ← ${JSON.stringify(CANONICAL_PATCH)}`);
    console.log(`   [dry] ${DUPLICATE_ID} ← ${JSON.stringify(DUPLICATE_PATCH)}`);
} else {
    await rest(`site_films?id=eq.${CANONICAL_ID}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(CANONICAL_PATCH),
    });
    console.log(`   ${CANONICAL_ID} mis à jour (affiche + champs éditoriaux)`);

    await rest(`site_films?id=eq.${DUPLICATE_ID}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(DUPLICATE_PATCH),
    });
    console.log(`   ${DUPLICATE_ID} retiré de la publication (doublon, conservé)`);
}

/* --- 4. Contrôle final ---------------------------------------------------- */
console.log('4) Contrôle');
if (DRY) {
    // En simulation, l'envoi n'a pas eu lieu : le contrôle serait un faux négatif.
    console.log('   [dry] contrôle du fichier publié ignoré');
}
const check = DRY ? null : await fetch(PUBLIC_URL_VERSIONED, { cache: 'no-store' });
if (check && !check.ok) {
    console.error(`❌ Affiche publiée injoignable (HTTP ${check.status}).`);
    process.exitCode = 2;
} else if (check) {
    const served = Buffer.from(await check.arrayBuffer());
    const servedHash = createHash('sha256').update(served).digest('hex');
    const same = servedHash === sourceHash;
    console.log(
        `   ${PUBLIC_URL_VERSIONED}\n   ${Math.round(served.length / 1024)} Ko — identique à la source : ${same ? 'OUI' : 'NON'}`
    );
    if (!same) process.exitCode = 2;
}

const rows = await rest(
    `site_films?select=id,title,imdb_url,is_published,image,category&id=in.(${CANONICAL_ID},${DUPLICATE_ID})`
);
console.log('\nÉtat des fiches :');
for (const r of rows || []) {
    console.log(`   ${r.id} | « ${r.title} » | publié=${r.is_published} | cat=${r.category}`);
    console.log(`      imdb  : ${r.imdb_url}`);
    console.log(`      image : ${r.image}`);
}
console.log('');
