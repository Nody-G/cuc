/**
 * ==============================================================================
 * CUC — Scraping des crédits de tournage des coachs via IMDb (source primaire)
 * ==============================================================================
 * IMDb est la source la plus exhaustive pour les cascadeurs (ex. Amédéo
 * Cazzella : 119 crédits IMDb contre 0 sur TMDB). Ce script :
 *
 *   1. résout l'identité IMDb de chaque coach (registre, puis suggestion API) ;
 *   2. récupère la filmographie complète via l'API GraphQL publique d'IMDb ;
 *   3. filtre les crédits Stunts / Crew pertinents (et Acting si Parkour) ;
 *   4. normalise les catégories IMDb vers la terminologie CUC sobre ;
 *   5. croise avec les crédits déclarés dans src/data/team.ts ;
 *   6. produit un artefact de revue (JSON + Markdown).
 *
 * AUCUNE ÉCRITURE EN BASE. La validation humaine reste obligatoire.
 *
 * Usage :
 *   node scripts/scrape_coach_credits_imdb.mjs [--no-cache]
 * ==============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { imdb } from './lib/imdb-client.mjs';
import { COACH_REGISTRY } from './lib/coach-registry.mjs';
import {
    normalizeImdbCategory,
    enforceEditorialDoctrine,
    dedupeCredits,
    mergeCreditsByTitle,
    formatCreditString,
} from './lib/credit-normalizer.mjs';
import {
    loadCurrentTeam,
    buildVerificationReport,
} from './lib/credit-verifier.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const RESOLUTION_FILE = path.join(__dirname, 'imdb_person_resolution.json');
const REVIEW_JSON = path.join(__dirname, 'coach_credits_review_imdb.json');
const REVIEW_MD = path.join(ROOT, 'plans', 'revue-credits-coachs-imdb.md');

const noCache = process.argv.includes('--no-cache');
if (noCache) imdb.setCacheEnabled(false);

/** Catégories IMDb retenues comme crédits de cascade pertinents. */
const STUNT_CATEGORIES = new Set([
    'stunts',
    'stunt coordinator',
    'stunt double',
    'fight choreographer',
    'utility stunts',
    'stunt driver',
    'stunt performer',
    'additional crew',
    'second unit director',
    'armorer',
    'rigging',
    'special effects',
]);

/** Catégories d'acting retenues uniquement pour les profils Parkour. */
const PARKOUR_ACTING_DISCIPLINES = /parkour|acrobat|freerun/i;

function isStuntCategory(category) {
    if (!category) return false;
    return STUNT_CATEGORIES.has(category.trim().toLowerCase());
}

function isRelevantCredit(credit, coach) {
    const category = (credit.category || '').trim().toLowerCase();
    if (isStuntCategory(category)) return true;
    // Acting : uniquement pour les profils Parkour (Yamakasi, etc.).
    if (category === 'actor' || category === 'actress') {
        return PARKOUR_ACTING_DISCIPLINES.test(coach.discipline || '');
    }
    return false;
}

function log(msg) {
    process.stdout.write(`${msg}\n`);
}

async function resolveIdentities() {
    log('=== RÉSOLUTION DES IDENTITÉS IMDb ===\n');
    const results = [];

    for (const coach of COACH_REGISTRY) {
        if (coach.imdbId) {
            log(`→ ${coach.name}… identifiant IMDb connu (${coach.imdbId})`);
            results.push({
                id: coach.id,
                name: coach.name,
                imdbId: coach.imdbId,
                method: 'registry',
                status: 'RÉSOLU',
            });
            continue;
        }

        log(`→ ${coach.name}… recherche nominative…`);
        try {
            const match = await imdb.resolveImdbId(coach.name);
            if (match) {
                log(`  ✓ RÉSOLU — ${match.imdbId} (${match.description})`);
                results.push({
                    id: coach.id,
                    name: coach.name,
                    imdbId: match.imdbId,
                    method: 'suggestion',
                    status: 'RÉSOLU',
                    description: match.description,
                });
            } else {
                log('  ✗ INTROUVABLE');
                results.push({
                    id: coach.id,
                    name: coach.name,
                    imdbId: null,
                    method: 'suggestion',
                    status: 'INTROUVABLE',
                });
            }
        } catch (err) {
            log(`  ✗ ERREUR — ${err.message}`);
            results.push({
                id: coach.id,
                name: coach.name,
                imdbId: null,
                method: 'suggestion',
                status: 'ERREUR',
                error: err.message,
            });
        }
    }

    fs.writeFileSync(
        RESOLUTION_FILE,
        JSON.stringify(
            {
                generatedAt: new Date().toISOString(),
                stats: imdb.stats,
                results,
            },
            null,
            2,
        ),
        'utf8',
    );
    log(`\nRapport écrit : ${path.relative(ROOT, RESOLUTION_FILE)}\n`);
    return results;
}

