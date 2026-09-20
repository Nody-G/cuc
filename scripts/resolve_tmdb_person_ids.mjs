/**
 * ==============================================================================
 * CUC — Résolution des identifiants TMDB des coachs
 * ==============================================================================
 * Résout chaque coach du registre vers un identifiant TMDB (person_id).
 *
 * Stratégie en cascade :
 *   1. tmdbId déjà connu dans le registre → confiance 1.0
 *   2. find/{imdb_id} → confiance 0.95 (correspondance externe officielle)
 *   3. search/person + scoring nominatif → confiance variable (0.0–0.9)
 *
 * Toute résolution sous le seuil de 0.85 est marquée « À CONFIRMER » et ne
 * sera jamais utilisée pour une écriture automatique.
 *
 * Sortie : scripts/tmdb_person_resolution.json
 *
 * Usage : node scripts/resolve_tmdb_person_ids.mjs
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { tmdb } from './lib/tmdb-client.mjs';
import { COACH_REGISTRY, normalizeName } from './lib/coach-registry.mjs';

const CONFIDENCE_THRESHOLD = 0.85;
const OUTPUT_FILE = path.resolve(process.cwd(), 'scripts', 'tmdb_person_resolution.json');

/**
 * Calcule un score de confiance entre un coach et un résultat TMDB.
 *
 * @param {any} coach
 * @param {any} candidate - résultat TMDB (id, name, known_for_department, known_for)
 * @returns {number} score 0–1
 */
function scoreCandidate(coach, candidate) {
    let score = 0;

    const coachNames = [coach.name, ...coach.nameVariants].map(normalizeName);
    const candidateName = normalizeName(candidate.name);

    // 1. Correspondance exacte du nom (poids fort)
    if (coachNames.includes(candidateName)) {
        score += 0.6;
    } else if (coachNames.some((n) => candidateName.includes(n) || n.includes(candidateName))) {
        score += 0.35;
    } else {
        // Vérifie que tous les tokens du nom du coach sont présents
        const coachTokens = normalizeName(coach.name).split(' ').filter((t) => t.length > 2);
        const candidateTokens = candidateName.split(' ');
        const allPresent = coachTokens.every((t) => candidateTokens.includes(t));
        if (allPresent && coachTokens.length >= 2) {
            score += 0.3;
        } else {
            return 0; // Nom trop divergent
        }
    }

    // 2. Département connu (poids moyen)
    const dept = (candidate.known_for_department || '').toLowerCase();
    if (dept === 'crew' || dept === 'acting') {
        score += 0.2;
    }

    // 3. Présence de travaux d'action dans known_for (poids moyen)
    const knownFor = Array.isArray(candidate.known_for) ? candidate.known_for : [];
    const actionHits = knownFor.filter((k) => {
        const genres = Array.isArray(k.genre_ids) ? k.genre_ids : [];
        return genres.includes(28) || genres.includes(10759); // Action / Action & Adventure
    }).length;
    if (actionHits > 0) {
        score += Math.min(0.2, actionHits * 0.1);
    }

    return Math.min(1, score);
}

/**
 * Résout un coach vers un identifiant TMDB.
 *
 * @param {any} coach
 * @returns {Promise<any>}
 */
