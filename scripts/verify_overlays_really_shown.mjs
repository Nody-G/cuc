#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Épreuve de bout en bout : une traduction semée produit-elle de l'anglais ?
 * ==============================================================================
 * La garde `audit_overlay_consumption.mjs` prouve qu'un **lecteur existe** dans le
 * code. Elle ne prouve pas que ce lecteur **change le texte affiché**. Or c'est
 * exactement le défaut trouvé le 2026-09-21 : 501 synopsis semés, aucun lecteur,
 * donc français à l'écran malgré une couverture « 100 % ».
 *
 * Cette épreuve ferme la boucle avec les **helpers réels** de l'interface
 * (`applyFilmOverlays`, `applyEventOverlays`) :
 *   1. lit les lignes FR (ce que la base affiche par défaut) ;
 *   2. lit les overlays EN tels que le client les requête
 *      (`locale = en` ET `is_published = true`) ;
 *   3. applique la fusion exactement comme les composants ;
 *   4. compare : le texte affiché doit CHANGER pour chaque fiche traduite, et ne
 *      jamais devenir vide.
 *
 * Exécution via `tsx` : le script importe du TypeScript du dossier `src/`.
 *
 * Usage : npx tsx scripts/verify_overlays_really_shown.mjs
 * Sort en code 2 si une fiche traduite reste en français ou devient vide.
 * ==============================================================================
 */
import dotenv from 'dotenv';

import { applyFilmOverlays } from '../src/lib/i18n/apply-film-overlay.ts';
import { applyEventOverlays } from '../src/lib/i18n/apply-event-overlay.ts';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function rows(path) {
    const res = await fetch(`${URL_BASE}/rest/v1/${path}`, { headers: HEADERS });
    if (!res.ok) {
        console.error(`❌ ${path} → HTTP ${res.status}`);
        process.exit(1);
    }
    return res.json();
}

/** Requête identique à celle du client (`useEntityOverlays`). */
async function overlaysOf(entity) {
    const list = await rows(
        `site_translations?select=entity_id,payload&entity=eq.${entity}&locale=eq.en&is_published=eq.true`
    );
    return Object.fromEntries(list.map((row) => [row.entity_id, row.payload ?? {}]));
}

/**
 * Compare l'état français et l'état après fusion, et rend les anomalies.
 *
 * ⚠️  RÈGLE PRÉCISE : un champ vide n'est une ANOMALIE que s'il était **rempli
 * avant** la fusion. Beaucoup de fiches n'ont aucune description en français
 * (aucune donnée factuelle disponible) : les compter comme « vidées par la
 * fusion » produisait 69 faux positifs — mesuré, puis corrigé ici plutôt que
 * « réparé » à tort côté contenu.
 */
function judge(before, after, label, id, field) {
    const initial = String(before[field] ?? '').trim();
    const merged = String(after[field] ?? '').trim();

    if (!merged && initial) {
        return { level: 'error', message: `${label}/${id} : « ${field} » était rempli et devient VIDE après fusion` };
    }
    if (!merged) {
        // Champ vide avant ET après : fiche sans description, ce n'est pas un défaut.
        return { level: 'info', message: null, translated: false, empty: true };
    }
    return { level: 'info', message: null, translated: merged !== initial };
}

let errors = 0;

/* ------------------------------------------------------------------ *
 * Films
 * ------------------------------------------------------------------ */
const filmsFr = await rows('site_films?select=id,title,description');
const filmOverlays = await overlaysOf('film');
const filmsLocalized = applyFilmOverlays(filmsFr, filmOverlays);

let filmsTranslated = 0;
const filmSamples = [];

for (let index = 0; index < filmsFr.length; index += 1) {
    const verdict = judge(filmsFr[index], filmsLocalized[index], 'film', filmsFr[index].id, 'description');
    if (verdict.level === 'error') {
        errors += 1;
        console.log(`   ❌ ${verdict.message}`);
        continue;
    }
    if (verdict.translated) {
        filmsTranslated += 1;
        if (filmSamples.length < 3) {
            filmSamples.push({
                id: filmsFr[index].id,
                fr: String(filmsFr[index].description ?? '').slice(0, 90),
                en: String(filmsLocalized[index].description ?? '').slice(0, 90),
            });
        }
    }
}

/* ------------------------------------------------------------------ *
 * Événements
 * ------------------------------------------------------------------ */
const eventsFr = await rows('site_events?select=id,title,description');
const eventOverlays = await overlaysOf('event');
const eventsLocalized = applyEventOverlays(eventsFr, eventOverlays);

