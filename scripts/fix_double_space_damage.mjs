#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — RESTAURATION après incident : doubles espaces réparés trop brutalement
 * ==============================================================================
 * INCIDENT (à ne pas reproduire) :
 *   La réparation des doubles espaces utilisait le motif `/\S {2,}\S/g` — qui
 *   inclut le caractère AVANT et le caractère APRÈS la suite d'espaces. Combiné
 *   à `.replace(motif, ' ')`, il **supprimait ces deux caractères** :
 *     `Gloria  needs`  →  `Glori eeds`   (perte de `a` et `n`)
 *     `family.  She`   →  `family he`    (perte de `.` et `S`)
 *   9 emplacements sur 7 fiches ont été touchés. Le défaut était invisible pour
 *   l'audit d'intégrité (plus de double espace, plus de ponctuation fautive) :
 *   seule une lecture du texte révélait la perte de caractères.
 *
 * RESTAURATION :
 *   Chaque emplacement est décrit par le fragment abîmé **et** le fragment
 *   attendu, reconstruit à partir de la revue écrite AVANT réparation
 *   (`plans/revue-artefacts-textuels.md`, contexte complet de part et d'autre)
 *   et recoupé par la cohérence grammaticale de la phrase anglaise.
 *   Chaque fragment doit apparaître **exactement une fois**, sinon la
 *   réparation est refusée pour cette fiche (aucune écriture approximative).
 *
 * DOCTRINE : revue avant écriture.
 *   node scripts/fix_double_space_damage.mjs           → liste seule
 *   node scripts/fix_double_space_damage.mjs --write   → applique
 *
 * Revue : plans/revue-restauration-doubles-espaces.md
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
 * Emplacements abîmés.
 * `broken`  : fragment actuellement en base (conséquence du motif fautif)
 * `fixed`   : fragment attendu (caractères perdus + typographie correcte)
 */
const REPAIRS = [
    { id: 'furies', broken: 'the death of her family he furtively', fixed: 'the death of her family. She furtively' },
    { id: 'gloria', broken: 'Glori eeds an orgasm', fixed: 'Gloria needs an orgasm' },
    { id: 'le-jardinier', broken: 'better known as the Matignon List ondemned', fixed: 'better known as the Matignon List. Condemned' },
    { id: 'les-blagues-de-toto', broken: 'Toto is immediately blamed o prove', fixed: 'Toto is immediately blamed. To prove' },
    { id: 'les-blagues-de-toto', broken: 'Toto will help Igor being cool he unlikely', fixed: 'Toto will help Igor being cool. The unlikely' },
    { id: 'les-envoutes', broken: 'Coline, who resists but falls in love.. ased on', fixed: 'Coline, who resists but falls in love... Based on' },
    { id: 'un-triomphe', broken: 'where he bring ogether an unlikely', fixed: 'where he brings together an unlikely' },
    { id: 'zorro', broken: "born in one of the town's hotels his story", fixed: "born in one of the town's hotels. This story" },
    { id: 'zorro', broken: 'the line between reality and myth becomes blurred his film', fixed: 'the line between reality and myth becomes blurred. This film' },
];

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

function countOccurrences(text, fragment) {
    return text.split(fragment).length - 1;
}

const ids = [...new Set(REPAIRS.map((repair) => repair.id))];
const res = await fetch(
    `${URL_BASE}/rest/v1/site_translations?select=entity_id,payload&locale=eq.en&entity=eq.film&entity_id=in.(${ids.join(',')})`,
    { headers: HEADERS }
);
if (!res.ok) {
    console.error(`❌ Lecture site_translations → HTTP ${res.status}`);
    process.exit(1);
}
const rows = await res.json();
const byId = new Map(rows.map((row) => [row.entity_id, row]));

const review = [];
review.push('# Revue — Restauration après incident « doubles espaces »');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/fix_double_space_damage.mjs\`.`);
review.push('');
review.push('## Cause');
review.push('');
review.push(
    'Le motif `\\S {2,}\\S` inclut le caractère avant et après la suite d\'espaces : utilisé avec `.replace(motif, \' \')`, il **supprime ces deux caractères** au lieu de réduire la suite d\'espaces. `Gloria  needs` est ainsi devenu `Glori eeds`.'
);
review.push('');
review.push('## Emplacements');
review.push('');
review.push('| Fiche | Fragment abîmé | Fragment attendu | Occurrences | Statut |');
review.push('|---|---|---|---|---|');

const planned = [];

for (const repair of REPAIRS) {
    const row = byId.get(repair.id);
    if (!row) {
        review.push(`| \`${repair.id}\` | — | — | 0 | fiche introuvable |`);
        continue;
    }

    const payloadText = JSON.stringify(row.payload);
    const occurrenceCount = countOccurrences(payloadText, repair.broken);
    const status = occurrenceCount === 1 ? 'prêt' : `REFUSÉ (${occurrenceCount} occurrence(s))`;
    review.push(
        `| \`${repair.id}\` | \`${repair.broken}\` | \`${repair.fixed}\` | ${occurrenceCount} | ${status} |`
    );

    if (occurrenceCount === 1) planned.push({ row, repair });
}

review.push('');

const plannedIds = [...new Set(planned.map((item) => item.row.entity_id))];
review.push('## Périmètre');
review.push('');
review.push(`- Emplacements prêts : **${planned.length}/${REPAIRS.length}**`);
review.push(`- Fiches concernées : **${plannedIds.length}** (${plannedIds.join(', ')})`);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-restauration-doubles-espaces.md', review.join('\n'), 'utf8');

console.log(`Emplacements prêts : ${planned.length}/${REPAIRS.length}`);
console.log(`Fiches concernées  : ${plannedIds.join(', ') || '—'}`);
console.log('Revue : plans/revue-restauration-doubles-espaces.md');
console.log('');

if (!WRITE) {
    console.log('Mode lecture seule — relancer avec --write pour appliquer.');
    process.exit(0);
}

/**
 * Les réparations sont regroupées PAR FICHE : une fiche portant deux
 * emplacements doit recevoir les deux corrections dans le **même** payload.
 * Un envoi séparé repartirait du payload d'origine et annulerait la première
 * correction (cas réel : `les-blagues-de-toto` et `zorro`).
 */
const byEntity = new Map();
for (const item of planned) {
    const list = byEntity.get(item.row.entity_id) ?? [];
    list.push(item.repair);
    byEntity.set(item.row.entity_id, list);
}

let appliedFiches = 0;
let appliedSpots = 0;

for (const [entityId, repairs] of byEntity) {
    const row = byId.get(entityId);
    const repaired = mapStrings(row.payload, (text) => {
        let out = text;
        for (const repair of repairs) out = out.split(repair.broken).join(repair.fixed);
        return out;
    });

    const url = `${URL_BASE}/rest/v1/site_translations?entity=eq.film&entity_id=eq.${encodeURIComponent(entityId)}&locale=eq.en`;
    const patch = await fetch(url, {
        method: 'PATCH',
        headers: { ...HEADERS, Prefer: 'return=minimal' },
        body: JSON.stringify({ payload: repaired }),
    });

    if (patch.ok) {
        appliedFiches += 1;
        appliedSpots += repairs.length;
        console.log(`RESTAURÉ ${entityId} — ${repairs.length} emplacement(s)`);
    } else {
        console.error(`ÉCHEC    ${entityId} → HTTP ${patch.status} ${await patch.text()}`);
    }
}

console.log('');
console.log(`Fiches restaurées : ${appliedFiches}/${byEntity.size} · emplacements : ${appliedSpots}/${planned.length}`);
