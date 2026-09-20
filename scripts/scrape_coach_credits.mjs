/**
 * ==============================================================================
 * CUC — Scraper des crédits de tournage des coachs (TMDB)
 * ==============================================================================
 * Récupère l'intégralité des participations à des tournages pour chaque coach,
 * via l'API officielle TMDB (films + séries), puis :
 *   1. normalise les crédits (terminologie CUC sobre)
 *   2. les croise avec les crédits déclarés dans src/data/team.ts
 *   3. produit un artefact de revue (JSON + Markdown)
 *
 * AUCUNE ÉCRITURE EN BASE DE DONNÉES. AUCUNE MODIFICATION DE src/data/team.ts.
 * L'application des données se fait après validation, via
 * scripts/apply_verified_coach_credits.mjs.
 *
 * Prérequis : avoir exécuté scripts/resolve_tmdb_person_ids.mjs au préalable.
 *
 * Usage :
 *   node scripts/scrape_coach_credits.mjs
 *   node scripts/scrape_coach_credits.mjs --no-cache   (force le re-fetch)
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { tmdb } from './lib/tmdb-client.mjs';
import { COACH_REGISTRY } from './lib/coach-registry.mjs';
import { normalizeCredits, formatCreditString } from './lib/credit-normalizer.mjs';
import { loadCurrentTeam, buildVerificationReport } from './lib/credit-verifier.mjs';

const RESOLUTION_FILE = path.resolve(process.cwd(), 'scripts', 'tmdb_person_resolution.json');
const REVIEW_JSON = path.resolve(process.cwd(), 'scripts', 'coach_credits_review.json');
const REVIEW_MD = path.resolve(process.cwd(), 'plans', 'revue-credits-coachs.md');

const STATUS_ICONS = {
    'CONFIRMÉ': '✅',
    'NOUVEAU': '🆕',
    'CONTRADICTOIRE': '⚠️',
    'NON VÉRIFIABLE': '❓',
};

/**
 * Charge le rapport de résolution des identifiants TMDB.
 * @returns {any}
 */
function loadResolution() {
    if (!fs.existsSync(RESOLUTION_FILE)) {
        throw new Error(
            `Rapport de résolution introuvable : ${path.relative(process.cwd(), RESOLUTION_FILE)}\n` +
            'Exécutez d\'abord : node scripts/resolve_tmdb_person_ids.mjs'
        );
    }
    return JSON.parse(fs.readFileSync(RESOLUTION_FILE, 'utf8'));
}

/**
 * Récupère et normalise tous les crédits d'un coach.
 *
 * @param {number|string} tmdbId
 * @returns {Promise<any[]>}
 */
async function fetchCoachCredits(tmdbId) {
    const [movieCredits, tvCredits] = await Promise.all([
        tmdb.getMovieCredits(tmdbId),
        tmdb.getTvCredits(tmdbId),
    ]);

    const movies = normalizeCredits(movieCredits?.crew || [], 'movie');
    const tv = normalizeCredits(tvCredits?.crew || [], 'tv');

    return [...movies, ...tv].sort((a, b) => {
        const yearA = Number(a.year) || 0;
        const yearB = Number(b.year) || 0;
        if (yearB !== yearA) return yearB - yearA;
        return b.popularity - a.popularity;
    });
}

/**
 * Génère le rapport Markdown de revue.
 *
 * @param {any} report
 * @returns {string}
 */