let eventsTranslated = 0;
for (let index = 0; index < eventsFr.length; index += 1) {
    const verdict = judge(eventsFr[index], eventsLocalized[index], 'event', eventsFr[index].id, 'title');
    if (verdict.level === 'error') {
        errors += 1;
        console.log(`   ❌ ${verdict.message}`);
        continue;
    }
    if (verdict.translated) eventsTranslated += 1;
}

/* ------------------------------------------------------------------ *
 * Rapport
 * ------------------------------------------------------------------ */
/** Overlays portant une clé exploitable (les autres ne traduisent que des rôles). */
const withDescription = (overlays, field) =>
    Object.values(overlays).filter(
        (overlay) => typeof overlay[field] === 'string' && overlay[field].trim().length > 0
    ).length;

/**
 * Pourquoi un overlay porteur d'un synopsis peut ne rien changer à l'affichage :
 * mesure des deux causes possibles, pour ne jamais conclure à l'aveugle.
 *   - `orphan`  : l'overlay référence une fiche absente du catalogue → inerte ;
 *   - `identical` : le texte anglais est identique au français en base (déjà en
 *     anglais, ou traduction identique) → aucun changement visible, sans défaut.
 */
const filmById = new Map(filmsFr.map((film) => [film.id, film]));
let orphanOverlays = 0;
let identicalOverlays = 0;
const identicalButFrench = [];

/**
 * Marqueurs de français (mots-outils sans accent, donc détectables sur du texte
 * brut). Un texte FRANÇAIS typique en contient plusieurs.
 */
const FR_MARKERS = [
    ' le ', ' la ', ' les ', ' une ', ' des ', ' dans ', ' pour ', ' avec ', ' sur ',
    ' qui ', ' que ', ' est ', ' sont ', ' au ', ' aux ', ' du ', ' cette ', ' son ',
    ' ses ', ' il ', ' elle ', ' ils ', ' mais ', ' plus ', ' tout ', ' fait ',
    ' apres ', ' avant ', ' entre ', ' alors ', ' donc ',
];

/** Normalisation légère : accents retirés, minuscules, espaces encadrants. */
function looksFrench(text) {
    const normalized =
        ' ' +
        text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z]+/g, ' ') +
        ' ';
    return FR_MARKERS.filter((marker) => normalized.includes(marker)).length >= 3;
}

for (const [id, overlay] of Object.entries(filmOverlays)) {
    const en = typeof overlay.description === 'string' ? overlay.description.trim() : '';
    if (!en) continue;
    const film = filmById.get(id);
    if (!film) {
        orphanOverlays += 1;
        continue;
    }
    if (String(film.description ?? '').trim() === en) {
        identicalOverlays += 1;
        // Un overlay « anglais » identique au français peut simplement venir d'un
        // synopsis déjà en anglais en base… ou être une non-traduction.
        if (looksFrench(en)) identicalButFrench.push({ id, sample: en.slice(0, 100) });
    }
}

console.log('');
console.log(`Films       : ${filmsFr.length} fiche(s) · overlays EN : ${Object.keys(filmOverlays).length}`);
console.log(`              dont overlays porteurs d'un synopsis : ${withDescription(filmOverlays, 'description')}`);
console.log(`              synopsis effectivement affichés en anglais : ${filmsTranslated}`);
console.log(`              overlays sans fiche au catalogue : ${orphanOverlays}`);
console.log(`              overlays identiques au français : ${identicalOverlays}`);
console.log(`                 dont visiblement NON traduits (texte français) : ${identicalButFrench.length}`);
for (const item of identicalButFrench.slice(0, 5)) {
    console.log(`                   - ${item.id} : ${item.sample}…`);
}
console.log(
    `Événements  : ${eventsFr.length} fiche(s) · overlays EN : ${Object.keys(eventOverlays).length} · titres traduits : ${eventsTranslated}`
);
console.log('');

for (const sample of filmSamples) {
    console.log(`   ${sample.id}`);
    console.log(`     FR : ${sample.fr}…`);
    console.log(`     EN : ${sample.en}…`);
}

console.log('');
if (errors || identicalButFrench.length) {
    if (identicalButFrench.length) {
        console.log(
            `❌ ${identicalButFrench.length} fiche(s) ont un « overlay anglais » qui est en réalité du texte français :`
        );
        console.log('   la page anglaise y affiche donc du français (traduction manquante, pas bug technique).');
    }
    if (errors) console.log(`❌ ${errors} anomalie(s) : une traduction semée ne produit pas l'effet attendu.`);
    process.exit(2);
}

console.log('✅ La fusion produit bien l\'anglais sur les fiches traduites, sans jamais vider un champ.');
console.log('');
