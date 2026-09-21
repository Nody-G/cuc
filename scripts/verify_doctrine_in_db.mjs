/**
 * VÉRIFICATION — DOCTRINE ÉDITORIALE EN BASE SUPABASE
 * ===================================================
 *
 * Contrôle que le contenu persisté en base respecte la doctrine AGENTS.md :
 *
 *  1. TERMINOLOGIE PARKOUR (doctrine §4) — interdiction absolue de « ADD » et
 *     « Art du Déplacement » pour Malik Diouf et les modules d'entraînement.
 *     Seul le terme « Parkour » est autorisé.
 *
 *  2. BADGES CREUX (doctrine §3) — interdiction des faux badges marketing
 *     (HOLLYWOOD ACTION, PRO STAFF, WORLDWIDE, BOX-OFFICE) et du jargon
 *     pseudo-opérationnel (RADAR TACTIQUE, HUB OPÉRATIONNEL, CURSUS ÉLITE).
 *
 * Le scan est RÉCURSIF : il parcourt chaque valeur JSON (chaînes, tableaux,
 * objets imbriqués) afin de détecter les violations cachées dans `content`,
 * `metadata`, `sections`, `settings`, etc.
 *
 * Sort en code 2 si au moins une violation est trouvée (régression).
 *
 * Usage :
 *   node scripts/verify_doctrine_in_db.mjs
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkbkcsypftvspmkfnrfm.supabase.co';
const SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

if (!SERVICE_KEY) {
    console.error('❌ Clé Supabase manquante (SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY).');
    process.exit(1);
}

/** Tables du site vitrine / cockpit à contrôler. */
const SITE_TABLES = [
    'site_pages',
    'site_settings',
    'site_team',
    'site_films',
    'site_partners',
    'site_events',
    'site_disciplines',
    'site_campus_pois',
    'site_sessions',
    'site_inquiries',
    'site_announcements',
    'site_navigation',
    'site_footer',
    'site_social_links',
];

/**
 * Règles de doctrine. Chaque règle porte un identifiant stable et une regex.
 *
 * ATTENTION : la règle `termino-add` utilise une assertion négative pour ne pas
 * confondre l'acronyme banni « ADD » avec le verbe SQL « ADD » (DDL) qui peut
 * apparaître dans des champs de migration ou de documentation.
 */
const RULES = [
    // ── Terminologie Parkour (doctrine §4) ───────────────────────────────────
    {
        id: 'termino-art-du-deplacement',
        label: 'Art du Déplacement (banni — utiliser « Parkour »)',
        re: /art\s+du\s+d[ée]placement/i,
    },
    {
        id: 'termino-add',
        label: 'Acronyme ADD (banni — utiliser « Parkour »)',
        re: /\bADD\b(?!\s+(?:CONSTRAINT|COLUMN|TABLE|INDEX|PRIMARY|FOREIGN|UNIQUE|CHECK|PUBLICATION|IF))/,
    },

    // ── Badges creux (doctrine §3) ───────────────────────────────────────────
    { id: 'badge-hollywood-action', label: 'Badge creux HOLLYWOOD ACTION', re: /hollywood\s+action/i },
    { id: 'badge-pro-staff', label: 'Badge creux PRO STAFF', re: /\bpro\s*staff\b/i },
    { id: 'badge-worldwide', label: 'Badge creux WORLDWIDE', re: /\bworldwide\b/i },
    { id: 'badge-box-office', label: 'Badge creux BOX-OFFICE', re: /\bbox[\s-]?office\b/i },
    { id: 'jargon-radar-tactique', label: 'Jargon RADAR TACTIQUE', re: /radar\s+tactique/i },
    { id: 'jargon-hub-operationnel', label: 'Jargon HUB OPÉRATIONNEL', re: /hub\s+op[ée]rationnel/i },
    { id: 'jargon-cursus-elite', label: 'Jargon CURSUS ÉLITE', re: /cursus\s+[ée]lite/i },
    { id: 'jargon-gps-actif', label: 'Jargon GPS ACTIF', re: /gps\s+actif/i },
    { id: 'jargon-5-paliers', label: 'Jargon 5 PALIERS', re: /5\s+paliers/i },
    { id: 'jargon-code-interne', label: 'Code interne (OD-/INFRA-/MOD-)', re: /\b(?:OD|INFRA|MOD)-\d+/i },
];

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
});

/**
 * Parcourt récursivement une valeur JSON et collecte les violations trouvées.
 *
 * @param {unknown} value  Valeur à inspecter.
 * @param {string}  trail  Chemin JSON courant (pour le rapport).
 * @param {Array}   out    Accumulateur de violations.
 */
function collectViolations(value, trail, out) {
    if (value == null) return;

    if (typeof value === 'string') {
        for (const rule of RULES) {
            const m = value.match(rule.re);
            if (m) {
                out.push({ path: trail, rule: rule.id, label: rule.label, match: m[0] });
            }
        }
        return;
    }

    if (Array.isArray(value)) {
        value.forEach((v, i) => collectViolations(v, `${trail}[${i}]`, out));
        return;
    }

    if (typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
            collectViolations(v, trail ? `${trail}.${k}` : k, out);
        }
    }
}

async function main() {
    console.log('\n=== VÉRIFICATION DOCTRINE ÉDITORIALE EN BASE ===\n');

    let totalViolations = 0;
    const perTable = {};
    const inaccessible = [];

    for (const table of SITE_TABLES) {
        const { data, error } = await supabase.from(table).select('*');

        if (error) {
            inaccessible.push({ table, message: error.message });
            continue;
        }

        const violations = [];
        for (const row of data || []) {
            collectViolations(row, table, violations);
        }

        perTable[table] = { rows: (data || []).length, violations: violations.length };
        totalViolations += violations.length;

        if (violations.length > 0) {
            console.log(`❌ ${table} — ${violations.length} violation(s) sur ${(data || []).length} ligne(s)`);
            for (const v of violations.slice(0, 12)) {
                console.log(`     [${v.rule}] ${v.path} → « ${v.match} »`);
            }
            if (violations.length > 12) {
                console.log(`     … et ${violations.length - 12} de plus`);
            }
        } else {
            console.log(`✅ ${table} — 0 violation (${(data || []).length} ligne(s))`);
        }
    }

    if (inaccessible.length > 0) {
        console.log('\n⚠️  Tables inaccessibles (absentes du cache de schéma) :');
        for (const t of inaccessible) {
            console.log(`   • ${t.table} — ${t.message}`);
        }
    }

    console.log(`\n─────────────────────────────────────────────`);
    console.log(`TOTAL violations doctrine : ${totalViolations}`);

    if (totalViolations > 0) {
        console.error('\nÉCHEC — la doctrine éditoriale n\'est pas respectée en base.');
        process.exit(2);
    }

    console.log('OK — aucune violation de doctrine en base Supabase.');
}

main().catch((err) => {
    console.error('Erreur inattendue :', err);
    process.exit(1);
});
