#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Audit d'INTÉGRITÉ DES TEXTES en base (FR éditorial + overlays EN)
 * ==============================================================================
 * Quatre familles de défauts, chacune avec un signal **sans ambiguïté** :
 *
 *   1. DOUBLE-ENCODAGE UTF-8 (« mojibake ») : `Ã©` au lieu de `é`, `â€™` au lieu
 *      de `’`. Le dépôt corrige déjà ce cas dans `src/` via
 *      `scripts/fix_mojibake.mjs` — ce même contrôle est appliqué ICI aux textes
 *      stockés en base (colonnes éditoriales ET payloads de traduction).
 *
 *   2. APOSTROPHES PERDUES À L'IMPORT (FRANÇAIS UNIQUEMENT) : « dune fraternité »,
 *      « laidera », « quil ». Signal volontairement conservateur : un texte LONG
 *      (> 60 caractères) sans **aucune** apostrophe alors qu'il contient une
 *      élision cassée connue. Un texte français de cette taille sans apostrophe
 *      est statistiquement impossible. Ce contrôle n'a AUCUN sens en anglais :
 *      il n'est donc pas appliqué aux overlays EN.
 *
 *   3. ENTITÉS HTML RÉSIDUELLES écrites en clair (`&` + `amp;`, `&` + `apos;`…) :
 *      React n'interprète pas ces séquences dans un nœud texte — la page les
 *      affiche telles quelles. Les séquences sont composées à l'exécution
 *      (`AMP + 'amp;'`) car le canal d'écriture de ce dépôt décode les entités.
 *
 *   4. ARTEFACTS TYPOGRAPHIQUES, **sensibles à la locale** :
 *      - doubles espaces à l'intérieur d'un texte : jamais voulus, toutes langues ;
 *      - espace AVANT ponctuation : ` ,` et ` .` sont fautifs en français comme
 *        en anglais, MAIS ` : `, ` ; `, ` ! `, ` ? ` sont **requis** en
 *        typographie française et **fautifs** en anglais. Un contrôle unique
 *        produirait donc de faux positifs : la règle dépend de la locale.
 *
 * Aucune écriture en base : la revue sert de base à une correction relue.
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

/** « et commercial » — jamais écrit littéralement (le canal d'écriture décode). */
const AMP = String.fromCharCode(38);
const ESCAPED_ENTITIES = {
    amp: `${AMP}amp;`,
    apos: `${AMP}apos;`,
    dec39: `${AMP}#39;`,
    quot: `${AMP}quot;`,
    nbsp: `${AMP}nbsp;`,
};

/**
 * Élisions dont l'apostrophe a pu être supprimée à l'import (français).
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

/** Deux espaces consécutifs entre deux caractères visibles. */
const DOUBLE_SPACE = /\S {2,}\S/;

/** Espace avant `,` ou `.` : fautif dans les deux langues. */
const PUNCT_BOTH = / [,.]/g;
/** Espace avant `:` `;` `!` `?` : fautif en ANGLAIS, requis en FRANÇAIS. */
const PUNCT_EN_ONLY = / [;:!?]/g;

/**
 * Repère un espace avant ponctuation, en tenant compte de la locale ET de
 * l'ellipse.
 *
 * L'ELLIPSE EST EXCLUE : « mot ... » est une convention d'écriture admise (et
 * attendue en français) — l'inclure produisait deux faux positifs réels sur les
 * overlays EN (`indifferent ...`, `such a ball ...`), qui n'ont jamais été des
 * fautes.
 */
function findBadPunctuation(text, locale) {
    const pattern = locale === 'en' ? / [,.!?;:]/g : PUNCT_BOTH;
    for (const match of text.matchAll(pattern)) {
        const at = match.index ?? 0;
        const char = match[0].slice(1);
        if (char === '.' && text.slice(at + 1, at + 4) === '...') continue;
        return { at, char };
    }
    return null;
}

/**
 * Cibles inspectées.
 *   locale : 'fr' (source éditoriale) ou 'en' (overlays de traduction)
 *   fields : colonnes lues ; les objets JSON sont parcourus récursivement
 *   idFields : colonnes d'identification pour la revue
 */
const TARGETS = [
    { label: 'Films', locale: 'fr', path: 'site_films?select=id,description', fields: ['description'] },
    { label: 'Coachs', locale: 'fr', path: 'site_team?select=id,bio', fields: ['bio'] },
    {
        label: 'Partenaires',
        locale: 'fr',
        path: 'site_partners?select=id,description',
        fields: ['description'],
    },
    {
        label: 'Événements',
        locale: 'fr',
        path: 'site_events?select=id,description',
        fields: ['description'],
    },
    {
        label: 'Programmes',
        locale: 'fr',
        path: 'site_programs?select=id,description',
        fields: ['description'],
    },
    {
        label: 'Disciplines',
        locale: 'fr',
        path: 'site_disciplines?select=id,short_desc,full_desc',
        fields: ['short_desc', 'full_desc'],
    },
    {
        label: 'Pages vitrine',
        locale: 'fr',
        path: 'site_pages?select=slug,sections_data',
        fields: ['sections_data'],
        idFields: ['slug'],
    },
    {
        label: 'Traductions EN',
        locale: 'en',
        path: 'site_translations?select=entity,entity_id,locale,payload&locale=eq.en',
        fields: ['payload'],
        idFields: ['entity', 'entity_id'],
    },
];

