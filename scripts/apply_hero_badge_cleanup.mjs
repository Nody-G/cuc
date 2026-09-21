#!/usr/bin/env node
/**
 * NETTOYAGE DES BADGES DE HERO — DOUBLONS & GADGETS (code)
 * ========================================================
 *
 * Constat (revue éditoriale 2026-09-21, signalée par le client) : six pages
 * affichaient un badge jaune ET une méta côte à côte disant en partie LA MÊME
 * CHOSE ; trois badges répétaient aussi le titre de la page juste en dessous.
 *
 * Doctrine appliquée (AGENTS.md) :
 *   1. « Zéro Gadget UI Creux » — un badge = une information, jamais deux ;
 *   2. pas de chiffre non prouvable (+20 000 chutes) ni de superlatif ;
 *   3. le doublon le plus FAIBLE est retiré : on conserve le badge
 *      (fonction d'identité, au-dessus du titre) et la méta garde le détail
 *      que le badge ne porte pas.
 *
 * Corrections apportées (par page) :
 *   - stunt-workshop : badge perd « EN ANGLAIS & FRANÇAIS » (la langue reste,
 *     une seule fois, dans la méta) ;
 *   - videos         : badge « REPORTAGES TÉLÉVISION » (les chaînes restent
 *     dans la méta, une seule fois) ;
 *   - spectacles     : badge perd « SHOWS CLÉ EN MAIN » (déjà dans la méta) ;
 *   - team-building  : badge perd « COHÉSION D'ÉQUIPE » (déjà dans la méta) ;
 *   - partenaires    : badge « ILS NOUS ACCOMPAGNENT » (la méta liste les
 *     catégories, dont institutions) ;
 *   - formation      : badge « 2 ANS • 720H À 800H » (le titre contient déjà
 *     « FORMATION PROFESSIONNELLE ») ;
 *   - contact        : badge « ADMISSIONS & PROJETS » (le titre contient déjà
 *     « CONTACT ») ;
 *   - stages         : badge « TOUS NIVEAUX • DÈS 16 ANS » (le titre contient
 *     déjà « STAGES »).
 *
 * Les MÊMES valeurs sont propagées en base par
 * `scripts/apply_hero_badge_cleanup_migration.mjs` (dry-run documenté là-bas).
 *
 * Usage :
 *   node scripts/apply_hero_badge_cleanup.mjs           # dry-run
 *   node scripts/apply_hero_badge_cleanup.mjs --apply   # écrit les fichiers
 *
 * Rapport : plans/revue-badges-hero.md (les deux modes).
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const APPLY = process.argv.includes('--apply');

/**
 * Éditions du code. Chaque entrée : fichier, motif (regex tolérante aux
 * apostrophes typographiques ’ vs '), remplacement, motif éditorial.
 */
