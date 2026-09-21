#!/usr/bin/env node
/**
 * ==============================================================================
 * SONDE INTERMÉDIAIRE — Artefacts typographiques en base
 * ==============================================================================
 *  ⚠️  OBSOLÈTE (conservée pour traçabilité, ne pas relancer pour conclure).
 *      Remplacée par `scripts/audit_text_integrity.mjs`, qui couvre les cinq
 *      familles de défauts — mojibake, apostrophes FR, entités HTML, doubles
 *      espaces, ponctuation — sur les colonnes FR **et** les overlays EN.
 *      Sa règle de ponctuation n'était PAS sensible à la locale : elle
 *      comptait les espaces français légitimes (` : `, ` ; `) comme défauts,
 *      soit 28 faux positifs. C'est cette mesure qui a motivé la règle
 *      locale-aware désormais en place dans l'audit.
 *
 * Mesure, AVANT d'ajouter un contrôle permanent, la fréquence réelle de trois
 * familles d'artefacts dans les colonnes éditoriales et dans les payloads de
 * traduction :
 *
 *   1. ENTITÉS HTML RÉSIDUELLES écrites en clair dans le texte (amp, apos, 39,
 *      quot, nbsp, lt, gt). Un tel texte afficherait la séquence telle quelle.
 *      Risque réel : les scripts d'injection écrivent du JSON et certains
 *      canaux peuvent ré-encoder le « et commercial ».
 *   2. DOUBLES ESPACES à l'intérieur d'un texte.
 *   3. ESPACE AVANT PONCTUATION ( , . ! ? ; :) — la ponctuation se colle.
 *
 * NOTE TECHNIQUE : les séquences sont composées à l'exécution
 * (`AMP + 'amp;'`) parce que ce dépôt écrit ses fichiers via un canal qui
 * décode les entités HTML : une chaîne littérale serait corrompue à l'écriture.
 *
 * Aucune écriture en base. Sert uniquement à décider si le contrôle mérite
 * d'entrer dans `audit_text_integrity.mjs`.
 *
 * Usage : node scripts/_probe_text_artifacts.mjs
 * ==============================================================================
 */
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

/** « et commercial » — jamais écrit littéralement, toujours composé. */
const AMP = String.fromCharCode(38);

const ENTITIES = {
    amp: `${AMP}amp;`,
    apos: `${AMP}apos;`,
    dec39: `${AMP}#39;`,
    quot: `${AMP}quot;`,
    nbsp: `${AMP}nbsp;`,
};

/** Espace avant ponctuation — la virgule, le point, etc. se collent au mot. */
const SPACE_BEFORE_PUNCT = / [,.;:!?]/;
/** Deux espaces consécutifs minimum (les sauts de ligne restent hors champ). */
const DOUBLE_SPACE = /\S {2,}\S/;

const TARGETS = [
    { label: 'Films', path: 'site_films?select=id,description', fields: ['description'] },
    { label: 'Coachs', path: 'site_team?select=id,bio', fields: ['bio'] },
    { label: 'Partenaires', path: 'site_partners?select=id,description', fields: ['description'] },
    { label: 'Événements', path: 'site_events?select=id,description', fields: ['description'] },
    { label: 'Programmes', path: 'site_programs?select=id,description', fields: ['description'] },
    {
        label: 'Disciplines',
        path: 'site_disciplines?select=id,short_desc,full_desc',
        fields: ['short_desc', 'full_desc'],
    },
    { label: 'Pages vitrine', path: 'site_pages?select=slug,sections_data', fields: ['sections_data'] },
    {
        label: 'Traductions (overlays)',
        path: 'site_translations?select=entity,entity_id,payload',
        fields: ['payload'],
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

const totals = { entities: 0, doubleSpace: 0, spaceBeforePunct: 0 };
const samples = [];

for (const target of TARGETS) {
    const list = await rows(target.path);
    const counts = { entities: 0, doubleSpace: 0, spaceBeforePunct: 0 };
    const texts = [];

    for (const row of list) {
        for (const field of target.fields) {
            collectStrings(row[field], texts);
        }
    }

    for (const text of texts) {
        for (const [name, sequence] of Object.entries(ENTITIES)) {
            if (text.includes(sequence)) {
                counts.entities += 1;
                if (samples.length < 40) {
                    samples.push({ table: target.label, kind: `entité ${name}`, sample: text.slice(0, 120) });
                }
                break;
            }
        }
        if (DOUBLE_SPACE.test(text)) {
            counts.doubleSpace += 1;
            if (samples.length < 40) {
                samples.push({ table: target.label, kind: 'double espace', sample: text.slice(0, 120) });
            }
        }
        if (SPACE_BEFORE_PUNCT.test(text)) {
            counts.spaceBeforePunct += 1;
            if (samples.length < 40) {
                samples.push({ table: target.label, kind: 'espace avant ponctuation', sample: text.slice(0, 120) });
            }
        }
    }

    totals.entities += counts.entities;
    totals.doubleSpace += counts.doubleSpace;
    totals.spaceBeforePunct += counts.spaceBeforePunct;

    console.log(
        `${target.label.padEnd(22)} textes : ${String(texts.length).padStart(4)} · entités : ${String(counts.entities).padStart(3)} · doubles espaces : ${String(counts.doubleSpace).padStart(3)} · espace-ponctuation : ${String(counts.spaceBeforePunct).padStart(3)}`
    );
}

console.log('');
console.log(
    `TOTAL — entités HTML : ${totals.entities} · doubles espaces : ${totals.doubleSpace} · espace avant ponctuation : ${totals.spaceBeforePunct}`
);

if (samples.length) {
    console.log('');
    console.log('Échantillons :');
    for (const item of samples) {
        console.log(`  [${item.table}] ${item.kind} → ${item.sample.replace(/\s+/g, ' ')}`);
    }
}
console.log('');
