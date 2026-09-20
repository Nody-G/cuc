/**
 * ==============================================================================
 * CUC — Application des crédits validés dans src/data/team.ts
 * ==============================================================================
 * Lit l'artefact de revue (IMDb par défaut, TMDB en repli), applique les
 * décisions de validation, puis réécrit src/data/team.ts avec :
 *   - notableCredits  (crédits confirmés + nouveaux + non vérifiables conservés)
 *   - metadata.film_roles (rôle par film, pour l'affichage CoachDetailClient)
 *   - doubledActors   (inchangé, sauf enrichissement explicite)
 *
 * Règles de sécurité :
 *   - Les coachs dont l'identité n'est pas RÉSOLU sont ignorés intégralement.
 *   - Les crédits au statut REJETÉ sont exclus.
 *   - Les crédits NON VÉRIFIABLE sont conservés tels quels (aucune perte).
 *   - Un fichier de sauvegarde .bak est créé avant toute écriture.
 *
 * Usage :
 *   node scripts/apply_verified_coach_credits.mjs --dry-run   (aperçu, défaut)
 *   node scripts/apply_verified_coach_credits.mjs --write     (écriture réelle)
 *   node scripts/apply_verified_coach_credits.mjs --source=tmdb
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { COACH_REGISTRY } from './lib/coach-registry.mjs';
import { loadCurrentTeam } from './lib/credit-verifier.mjs';

const sourceArg = process.argv.find((a) => a.startsWith('--source='));
const SOURCE = sourceArg ? sourceArg.split('=')[1] : 'imdb';

// Par défaut, on applique la sélection CURATÉE (filtre non-cinéma, rôles précis
// préservés, assainissement doctrinal). Utiliser --raw pour appliquer le vrac brut.
const USE_RAW = process.argv.includes('--raw');

const RAW_JSON = path.resolve(
    process.cwd(),
    'scripts',
    SOURCE === 'tmdb' ? 'coach_credits_review.json' : 'coach_credits_review_imdb.json',
);
const CURATED_JSON = path.resolve(
    process.cwd(),
    'scripts',
    SOURCE === 'tmdb' ? 'coach_credits_curated.json' : 'coach_credits_curated_imdb.json',
);

const REVIEW_JSON =
    !USE_RAW && fs.existsSync(CURATED_JSON) ? CURATED_JSON : RAW_JSON;
const TEAM_FILE = path.resolve(process.cwd(), 'src', 'data', 'team.ts');

/**
 * Échappe une chaîne pour insertion dans un littéral TypeScript à quotes simples.
 * @param {string} str
 * @returns {string}
 */
