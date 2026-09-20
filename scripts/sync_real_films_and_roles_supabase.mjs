/**
 * Synchronisation Supabase — Films réels + rôles canoniques (3 libellés)
 * ----------------------------------------------------------------------
 * Source de vérité :
 *   - scripts/films_real_data.json          (562 films : vraie description IMDb + vraie jaquette)
 *   - scripts/coach_credits_curated_imdb.json (877 crédits, rôles canoniques)
 *
 * Doctrine :
 *   - Zéro invention : on n'écrit que des données IMDb vérifiées.
 *   - 3 libellés SEULEMENT : Cascadeur / Doublure / Coordinateur des cascades.
 *   - Les lignes site_films existantes ne sont JAMAIS supprimées : on met à jour
 *     description/image/imdb_url/metadata et on préserve les champs éditoriaux
 *     (category, highlight, tag, trailer_url, allocine_url, order_index, is_published).
 *
 * Usage :
 *   node scripts/sync_real_films_and_roles_supabase.mjs            # dry-run
 *   node scripts/sync_real_films_and_roles_supabase.mjs --apply    # écriture réelle
 */

import fs from 'fs';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
});

const CANONICAL_ROLES = new Set(['Coordinateur des cascades', 'Doublure', 'Cascadeur']);

function slugify(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/['’]/g, '-')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

function canonicalRole(role) {
    const value = String(role || '').trim();
    return CANONICAL_ROLES.has(value) ? value : 'Cascadeur';
}

function readJson(path) {
    if (!fs.existsSync(path)) {
        console.error(`❌ Fichier introuvable : ${path}`);
        process.exit(1);
    }
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

const filmsData = readJson('scripts/films_real_data.json');
const curated = readJson('scripts/coach_credits_curated_imdb.json');

const films = filmsData.films || [];
const coaches = curated.coaches || [];

console.log('--- SYNCHRONISATION FILMS + RÔLES (Supabase) ---');
console.log(`Mode                : ${APPLY ? 'APPLY (écriture)' : 'DRY-RUN (lecture seule)'}`);
console.log(`Films (source IMDb) : ${films.length}`);
console.log(`Coachs (source IMDb) : ${coaches.length}`);

// ---------------------------------------------------------------------------
// 1. Charger l'état actuel de site_films
// ---------------------------------------------------------------------------
const { data: existingFilms, error: filmsError } = await supabase
    .from('site_films')
    .select('id,title,year,imdb_url,image,description,metadata,category,highlight,tag,trailer_url,allocine_url,order_index,is_published');

if (filmsError) {
    console.error('❌ Lecture site_films :', filmsError.message);
    process.exit(1);
}

const existingById = new Map((existingFilms || []).map((row) => [row.id, row]));
const existingByImdb = new Map();
for (const row of existingFilms || []) {
    if (row.imdb_url) {
        const match = String(row.imdb_url).match(/(tt\d+)/);
        if (match) existingByImdb.set(match[1], row);
    }
}

console.log(`Films déjà en base  : ${existingFilms?.length || 0}`);

// ---------------------------------------------------------------------------
// 2. Construire les lignes à upsert
// ---------------------------------------------------------------------------
const rowsToUpsert = [];
const usedIds = new Set();
let created = 0;
let updated = 0;
let skippedNoId = 0;

for (const film of films) {
    const imdbId = film.imdbId || null;
    const title = (film.title || '').trim();
    if (!title) {
        skippedNoId += 1;
        continue;
    }

    // Retrouver une ligne existante : par imdbId d'abord, puis par slug de titre.
    let existing = imdbId ? existingByImdb.get(imdbId) : null;
    let id = existing?.id || slugify(title);

    // Éviter les collisions d'id entre deux films distincts.
    if (!existing && usedIds.has(id)) {
        id = imdbId ? `${id}-${imdbId.replace(/^tt/, '')}` : `${id}-${rowsToUpsert.length}`;
    }
    usedIds.add(id);

    const coachesMap = {};
    for (const [coachId, role] of Object.entries(film.coaches || {})) {
        coachesMap[coachId] = canonicalRole(role);
    }

    const metadata = {
        ...(existing?.metadata || {}),
        cuc_team_roles: coachesMap,
        imdb_id: imdbId,
        title_type: film.titleType || null,
        synced_from: 'imdb',
        synced_at: new Date().toISOString(),
    };

    const row = {
        id,
        title,
        year: film.year ? String(film.year) : existing?.year || null,
        // Vraie description IMDb — jamais composée.
        description: film.description || existing?.description || null,
        // Vraie jaquette originale IMDb — on ne remplace pas une image existante par du vide.
        image: film.poster || existing?.image || null,
        imdb_url: imdbId ? `https://www.imdb.com/title/${imdbId}/` : existing?.imdb_url || null,
        cuc_team_involved: Object.keys(coachesMap),
        metadata,
        // Champs éditoriaux préservés.
        category: existing?.category ?? null,
        highlight: existing?.highlight ?? null,
        tag: existing?.tag ?? null,
        trailer_url: existing?.trailer_url ?? null,
        allocine_url: existing?.allocine_url ?? null,
        order_index: existing?.order_index ?? null,
        is_published: existing?.is_published ?? true,
    };

    if (existing) updated += 1;
    else created += 1;

    rowsToUpsert.push(row);
}

console.log(`Films à créer       : ${created}`);
console.log(`Films à mettre à jour: ${updated}`);
if (skippedNoId) console.log(`Films ignorés (sans titre): ${skippedNoId}`);

// ---------------------------------------------------------------------------
// 3. Construire les mises à jour site_team
// ---------------------------------------------------------------------------
const teamUpdates = [];

for (const coach of coaches) {
    const credits = coach.credits || [];
    if (!credits.length) continue;

    const notableCredits = [];
    const filmRoles = {};

    for (const credit of credits) {
        const title = (credit.title || '').trim();
        if (!title) continue;
        const role = canonicalRole(credit.role);
        const year = credit.year ? ` (${credit.year})` : '';
        notableCredits.push(`${title}${year} — ${role}`);

        const slug = slugify(title);
        if (slug && !filmRoles[slug]) filmRoles[slug] = role;
    }

    teamUpdates.push({
        id: coach.id,
        name: coach.name,
        notable_credits: notableCredits,
        metadata: { film_roles: filmRoles },
        _count: notableCredits.length,
    });
}

console.log(`Coachs à mettre à jour: ${teamUpdates.length}`);
for (const t of teamUpdates) {
    console.log(`  ${t.name.padEnd(18)} ${String(t._count).padStart(4)} crédits`);
}

if (!APPLY) {
    console.log('\nℹ️  DRY-RUN terminé. Relancer avec --apply pour écrire dans Supabase.');
    process.exit(0);
}

// ---------------------------------------------------------------------------
// 4. Écriture — site_films (par lots)
// ---------------------------------------------------------------------------
const CHUNK = 100;
let filmsWritten = 0;

for (let i = 0; i < rowsToUpsert.length; i += CHUNK) {
    const chunk = rowsToUpsert.slice(i, i + CHUNK);
    const { error } = await supabase.from('site_films').upsert(chunk, { onConflict: 'id' });
    if (error) {
        console.error(`❌ Upsert site_films (lot ${i / CHUNK + 1}) :`, error.message);
        process.exit(1);
    }
    filmsWritten += chunk.length;
    process.stdout.write(`\r  site_films : ${filmsWritten}/${rowsToUpsert.length}`);
}
console.log('');

// ---------------------------------------------------------------------------
// 5. Écriture — site_team (fusion metadata pour ne rien écraser)
// ---------------------------------------------------------------------------
const { data: teamRows, error: teamReadError } = await supabase
    .from('site_team')
    .select('id,metadata');

if (teamReadError) {
    console.error('❌ Lecture site_team :', teamReadError.message);
    process.exit(1);
}

const teamMetaById = new Map((teamRows || []).map((r) => [r.id, r.metadata || {}]));

let teamWritten = 0;
for (const update of teamUpdates) {
    const mergedMetadata = {
        ...(teamMetaById.get(update.id) || {}),
        film_roles: update.metadata.film_roles,
    };

    const { error } = await supabase
        .from('site_team')
        .update({
            notable_credits: update.notable_credits,
            metadata: mergedMetadata,
        })
        .eq('id', update.id);

    if (error) {
        console.error(`❌ Update site_team ${update.id} :`, error.message);
        process.exit(1);
    }
    teamWritten += 1;
    process.stdout.write(`\r  site_team  : ${teamWritten}/${teamUpdates.length}`);
}
console.log('');

console.log('\n✓ Synchronisation terminée.');
console.log(`  Films écrits : ${filmsWritten}`);
console.log(`  Coachs écrits: ${teamWritten}`);
