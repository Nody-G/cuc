#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Réparation des ARTEFACTS TEXTUELS des overlays EN
 *                   (`site_translations`, locale = en)
 * ==============================================================================
 * Trois défauts mesurés par `scripts/_probe_text_artifacts.mjs` sur les payloads
 * de traduction, tous **sans ambiguïté** :
 *
 *   1. ENTITÉ HTML RÉSIDUELLE : une séquence « amp » échappée
 *      (`&` + `amp;`) écrite en clair dans un texte. Elle n'est PAS interprétée
 *      par React : la page affiche la séquence telle quelle. Correction
 *      univoque → `&`.
 *
 *   2. DOUBLES ESPACES : artefacts de saisie (`mot  mot`), jamais voulus.
 *
 *   3. ESPACE AVANT PONCTUATION **EN ANGLAIS** (`unit : Police`, `hell .`) : en
 *      typographie anglaise la ponctuation se colle toujours au mot précédent.
 *      L'ELLIPSE est exclue (`word ...` est une convention admise) : l'inclure
 *      produisait des faux positifs. Cet espace reste **légitime en français**
 *      (` : `, ` ; `, ` ! `, ` ? ` sont requis) : la correction est donc
 *      strictement réservée aux overlays `locale = en`.
 *
 * DOCTRINE : aucune écriture sans revue préalable.
 *   1. `node scripts/fix_text_artifacts_translations.mjs`          → liste seule
 *   2. `node scripts/fix_text_artifacts_translations.mjs --write`  → applique
 *
 * La revue est écrite dans `plans/revue-artefacts-textuels.md`.
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

/** « et commercial » — composé à l'exécution : le canal d'écriture décode les entités. */
const AMP = String.fromCharCode(38);
const ESCAPED_AMP = `${AMP}amp;`;

const DOUBLE_SPACE = /\S {2,}\S/g;

/** Espace avant ponctuation en anglais — l'ellipse sera préservée. */
const PUNCT_EN = / [,.!?;:]/g;

/**
 * Colle la ponctuation au mot précédent (anglais), sans toucher à l'ellipse :
 * `unit : Police` → `unit: Police`, mais `indifferent ...` reste inchangé.
 */
function fixEnglishPunctuation(text) {
    return text.replace(PUNCT_EN, (match, offset, whole) => {
        const char = match.slice(1);
        if (char === '.' && whole.slice(offset + 1, offset + 4) === '...') return match;
        return char;
    });
}

/** Parcourt une valeur JSON et transforme chaque chaîne rencontrée. */
function mapStrings(value, transform) {
    if (typeof value === 'string') return transform(value);
    if (Array.isArray(value)) return value.map((item) => mapStrings(item, transform));
    if (value && typeof value === 'object') {
        const out = {};
        for (const [key, item] of Object.entries(value)) out[key] = mapStrings(item, transform);
        return out;
    }
    return value;
}

/**
 * Rend un extrait **vérifiable** : les espaces consécutifs sont remplacés par un
 * marqueur visible (`⟦2⟧`), sinon la revue masquerait l'artefact qu'elle signale.
 */
function show(text, at, before = 40, after = 50) {
    const slice = text.slice(Math.max(0, at - before), at + after);
    return slice
        .replace(/\r?\n/g, '⏎')
        .replace(/ {2,}/g, (run) => `⟦${run.length} espaces⟧`);
}

/** Extrait les défauts d'une chaîne (sans la modifier). */
function inspect(text) {
    const defects = [];
    if (text.includes(ESCAPED_AMP)) {
        const at = text.indexOf(ESCAPED_AMP);
        defects.push({ kind: 'entité échappée', token: ESCAPED_AMP, context: show(text, at) });
    }
    for (const match of text.matchAll(DOUBLE_SPACE)) {
        const at = match.index ?? 0;
        defects.push({ kind: 'double espace', token: '␣␣', context: show(text, at + 1) });
    }
    for (const match of text.matchAll(PUNCT_EN)) {
        const at = match.index ?? 0;
        const char = match[0].slice(1);
        if (char === '.' && text.slice(at + 1, at + 4) === '...') continue;
        defects.push({
            kind: 'espace avant ponctuation (anglais)',
            token: `␣${char}`,
            context: show(text, at),
        });
    }
    // Espaces en bordure : signalés seulement (non corrigés automatiquement —
    // ils peuvent être structurants pour un rendu en liste).
    if (/^\s/.test(text) || /\s$/.test(text)) {
        defects.push({
            kind: 'espace en bordure (non corrigé)',
            token: '␣',
            context: show(text, 0, 0, 30) + ' … ' + show(text, text.length, 30, 0),
        });
    }
    return defects;
}