const EDITS = [
    {
        file: 'src/lib/data/site-service.ts',
        find: /'STAGE INTERNATIONAL • EN ANGLAIS & FRANÇAIS'/,
        replace: "'STAGE INTERNATIONAL'",
        reason: 'Langue dupliquée avec heroMeta — la langue reste une seule fois, dans la méta.',
    },
    {
        file: 'src/lib/data/site-service.ts',
        find: /'REPORTAGES TÉLÉVISION • TF1 JT 20H • FRANCE 2'/,
        replace: "'REPORTAGES TÉLÉVISION'",
        reason: 'Chaînes TV dupliquées avec heroMeta.',
    },
    {
        file: 'src/lib/data/site-service.ts',
        find: /'ILS NOUS ACCOMPAGNENT • MARQUES & INSTITUTIONS'/,
        replace: "'ILS NOUS ACCOMPAGNENT'",
        reason: 'Catégories déjà listées par heroMeta (dont institutions).',
    },
    {
        file: 'src/lib/data/site-service.ts',
        find: /'LE CINÉMA S[’']INVITE SUR SCÈNE • SHOWS CLÉ EN MAIN'/,
        replace: "'LE CINÉMA S’INVITE SUR SCÈNE'",
        reason: '« Shows clé en main » déjà présent dans heroMeta.',
    },
    {
        file: 'src/lib/data/site-service.ts',
        find: /'SÉMINAIRES & ENTREPRISES • COHÉSION D[’']ÉQUIPE'/,
        replace: "'SÉMINAIRES & ENTREPRISES'",
        reason: '« Cohésion d’équipe » déjà présent dans heroMeta.',
    },
    {
        file: 'src/lib/data/site-service.ts',
        find: /'FORMATION PROFESSIONNELLE • 2 ANS'/,
        replace: "'2 ANS • 720H À 800H'",
        reason: 'Le titre contient déjà « Formation professionnelle » ; le badge porte les faits (durée, volume horaire).',
    },
    {
        file: 'src/lib/data/site-service.ts',
        find: /'CONTACT & ADMISSIONS'/,
        replace: "'ADMISSIONS & PROJETS'",
        reason: 'Le titre (« CONTACT & PROJETS ») contient déjà « Contact ».',
    },
    {
        file: 'src/lib/data/site-service.ts',
        find: /'STAGES INTENSIFS TOUS NIVEAUX • DÈS 16 ANS'/,
        replace: "'TOUS NIVEAUX • DÈS 16 ANS'",
        reason: 'Le titre (« STAGES DE CASCADE & PARKOUR ») contient déjà « Stages ».',
    },
    /* --- Messages FR : la méta garde le détail, sans redite du badge --- */
    {
        file: 'messages/fr.json',
        find: /"heroMeta": "EN ANGLAIS & FRANÇAIS • 2 SEMAINES RÉSIDENTIELLES"/,
        replace: '"heroMeta": "2 SEMAINES RÉSIDENTIELLES • EN ANGLAIS & FRANÇAIS"',
        reason: 'La langue n’apparaît plus qu’ici (le badge a été nettoyé).',
    },
    {
        file: 'messages/fr.json',
        find: /"heroMeta": "\+20 000 CHUTES ENCADRÉES • DEPUIS 2009"/,
        replace: '"heroMeta": "GRAND PUBLIC • DEPUIS 2009"',
        reason: 'Chiffre non prouvable retiré ; « encadrées » redondait avec le badge « ENCADREMENT PROFESSIONNEL ».',
    },
    /* --- Passe 2 : dédoublonnage méta × sous-titre effectué après revue --- */
    {
        file: 'messages/fr.json',
        find: /"heroMeta": "2 SEMAINES RÉSIDENTIELLES • EN ANGLAIS & FRANÇAIS"/,
        replace: '"heroMeta": "EN ANGLAIS & FRANÇAIS"',
        reason: '« 2 semaines » est déjà dans le sous-titre ; la méta ne garde que la langue.',
    },
    {
        file: 'messages/en.json',
        find: /"heroMeta": "2 RESIDENTIAL WEEKS • IN ENGLISH & FRENCH"/,
        replace: '"heroMeta": "IN ENGLISH & FRENCH"',
        reason: 'Idem FR : la durée reste au sous-titre.',
    },
    {
        file: 'messages/fr.json',
        find: /"heroMeta": "GRAND PUBLIC • DEPUIS 2009"/,
        replace: '"heroMeta": "DEPUIS 2009"',
        reason: '« Grand public » est déjà dans le sous-titre ; la méta ne garde que l’ancienneté.',
    },
    {
        file: 'messages/en.json',
        find: /"heroMeta": "OPEN TO THE PUBLIC • SINCE 2009"/,
        replace: '"heroMeta": "SINCE 2009"',
        reason: 'Idem FR.',
    },
    /* --- Messages EN : mêmes règles --- */
    {
        file: 'messages/en.json',
        find: /"heroMeta": "IN ENGLISH & FRENCH • 2 RESIDENTIAL WEEKS"/,
        replace: '"heroMeta": "IN ENGLISH & FRENCH"',
        reason: 'Idem FR : langue seule (état hérité).',
    },
    {
        file: 'messages/en.json',
        find: /"heroMeta": "\+20,000 SUPERVISED JUMPS • SINCE 2009"/,
        replace: '"heroMeta": "OPEN TO THE PUBLIC • SINCE 2009"',
        reason: 'Chiffre non prouvable retiré ; encadrement déjà porté par le badge.',
    },
];

const results = [];

for (const edit of EDITS) {
    const full = path.join(ROOT, edit.file);
    const content = fs.readFileSync(full, 'utf8');
    const match = content.match(edit.find);
    if (!match) {
        results.push({ ...edit, applied: false, note: 'motif introuvable (déjà appliqué ?)' });
        continue;
    }
    const next = content.replace(edit.find, edit.replace);
    if (APPLY) fs.writeFileSync(full, next, 'utf8');
    results.push({ ...edit, applied: true, before: match[0], after: edit.replace });
}

/* ---------------------- Rapport ---------------------------- */
const md = [];
md.push('# Revue — Badges de hero : doublons et gadgets (code)');
md.push('');
md.push(`**Mode :** ${APPLY ? 'APPLIQUÉ (--apply)' : 'DRY-RUN (aucune écriture)'}`);
md.push(`**Généré le :** ${new Date().toISOString()}`);
md.push('');
md.push('## Règle appliquée');
md.push('');
md.push(
    'Un badge = **une** information. Quand badge et méta disent la même chose, on conserve le badge (identité, au-dessus du titre) et la méta garde le détail qu’il ne porte plus. Un badge qui répète le titre est remplacé par un fait (durée, public, volume horaire).'
);
md.push('');
md.push('## Éditions');
md.push('');
for (const r of results) {
    md.push(`### \`${r.file}\` — ${r.applied ? '✔' : '⏭ ' + r.note}`);
    md.push('');
    md.push(`- Avant : \`${r.before ?? '(n/a)'}\``);
    md.push(`- Après : \`${r.after}\``);
    md.push(`- Motif : ${r.reason}`);
    md.push('');
}
const appliedCount = results.filter((r) => r.applied).length;
md.push(`**Total : ${appliedCount}/${results.length} édition(s).**`);
md.push('');
md.push('La base de données (`site_pages.hero.badge`) est alignée par');
md.push('[`apply_hero_badge_cleanup_migration.mjs`](scripts/apply_hero_badge_cleanup_migration.mjs:1).');
md.push('');

fs.mkdirSync(path.join(ROOT, 'plans'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'plans', 'revue-badges-hero.md'), md.join('\n'), 'utf8');

console.log(`=== Badges de hero (code) — ${APPLY ? 'APPLIQUÉ' : 'DRY-RUN'} ===`);
for (const r of results) {
    console.log(`${r.applied ? '✔' : '⏭'} ${r.file} : ${r.before ?? '(introuvable)'} → ${r.after}`);
}
console.log(`Total : ${appliedCount}/${results.length}`);
console.log('Rapport : plans/revue-badges-hero.md');
if (!APPLY) console.log('\nRelancer avec --apply pour écrire.');
