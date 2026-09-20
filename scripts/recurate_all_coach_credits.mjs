#!/usr/bin/env node
/**
 * recurate_all_coach_credits.mjs
 * ---------------------------------------------------------------------------
 * Re-curation SANS PLAFOND des crédits IMDb bruts des coachs CUC.
 *
 * Contexte (demande utilisateur) :
 *   La première curation appliquait un plafond de 24 crédits/coach, ce qui
 *   écartait 616 crédits sur 894. L'utilisateur veut TOUS les crédits
 *   (« je devrais avoir des centaines de rôle de mes coach et surement des
 *   centaines de films »).
 *
 * Doctrine (AGENTS.md) :
 *   - Zéro invention : aucun crédit créé, uniquement filtre + fusion.
 *   - Zéro texte orphelin : chaque crédit conservé porte sa source IMDb.
 *   - Sobriété : 3 libellés de rôle SEULEMENT — Cascadeur, Doublure,
 *     Coordinateur des cascades. Pas de « Parkour », pas de « Câblage ».
 *
 * Entrée  : scripts/coach_credits_review_imdb.json
 * Sortie  : scripts/coach_credits_curated_imdb.json  (tous les crédits)
 *           plans/revue-credits-coachs-curated.md     (revue lisible)
 *
 * Usage :
 *   node scripts/recurate_all_coach_credits.mjs
 *   node scripts/recurate_all_coach_credits.mjs --show-excluded
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    curateReport,
    formatCuratedCredit,
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
    const args = { showExcluded: false };
    for (const raw of argv.slice(2)) {
        if (raw === '--show-excluded') args.showExcluded = true;
    }
    return args;
}

// ---------------------------------------------------------------------------
// Rendu Markdown
// ---------------------------------------------------------------------------

function renderHeader(report, globalStats) {
    const generatedAt = report.generatedAt || new Date().toISOString();
    const lines = [];
    lines.push('# Revue curatée des crédits — Coachs CUC (source IMDb)');
    lines.push('');
    lines.push(`> Généré le ${generatedAt} — curation éditoriale du rapport IMDb brut.`);
    lines.push('> **Aucun plafond** : tous les crédits cinématographiques vérifiables sont conservés.');
    lines.push('> Rôles normalisés en 3 libellés : **Cascadeur**, **Doublure**, **Coordinateur des cascades**.');
    lines.push('');
    lines.push('## Synthèse globale');
    lines.push('');
    lines.push('| Indicateur | Valeur |');
    lines.push('| --- | --- |');
    lines.push(`| Coachs traités | ${globalStats.coaches} |`);
    lines.push(`| Crédits bruts analysés | ${globalStats.totalRaw} |`);
    lines.push(`| Crédits retenus (publiables) | ${globalStats.totalKept} |`);
    lines.push(`| Exclus — contenu non cinématographique | ${globalStats.totalExcludedNonCinema} |`);
    lines.push(`| Exclus — non datés et non rattachés IMDb | ${globalStats.totalExcludedUnverifiable} |`);
    lines.push(`| Coordinateurs des cascades | ${globalStats.totalCoordinators} |`);
    lines.push(`| Doublures | ${globalStats.totalDoublures} |`);
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
    lines.push(`- Exclus (non datés / non IMDb) : ${coach.stats.excludedUnverifiable}`);
    lines.push(`- Coordinateur des cascades : ${coach.stats.coordinators}`);
    lines.push(`- Doublures : ${coach.stats.doublures}`);
    lines.push('');

    if (coach.curated.length === 0) {
        lines.push('_Aucun crédit publiable retenu._');
        lines.push('');
        lines.push('---');
        lines.push('');
        return lines.join('\n');
    }

    lines.push('| # | Titre | Année | Rôle | Statut |');
    lines.push('| --- | --- | --- | --- | --- |');
    coach.curated.forEach((c, i) => {
        const year = c.year ?? '—';
        const role = c.role.replace(/\|/g, '\\|');
        const title = c.title.replace(/\|/g, '\\|');
        lines.push(`| ${i + 1} | ${title} | ${year} | ${role} | ${c.status} |`);
    });
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
    // limit: Infinity => aucun plafond.
    const { coaches, globalStats } = curateReport(report, { limit: Infinity });

    // --- Sortie JSON (données curatées, consommables par apply) ---
    const curatedJson = {
        generatedAt: new Date().toISOString(),
        source: 'imdb',
        curatedFrom: path.basename(INPUT_JSON),
        limit: null,
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
        renderHeader(report, globalStats),
        ...coaches.map((c) => renderCoach(c, args.showExcluded)),
        renderFooter(),
    ].join('\n');
    fs.writeFileSync(OUTPUT_MD, md, 'utf8');

    // --- Rapport console ---
    console.log('--- RE-CURATION SANS PLAFOND ---');
    console.log(`Crédits bruts analysés : ${globalStats.totalRaw}`);
    console.log(`Crédits retenus        : ${globalStats.totalKept}`);
    console.log(`Exclus (non cinéma)    : ${globalStats.totalExcludedNonCinema}`);
    console.log(`Exclus (non datés)     : ${globalStats.totalExcludedUnverifiable}`);
    console.log(`Coordinateurs          : ${globalStats.totalCoordinators}`);
    console.log(`Doublures              : ${globalStats.totalDoublures}`);
    console.log('');
    for (const c of coaches) {
        console.log(
            `  ${c.name.padEnd(20)} ${String(c.stats.total).padStart(3)} brut → ` +
            `${String(c.stats.kept).padStart(3)} retenus ` +
            `(${c.stats.coordinators} coord, ${c.stats.doublures} doublure)`
        );
    }
    console.log('');
    console.log(`✓ JSON : ${path.relative(ROOT, OUTPUT_JSON)}`);
    console.log(`✓ Revue : ${path.relative(ROOT, OUTPUT_MD)}`);
}

main();
