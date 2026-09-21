/**
 * Lot i18n — héro de la page STAGES (`/stages-cascades-parkour-2`).
 *
 * 1. Injecte `stages.hero` (chrome du héro) dans les catalogues FR/EN.
 * 2. Reformule deux libellés EN qui contenaient une particule française
 *    (« Île-de-France », « Bouches-du-Rhône ») : en anglais, on écrit la région
 *    et le pays, pas la toponymie administrative française.
 *
 * Usage : node scripts/fix_stages_hero_i18n.mjs [--dry]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dry = process.argv.includes('--dry');
const here = (rel) => fileURLToPath(new URL('../' + rel, import.meta.url));

const HERO = {
    fr: {
        breadcrumbHome: 'ACCUEIL',
        breadcrumbCurrent: 'STAGES & SÉJOURS DE CASCADES',
        badge: 'IMMERSION & PERFECTIONNEMENT',
        meta: 'WEEK-ENDS DÈS 250€ • STAGES AFDAS 100% • SUMMER CAMP',
        titleLead: 'STAGES DE CASCADE, ',
        titleAccent: 'PARKOUR & ACTION',
        subtitle:
            "Pour vivre l'expérience cascadeur le temps d'un week-end en immersion totale à 250€, profiter d'une prise en charge intégrale AFDAS en tant qu'artiste interprète, ou rejoindre notre grand Summer Camp estival sur nos installations.",
        bgAlt: 'Stages et séjours de cascades au Campus Univers Cascades',
        logosAlt: 'Logos des stages CUC',
    },
    en: {
        breadcrumbHome: 'HOME',
        breadcrumbCurrent: 'STUNT COURSES & STAYS',
        badge: 'IMMERSION & SKILL DEVELOPMENT',
        meta: 'WEEKENDS FROM €250 • 100% AFDAS-FUNDED COURSES • SUMMER CAMP',
        titleLead: 'STUNT, ',
        titleAccent: 'PARKOUR & ACTION COURSES',
        subtitle:
            'Live the stunt performer experience over a full-immersion weekend for €250, benefit from full AFDAS funding as a performing artist, or join our big summer camp on our facilities.',
        bgAlt: 'Stunt courses and stays at Campus Univers Cascades',
        logosAlt: 'CUC course logos',
    },
};

/** Reformulations EN : pas de particule française dans le texte anglais. */
const DETAIL_FIXES = [
    ['CUC Île-de-France centre, 92230 Gennevilliers', 'CUC Paris region centre, 92230 Gennevilliers'],
    ['Provence Studios, Martigues (Bouches-du-Rhône)', 'Provence Studios, Martigues, France'],
];

function patch(rel, locale) {
    const path = here(rel);
    const catalog = JSON.parse(readFileSync(path, 'utf8'));
    const stages = catalog.stages ?? {};
    const existed = Boolean(stages.hero);
    catalog.stages = { ...stages, hero: HERO[locale] };

    const fixes = [];
    if (locale === 'en') {
        const cards = catalog.stages.cards ?? [];
        for (const card of cards) {
            card.details = (card.details ?? []).map((detail) => {
                const hit = DETAIL_FIXES.find(([from]) => from === detail);
                if (!hit) return detail;
                fixes.push(`${hit[0]} → ${hit[1]}`);
                return hit[1];
            });
        }
    }

    if (!dry) writeFileSync(path, JSON.stringify(catalog, null, 4) + '\n');
    return `${rel} : stages.hero ${existed ? 'remplacé' : 'ajouté'} ; ${fixes.length} libellé(s) corrigé(s)${fixes.length ? ' — ' + fixes.join(' ; ') : ''
        }`;
}

console.log(patch('messages/fr.json', 'fr'));
console.log(patch('messages/en.json', 'en'));
if (dry) console.log('Mode --dry : aucun fichier écrit.');