async function scrapeCoach(coach, identity) {
    if (!identity.imdbId) {
        return { coach, identity, credits: [], error: null };
    }
    try {
        const person = await imdb.getPersonCredits(identity.imdbId);
        if (!person) {
            return {
                coach,
                identity,
                credits: [],
                error: 'Fiche IMDb introuvable',
            };
        }

        const relevant = person.credits.filter((c) =>
            isRelevantCredit(c, coach),
        );

        const normalized = relevant.map((c) => {
            const role = normalizeImdbCategory(c.category, coach.discipline);
            return {
                title: c.title,
                originalTitle: c.originalTitle,
                year: c.year,
                titleType: c.titleType,
                titleTypeLabel: c.titleTypeLabel,
                imdbTitleId: c.titleId,
                imdbCategory: c.category,
                role,
                characters: c.characters,
                source: 'imdb',
            };
        });

        const deduped = dedupeCredits(normalized);
        const merged = mergeCreditsByTitle(deduped);

        return {
            coach,
            identity,
            credits: merged,
            totalImdb: person.total,
            error: null,
        };
    } catch (err) {
        return { coach, identity, credits: [], error: err.message };
    }
}

function renderMarkdown(report) {
    const lines = [];
    lines.push('# Revue des crédits de tournage — Coachs CUC (source IMDb)');
    lines.push('');
    lines.push(
        `> Généré le ${new Date(report.generatedAt).toLocaleString('fr-FR')} depuis l'API IMDb.`,
    );
    lines.push('>');
    lines.push(
        '> **Aucune donnée n\'a été écrite.** Ce document sert à valider, corriger ou rejeter',
    );
    lines.push(
        '> chaque crédit avant application dans `src/data/team.ts` et Supabase.',
    );
    lines.push('');
    lines.push('## Synthèse globale');
    lines.push('');
    lines.push('| Statut | Nombre |');
    lines.push('| --- | --- |');
    lines.push(`| ✅ CONFIRMÉ | ${report.globalSummary.confirmed} |`);
    lines.push(`| 🆕 NOUVEAU | ${report.globalSummary.new} |`);
    lines.push(
        `| ❓ NON VÉRIFIABLE | ${report.globalSummary.unverifiable} |`,
    );
    lines.push(
        `| ⚠️ CONTRADICTOIRE | ${report.globalSummary.contradictory} |`,
    );
    lines.push('');
    lines.push('## Légende');
    lines.push('');
    lines.push(
        '- ✅ **CONFIRMÉ** — crédit présent dans IMDb et cohérent avec la déclaration actuelle.',
    );
    lines.push(
        '- 🆕 **NOUVEAU** — crédit trouvé dans IMDb, absent de la fiche actuelle.',
    );
    lines.push('- ⚠️ **CONTRADICTOIRE** — rôle déclaré différent du rôle IMDb.');
    lines.push(
        '- ❓ **NON VÉRIFIABLE** — crédit déclaré introuvable dans IMDb (à arbitrer).',
    );
    lines.push('');
    lines.push('---');
    lines.push('');

    for (const entry of report.coaches) {
        const { id, name, identity, entries, summary } = entry;
        const declaredCount = entry.declaredCreditsCount ?? 0;
        const scrapedCount = entry.scrapedCreditsCount ?? 0;
        lines.push(`## ${name} (\`${id}\`)`);
        lines.push('');
        lines.push(
            `IMDb : \`${identity?.imdbId ?? 'non résolu'}\` · Méthode : ${identity?.method ?? 'n/a'}`,
        );
        lines.push('');
        lines.push(
            `Crédits déclarés : **${declaredCount}** · Crédits IMDb : **${scrapedCount}**`,
        );
        lines.push('');

        if (!identity?.imdbId) {
            lines.push(
                '> ⚠️ **Identité non résolue.** Aucun crédit ne sera appliqué sans confirmation manuelle.',
            );
            lines.push('');
            lines.push('---');
            lines.push('');
            continue;
        }

        if (!entries.length) {
            lines.push('_Aucun crédit exploitable._');
            lines.push('');
            lines.push('---');
            lines.push('');
            continue;
        }

        lines.push('| Statut | Titre | Année | Rôle IMDb | Rôle déclaré | Note |');
        lines.push('| --- | --- | --- | --- | --- | --- |');
        for (const e of entries) {
            const icon =
                e.status === 'CONFIRMÉ'
                    ? '✅'
                    : e.status === 'NOUVEAU'
                        ? '🆕'
                        : e.status === 'CONTRADICTOIRE'
                            ? '⚠️'
                            : '❓';
            const title = (e.title || '—').replace(/\|/g, '\\|');
            const year = e.year ?? '—';
            const imdbRole = (e.imdbRole || '—').replace(/\|/g, '\\|');
            const declared = (e.declaredRole || '—').replace(/\|/g, '\\|');
            const note = (e.note || '').replace(/\|/g, '\\|');
            lines.push(
                `| ${icon} ${e.status} | ${title} | ${year} | ${imdbRole} | ${declared} | ${note} |`,
            );
        }
        lines.push('');
        lines.push('---');
        lines.push('');
    }

    lines.push('## Prochaine étape');
    lines.push('');
    lines.push(
        '1. Corriger `scripts/coach_credits_review_imdb.json` : passer un statut à `REJETÉ`, corriger `imdbRole`.',
    );
    lines.push(
        '2. Exécuter `node scripts/apply_verified_coach_credits.mjs` pour écrire dans `src/data/team.ts`.',
    );
    lines.push(
        '3. Exécuter `node scripts/sync_coach_credits_supabase.mjs` pour synchroniser Supabase.',
    );
    lines.push('');

    return lines.join('\n');
}