function renderMarkdown(report) {
    const lines = [];

    lines.push('# Revue des crédits de tournage — Coachs CUC');
    lines.push('');
    lines.push(`> Généré le ${new Date(report.generatedAt).toLocaleString('fr-FR')} depuis l'API TMDB.`);
    lines.push('>');
    lines.push('> **Aucune donnée n\'a été écrite.** Ce document sert à valider, corriger ou rejeter');
    lines.push('> chaque crédit avant application dans `src/data/team.ts` et Supabase.');
    lines.push('');

    lines.push('## Synthèse globale');
    lines.push('');
    lines.push('| Statut | Nombre |');
    lines.push('| --- | --- |');
    for (const [status, count] of Object.entries(report.globalSummary)) {
        lines.push(`| ${STATUS_ICONS[status] || ''} ${status} | ${count} |`);
    }
    lines.push('');

    lines.push('## Légende');
    lines.push('');
    lines.push('- ✅ **CONFIRMÉ** — crédit présent dans TMDB et cohérent avec la déclaration actuelle.');
    lines.push('- 🆕 **NOUVEAU** — crédit trouvé dans TMDB, absent de la fiche actuelle.');
    lines.push('- ⚠️ **CONTRADICTOIRE** — rôle déclaré différent du rôle TMDB.');
    lines.push('- ❓ **NON VÉRIFIABLE** — crédit déclaré introuvable dans TMDB (à arbitrer).');
    lines.push('');

    for (const coach of report.coaches) {
        lines.push('---');
        lines.push('');
        lines.push(`## ${coach.name} (\`${coach.id}\`)`);
        lines.push('');
        lines.push(
            `IMDb : ${coach.imdbId ? `\`${coach.imdbId}\`` : '_aucun_'} · ` +
            `TMDB : ${coach.tmdbId ? `\`${coach.tmdbId}\`` : '_non résolu_'} · ` +
            `Confiance : ${coach.confidence}`
        );
        lines.push('');
        lines.push(
            `Crédits déclarés : **${coach.declaredCreditsCount}** · ` +
            `Crédits TMDB : **${coach.scrapedCreditsCount}**`
        );
        lines.push('');

        if (coach.status !== 'RÉSOLU') {
            lines.push(`> ⚠️ **Identité non résolue automatiquement** (${coach.status}).`);
            lines.push('> Aucun crédit ne sera appliqué sans confirmation manuelle de l\'identifiant TMDB.');
            lines.push('');
            if (coach.candidates && coach.candidates.length > 0) {
                lines.push('Candidats TMDB proposés :');
                lines.push('');
                lines.push('| TMDB ID | Nom | Département | Score | Connu pour |');
                lines.push('| --- | --- | --- | --- | --- |');
                for (const c of coach.candidates) {
                    lines.push(
                        `| ${c.tmdbId} | ${c.name} | ${c.department || '—'} | ${c.score} | ${(c.knownFor || []).join(', ') || '—'} |`
                    );
                }
                lines.push('');
            }
            continue;
        }

        if (coach.entries.length === 0) {
            lines.push('_Aucun crédit de cascade trouvé dans TMDB._');
            lines.push('');
            continue;
        }

        lines.push('| Statut | Titre | Année | Rôle TMDB | Rôle déclaré | Note |');
        lines.push('| --- | --- | --- | --- | --- | --- |');
        for (const e of coach.entries) {
            const icon = STATUS_ICONS[e.status] || '';
            lines.push(
                `| ${icon} ${e.status} | ${e.title} | ${e.year || '—'} | ${e.tmdbRole || '—'} | ${e.declaredRole || '—'} | ${e.note} |`
            );
        }
        lines.push('');
    }

    lines.push('---');
    lines.push('');
    lines.push('## Prochaine étape');
    lines.push('');
    lines.push('1. Corriger ce document ou le JSON `scripts/coach_credits_review.json` :');
    lines.push('   - passer un statut à `REJETÉ` pour exclure un crédit erroné ;');
    lines.push('   - corriger `tmdbId` pour les coachs « À CONFIRMER » ;');
    lines.push('   - corriger `tmdbRole` pour les crédits contradictoires.');
    lines.push('2. Exécuter `node scripts/apply_verified_coach_credits.mjs` pour écrire dans `src/data/team.ts`.');
    lines.push('3. Exécuter `node scripts/sync_coach_credits_supabase.mjs` pour synchroniser Supabase.');
    lines.push('');

    return lines.join('\n');
}

async function main() {
    const noCache = process.argv.includes('--no-cache');
    if (noCache) {
        tmdb.setCacheEnabled(false);
        console.log('Cache désactivé (--no-cache).\n');
    }

    console.log('=== SCRAPING DES CRÉDITS DE TOURNAGE DES COACHS (TMDB) ===\n');

    const resolution = loadResolution();
    const resolutionById = new Map(resolution.results.map((r) => [r.id, r]));
    const currentTeam = loadCurrentTeam();
    const currentById = new Map(currentTeam.map((m) => [m.id, m]));

    const inputs = [];

    for (const coach of COACH_REGISTRY) {
        const res = resolutionById.get(coach.id);
        const currentMember = currentById.get(coach.id);

        if (!res || res.status !== 'RÉSOLU' || !res.tmdbId) {
            console.log(`→ ${coach.name} — identité non résolue (${res?.status || 'ABSENT'}), ignoré.`);
            inputs.push({
                coach,
                credits: [],
                currentMember,
                resolution: res || null,
            });
            continue;
        }

        process.stdout.write(`→ ${coach.name} (TMDB ${res.tmdbId})… `);
        try {
            const credits = await fetchCoachCredits(res.tmdbId);
            console.log(`${credits.length} crédits de cascade`);
            inputs.push({ coach, credits, currentMember, resolution: res });
        } catch (err) {
            console.log(`ERREUR : ${err.message}`);
            inputs.push({ coach, credits: [], currentMember, resolution: res, error: err.message });
        }
    }

    const report = buildVerificationReport(inputs);

    // Enrichissement avec les métadonnées de résolution
    report.coaches = report.coaches.map((c) => {
        const input = inputs.find((i) => i.coach.id === c.id);
        const res = input?.resolution;
        return {
            ...c,
            tmdbId: res?.tmdbId || null,
            tmdbName: res?.tmdbName || null,
            confidence: res?.confidence ?? 0,
            method: res?.method || 'n/a',
            status: res?.status || 'ABSENT',
            candidates: res?.candidates || [],
            error: input?.error || null,
        };
    });

    // Ajout des crédits normalisés bruts pour l'étape d'application
    report.rawCreditsByCoach = Object.fromEntries(
        inputs.map((i) => [
            i.coach.id,
            i.credits.map((c) => ({
                ...c,
                formatted: formatCreditString(c),
            })),
        ])
    );

    report.stats = tmdb.stats();

    fs.writeFileSync(REVIEW_JSON, JSON.stringify(report, null, 2), 'utf8');
    fs.mkdirSync(path.dirname(REVIEW_MD), { recursive: true });
    fs.writeFileSync(REVIEW_MD, renderMarkdown(report), 'utf8');

    console.log('\n--- SYNTHÈSE GLOBALE ---');
    for (const [status, count] of Object.entries(report.globalSummary)) {
        console.log(`${STATUS_ICONS[status] || ' '} ${status.padEnd(16)} : ${count}`);
    }
    console.log(`\nRequêtes TMDB : ${report.stats.requests} (cache : ${report.stats.cacheHits})`);
    console.log(`\nArtefact JSON : ${path.relative(process.cwd(), REVIEW_JSON)}`);
    console.log(`Rapport revue : ${path.relative(process.cwd(), REVIEW_MD)}`);
    console.log('\n⚠ Aucune donnée n\'a été écrite. Validez le rapport avant application.');
}

main().catch((err) => {
    console.error('Erreur fatale :', err.message);
    process.exit(1);
});
