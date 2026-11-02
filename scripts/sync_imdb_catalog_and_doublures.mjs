/**
 * ==============================================================================
 * CUC — Synchronisation Complète IMDb : Johnny (tt37205945), Unification des
 * Doublures en Cascadeur, et Import des Films Manquants des 20 Coachs
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { imdb } from './lib/imdb-client.mjs';

dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error('❌ Variables Supabase manquantes dans .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
});

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

function normalizeTitleKey(str) {
    return String(str || '')
        .replace(/\s*\(\d{4}(?:[^)]*)?\)\s*$/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function mapTitleTypeToCategory(titleType) {
    const t = String(titleType || '').toLowerCase();
    if (t.includes('series') || t.includes('episode') || t === 'tvminiseries' || t === 'tvseries') {
        return 'Série';
    }
    if (t === 'short' || t === 'tvshort' || t === 'musicvideo' || t === 'video') {
        return 'Court métrage';
    }
    return 'Film';
}

/**
 * Convertit tout rôle "Doublure" ou "Doublure de X" en "Cascadeur",
 * tout en extrayant l'acteur doublé éventuel pour la métadonnée interne.
 * Préserve Rigger, Cascadeur mécanique, Assistant coordinateur, Coordinateur de rigging, Coordinateur des cascades.
 */