async function main() {
    log('=== SCRAPING DES CRÉDITS DE TOURNAGE DES COACHS (IMDb) ===\n');

    const identities = await resolveIdentities();
    const identityById = new Map(identities.map((i) => [i.id, i]));

    log('=== RÉCUPÉRATION DES FILMOGRAPHIES ===\n');
    const currentTeam = loadCurrentTeam();
    const inputs = [];

    for (const coach of COACH_REGISTRY) {
        const identity = identityById.get(coach.id);
        if (!identity?.imdbId) {
            log(`→ ${coach.name} — identité non résolue, ignoré.`);
            inputs.push({
                coach,
                identity,
                credits: [],
                currentMember: currentTeam.find((m) => m.id === coach.id),
            });
            continue;
        }

        const result = await scrapeCoach(coach, identity);
        if (result.error) {
            log(`→ ${coach.name} — ERREUR : ${result.error}`);
        } else {
            log(
                `→ ${coach.name} (${identity.imdbId})… ${result.credits.length} crédits retenus sur ${result.totalImdb} au total`,
            );
        }
        inputs.push({
            coach,
            identity,
            credits: result.credits,
            currentMember: currentTeam.find((m) => m.id === coach.id),
        });
    }

    const report = buildVerificationReport(inputs, { sourceLabel: 'IMDb' });

    fs.writeFileSync(REVIEW_JSON, JSON.stringify(report, null, 2), 'utf8');
    fs.writeFileSync(REVIEW_MD, renderMarkdown(report), 'utf8');

    log('\n--- SYNTHÈSE GLOBALE ---');
    log(`✅ CONFIRMÉ         : ${report.globalSummary.confirmed}`);
    log(`🆕 NOUVEAU          : ${report.globalSummary.new}`);
    log(`❓ NON VÉRIFIABLE   : ${report.globalSummary.unverifiable}`);
    log(`⚠️ CONTRADICTOIRE   : ${report.globalSummary.contradictory}`);
    log('');
    log(`Requêtes IMDb : ${imdb.stats.requests} (cache : ${imdb.stats.cacheHits})`);
    log('');
    log(`Artefact JSON : ${path.relative(ROOT, REVIEW_JSON)}`);
    log(`Rapport revue : ${path.relative(ROOT, REVIEW_MD)}`);
    log('');
    log('⚠ Aucune donnée n\'a été écrite. Validez le rapport avant application.');
}

main().catch((err) => {
    console.error('\nERREUR FATALE :', err.message);
    process.exitCode = 1;
});
