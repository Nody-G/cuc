#!/usr/bin/env node
/**
 * verify_coaches_imdb_veracity.mjs
 * ---------------------------------------------------------------------------
 * Vérifie la véracité IMDb de chaque coach CUC :
 *   - l'identité IMDb est-elle résolue (imdbId non nul) ?
 *   - combien de crédits sont confirmés / nouveaux / contradictoires /
 *     non vérifiables ?
 *   - le nom IMDb correspond-il exactement au nom du coach ?
 *
 * Contexte (demande utilisateur) :
 *   « trouve un moyen de trouver toutes les infos sur mes gars et verifie leur
 *   veracité sur imdb au cas ou. n oublie pas que niels a juste fait "Sous la
 *   scene" et aucun autre film ».
 *
 * Entrée  : scripts/coach_credits_review_imdb.json
 * Sortie  : scripts/coaches_imdb_veracity.json  (rapport de véracité)
 *
 * Usage :
 *   node scripts/verify_coaches_imdb_veracity.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const INPUT_JSON = path.join(__dirname, 'coach_credits_review_imdb.json');
const OUTPUT_JSON = path.join(__dirname, 'coaches_imdb_veracity.json');

/** Normalise un nom pour comparaison (accents, casse, ponctuation). */
function normalizeName(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function main() {
    if (!fs.existsSync(INPUT_JSON)) {
        console.error(`Rapport introuvable : ${path.relative(ROOT, INPUT_JSON)}`);
        process.exit(1);
    }

    const report = JSON.parse(fs.readFileSync(INPUT_JSON, 'utf8'));

    const results = [];
    const global = {
        coaches: 0,
        resolved: 0,
        unresolved: 0,
        confirmed: 0,
        new: 0,
        contradictory: 0,
        unverifiable: 0,
    };

    for (const coach of report.coaches) {
        const identity = coach.identity || {};
        const resolved = Boolean(coach.imdbId) && identity.status === 'RÉSOLU';

        // Comptage par statut.
        const counts = { 'CONFIRMÉ': 0, 'NOUVEAU': 0, 'CONTRADICTOIRE': 0, 'NON VÉRIFIABLE': 0 };
        for (const entry of coach.entries || []) {
            if (counts[entry.status] !== undefined) counts[entry.status] += 1;
        }

        // Vérification du nom : le nom IMDb doit correspondre au nom du coach.
        const nameMatch = resolved
            ? normalizeName(identity.name) === normalizeName(coach.name)
            : null;

        const flags = [];
        if (!resolved) flags.push('IDENTITÉ NON RÉSOLUE');
        if (resolved && nameMatch === false) flags.push('NOM IMDb DIFFÉRENT');
        if (counts['NON VÉRIFIABLE'] > 0) {
            flags.push(`${counts['NON VÉRIFIABLE']} crédit(s) non vérifiable(s)`);
        }

        results.push({
            id: coach.id,
            name: coach.name,
            imdbId: coach.imdbId || null,
            imdbName: identity.name || null,
            identityStatus: identity.status || 'INCONNU',
            resolved,
            nameMatch,
            declaredCreditsCount: coach.declaredCreditsCount ?? null,
            scrapedCreditsCount: coach.scrapedCreditsCount ?? null,
            counts,
            flags,
        });

        global.coaches += 1;
        if (resolved) global.resolved += 1; else global.unresolved += 1;
        global.confirmed += counts['CONFIRMÉ'];
        global.new += counts['NOUVEAU'];
        global.contradictory += counts['CONTRADICTOIRE'];
        global.unverifiable += counts['NON VÉRIFIABLE'];
    }

    const output = {
        generatedAt: new Date().toISOString(),
        source: 'imdb',
        global,
        coaches: results,
    };
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2), 'utf8');

    console.log('--- VÉRACITÉ IMDb DES COACHS ---');
    console.log(`Coachs analysés      : ${global.coaches}`);
    console.log(`Identités résolues   : ${global.resolved}`);
    console.log(`Identités non résolues: ${global.unresolved}`);
    console.log(`Crédits confirmés    : ${global.confirmed}`);
    console.log(`Crédits nouveaux     : ${global.new}`);
    console.log(`Crédits contradictoires: ${global.contradictory}`);
    console.log(`Crédits non vérifiables: ${global.unverifiable}`);
    console.log('');
    for (const c of results) {
        const flag = c.flags.length ? ` ⚠ ${c.flags.join(' · ')}` : '';
        console.log(
            `  ${c.name.padEnd(20)} ${(c.imdbId || '—').padEnd(12)} ` +
            `${c.identityStatus.padEnd(12)}${flag}`
        );
    }
    console.log('');
    console.log(`✓ JSON : ${path.relative(ROOT, OUTPUT_JSON)}`);
}

main();