async function resolveCoach(coach) {
    // Stratégie 1 : identifiant déjà connu
    if (coach.tmdbId) {
        return {
            id: coach.id,
            name: coach.name,
            imdbId: coach.imdbId,
            tmdbId: coach.tmdbId,
            tmdbName: coach.name,
            confidence: 1.0,
            method: 'registry',
            status: 'RÉSOLU',
            candidates: [],
        };
    }

    // Stratégie 2 : résolution via IMDb ID
    if (coach.imdbId) {
        const person = await tmdb.findByImdbId(coach.imdbId);
        if (person) {
            return {
                id: coach.id,
                name: coach.name,
                imdbId: coach.imdbId,
                tmdbId: person.id,
                tmdbName: person.name,
                confidence: 0.95,
                method: 'imdb_find',
                status: 'RÉSOLU',
                candidates: [],
            };
        }
        console.warn(`  ⚠ IMDb ${coach.imdbId} non résolu sur TMDB pour ${coach.name}`);
    }

    // Stratégie 3 : recherche nominative avec scoring
    const allCandidates = [];
    for (const variant of coach.nameVariants) {
        const results = await tmdb.searchPerson(variant);
        for (const r of results) {
            if (!allCandidates.some((c) => c.id === r.id)) {
                allCandidates.push(r);
            }
        }
    }

    const scored = allCandidates
        .map((c) => ({ candidate: c, score: scoreCandidate(coach, c) }))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
        return {
            id: coach.id,
            name: coach.name,
            imdbId: coach.imdbId,
            tmdbId: null,
            tmdbName: null,
            confidence: 0,
            method: 'search_person',
            status: 'INTROUVABLE',
            candidates: [],
        };
    }

    const best = scored[0];
    const status = best.score >= CONFIDENCE_THRESHOLD ? 'RÉSOLU' : 'À CONFIRMER';

    return {
        id: coach.id,
        name: coach.name,
        imdbId: coach.imdbId,
        tmdbId: best.score >= CONFIDENCE_THRESHOLD ? best.candidate.id : null,
        tmdbName: best.candidate.name,
        confidence: Number(best.score.toFixed(2)),
        method: 'search_person',
        status,
        candidates: scored.slice(0, 5).map((s) => ({
            tmdbId: s.candidate.id,
            name: s.candidate.name,
            department: s.candidate.known_for_department,
            score: Number(s.score.toFixed(2)),
            knownFor: (s.candidate.known_for || []).slice(0, 3).map((k) => k.title || k.name),
        })),
    };
}

async function main() {
    console.log('=== RÉSOLUTION DES IDENTIFIANTS TMDB DES COACHS ===\n');

    const results = [];
    for (const coach of COACH_REGISTRY) {
        process.stdout.write(`→ ${coach.name} (${coach.id})… `);
        try {
            const result = await resolveCoach(coach);
            results.push(result);
            const icon = result.status === 'RÉSOLU' ? '✓' : result.status === 'À CONFIRMER' ? '?' : '✗';
            console.log(
                `${icon} ${result.status} — TMDB ${result.tmdbId || 'n/a'} (confiance ${result.confidence}, via ${result.method})`
            );
        } catch (err) {
            console.log(`✗ ERREUR : ${err.message}`);
            results.push({
                id: coach.id,
                name: coach.name,
                imdbId: coach.imdbId,
                tmdbId: null,
                tmdbName: null,
                confidence: 0,
                method: 'error',
                status: 'ERREUR',
                error: err.message,
                candidates: [],
            });
        }
    }

    const report = {
        generatedAt: new Date().toISOString(),
        threshold: CONFIDENCE_THRESHOLD,
        stats: tmdb.stats(),
        summary: {
            resolved: results.filter((r) => r.status === 'RÉSOLU').length,
            toConfirm: results.filter((r) => r.status === 'À CONFIRMER').length,
            notFound: results.filter((r) => r.status === 'INTROUVABLE').length,
            errors: results.filter((r) => r.status === 'ERREUR').length,
        },
        results,
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2), 'utf8');

    console.log('\n--- SYNTHÈSE ---');
    console.log(`Résolus        : ${report.summary.resolved}`);
    console.log(`À confirmer    : ${report.summary.toConfirm}`);
    console.log(`Introuvables   : ${report.summary.notFound}`);
    console.log(`Erreurs        : ${report.summary.errors}`);
    console.log(`Requêtes TMDB  : ${report.stats.requests} (cache : ${report.stats.cacheHits})`);
    console.log(`\nRapport écrit : ${path.relative(process.cwd(), OUTPUT_FILE)}`);

    if (report.summary.toConfirm > 0 || report.summary.notFound > 0) {
        console.log('\n⚠ Des coachs nécessitent une confirmation manuelle (voir le rapport).');
    }
}

main().catch((err) => {
    console.error('Erreur fatale :', err.message);
    process.exit(1);
});
