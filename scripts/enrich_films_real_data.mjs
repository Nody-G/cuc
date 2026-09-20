#!/usr/bin/env node
/**
 * enrich_films_real_data.mjs
 * ---------------------------------------------------------------------------
 * Récupère les VRAIES données de chaque film depuis IMDb :
 *   - la VRAIE description (synopsis `plot.plotText.plainText`) ;
 *   - la VRAIE jaquette originale (`primaryImage.url`) ;
 *   - le réalisateur (`directors`) ;
 *   - le type (film / série) et l'année.
 *
 * Contexte (demande utilisateur) :
 *   « je veux que que tu arretes avec ces fausse escription du genre
 *   "Projections télékinétiques par câblage…" et marque juste si ils ont ete
 *   cascadeur doublure ou coordinateur […] et pour les description de films je
 *   veux la vrai description du film, je veux aussi que tu trouves toutes les
 *   jaquettes original ».
 *
 * Doctrine (AGENTS.md) :
 *   - Zéro invention : on ne compose AUCUNE description. On reprend le synopsis
 *     IMDb tel quel. Si IMDb ne fournit rien, on laisse vide (jamais inventé).
 *   - Zéro texte orphelin : chaque donnée porte sa source (imdbId).
 *
 * Entrée  : scripts/coach_credits_curated_imdb.json  (crédits re-curatés)
 * Sortie  : scripts/films_real_data.json             (données réelles par film)
 *
 * Usage :
 *   node scripts/enrich_films_real_data.mjs
 *   node scripts/enrich_films_real_data.mjs --limit=20
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { imdb } from './lib/imdb-client.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const INPUT_JSON = path.join(__dirname, 'coach_credits_curated_imdb.json');
const OUTPUT_JSON = path.join(__dirname, 'films_real_data.json');

// ---------------------------------------------------------------------------
// Arguments CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
    const args = { limit: Infinity };
    for (const raw of argv.slice(2)) {
        if (raw.startsWith('--limit=')) {
            const n = Number.parseInt(raw.split('=')[1], 10);
            if (Number.isFinite(n) && n > 0) args.limit = n;
        }
    }
    return args;
}

// ---------------------------------------------------------------------------
// Requête GraphQL « titre » — synopsis + jaquette + réalisateurs
// ---------------------------------------------------------------------------

/**
 * Construit la requête GraphQL inline pour un identifiant de titre IMDb.
 * La forme inline (sans variables) est la seule acceptée par l'endpoint public.
 *
 * @param {string} titleId - identifiant `ttXXXXXXX`
 * @returns {string}
 */
function buildTitleQuery(titleId) {
    return `
        query {
            title(id: "${titleId}") {
                id
                titleText { text }
                originalTitleText { text }
                releaseYear { year }
                titleType { id text }
                plot { plotText { plainText } }
                primaryImage { url width height }
                directors: credits(first: 5, filter: { categories: ["director"] }) {
                    edges { node { name { nameText { text } } } }
                }
            }
        }
    `;
}

/**
 * Récupère les données réelles d'un titre IMDb.
 *
 * @param {string} titleId
 * @returns {Promise<{description:string,poster:string|null,director:string|null,titleType:string|null,year:number|null}|null>}
 */
async function fetchTitleData(titleId) {
    if (!/^tt\d+$/.test(String(titleId || ''))) return null;
    let payload;
    try {
        payload = await imdb.graphql(buildTitleQuery(titleId), {});
    } catch {
        return null;
    }
    const t = payload?.data?.title;
    if (!t) return null;

    const description = (t.plot?.plotText?.plainText || '').trim();
    const poster = t.primaryImage?.url || null;
    const directorEdges = t.directors?.edges ?? [];
    const director = directorEdges
        .map((e) => e?.node?.name?.nameText?.text)
        .filter(Boolean)
        .join(', ') || null;

    return {
        description,
        poster,
        director,
        titleType: t.titleType?.id || null,
        titleTypeLabel: t.titleType?.text || null,
        year: t.releaseYear?.year ?? null,
    };
}

// ---------------------------------------------------------------------------
// Programme principal
// ---------------------------------------------------------------------------

async function main() {
    const args = parseArgs(process.argv);

    if (!fs.existsSync(INPUT_JSON)) {
        console.error(`Fichier introuvable : ${path.relative(ROOT, INPUT_JSON)}`);
        console.error('Lancez d\'abord : node scripts/recurate_all_coach_credits.mjs');
        process.exit(1);
    }

    const curated = JSON.parse(fs.readFileSync(INPUT_JSON, 'utf8'));

    // Agrégation : un film = un imdbId. On collecte les coachs impliqués et
    // leur rôle canonique (3 libellés).
    /** @type {Map<string, {imdbId:string,title:string,year:number|null,coaches:Record<string,string>}>} */
    const films = new Map();

    for (const coach of curated.coaches) {
        for (const credit of coach.credits) {
            if (!credit.imdbId) continue;
            const key = credit.imdbId;
            if (!films.has(key)) {
                films.set(key, {
                    imdbId: key,
                    title: credit.title,
                    year: credit.year ?? null,
                    coaches: {},
                });
            }
            const film = films.get(key);
            // Un coach peut avoir plusieurs crédits sur le même film : on
            // conserve le rôle le plus « fort » (coordination > doublure > cascadeur).
            const rank = { 'Coordinateur des cascades': 3, 'Doublure': 2, 'Cascadeur': 1 };
            const prev = film.coaches[coach.id];
            if (!prev || (rank[credit.role] || 0) > (rank[prev] || 0)) {
                film.coaches[coach.id] = credit.role;
            }
        }
    }

    const list = Array.from(films.values());
    const target = Number.isFinite(args.limit) ? list.slice(0, args.limit) : list;

    console.log(`Films uniques à enrichir : ${list.length}`);
    console.log(`Traitement de ${target.length} film(s)…`);
    console.log('');

    const results = [];
    let withDescription = 0;
    let withPoster = 0;
    let done = 0;

    for (const film of target) {
        const data = await fetchTitleData(film.imdbId);
        done += 1;

        const record = {
            imdbId: film.imdbId,
            title: film.title,
            year: film.year,
            description: data?.description || '',
            poster: data?.poster || null,
            director: data?.director || null,
            titleType: data?.titleType || null,
            coaches: film.coaches,
        };
        if (record.description) withDescription += 1;
        if (record.poster) withPoster += 1;
        results.push(record);

        if (done % 25 === 0 || done === target.length) {
            console.log(
                `  ${String(done).padStart(4)}/${target.length} — ` +
                `${withDescription} descriptions, ${withPoster} jaquettes`
            );
        }
    }

    const output = {
        generatedAt: new Date().toISOString(),
        source: 'imdb',
        stats: {
            films: results.length,
            withDescription,
            withPoster,
            withoutDescription: results.length - withDescription,
            withoutPoster: results.length - withPoster,
        },
        films: results,
    };
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2), 'utf8');

    console.log('');
    console.log('--- ENRICHISSEMENT FILMS (données réelles IMDb) ---');
    console.log(`Films traités        : ${results.length}`);
    console.log(`Avec description     : ${withDescription}`);
    console.log(`Avec jaquette        : ${withPoster}`);
    console.log(`Sans description     : ${results.length - withDescription}`);
    console.log(`Sans jaquette        : ${results.length - withPoster}`);
    console.log('');
    console.log(`✓ JSON : ${path.relative(ROOT, OUTPUT_JSON)}`);
}

main().catch((err) => {
    console.error('Erreur fatale :', err);
    process.exit(1);
});
