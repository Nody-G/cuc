/**
 * CORRECTION — DOCTRINE ÉDITORIALE EN BASE SUPABASE
 * ==================================================
 *
 * Corrige en place les violations de doctrine détectées par
 * `scripts/verify_doctrine_in_db.mjs` :
 *
 *  1. TERMINOLOGIE PARKOUR (doctrine §4) — « ADD » et « Art du Déplacement »
 *     sont remplacés par « Parkour ». C'est la correction PRIORITAIRE : elle
 *     touche l'identité de Malik Diouf et les modules d'entraînement.
 *
 *  2. BADGES CREUX (doctrine §3) — les tags marketing (WORLDWIDE, BOX-OFFICE)
 *     sont remplacés par une taxonomie factuelle :
 *       • WORLDWIDE          → « Cinéma International »
 *       • BOX-OFFICE         → « Blockbuster »
 *       • HOLLYWOOD ACTION   → « Blockbuster »
 *
 *  3. JARGON (doctrine §3) — « 5 paliers » → « 5 niveaux ».
 *
 * Le script est IDEMPOTENT : relancé, il ne trouve plus rien à corriger.
 *
 * Usage :
 *   node scripts/fix_doctrine_in_db.mjs --dry-run   # simulation
 *   node scripts/fix_doctrine_in_db.mjs             # application réelle
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const DRY_RUN = process.argv.includes('--dry-run');

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

if (!SERVICE_KEY) {
    console.error('❌ Clé Supabase manquante.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
});

/**
 * Tables à corriger, avec leur clé primaire (pour l'UPDATE ciblé).
 */
const TABLES = [
    { name: 'site_pages', pk: 'slug' },
    { name: 'site_settings', pk: 'key' },
    { name: 'site_team', pk: 'id' },
    { name: 'site_films', pk: 'id' },
    { name: 'site_partners', pk: 'id' },
    { name: 'site_events', pk: 'id' },
    { name: 'site_campus_pois', pk: 'id' },
    { name: 'site_sessions', pk: 'id' },
    { name: 'site_announcements', pk: 'id' },
    { name: 'site_navigation', pk: 'id' },
    { name: 'site_footer', pk: 'id' },
    { name: 'site_social_links', pk: 'id' },
];

/**
 * Règles de remplacement, appliquées dans l'ordre.
 *
 * ATTENTION : la règle ADD utilise une assertion négative pour ne pas toucher
 * le verbe SQL « ADD » (DDL) qui peut apparaître dans des champs de migration.
 */
const REPLACEMENTS = [
    // ── 1. Terminologie Parkour (PRIORITAIRE) ────────────────────────────────
    { re: /art\s+du\s+d[ée]placement/gi, to: 'Parkour' },
    { re: /\bADD\b(?!\s+(?:CONSTRAINT|COLUMN|TABLE|INDEX|PRIMARY|FOREIGN|UNIQUE|CHECK|PUBLICATION|IF))/g, to: 'Parkour' },

    // ── 2. Badges creux → taxonomie factuelle ────────────────────────────────
    { re: /\bHOLLYWOOD\s+ACTION\b/gi, to: 'Blockbuster' },
    { re: /\bWORLDWIDE\b/gi, to: 'Cinéma International' },
    { re: /\bBOX[\s-]?OFFICE\b/gi, to: 'Blockbuster' },
    { re: /\bPRO\s*STAFF\b/gi, to: 'Équipe technique' },

    // ── 3. Jargon ────────────────────────────────────────────────────────────
    { re: /\b5\s+paliers\b/gi, to: '5 niveaux' },
    { re: /\bRADAR\s+TACTIQUE\b/gi, to: 'Cartographie du campus' },
    { re: /\bHUB\s+OP[ÉE]RATIONNEL\b/gi, to: 'Coordination du campus' },
    { re: /\bCURSUS\s+[ÉE]LITE\b/gi, to: 'Cursus diplômant' },
    { re: /\bGPS\s+ACTIF\b/gi, to: 'Géolocalisation' },
];

/**
 * Détecte si une chaîne contient au moins une violation.
 */
function hasViolation(value) {
    if (typeof value !== 'string') return false;
    return REPLACEMENTS.some((r) => {
        // Regex sans état : on recrée une instance non globale pour le test.
        const testRe = new RegExp(r.re.source, r.re.flags.replace('g', ''));
        return testRe.test(value);
    });
}

/**
 * Applique tous les remplacements à une chaîne.
 */
function applyReplacements(value) {
    let out = value;
    for (const r of REPLACEMENTS) {
        out = out.replace(r.re, r.to);
    }
    return out;
}

/**
 * Parcourt récursivement une valeur JSON et corrige les violations.
 *
 * @returns {{ value: unknown, changed: boolean }}
 */
function fixValue(value) {
    if (typeof value === 'string') {
        if (!hasViolation(value)) return { value, changed: false };
        return { value: applyReplacements(value), changed: true };
    }

    if (Array.isArray(value)) {
        let changed = false;
        const out = value.map((v) => {
            const res = fixValue(v);
            if (res.changed) changed = true;
            return res.value;
        });
        return { value: out, changed };
    }

    if (value && typeof value === 'object') {
        let changed = false;
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            const res = fixValue(v);
            if (res.changed) changed = true;
            out[k] = res.value;
        }
        return { value: out, changed };
    }

    return { value, changed: false };
}

async function main() {
    console.log(`\n=== CORRECTION DOCTRINE ÉDITORIALE EN BASE ${DRY_RUN ? '(DRY-RUN)' : ''} ===\n`);

    let totalRows = 0;
    let totalFields = 0;

    for (const table of TABLES) {
        const { data, error } = await supabase.from(table.name).select('*');

        if (error) {
            console.log(`⚠️  ${table.name} — inaccessible (${error.message})`);
            continue;
        }

        let tableRows = 0;

        for (const row of data || []) {
            const { value: fixed, changed } = fixValue(row);
            if (!changed) continue;

            // On ne renvoie que les colonnes réellement modifiées.
            const patch = {};
            for (const [k, v] of Object.entries(fixed)) {
                if (JSON.stringify(v) !== JSON.stringify(row[k])) {
                    patch[k] = v;
                }
            }

            const fieldCount = Object.keys(patch).length;
            if (fieldCount === 0) continue;

            tableRows++;
            totalRows++;
            totalFields += fieldCount;

            const pkValue = row[table.pk];
            console.log(`  ${table.name} [${table.pk}=${pkValue}] → ${fieldCount} champ(s) : ${Object.keys(patch).join(', ')}`);

            if (!DRY_RUN) {
                const { error: upErr } = await supabase
                    .from(table.name)
                    .update(patch)
                    .eq(table.pk, pkValue);

                if (upErr) {
                    console.error(`     ❌ Échec UPDATE : ${upErr.message}`);
                }
            }
        }

        if (tableRows === 0) {
            console.log(`✅ ${table.name} — rien à corriger`);
        }
    }

    console.log(`\n─────────────────────────────────────────────`);
    console.log(`Lignes corrigées : ${totalRows}`);
    console.log(`Champs corrigés : ${totalFields}`);

    if (DRY_RUN) {
        console.log('\n(DRY-RUN — aucune écriture effectuée)');
    } else {
        console.log('\nOK — corrections appliquées. Relancez verify_doctrine_in_db.mjs pour confirmer.');
    }
}

main().catch((err) => {
    console.error('Erreur inattendue :', err);
    process.exit(1);
});