async function fetchRows() {
    const res = await fetch(
        `${URL_BASE}/rest/v1/site_translations?select=entity,entity_id,locale,payload&locale=eq.en`,
        { headers: HEADERS }
    );
    if (!res.ok) {
        console.error(`❌ Lecture site_translations → HTTP ${res.status}`);
        process.exit(1);
    }
    return res.json();
}

const rows = await fetchRows();
const review = [];
review.push('# Revue — Artefacts textuels des overlays EN (`site_translations`)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/fix_text_artifacts_translations.mjs\`.`);
review.push('');

const repairs = [];

for (const row of rows) {
    const strings = [];
    mapStrings(row.payload, (text) => {
        strings.push(text);
        return text;
    });

    const defects = strings.flatMap((text) => inspect(text));
    if (!defects.length) continue;

    const repaired = mapStrings(row.payload, (text) =>
        fixEnglishPunctuation(text.split(ESCAPED_AMP).join(AMP).replace(DOUBLE_SPACE, ' '))
    );

    // Un signal en bordure (non corrigé) ne doit pas déclencher d'écriture :
    // on n'enregistre que les lignes dont le payload change réellement.
    const changed = JSON.stringify(repaired) !== JSON.stringify(row.payload);

    repairs.push({ row, defects, repaired, changed });
}

let totalDefects = 0;
for (const { defects } of repairs) {
    totalDefects += defects.length;
}

review.push('## Synthèse');
review.push('');
review.push(`- Overlays EN inspectés : **${rows.length}**`);
review.push(`- Overlays porteurs d'artefacts : **${repairs.length}**`);
review.push(`- Artefacts à corriger : **${totalDefects}**`);
review.push('');

for (const { row, defects } of repairs) {
    review.push(`### \`${row.entity}/${row.entity_id}\` — ${defects.length} artefact(s)`);
    review.push('');
    review.push('| Type | Séquence | Contexte |');
    review.push('|---|---|---|');
    for (const defect of defects) {
        review.push(
            `| ${defect.kind} | \`${defect.token}\` | …${defect.context.replace(/\s+/g, ' ').replace(/\|/g, '\\|')}… |`
        );
    }
    review.push('');
}

review.push('## Non traité (décision éditoriale)');
review.push('');
review.push(
    "L'espace **français** avant ` : `, ` ; `, ` ! ` et ` ? ` n'est jamais corrigé : il est **requis** en typographie française. Seuls les overlays `locale = en` reçoivent la correction, et l'ellipse (`word ...`) est préservée dans tous les cas."
);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-artefacts-textuels.md', review.join('\n'), 'utf8');

console.log(`Overlays EN inspectés      : ${rows.length}`);
console.log(`Overlays à corriger        : ${repairs.length}`);
console.log(`Artefacts détectés         : ${totalDefects}`);
console.log('Revue : plans/revue-artefacts-textuels.md');
console.log('');

if (!WRITE) {
    console.log('Mode lecture seule — relancer avec --write pour appliquer.');
    process.exit(0);
}

const writable = repairs.filter((item) => item.changed);
let applied = 0;
for (const { row, repaired } of writable) {
    const url = `${URL_BASE}/rest/v1/site_translations?entity=eq.${encodeURIComponent(row.entity)}&entity_id=eq.${encodeURIComponent(row.entity_id)}&locale=eq.en`;
    const res = await fetch(url, {
        method: 'PATCH',
        headers: { ...HEADERS, Prefer: 'return=minimal' },
        body: JSON.stringify({ payload: repaired }),
    });
    if (res.ok) {
        applied += 1;
        console.log(`CORRIGÉ ${row.entity}/${row.entity_id}`);
    } else {
        console.error(`ÉCHEC   ${row.entity}/${row.entity_id} → HTTP ${res.status} ${await res.text()}`);
    }
}

console.log('');
console.log(`Overlays corrigés : ${applied}/${repairs.length}`);
