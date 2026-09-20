#!/usr/bin/env node
/**
 * curate_coach_credits.mjs
 * ---------------------------------------------------------------------------
 * Transforme le rapport IMDb brut (scripts/coach_credits_review_imdb.json)
 * en une sélection éditoriale publiable pour les fiches coachs CUC.
 *
 * Entrée  : scripts/coach_credits_review_imdb.json
 * Sorties : scripts/coach_credits_curated_imdb.json   (données curatées)
 *           plans/revue-credits-coachs-curated.md      (revue lisible)
 *
 * Doctrine (AGENTS.md) :
 *   - Zéro invention : aucun crédit créé, uniquement filtre + fusion.
 *   - Zéro texte orphelin : chaque crédit conservé porte sa source IMDb.
 *   - Sobriété : pas de badge, pas de superlatif, terminologie Parkour.
 *
 * Usage :
 *   node scripts/curate_coach_credits.mjs
 *   node scripts/curate_coach_credits.mjs --limit=30
 *   node scripts/curate_coach_credits.mjs --show-excluded
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    curateReport,
    formatCuratedCredit,
    isRichRole,
} from './lib/credit-curator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const INPUT_JSON = path.join(__dirname, 'coach_credits_review_imdb.json');
const OUTPUT_JSON = path.join(__dirname, 'coach_credits_curated_imdb.json');
const OUTPUT_MD = path.join(ROOT, 'plans', 'revue-credits-coachs-curated.md');

// ---------------------------------------------------------------------------
// Arguments CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
    const args = { limit: 24, showExcluded: false };
    for (const raw of argv.slice(2)) {
        if (raw.startsWith('--limit=')) {
            const n = Number.parseInt(raw.split('=')[1], 10);
            if (Number.isFinite(n) && n > 0) args.limit = n;
        } else if (raw === '--show-excluded') {
            args.showExcluded = true;
        }
    }
    return args;
}

// ---------------------------------------------------------------------------
// Rendu Markdown
// ---------------------------------------------------------------------------

function renderHeader(report, globalStats, limit) {
    const generatedAt = report.generatedAt || new Date().toISOString();
    const lines = [];
    lines.push('# Revue curatée des crédits — Coachs CUC (source IMDb)');
    lines.push('');
    lines.push(`> Généré le ${generatedAt} — curation éditoriale du rapport IMDb brut.`);
    lines.push('> Plafond par coach : **' + limit + ' crédits**.');
    lines.push('');
    lines.push('## Synthèse globale');
    lines.push('');
    lines.push('| Indicateur | Valeur |');
    lines.push('| --- | --- |');
    lines.push(`| Coachs traités | ${globalStats.coaches} |`);
    lines.push(`| Crédits bruts analysés | ${globalStats.totalRaw} |`);
    lines.push(`| Crédits retenus (publiables) | ${globalStats.totalKept} |`);
    lines.push(`| Exclus — contenu non cinématographique | ${globalStats.totalExcludedNonCinema} |`);
    lines.push(`| Exclus — au-delà du plafond éditorial | ${globalStats.totalExcludedOverLimit} |`);
    lines.push(`| Rôles précis conservés | ${globalStats.totalRichRoles} |`);
    lines.push('');
    lines.push('## Légende');
    lines.push('');
    lines.push('- **CONFIRMÉ** : rôle cohérent entre IMDb et la déclaration actuelle.');
    lines.push('- **NOUVEAU** : crédit IMDb non déclaré, vérifié sur la fiche IMDb du coach.');
    lines.push('- **CONTRADICTOIRE** : rôle déclaré plus précis que la catégorie IMDb — le rôle déclaré est conservé.');
    lines.push('- **NON VÉRIFIABLE** : crédit déclaré introuvable sur IMDb — conservé tel quel, à arbitrer.');
    lines.push('');
    lines.push('---');
    lines.push('');
    return lines.join('\n');
}

function renderCoach(coach, showExcluded) {
    const lines = [];
    const identity = coach.identityStatus || 'INCONNU';
    lines.push(`## ${coach.name} (\`${coach.id}\`)`);
    lines.push('');
    lines.push(`- Identité IMDb : **${identity}**`);
    lines.push(`- Crédits bruts : ${coach.stats.total}`);
    lines.push(`- Crédits retenus : **${coach.stats.kept}**`);
    lines.push(`- Exclus (non cinéma) : ${coach.stats.excludedNonCinema}`);
    lines.push(`- Exclus (plafond) : ${coach.stats.excludedOverLimit}`);
    lines.push(`- Rôles précis : ${coach.stats.richRoles}`);
    lines.push('');

    if (coach.curated.length === 0) {
        lines.push('_Aucun crédit publiable retenu._');
        lines.push('');
        lines.push('---');
        lines.push('');
        return lines.join('\n');
    }

    lines.push('| # | Titre | Année | Rôle retenu | Statut |');
    lines.push('| --- | --- | --- | --- | --- |');
    coach.curated.forEach((c, i) => {
        const year = c.year ?? '—';
        const role = c.role.replace(/\|/g, '\\|');
        const title = c.title.replace(/\|/g, '\\|');
        const marker = isRichRole(c.role) ? ' ★' : '';
        lines.push(`| ${i + 1} | ${title} | ${year} | ${role}${marker} | ${c.status} |`);
    });
    lines.push('');
    lines.push('★ = rôle précis (coordination, doublure nommée, câblage, chorégraphie…).');
    lines.push('');

    if (showExcluded && coach.excluded.length > 0) {
        lines.push('<details>');
        lines.push('<summary>Crédits exclus</summary>');
        lines.push('');
        lines.push('| Titre | Année | Motif |');
        lines.push('| --- | --- | --- |');
        for (const e of coach.excluded) {
            const title = e.title.replace(/\|/g, '\\|');
            lines.push(`| ${title} | ${e.year ?? '—'} | ${e.reason} |`);
        }
        lines.push('');
        lines.push('</details>');
        lines.push('');
    }

    lines.push('---');
    lines.push('');
    return lines.join('\n');
}

function renderFooter() {
    return [
        '## Prochaine étape',
        '',
        '1. Valider cette sélection (ou signaler les crédits à retirer / réintégrer).',
        '2. Appliquer dans `src/data/team.ts` : `npm run coaches:apply -- --write`.',
        '3. Synchroniser vers Supabase : `npm run coaches:sync`.',
        '',
    ].join('\n');
}

// ---------------------------------------------------------------------------
// Programme principal
// ---------------------------------------------------------------------------

function main() {
    const args = parseArgs(process.argv);

    if (!fs.existsSync(INPUT_JSON)) {
        console.error(`Rapport IMDb introuvable : ${path.relative(ROOT, INPUT_JSON)}`);
        console.error('Lancez d\'abord : node scripts/scrape_coach_credits_imdb.mjs');
        process.exit(1);
    }

    const report = JSON.parse(fs.readFileSync(INPUT_JSON, 'utf8'));
    const { coaches, globalStats } = curateReport(report, { limit: args.limit });

    // --- Sortie JSON (données curatées, consommables par apply) ---
    const curatedJson = {
        generatedAt: new Date().toISOString(),
        source: 'imdb',
        curatedFrom: path.basename(INPUT_JSON),
        limit: args.limit,
        globalStats,
        coaches: coaches.map((c) => ({
            id: c.id,
            name: c.name,
            identityStatus: c.identityStatus,
            declaredCreditsCount: c.declaredCreditsCount,
            stats: c.stats,
            credits: c.curated.map((credit) => ({
                title: credit.title,
                year: credit.year,
                role: credit.role,
                status: credit.status,
                imdbId: credit.imdbId,
                score: credit.score,
                formatted: formatCuratedCredit(credit),
            })),
        })),
    };
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(curatedJson, null, 2), 'utf8');

    // --- Sortie Markdown (revue lisible) ---
    const md = [
        renderHeader(report, globalStats, args.limit),
        ...coaches.map((c) => renderCoach(c, args.showExcluded)),
        renderFooter(),
    ].join('\n');
    fs.writeFileSync(OUTPUT_MD, md, 'utf8');

    // --- Rapport console ---
    console.log('--- CURATION ÉDITORIALE ---');
    console.log(`Crédits bruts analysés : ${globalStats.totalRaw}`);
    console.log(`Crédits retenus        : ${globalStats.totalKept}`);
    console.log(`Exclus (non cinéma)    : ${globalStats.totalExcludedNonCinema}`);
    console.log(`Exclus (plafond)       : ${globalStats.totalExcludedOverLimit}`);
    console.log(`Rôles précis conservés : ${globalStats.totalRichRoles}`);
    console.log('');
    for (const c of coaches) {
        console.log(
            `  ${c.name.padEnd(20)} ${String(c.stats.total).padStart(3)} brut → ` +
            `${String(c.stats.kept).padStart(2)} retenus ` +
            `(${c.stats.richRoles} rôles précis, ${c.stats.excludedNonCinema} non cinéma)`
        );
    }
    console.log('');
    console.log(`✓ JSON : ${path.relative(ROOT, OUTPUT_JSON)}`);
    console.log(`✓ Revue : ${path.relative(ROOT, OUTPUT_MD)}`);
}

main();
