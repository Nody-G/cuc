#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Réparation des APOSTROPHES PERDUES dans les textes éditoriaux FR
 * ==============================================================================
 * L'audit `scripts/audit_text_integrity.mjs` a établi le périmètre exact :
 * **un seul** texte en base est touché (`site_films.description` de
 * `mon-frere-yves`), import dont toutes les apostrophes ont disparu
 * (« dune fraternité », « laidera », « quil », « dinitiation »).
 *
 * Ce script applique une table de correspondance **vérifiée mot à mot** :
 *   - seuls des mots ENTIERS sont remplacés (jamais de sous-chaîne) ;
 *   - la table ne contient que des formes impossibles en français ;
 *   - rien d'autre n'est réécrit : les accords ou la ponctuation restent tels
 *     quels et sont signalés dans la revue (décision éditoriale, pas mécanique).
 *
 * Doctrine : la revue est écrite AVANT toute écriture, et l'application exige
 * `--write`.
 *
 * Usage :
 *   node scripts/fix_missing_apostrophes.mjs            # revue seule (dry)
 *   node scripts/fix_missing_apostrophes.mjs --write    # applique en base
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
 * Formes cassées → forme correcte. Aucune de ces clés n'est un mot français :
 * chaque remplacement est vérifiable, et appliqué sur mot entier.
 */
const REPAIRS = [
    ['quil', "qu'il"],
    ['quils', "qu'ils"],
    ['quune', "qu'une"],
    ['quun', "qu'un"],
    ['quhomme', "qu'homme"],
    ['cest', "c'est"],
    ['cetait', "c'était"],
    ['javais', "j'avais"],
    ['jai', "j'ai"],
    ['letait', "l'était"],
    ['lhomme', "l'homme"],
    ['lautre', "l'autre"],
    ['lambiguité', "l'ambiguïté"],
    ['lextravagance', "l'extravagance"],
    ['lattirent', "l'attirent"],
    ['laidera', "l'aidera"],
    ['laimer', "l'aimer"],
    ['senivre', "s'enivre"],
    ['davoir', "d'avoir"],
    ['dinitiation', "d'initiation"],
    ['detre', "d'être"],
    ['dYves', "d'Yves"],
    ['nayant', "n'ayant"],
    ['nimporte', "n'importe"],
];

/**
 * Cas AMBIGUS traités par phrase exacte : « Dune » est aussi un nom propre
 * (la planète, le film) et « dune » un nom commun. On ne les remplace donc
 * jamais au mot isolé — seulement dans un contexte qui ne laisse aucun doute.
 */
const CONTEXTUAL_REPAIRS = [
    ['récit dune fraternité', "récit d'une fraternité"],
    ['ou dun amour fraternel', "ou d'un amour fraternel"],
    ['Dun côté', "D'un côté"],
];

/** Applique la table sur mot entier, en conservant la casse initiale. */
function repairText(text) {
    let result = text;
    const applied = [];

    for (const [broken, fixed] of CONTEXTUAL_REPAIRS) {
        if (result.includes(broken)) {
            result = result.split(broken).join(fixed);
            applied.push(`${broken} → ${fixed}`);
        }
    }

    /**
     * Frontières UNICODE : `\b` en JavaScript est ASCII, donc « é » compte comme
     * un non-mot — « Géquil » était vu comme le mot « quil » et devenait
     * « Géqu'il » (détecté par la revue avant écriture). On exige donc un
     * caractère qui n'est NI lettre NI chiffre au sens Unicode.
     */
    const wordPattern = (word) =>
        new RegExp(`(?<![\\p{L}\\p{N}])${word}(?![\\p{L}\\p{N}])`, 'gu');

    for (const [broken, fixed] of REPAIRS) {
        const pattern = wordPattern(broken);
        const uppercase = broken.charAt(0).toUpperCase() + broken.slice(1);
        const upperPattern = wordPattern(uppercase);
        const fixedUpper = fixed.charAt(0).toUpperCase() + fixed.slice(1);
        if (pattern.test(result)) {
            result = result.replace(pattern, fixed);
            applied.push(`${broken} → ${fixed}`);
        }
        if (upperPattern.test(result)) {
            result = result.replace(upperPattern, fixedUpper);
            applied.push(`${uppercase} → ${fixedUpper}`);
        }
    }
    return { result, applied };
}

async function rows(path) {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`${path} → ${res.status}`);
    return res.json();
}

const films = await rows('site_films?select=id,description');
const brokenRe = new RegExp(
    `(?<![\\p{L}\\p{N}])(${REPAIRS.map(([broken]) => broken).join('|')})(?![\\p{L}\\p{N}])`,
    'u'
);
const targets = films.filter(
    (film) => typeof film.description === 'string' && brokenRe.test(film.description)
);

const review = [];
review.push('# Revue — Réparation des apostrophes perdues (`site_films`)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/fix_missing_apostrophes.mjs\`.`);
review.push('');
review.push(`Mode : **${WRITE ? 'application en base' : 'revue seule (dry-run)'}**`);
review.push('');
review.push(`Fiches concernées : **${targets.length}** — mots réparés : ${REPAIRS.length} formes connues.`);
review.push('');

let fixedCount = 0;
for (const film of targets) {
    const { result, applied } = repairText(film.description);
    if (result === film.description) continue;

    review.push(`## \`${film.id}\``);
    review.push('');
    review.push(`Remplacements : ${applied.join(' · ')}`);
    review.push('');
    review.push('Avant / après (extrait) :');
    review.push('');
    review.push('```');
    review.push(`AVANT : ${film.description.slice(0, 220)}…`);
    review.push(`APRÈS : ${result.slice(0, 220)}…`);
    review.push('```');
    review.push('');

    if (WRITE) {
        const res = await fetch(`${URL_BASE}/rest/v1/site_films?id=eq.${encodeURIComponent(film.id)}`, {
            method: 'PATCH',
            headers: { ...HEADERS, Prefer: 'return=minimal' },
            body: JSON.stringify({ description: result }),
        });
        if (!res.ok) {
            console.error(`❌ ${film.id} → ${res.status} ${await res.text()}`);
            continue;
        }
    }
    fixedCount += 1;
    console.log(`${WRITE ? 'RÉPARÉ' : '[dry]'} ${film.id} — ${applied.length} remplacement(s)`);
}

review.push('## Points non corrigés (décision éditoriale)');
review.push('');
review.push(
    'Les accords et la ponctuation du texte importé n’ont pas été touchés par cette passe mécanique : « un amour fraternel, orageux et passionnés » (accord), phrases finales sans point dans la fiche `mon-frere-yves`. Une relecture éditoriale peut les reprendre — ce n’est pas un travail de réparation d’encodage.'
);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-apostrophes-reparees.md', review.join('\n'), 'utf8');

console.log('');
console.log(`${WRITE ? 'APPLIQUÉ' : 'DRY-RUN'} — ${fixedCount} fiche(s) ${WRITE ? 'réparée(s)' : 'à réparer'}.`);
console.log('Revue : plans/revue-apostrophes-reparees.md');
