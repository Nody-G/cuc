#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Audit d'INTÉGRITÉ DES TEXTES en base
 * ==============================================================================
 * Deux défauts distincts, souvent confondus :
 *
 *   1. DOUBLE-ENCODAGE UTF-8 (« mojibake ») : `Ã©` au lieu de `é`, `â€™` au lieu
 *      de `’`. Le dépôt corrige déjà ce cas dans `src/` via
 *      `scripts/fix_mojibake.mjs` — ce même contrôle est appliqué ICI aux textes
 *      stockés en base (colonnes éditoriales).
 *
 *   2. APOSTROPHES PERDUES À L'IMPORT : « dune fraternité », « laidera »,
 *      « quil », « cest ». Signal retenu, volontairement conservateur :
 *      un texte LONG (> 60 caractères) qui ne contient **aucune** apostrophe
 *      alors qu'il contient au moins une élision connue. Un texte français de
 *      cette taille sans apostrophe est statistiquement impossible à écrire.
 *
 * Aucune écriture : la revue sert de base à une correction relue.
 *
 * Usage : node scripts/audit_text_integrity.mjs
 * ==============================================================================
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

/** Séquences de double-encodage (mêmes paires que `fix_mojibake.mjs`). */
const MOJIBAKE = [
    'Ã©', 'Ã¨', 'Ãª', 'Ã«', 'Ã ', 'Ã¢', 'Ã®', 'Ã¯', 'Ã´', 'Ã¶', 'Ã¹', 'Ã»', 'Ã¼',
    'Ã§', 'Ã‰', 'Ã€', 'Ã”', 'ÃŽ', 'Ã‡', 'Ã™', 'â€™', 'â€œ', 'â€\u009d', 'â€“',
    'â€”', 'â€¦', 'Â°', 'Â«', 'Â»', 'Å“', 'Å’', 'ðŸ',
];

/**
 * Élisions dont l'apostrophe a pu être supprimée à l'import.
 *
 * Cette liste ne contient QUE des formes cassées : les mots français légitimes
 * (`dans`, `lorsque`, `lors`, `dès`…) n'y figurent pas — ils n'ont pas
 * d'apostrophe et gonflaient la revue de faux positifs.
 */
const ELISIONS = [
    'dune', 'dun', 'quil', 'quils', 'quune', 'quun', 'quon', 'cest', 'cetait',
    'javais', 'jai', 'jaime', 'jadore', 'letait', 'lhomme', 'lautre',
    'nayant', 'netaient', 'nimporte', 'senivre', 'sentend', 'sechappe',
    'laidera', 'lattirent', 'dinitiation', 'davoir', 'detre', 'jusqua',
    'lorsquil', 'presquil', 'dabord', 'dailleurs', 'quau', 'quaux',
];
const ELISION_RE = new RegExp(`\\b(${ELISIONS.join('|')})\\b`, 'i');

const TABLES = [
    { label: 'Films', path: 'site_films?select=id,description', fields: ['description'] },
    { label: 'Coachs', path: 'site_team?select=id,bio', fields: ['bio'] },
    { label: 'Partenaires', path: 'site_partners?select=id,description', fields: ['description'] },
    { label: 'Événements', path: 'site_events?select=id,description', fields: ['description'] },
    { label: 'Programmes', path: 'site_programs?select=id,description', fields: ['description'] },
    { label: 'Disciplines', path: 'site_disciplines?select=id,short_desc,full_desc', fields: ['short_desc', 'full_desc'] },
    { label: 'Pages vitrine', path: 'site_pages?select=slug,sections_data', fields: ['sections_data'] },
];

async function rows(path) {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: HEADERS });
    return res.ok ? res.json() : [];
}

const review = [];
review.push('# Revue — Intégrité des textes en base (mojibake & apostrophes)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/audit_text_integrity.mjs\`.`);
review.push('');

let totalMojibake = 0;
let totalApostrophes = 0;

for (const table of TABLES) {
    const list = await rows(table.path);
    const mojibakeRows = [];
    const apostropheRows = [];

    for (const row of list) {
        const texts = [];
        for (const field of table.fields) {
            const value = row[field];
            if (typeof value === 'string') texts.push(value);
            else if (value && typeof value === 'object') texts.push(JSON.stringify(value));
        }
        for (const text of texts) {
            const hits = MOJIBAKE.filter((sequence) => text.includes(sequence));
            if (hits.length) {
                mojibakeRows.push({ id: row.id ?? row.slug, hits, sample: text.slice(0, 140) });
            }
            // Signal apostrophes : texte long, AUCUNE apostrophe (droite ou
            // typographique ’), et au moins une élision cassée connue.
            if (text.length > 60 && !/['’]/.test(text) && ELISION_RE.test(text)) {
                const match = text.match(ELISION_RE);
                apostropheRows.push({
                    id: row.id ?? row.slug,
                    token: match?.[0] ?? '—',
                    sample: text.slice(0, 140),
                });
            }
        }
    }

    totalMojibake += mojibakeRows.length;
    totalApostrophes += apostropheRows.length;

    console.log(
        `${table.label.padEnd(16)} mojibake : ${String(mojibakeRows.length).padStart(3)} · apostrophes : ${apostropheRows.length}`
    );

    if (mojibakeRows.length) {
        review.push(`## ${table.label} — ${mojibakeRows.length} texte(s) double-encodé(s)`);
        review.push('');
        review.push('| Ligne | Séquences | Extrait |');
        review.push('|---|---|---|');
        for (const item of mojibakeRows.slice(0, 40)) {
            review.push(`| \`${item.id}\` | ${item.hits.join(' ')} | ${item.sample.replace(/\|/g, '\\|')} |`);
        }
        review.push('');
    }
    if (apostropheRows.length) {
        review.push(`## ${table.label} — ${apostropheRows.length} texte(s) sans aucune apostrophe`);
        review.push('');
        review.push('| Ligne | Jeton | Extrait |');
        review.push('|---|---|---|');
        for (const item of apostropheRows.slice(0, 40)) {
            review.push(`| \`${item.id}\` | ${item.token} | ${item.sample.replace(/\|/g, '\\|')} |`);
        }
        review.push('');
    }
}

review.unshift('');
review.splice(
    4,
    0,
    `- Double-encodage UTF-8 : **${totalMojibake}** texte(s)`,
    `- Textes longs sans aucune apostrophe : **${totalApostrophes}** texte(s)`
);

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-integrite-textes.md', review.join('\n'), 'utf8');

console.log('');
console.log(`Mojibake : ${totalMojibake} · Apostrophes : ${totalApostrophes}`);
console.log('Revue : plans/revue-integrite-textes.md\n');
