#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Corrections éditoriales CIBLÉES sur les textes importés
 * ==============================================================================
 * Passe distincte de la réparation d'encodage (`fix_missing_apostrophes.mjs`) :
 * ici on corrige des **fautes objectives** d'un texte importé — accord et
 * ponctuation — laissées de côté par la passe mécanique parce qu'elles touchent
 * la rédaction.
 *
 * Chaque correction est :
 *   • une **phrase exacte** (jamais un mot isolé) ;
 *   • justifiée par une **règle** (accord, ponctuation finale) ;
 *   • listée dans une revue AVANT écriture, et l'application exige `--write`.
 *
 * Usage :
 *   node scripts/fix_editorial_typos.mjs            # revue seule
 *   node scripts/fix_editorial_typos.mjs --write    # applique en base
 * ==============================================================================
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const WRITE = process.argv.includes('--write');

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
};

/**
 * Corrections ciblées. `NN` représente une fin de paragraphe (double saut de
 * ligne) : la ponctuation finale n'a de sens qu'à cette position.
 */
const CORRECTIONS = [
    {
        id: 'mon-frere-yves',
        from: 'amour fraternel, orageux et passionnés',
        to: 'amour fraternel, orageux et passionné',
        rule: 'Accord : « amour » est masculin singulier — « passionné ».',
    },
    {
        id: 'mon-frere-yves',
        from: 'le matelot Yves KERMADEC\n\n',
        to: 'le matelot Yves KERMADEC.\n\n',
        rule: 'Ponctuation finale manquante sur le premier paragraphe.',
    },
    {
        id: 'mon-frere-yves',
        from: 'entre aimer et aimer\n\n',
        to: 'entre aimer et aimer.\n\n',
        rule: 'Ponctuation finale manquante avant le paragraphe suivant.',
    },
];

async function fetchRow(id) {
    const res = await fetch(
        `${URL_BASE}/rest/v1/site_films?select=id,description&id=eq.${encodeURIComponent(id)}`,
        { headers: HEADERS }
    );
    if (!res.ok) throw new Error(`site_films/${id} → ${res.status}`);
    const [row] = await res.json();
    return row;
}

const byId = new Map();
for (const correction of CORRECTIONS) {
    if (!byId.has(correction.id)) byId.set(correction.id, []);
    byId.get(correction.id).push(correction);
}

const review = [];
review.push('# Revue — Corrections éditoriales ciblées (`site_films`)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/fix_editorial_typos.mjs\`.`);
review.push('');
review.push(`Mode : **${WRITE ? 'application en base' : 'revue seule (dry-run)'}**`);
review.push('');
review.push('Passe distincte de la réparation d’encodage : il s’agit ici d’accord et de ponctuation sur un texte importé, corrigés phrase par phrase et justifiés.');
review.push('');

let appliedCount = 0;

for (const [id, corrections] of byId) {
    const row = await fetchRow(id);
    if (!row) {
        console.warn(`⚠️  ${id} introuvable — ignoré.`);
        continue;
    }
    let result = row.description;
    const applied = [];

    for (const correction of corrections) {
        if (!result.includes(correction.from)) continue;
        result = result.split(correction.from).join(correction.to);
        applied.push(correction);
    }

    review.push(`## \`${id}\``);
    review.push('');
    if (!applied.length) {
        review.push('Aucune correction à appliquer (déjà propre).');
        review.push('');
        continue;
    }
    review.push('| Avant | Après | Règle |');
    review.push('|---|---|---|');
    for (const correction of applied) {
        const before = correction.from.replace(/\n/g, '⏎');
        const after = correction.to.replace(/\n/g, '⏎');
        review.push(`| ${before} | ${after} | ${correction.rule} |`);
    }
    review.push('');

    if (WRITE) {
        const res = await fetch(`${URL_BASE}/rest/v1/site_films?id=eq.${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: { ...HEADERS, Prefer: 'return=minimal' },
            body: JSON.stringify({ description: result }),
        });
        if (!res.ok) {
            console.error(`❌ ${id} → ${res.status} ${await res.text()}`);
            continue;
        }
    }
    appliedCount += applied.length;
    console.log(`${WRITE ? 'CORRIGÉ' : '[dry]'} ${id} — ${applied.length} correction(s)`);
}

review.push(`**${appliedCount}** correction(s) ${WRITE ? 'appliquée(s)' : 'à appliquer'}.`);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-corrections-editoriales.md', review.join('\n'), 'utf8');

console.log('');
console.log(`${WRITE ? 'APPLIQUÉ' : 'DRY-RUN'} — ${appliedCount} correction(s).`);
console.log('Revue : plans/revue-corrections-editoriales.md');
