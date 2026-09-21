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

/**
 * Règles de détection : SOURCE UNIQUE, partagée avec l'audit des catalogues du
 * dépôt (`audit_repo_text_integrity.mjs`). Une règle dupliquée d'un côté et pas
 * de l'autre produirait un site « propre » en base et sale dans l'interface —
 * et l'incident du 2026-09-21 a montré le coût d'une règle écrite deux fois.
 */
import { inspectText } from './lib/text-integrity-rules.mjs';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

/**
 * Familles de défauts inspectées, dans l'ordre d'affichage. Les règles
 * elles-mêmes vivent dans `scripts/lib/text-integrity-rules.mjs` : ce fichier ne
 * fait que les appliquer aux colonnes de la base.
 */
const FAMILIES = ['mojibake', 'apostrophes', 'entities', 'doubleSpace', 'punctuation', 'frenchQuotes'];

/**
 * Cibles inspectées.
 *   locale : 'fr' (source éditoriale) ou 'en' (overlays de traduction)
 *   fields : colonnes lues ; les objets JSON sont parcourus récursivement
 *   idFields : colonnes d'identification pour la revue
 */
/**
 * Dérogations DOCUMENTÉES : ligne → familles tolérées.
 *
 * `film/le-jardinier` — le synopsis anglais de ce film contient `« slugs »`, une
 * **paire équilibrée de guillemets français** issue du texte source (IMDb). Le
 * style de citation relève de la rédaction, pas de l'intégrité : le signalerait
 * à chaque exécution sans rien apprendre. À retirer si la rédaction normalise la
 * citation en anglais.
 */
const ALLOWED = new Map([['film/le-jardinier', new Set(['frenchQuotes'])]]);

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

const review = [];
review.push('# Revue — Intégrité des textes en base (mojibake, apostrophes, artefacts)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/audit_text_integrity.mjs\`.`);
review.push('');

const totals = {
    mojibake: 0,
    apostrophes: 0,
    entities: 0,
    doubleSpace: 0,
    punctuation: 0,
    frenchQuotes: 0,
};

for (const target of TARGETS) {
    const list = await rows(target.path);
    const found = {
        mojibake: [],
        apostrophes: [],
        entities: [],
        doubleSpace: [],
        punctuation: [],
        frenchQuotes: [],
    };

    for (const row of list) {
        const texts = [];
        for (const field of target.fields) collectStrings(row[field], texts);

        for (const text of texts) {
            const id = rowId(row, target.idFields);
            const tolerated = ALLOWED.get(id);

            // Détection déléguée au module partagé : ce sont exactement les règles
            // qui jugent aussi les catalogues `messages/*.json`.
            const defects = inspectText(text, target.locale);
            for (const family of FAMILIES) {
                if (tolerated?.has(family)) continue;
                for (const item of defects[family]) found[family].push({ id, ...item });
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
        frenchQuotes: 'textes anglais contenant des guillemets français',
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
    `- Espace avant ponctuation : **${totals.punctuation}** texte(s)`,
    `- Guillemets français dans un texte anglais : **${totals.frenchQuotes}** texte(s) (signalés, non corrigés)`
);

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-integrite-textes.md', review.join('\n'), 'utf8');

console.log('');
console.log(
    `Mojibake : ${totals.mojibake} · Apostrophes : ${totals.apostrophes} · Entités : ${totals.entities} · Doubles espaces : ${totals.doubleSpace} · Ponctuation : ${totals.punctuation} · Guillemets FR : ${totals.frenchQuotes}`
);
console.log('Revue : plans/revue-integrite-textes.md\n');