function unifyDoublureRole(rawRole) {
    const role = String(rawRole || '').trim();
    if (!role) return { publicRole: 'Cascadeur', doubledActor: null, wasDoublure: false };

    if (/^doublure\b/i.test(role)) {
        const m = role.match(/^doublure\s+(?:de\s+|d['’]\s*)?(.+)$/i);
        const doubledActor = m ? m[1].trim() : null;
        return {
            publicRole: 'Cascadeur',
            doubledActor,
            wasDoublure: true,
        };
    }

    return {
        publicRole: role,
        doubledActor: null,
        wasDoublure: false,
    };
}

const ROLE_PRIORITY = {
    'Coordinateur des cascades': 6,
    'Coordinateur de rigging': 5,
    'Assistant coordinateur des cascades': 4,
    'Rigger': 3,
    'Cascadeur mécanique': 2,
    'Cascadeur': 1,
};

function pickHigherRole(roleA, roleB) {
    if (!roleA) return roleB;
    if (!roleB) return roleA;
    const pA = ROLE_PRIORITY[roleA] || 1;
    const pB = ROLE_PRIORITY[roleB] || 1;
    return pB > pA ? roleB : roleA;
}

/**
 * Récupère par lot de 20 les métadonnées IMDb via GraphQL.
 */
async function fetchImdbBatch(titleIds) {
    const out = new Map();
    const BATCH_SIZE = 20;

    for (let i = 0; i < titleIds.length; i += BATCH_SIZE) {
        const chunk = titleIds.slice(i, i + BATCH_SIZE).filter((id) => /^tt\d+$/.test(id));
        if (chunk.length === 0) continue;

        const fields = chunk
            .map(
                (id, idx) => `
            t${idx}: title(id: "${id}") {
                id
                titleText { text }
                originalTitleText { text }
                releaseYear { year }
                titleType { id text }
                plot { plotText { plainText } }
                primaryImage { url width height }
                directors: credits(first: 4, filter: { categories: ["director"] }) {
                    edges { node { name { nameText { text } } } }
                }
            }
        `
            )
            .join('\n');

        try {
            const payload = await imdb.graphql(`query { ${fields} }`, {});
            const data = payload?.data || {};
            chunk.forEach((id, idx) => {
                const t = data[`t${idx}`];
                if (!t) return;
                const directors = (t.directors?.edges || [])
                    .map((e) => e?.node?.name?.nameText?.text)
                    .filter(Boolean)
                    .join(', ');
                out.set(id, {
                    imdbId: id,
                    title: t.titleText?.text || '',
                    originalTitle: t.originalTitleText?.text || '',
                    year: t.releaseYear?.year ? String(t.releaseYear.year) : '',
                    titleType: t.titleType?.id || 'movie',
                    description: (t.plot?.plotText?.plainText || '').trim(),
                    poster: t.primaryImage?.url || '',
                    director: directors || '',
                });
            });
        } catch (err) {
            console.warn(`⚠️ Erreur batch IMDb [${i}..${i + chunk.length}]:`, err.message);
        }
        process.stdout.write(`\r  IMDb GraphQL : ${Math.min(i + BATCH_SIZE, titleIds.length)}/${titleIds.length} titres récupérés...`);
    }
    if (titleIds.length > 0) console.log('');
    return out;
}

async function main() {
    console.log('=== SYNCHRONISATION CATALOGUE IMDB, JOHNNY & DOUBLURES ===\n');

    const scraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'coaches_scraped_full_imdb.json'), 'utf8'));

    const { data: existingFilms, error: errFilms } = await supabase
        .from('site_films')
        .select('*')
        .order('order_index', { ascending: true });
    if (errFilms) throw errFilms;

    const { data: existingTeam, error: errTeam } = await supabase
        .from('site_team')
        .select('*')
        .order('order_index', { ascending: true });
    if (errTeam) throw errTeam;

    console.log(`État initial : ${existingFilms.length} films en base, ${existingTeam.length} coachs.`);

    // 1. Indexer les films existants
    const filmById = new Map();
    const filmByImdbId = new Map();
    const filmByKey = new Map();

    for (const f of existingFilms) {
        filmById.set(f.id, f);
        filmByKey.set(normalizeTitleKey(f.title), f);
        const m = String(f.imdb_url || '').match(/(tt\d+)/);
        if (m) filmByImdbId.set(m[1], f);
        if (f.metadata?.imdb_id) filmByImdbId.set(f.metadata.imdb_id, f);
    }

    // Aliases connus entre titres courts en base et titres longs IMDb
    const KNOWN_TITLE_ALIASES = {
        'dune premiere partie': 'dune',
        'le transporteur la serie': 'le-transporteur',
    };
    for (const [aliasKey, targetId] of Object.entries(KNOWN_TITLE_ALIASES)) {
        if (filmById.has(targetId)) {
            filmByKey.set(aliasKey, filmById.get(targetId));
        }
    }

    // 2. Collecter tous les crédits scrapés des 20 coachs + Johnny (tt37205945) pour Lucas Dollfus
    const scrapedTitlesMap = new Map(); // titleId -> { titleId, title, originalTitle, year, coaches: Map<coachId, { publicRole, doubledActor, rawRole }> }

    // Ajouter Johnny (tt37205945) pour Lucas Dollfus en tant que Coordinateur des cascades
    scrapedTitlesMap.set('tt37205945', {
        titleId: 'tt37205945',
        title: 'Johnny',
        originalTitle: 'Johnny',
        year: '2027',
        coaches: new Map([
            [
                'lucas-dollfus',
                {
                    publicRole: 'Coordinateur des cascades',
                    doubledActor: null,
                    rawRole: 'Coordinateur des cascades',
                },
            ],
        ]),
    });

    for (const coach of scraped.coaches) {
        for (const c of coach.credits) {
            if (!c.titleId) continue;
            if (!scrapedTitlesMap.has(c.titleId)) {
                scrapedTitlesMap.set(c.titleId, {
                    titleId: c.titleId,
                    title: c.title,
                    originalTitle: c.originalTitle,
                    year: c.year ? String(c.year) : '',
                    coaches: new Map(),
                });
            }
            const entry = scrapedTitlesMap.get(c.titleId);
            const { publicRole, doubledActor } = unifyDoublureRole(c.roleLabel);
            const prev = entry.coaches.get(coach.id);
            if (!prev) {
                entry.coaches.set(coach.id, {
                    publicRole,
                    doubledActor: doubledActor || c.doubledActor || null,
                    rawRole: c.roleLabel,
                });
            } else {
                entry.coaches.set(coach.id, {
                    publicRole: pickHigherRole(prev.publicRole, publicRole),
                    doubledActor: prev.doubledActor || doubledActor || c.doubledActor || null,
                    rawRole: prev.rawRole,
                });
            }
        }
    }

    // 3. Identifier les titleIds à requêter sur IMDb (nouveaux films + Johnny + films existants sans image)
    const idsToFetch = new Set(['tt37205945']);
    for (const [titleId, info] of scrapedTitlesMap.entries()) {
        const existing =
            filmByImdbId.get(titleId) ||
            filmByKey.get(normalizeTitleKey(info.title)) ||
            filmByKey.get(normalizeTitleKey(info.originalTitle));
        if (!existing || !existing.image || !existing.director) {
            idsToFetch.add(titleId);
        }
    }

    console.log(`Titres IMDb à interroger via GraphQL : ${idsToFetch.size}`);
    const cacheFile = path.join(__dirname, '_imdb_batch_cache.json');
    let imdbDetailsMap;
    if (fs.existsSync(cacheFile)) {
        const rawCache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        imdbDetailsMap = new Map(Object.entries(rawCache));
        console.log(`  Cache IMDb chargé (${imdbDetailsMap.size} titres).`);
    } else {
        imdbDetailsMap = await fetchImdbBatch([...idsToFetch]);
        fs.writeFileSync(cacheFile, JSON.stringify(Object.fromEntries(imdbDetailsMap), null, 2), 'utf8');
    }

    // 4. Mettre à jour les films existants et créer les nouveaux films
    let maxOrderIndex = existingFilms.reduce((max, f) => Math.max(max, Number(f.order_index) || 0), 0);
    let createdCount = 0;
    let updatedCount = 0;
    let doubluresConvertedInFilms = 0;

    // D'abord, corriger explicitement la fiche "johnny"
    const johnnyImdb = imdbDetailsMap.get('tt37205945');
    if (filmById.has('johnny')) {
        const j = filmById.get('johnny');
        j.imdb_url = 'https://www.imdb.com/title/tt37205945/';
        j.image = johnnyImdb?.poster || 'https://m.media-amazon.com/images/M/MV5BNjExYjUyM2ItNzM1Yy00M2M0LTlhZGEtYTAwYmNmNGNjODIwXkEyXkFqcGc@._V1_.jpg';
        j.director = johnnyImdb?.director || 'Cédric Jimenez';
        j.year = johnnyImdb?.year || '2027';
        j.category = 'Film';
        j.allocine_url = '';
        j.cuc_team_involved = Array.from(new Set([...(j.cuc_team_involved || []), 'lucas-dollfus']));
        j.metadata = {
            ...(j.metadata || {}),
            imdb_id: 'tt37205945',
            title_type: 'movie',
            synced_from: 'imdb',
            synced_at: new Date().toISOString(),
            cuc_team_roles: {
                ...(j.metadata?.cuc_team_roles || {}),
                'lucas-dollfus': 'Coordinateur des cascades',
            },
        };
        filmByImdbId.set('tt37205945', j);
    }

    // Parcourir tous les titres scrapés pour enrichir ou créer les lignes site_films
    for (const [titleId, info] of scrapedTitlesMap.entries()) {
        const imdbData = imdbDetailsMap.get(titleId);
        let film =
            filmByImdbId.get(titleId) ||
            filmByKey.get(normalizeTitleKey(info.title)) ||
            filmByKey.get(normalizeTitleKey(info.originalTitle));

        if (!film) {
            // Créer une nouvelle fiche film dans site_films
            let baseSlug = slugify(info.title || imdbData?.title || titleId);
            if (!baseSlug) baseSlug = titleId;
            let finalId = baseSlug;
            if (filmById.has(finalId)) {
                finalId = `${baseSlug}-${titleId.replace(/^tt/, '')}`;
            }

            const cucRoles = {};
            const cucDoubledActors = {};
            const cucRolesDetail = {};

            for (const [coachId, roleObj] of info.coaches.entries()) {
                cucRoles[coachId] = roleObj.publicRole;
                cucRolesDetail[coachId] = roleObj.rawRole;
                if (roleObj.doubledActor) {
                    cucDoubledActors[coachId] = roleObj.doubledActor;
                }
            }

            maxOrderIndex += 1;
            const stuntCoordNames =
                [...info.coaches.entries()]
                    .filter(([, r]) => r.publicRole === 'Coordinateur des cascades')
                    .map(([cid]) => existingTeam.find((t) => t.id === cid)?.name)
                    .filter(Boolean)
                    .join(', ') || null;

            film = {
                id: finalId,
                title: info.title || imdbData?.title || info.originalTitle,
                year: info.year || imdbData?.year || '',
                category: mapTitleTypeToCategory(imdbData?.titleType),
                stunt_roles: '',
                doubled_actors: [],
                highlight: false,
                image: imdbData?.poster || '',
                tag: '',
                imdb_url: `https://www.imdb.com/title/${titleId}/`,
                allocine_url: '',
                trailer_url: '',
                cuc_team_involved: [...info.coaches.keys()],
                description: imdbData?.description || '',
                director: imdbData?.director || '',
                order_index: maxOrderIndex,
                is_published: true,
                metadata: {
                    cuc_team_roles: cucRoles,
                    cuc_team_roles_detail: cucRolesDetail,
                    ...(Object.keys(cucDoubledActors).length > 0 ? { cuc_team_doubled_actors: cucDoubledActors } : {}),
                    ...(stuntCoordNames ? { stunt_coordinator: stuntCoordNames } : {}),
                    imdb_id: titleId,
                    title_type: imdbData?.titleType || 'movie',
                    synced_from: 'imdb',
                    synced_at: new Date().toISOString(),
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            filmById.set(film.id, film);
            filmByImdbId.set(titleId, film);
            filmByKey.set(normalizeTitleKey(film.title), film);
            if (info.originalTitle) filmByKey.set(normalizeTitleKey(info.originalTitle), film);
            createdCount++;
        } else {
            // Mettre à jour un film existant avec les coachs manquants et les infos IMDb si absentes
            const involvedSet = new Set(film.cuc_team_involved || []);
            const rolesMap = { ...(film.metadata?.cuc_team_roles || {}) };
            const detailMap = { ...(film.metadata?.cuc_team_roles_detail || {}) };
            const doubledMap = { ...(film.metadata?.cuc_team_doubled_actors || {}) };

            for (const [coachId, roleObj] of info.coaches.entries()) {
                involvedSet.add(coachId);
                rolesMap[coachId] = pickHigherRole(rolesMap[coachId], roleObj.publicRole);
                if (!detailMap[coachId]) detailMap[coachId] = roleObj.rawRole;
                if (roleObj.doubledActor) doubledMap[coachId] = roleObj.doubledActor;
            }

            film.cuc_team_involved = [...involvedSet];
            if (!film.image && imdbData?.poster) film.image = imdbData.poster;
            if (!film.director && imdbData?.director) film.director = imdbData.director;
            if (!film.description && imdbData?.description) film.description = imdbData.description;
            if (!film.imdb_url || film.imdb_url.includes('/name/')) {
                film.imdb_url = `https://www.imdb.com/title/${titleId}/`;
            }

            film.metadata = {
                ...(film.metadata || {}),
                imdb_id: film.metadata?.imdb_id || titleId,
                title_type: film.metadata?.title_type || imdbData?.titleType || 'movie',
                cuc_team_roles: rolesMap,
                cuc_team_roles_detail: detailMap,
                ...(Object.keys(doubledMap).length > 0 ? { cuc_team_doubled_actors: doubledMap } : {}),
            };
            updatedCount++;
        }
    }

    // 5. Normaliser TOUS les films (convertir tout rôle "Doublure..." en "Cascadeur" dans cuc_team_roles)
    const allFilms = [...filmById.values()];
    for (const film of allFilms) {
        const rolesMap = { ...(film.metadata?.cuc_team_roles || {}) };
        const detailMap = { ...(film.metadata?.cuc_team_roles_detail || {}) };
        const doubledMap = { ...(film.metadata?.cuc_team_doubled_actors || {}) };

        for (const [coachId, rawRole] of Object.entries(rolesMap)) {
            const { publicRole, doubledActor, wasDoublure } = unifyDoublureRole(rawRole);
            if (wasDoublure) {
                if (!detailMap[coachId]) detailMap[coachId] = rawRole;
                if (doubledActor) doubledMap[coachId] = doubledActor;
                rolesMap[coachId] = publicRole;
                doubluresConvertedInFilms++;
            }
        }

        // S'assurer que la catégorie respecte strictement ['Film', 'Série', 'Court métrage']
        if (!['Film', 'Série', 'Court métrage'].includes(film.category)) {
            film.category = mapTitleTypeToCategory(film.metadata?.title_type);
        }

        film.metadata = {
            ...(film.metadata || {}),
            cuc_team_roles: rolesMap,
            ...(Object.keys(detailMap).length > 0 ? { cuc_team_roles_detail: detailMap } : {}),
            ...(Object.keys(doubledMap).length > 0 ? { cuc_team_doubled_actors: doubledMap } : {}),
        };
    }

    console.log(`Films créés : ${createdCount} | Films enrichis : ${updatedCount} | Rôles Doublure -> Cascadeur dans site_films : ${doubluresConvertedInFilms}`);

    // 6. Mettre à jour les 20 coachs (Johnny pour Lucas + Doublure -> Cascadeur + synchronisation film_roles)
    let doubluresConvertedInTeam = 0;

    for (const member of existingTeam) {
        // Pour Lucas Dollfus : ajouter Johnny (2027) — Coordinateur des cascades en tête s'il n'y est pas
        const rawCredits = [...(member.notable_credits || [])];
        if (member.id === 'lucas-dollfus') {
            const hasJohnny = rawCredits.some((c) => normalizeTitleKey(c.split(' — ')[0]) === 'johnny');
            if (!hasJohnny) {
                rawCredits.unshift('Johnny (2027) — Coordinateur des cascades');
            }
        }

        const newNotableCredits = [];
        const doubledActorsByFilm = { ...(member.metadata?.doubled_actors_by_film || {}) };
        const newFilmRoles = { ...(member.metadata?.film_roles || {}) };

        if (member.id === 'lucas-dollfus') {
            newFilmRoles['johnny'] = 'Coordinateur des cascades';
        }

        for (const creditStr of rawCredits) {
            if (creditStr.includes(' — ')) {
                const parts = creditStr.split(' — ');
                const titlePart = parts[0].trim();
                const rolePart = parts.slice(1).join(' — ').trim();
                const { publicRole, doubledActor, wasDoublure } = unifyDoublureRole(rolePart);
                if (wasDoublure) doubluresConvertedInTeam++;

                newNotableCredits.push(`${titlePart} — ${publicRole}`);

                // Trouver le film correspondant pour synchroniser film_roles sur le vrai film.id
                const key = normalizeTitleKey(titlePart);
                const matchedFilm = filmByKey.get(key);
                const targetSlug = matchedFilm ? matchedFilm.id : slugify(titlePart.replace(/\s*\(\d{4}(?:[^)]*)?\)\s*$/, ''));
                if (targetSlug) {
                    newFilmRoles[targetSlug] = pickHigherRole(newFilmRoles[targetSlug], publicRole);
                    if (doubledActor) doubledActorsByFilm[targetSlug] = doubledActor;
                }
            } else {
                newNotableCredits.push(creditStr);
            }
        }

        // Convertir aussi les éventuelles doublures restantes dans film_roles
        for (const [fSlug, rVal] of Object.entries(newFilmRoles)) {
            const { publicRole, doubledActor } = unifyDoublureRole(rVal);
            newFilmRoles[fSlug] = publicRole;
            if (doubledActor && !doubledActorsByFilm[fSlug]) {
                doubledActorsByFilm[fSlug] = doubledActor;
            }
        }

        // Convertir aussi featured_credits dans metadata si présent
        const rawFeatured = member.metadata?.featured_credits;
        let newFeatured = rawFeatured;
        if (Array.isArray(rawFeatured)) {
            newFeatured = rawFeatured.map((fc) => {
                if (typeof fc === 'string' && fc.includes(' — ')) {
                    const p = fc.split(' — ');
                    const { publicRole } = unifyDoublureRole(p.slice(1).join(' — ').trim());
                    return `${p[0].trim()} — ${publicRole}`;
                }
                return fc;
            });
        }

        member.notable_credits = newNotableCredits;
        member.metadata = {
            ...(member.metadata || {}),
            film_roles: newFilmRoles,
            ...(Object.keys(doubledActorsByFilm).length > 0 ? { doubled_actors_by_film: doubledActorsByFilm } : {}),
            ...(Array.isArray(newFeatured) ? { featured_credits: newFeatured } : {}),
        };
        member.updated_at = new Date().toISOString();
    }

    console.log(`Crédits Doublure -> Cascadeur convertis dans site_team : ${doubluresConvertedInTeam}`);

    // 7. Upsert dans Supabase : site_films par lots de 100
    console.log('\nSynchronisation Supabase site_films...');
    const CHUNK = 100;
    for (let i = 0; i < allFilms.length; i += CHUNK) {
        const chunk = allFilms.slice(i, i + CHUNK);
        const { error } = await supabase.from('site_films').upsert(chunk, { onConflict: 'id' });
        if (error) {
            console.error(`❌ Erreur upsert site_films lot ${i}:`, error.message);
            process.exit(1);
        }
        process.stdout.write(`\r  site_films : ${Math.min(i + CHUNK, allFilms.length)}/${allFilms.length}`);
    }
    console.log('\n✓ site_films synchronisé.');

    // 8. Upsert dans Supabase : site_team
    console.log('Synchronisation Supabase site_team...');
    for (const member of existingTeam) {
        const { error } = await supabase.from('site_team').upsert(member, { onConflict: 'id' });
        if (error) {
            console.error(`❌ Erreur upsert site_team ${member.id}:`, error.message);
            process.exit(1);
        }
    }
    console.log('✓ site_team synchronisé.');

    // 9. Générer src/data/filmography.ts et src/data/team.ts alignés à 100 % avec Supabase
    console.log('Mise à jour de src/data/filmography.ts et src/data/team.ts...');

    const staticFilms = allFilms.map((f) => ({
        id: f.id,
        title: f.title,
        year: f.year || '',
        category: f.category || 'Film',
        stuntRoles: f.stunt_roles || '',
        doubledActors: f.doubled_actors || [],
        highlight: Boolean(f.highlight),
        image: f.image || '',
        tag: f.tag || '',
        imdbUrl: f.imdb_url || '',
        allocineUrl: f.allocine_url || '',
        trailerUrl: f.trailer_url || '',
        cuc_team_involved: f.cuc_team_involved || [],
        cuc_team_roles: f.metadata?.cuc_team_roles || {},
        description: f.description || '',
        director: f.director || undefined,
        stuntCoordinator: f.stunt_coordinator || undefined,
    }));

    const FILM_CHUNK_SIZE = 300;
    const filmChunks = [];
    for (let i = 0; i < staticFilms.length; i += FILM_CHUNK_SIZE) {
        filmChunks.push(staticFilms.slice(i, i + FILM_CHUNK_SIZE));
    }

    const filmographyTs = `import { FilmCredit } from '@/types';

export { OFFICIAL_FILM_BANNERS } from './filmBanners';
export type { FilmBanner } from './filmBanners';
export { DOUBLED_CELEBRITIES } from './celebrities';

${filmChunks
    .map((chunk, idx) => `const FILMS_PART_${idx + 1}: FilmCredit[] = ${JSON.stringify(chunk, null, 2)};`)
    .join('\n\n')}

export const FILMOGRAPHY_CREDITS: FilmCredit[] = [
${filmChunks.map((_, idx) => `  ...FILMS_PART_${idx + 1},`).join('\n')}
];
`;
    fs.writeFileSync(path.join(ROOT, 'src', 'data', 'filmography.ts'), filmographyTs, 'utf8');

    const staticTeam = existingTeam.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        title: m.title,
        specialties: m.specialties || [],
        bio: m.bio || '',
        avatarUrl: m.avatar_url || '',
        imdb: m.imdb || undefined,
        externalUrl: m.external_url || undefined,
        instagram: m.instagram || undefined,
        order_index: m.order_index,
        doubledActors: m.doubled_actors || [],
        notableCredits: m.notable_credits || [],
        featuredCredits: Array.isArray(m.metadata?.featured_credits) ? m.metadata.featured_credits : undefined,
        metadata: m.metadata || {},
    }));

    const teamTs = `import { Instructor } from '@/types';

/**
 * Liste officielle des 20 coachs et formateurs du Campus Univers Cascades.
 * Données filmographiques et rôles certifiés issus du scraping IMDb.
 * Dernière synchronisation : ${new Date().toISOString()}
 */
export const CUC_TEAM: Instructor[] = ${JSON.stringify(staticTeam, null, 2)};
`;
    fs.writeFileSync(path.join(ROOT, 'src', 'data', 'team.ts'), teamTs, 'utf8');

    // Mettre à jour site_settings['team'] également
    await supabase.from('site_settings').upsert(
        {
            key: 'team',
            value: staticTeam,
            updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
    );

    console.log(`✓ src/data/filmography.ts (${staticFilms.length} films) et src/data/team.ts (${staticTeam.length} coachs) mis à jour.`);
    console.log('\n=== SYNCHRONISATION TERMINÉE AVEC SUCCÈS ===');
}

main().catch((err) => {
    console.error('❌ Erreur fatale:', err);
    process.exit(1);
});