async function rows(path) {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: HEADERS });
    if (!res.ok) {
        console.error(`   ⚠️  ${path} → HTTP ${res.status}`);
        return [];
    }
    return res.json();
}

/** Collecte récursivement toutes les chaînes d'une valeur JSON. */
function collectStrings(value, out = []) {
    if (typeof value === 'string') out.push(value);
    else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
    else if (value && typeof value === 'object') {
        Object.values(value).forEach((item) => collectStrings(item, out));
    }
    return out;
}

/** Identifiant lisible d'une ligne (colonnes explicites ou id/slug). */
function rowId(row, idFields) {
    if (idFields?.length) return idFields.map((field) => row[field]).filter(Boolean).join('/');
    return row.id ?? row.slug ?? '—';
}

/**
 * Rend un extrait **vérifiable** : les suites d'espaces sont remplacées par un
 * marqueur visible, sinon la revue masquerait l'artefact qu'elle signale.
 */
function show(text, at, before = 40, after = 50) {
    return text
        .slice(Math.max(0, at - before), at + after)
        .replace(/\r?\n/g, '⏎')
        .replace(/ {2,}/g, (run) => `⟦${run.length} espaces⟧`);
}

const review = [];
review.push('# Revue — Intégrité des textes en base (mojibake, apostrophes, artefacts)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/audit_text_integrity.mjs\`.`);
review.push('');

const totals = { mojibake: 0, apostrophes: 0, entities: 0, doubleSpace: 0, punctuation: 0 };

for (const target of TARGETS) {
    const list = await rows(target.path);
    const found = { mojibake: [], apostrophes: [], entities: [], doubleSpace: [], punctuation: [] };

    for (const row of list) {
        const texts = [];
        for (const field of target.fields) collectStrings(row[field], texts);

        for (const text of texts) {
            const id = rowId(row, target.idFields);

            const mojibakeHits = MOJIBAKE.filter((sequence) => text.includes(sequence));
            if (mojibakeHits.length) {
                found.mojibake.push({ id, detail: mojibakeHits.join(' '), sample: text.slice(0, 140) });
            }

            // Heuristique « aucune apostrophe » : FRANÇAIS uniquement.
            if (target.locale === 'fr' && text.length > 60 && !/['’]/.test(text) && ELISION_RE.test(text)) {
                found.apostrophes.push({
                    id,
                    detail: text.match(ELISION_RE)?.[0] ?? '—',
                    sample: text.slice(0, 140),
                });
            }

            for (const [name, sequence] of Object.entries(ESCAPED_ENTITIES)) {
                if (text.includes(sequence)) {
                    found.entities.push({ id, detail: name, sample: show(text, text.indexOf(sequence)) });
                    break;
                }
            }

            const double = DOUBLE_SPACE.exec(text);
            if (double) {
                found.doubleSpace.push({ id, detail: '␣␣', sample: show(text, double.index + 1) });
            }

            const punctuation = findBadPunctuation(text, target.locale);
            if (punctuation) {
                found.punctuation.push({
                    id,
                    detail: `«${punctuation.char}»`,
                    sample: show(text, punctuation.at),
                });
            }
        }
    }

    for (const key of Object.keys(found)) totals[key] += found[key].length;

    const parts = Object.entries(found)
        .map(([key, items]) => `${key} : ${String(items.length).padStart(3)}`)
        .join(' · ');
    console.log(`${target.label.padEnd(16)} (${target.locale}) ${parts}`);

    const titles = {
        mojibake: 'textes double-encodés',
        apostrophes: 'textes sans aucune apostrophe',
        entities: 'entités HTML résiduelles',
        doubleSpace: 'doubles espaces',
        punctuation: 'espace avant ponctuation',
    };
    for (const [key, items] of Object.entries(found)) {
        if (!items.length) continue;
        review.push(`## ${target.label} (${target.locale}) — ${items.length} ${titles[key]}`);
        review.push('');
        review.push('| Ligne | Détail | Extrait |');
        review.push('|---|---|---|');
        for (const item of items.slice(0, 40)) {
            review.push(
                `| \`${item.id}\` | ${item.detail} | …${String(item.sample).replace(/\|/g, '\\|')}… |`
            );
        }
        review.push('');
    }
}

review.unshift('');
review.splice(
    4,
    0,
    `- Double-encodage UTF-8 : **${totals.mojibake}** texte(s)`,
    `- Textes longs sans aucune apostrophe (FR) : **${totals.apostrophes}** texte(s)`,
    `- Entités HTML résiduelles : **${totals.entities}** texte(s)`,
    `- Doubles espaces : **${totals.doubleSpace}** texte(s)`,
    `- Espace avant ponctuation : **${totals.punctuation}** texte(s)`
);

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-integrite-textes.md', review.join('\n'), 'utf8');

console.log('');
console.log(
    `Mojibake : ${totals.mojibake} · Apostrophes : ${totals.apostrophes} · Entités : ${totals.entities} · Doubles espaces : ${totals.doubleSpace} · Ponctuation : ${totals.punctuation}`
);
console.log('Revue : plans/revue-integrite-textes.md\n');