function escapeTs(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Construit la liste finale de crédits pour un coach à partir des entrées vérifiées.
 *
 * @param {any} coachReport
 * @returns {{ credits: string[], filmRoles: Record<string, string> }}
 */
function buildCoachCredits(coachReport) {
    const credits = [];
    const filmRoles = {};
    const seen = new Set();

    // Format CURATÉ : la sélection éditoriale est déjà arbitrée (filtre
    // non-cinéma, rôles précis préservés, assainissement doctrinal). On la
    // reprend telle quelle, sans réinterpréter les statuts.
    if (Array.isArray(coachReport.credits)) {
        for (const credit of coachReport.credits) {
            const year = Number(credit.year);
            const yearPart = Number.isFinite(year) && year > 1900 ? ` (${year})` : '';
            const formatted = credit.formatted
                || `${credit.title}${yearPart} — ${credit.role}`;
            if (seen.has(formatted)) continue;
            seen.add(formatted);
            credits.push(formatted);
            if (credit.title) {
                filmRoles[slugify(credit.title)] = credit.role;
            }
        }
        return { credits, filmRoles };
    }

    for (const entry of coachReport.entries) {
        if (entry.status === 'REJETÉ') continue;

        // Les crédits non vérifiables sont conservés tels quels (aucune perte).
        if (entry.status === 'NON VÉRIFIABLE') {
            const formatted = entry.declaredRole
                ? `${entry.title}${entry.year ? ` (${entry.year})` : ''} — ${entry.declaredRole}`
                : entry.title;
            if (!seen.has(formatted)) {
                seen.add(formatted);
                credits.push(formatted);
            }
            continue;
        }

        // Rôle : IMDb en priorité, puis TMDB, puis déclaration, puis repli.
        const role =
            entry.imdbRole || entry.tmdbRole || entry.declaredRole || 'Cascadeur';
        const formatted = `${entry.title}${entry.year ? ` (${entry.year})` : ''} — ${role}`;
        if (seen.has(formatted)) continue;
        seen.add(formatted);
        credits.push(formatted);

        // Rôle par film : clé = slug dérivé du titre (aligné sur les ids site_films)
        const titleId = entry.imdbTitleId || entry.imdbId || entry.tmdbId;
        if (titleId) {
            filmRoles[slugify(entry.title)] = role;
        }
    }

    return { credits, filmRoles };
}

/**
 * Dérive un slug stable depuis un titre de film.
 * @param {string} title
 * @returns {string}
 */
function slugify(title) {
    return String(title)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Sérialise un membre de l'équipe en littéral TypeScript.
 *
 * @param {any} member
 * @param {string[]} notableCredits
 * @param {Record<string, string>} filmRoles
 * @returns {string}
 */
function serializeMember(member, notableCredits, filmRoles) {
    const lines = [];
    lines.push('  {');
    lines.push(`    id: '${escapeTs(member.id)}',`);
    lines.push(`    name: '${escapeTs(member.name)}',`);
    lines.push(`    role: '${escapeTs(member.role)}',`);
    lines.push(`    title: '${escapeTs(member.title)}',`);

    const specialties = (member.specialties || []).map((s) => `'${escapeTs(s)}'`).join(', ');
    lines.push(`    specialties: [${specialties}],`);
    lines.push(`    bio: '${escapeTs(member.bio)}',`);

    if (member.doubledActors && member.doubledActors.length > 0) {
        const doubled = member.doubledActors.map((d) => `'${escapeTs(d)}'`).join(', ');
        lines.push(`    doubledActors: [${doubled}],`);
    }

    lines.push('    notableCredits: [');
    for (const credit of notableCredits) {
        lines.push(`      '${escapeTs(credit)}',`);
    }
    lines.push('    ],');

    if (member.externalUrl) lines.push(`    externalUrl: '${escapeTs(member.externalUrl)}',`);
    if (member.avatarUrl) lines.push(`    avatarUrl: '${escapeTs(member.avatarUrl)}',`);
    if (member.instagram) lines.push(`    instagram: '${escapeTs(member.instagram)}',`);
    if (member.imdb) lines.push(`    imdb: '${escapeTs(member.imdb)}',`);

    const roleKeys = Object.keys(filmRoles);
    if (roleKeys.length > 0) {
        lines.push('    metadata: {');
        lines.push('      film_roles: {');
        for (const key of roleKeys) {
            lines.push(`        '${escapeTs(key)}': '${escapeTs(filmRoles[key])}',`);
        }
        lines.push('      },');
        lines.push('    },');
    }

    lines.push('  },');
    return lines.join('\n');
}

async function main() {
    const write = process.argv.includes('--write');

    console.log('=== APPLICATION DES CRÉDITS VALIDÉS DANS src/data/team.ts ===\n');
    console.log(write ? '⚠ MODE ÉCRITURE RÉELLE\n' : 'ℹ MODE APERÇU (--dry-run par défaut)\n');

    if (!fs.existsSync(REVIEW_JSON)) {
        throw new Error(
            `Artefact de revue introuvable : ${path.relative(process.cwd(), REVIEW_JSON)}\n` +
            (SOURCE === 'tmdb'
                ? 'Exécutez d\'abord : node scripts/scrape_coach_credits.mjs'
                : 'Exécutez d\'abord : node scripts/scrape_coach_credits_imdb.mjs')
        );
    }

    const review = JSON.parse(fs.readFileSync(REVIEW_JSON, 'utf8'));
    const currentTeam = loadCurrentTeam();
    const reviewById = new Map(review.coaches.map((c) => [c.id, c]));

    const updatedMembers = [];
    let appliedCount = 0;
    let skippedCount = 0;

    for (const member of currentTeam) {
        const coachReport = reviewById.get(member.id);

        // Le statut de résolution est porté soit à la racine (TMDB), soit dans
        // `identity` (IMDb), soit dans `identityStatus` (artefact curaté).
        const resolutionStatus =
            coachReport?.status
            ?? coachReport?.identity?.status
            ?? coachReport?.identityStatus
            ?? null;

        if (!coachReport || resolutionStatus !== 'RÉSOLU') {
            console.log(`→ ${member.name} — identité non résolue, fiche conservée telle quelle.`);
            updatedMembers.push(member);
            skippedCount++;
            continue;
        }

        const { credits, filmRoles } = buildCoachCredits(coachReport);
        const before = (member.notableCredits || []).length;

        console.log(
            `→ ${member.name} — ${before} crédits déclarés → ${credits.length} crédits validés ` +
            `(${Object.keys(filmRoles).length} rôles par film)`
        );

        updatedMembers.push({ ...member, notableCredits: credits, _filmRoles: filmRoles });
        appliedCount++;
    }

    // Reconstruction du fichier team.ts
    const header = `import { Instructor } from '@/types';\n\nexport const CUC_TEAM: Instructor[] = [\n`;
    const body = updatedMembers
        .map((m) => serializeMember(m, m.notableCredits || [], m._filmRoles || {}))
        .join('\n');
    const footer = `\n];\n`;
    const output = header + body + footer;

    console.log(`\n--- SYNTHÈSE ---`);
    console.log(`Fiches mises à jour : ${appliedCount}`);
    console.log(`Fiches conservées   : ${skippedCount}`);
    console.log(`Taille du fichier   : ${output.length} caractères`);

    if (!write) {
        console.log('\nℹ Aperçu terminé. Relancez avec --write pour appliquer.');
        return;
    }

    // Sauvegarde puis écriture
    const backup = `${TEAM_FILE}.bak`;
    fs.copyFileSync(TEAM_FILE, backup);
    fs.writeFileSync(TEAM_FILE, output, 'utf8');

    console.log(`\n✓ Sauvegarde créée : ${path.relative(process.cwd(), backup)}`);
    console.log(`✓ Fichier écrit    : ${path.relative(process.cwd(), TEAM_FILE)}`);
    console.log('\nProchaine étape : node scripts/sync_coach_credits_supabase.mjs');
}

main().catch((err) => {
    console.error('Erreur fatale :', err.message);
    process.exit(1);
});
