#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Semis des overlays EN du RÉFÉRENTIEL DES 10 DISCIPLINES
 * ==============================================================================
 * Les disciplines vivent dans `site_disciplines` (repli `CUC_DISCIPLINES`,
 * `src/data/disciplines.ts`) : intitulé, description longue, contexte de
 * tournage et équipements sont des DONNÉES, donc absents des catalogues
 * `messages/*.json` et laissés en français sur les pages anglaises.
 *
 * On sème ici leur traduction EN via `site_translations`
 * (`entity = 'discipline'`), consommée par `applyDisciplineOverlays`.
 *
 * Doctrine : traduction fidèle, aucun fait ajouté. Un identifiant inconnu en
 * base est SIGNALÉ et ignoré (jamais créé).
 *
 * Idempotent : fusion dans le payload EN existant, upsert sur
 * (entity, entity_id, locale). Fichier de revue écrit à chaque exécution.
 *
 * Usage :
 *   node scripts/seed_disciplines_translations_en.mjs --dry
 *   node scripts/seed_disciplines_translations_en.mjs
 * ==============================================================================
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const DRY = process.argv.includes('--dry');

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
};

/** Traductions EN des 10 disciplines — clé = `discipline.entity_id`. */
const DISCIPLINE_TRANSLATIONS = {
    'combat-choregraphie': {
        name: 'Choreographed Combat & Action Design',
        shortDesc:
            'Millimetre-precise martial reproduction, camera-axis management, strike synchronisation and believable impacts.',
        fullDesc:
            'Mastering screen combat is not about actually striking, but about reproducing the power of a confrontation with technical precision. Stunt performers learn the martial repertoires of East and West (boxing, muay thai, judo, krav maga, wushu), how to calculate safety distances, and the art of selling a hit through a physical reaction synchronised with the camera angle.',
        cinemaContext: 'Hand-to-hand scenes, brawls, knife duels, close-quarters action assaults.',
        equipment: [
            'Shin guards and concealable groin guards',
            'Training mitts',
            'Punching bags and focus pads',
            'Camera-axis monitoring cameras',
        ],
    },
    'chute-grande-hauteur': {
        name: 'High Falls (CUC Tower, 21m)',
        shortDesc:
            'Defenestration, free falls from 6 to 21 metres, aerial control and secure landings on airbags and boxes.',
        fullDesc:
            'Unique in Europe, the CUC Tower rises 21 metres above the campus with several progressive jump platforms. Trainees learn defenestration, backward drops, twists and free fall. Teaching focuses on spatial awareness, holding posture through to the landing, and the rigorous use of damping systems (professional stunt airbag, impact boxes).',
        cinemaContext:
            'Roof falls, defenestrations, being thrown off walkways or out of helicopters.',
        equipment: [
            'CUC 21m jump tower',
            'Certified giant CUC airbag',
            'High-density landing mats',
            'Calibrated stunt boxes',
        ],
    },
    'torche-humaine': {
        name: 'Human Torch & Pyrotechnic Stunts',
        shortDesc:
            'Partial or full burning of the stunt performer with protective thermal gel and multi-layer flame-retardant suits.',
        fullDesc:
            'The human torch demands rigorous technical preparation and uncompromising safety. Trainees study the application of insulating thermal gel, the fitting of aramid fibre (Nomex) suits, breath management and emergency extinguishing coordination with the pyrotechnic technicians.',
        cinemaContext: 'Explosion victims, fire scenes, laboratory or vehicle accidents.',
        equipment: [
            'Multi-layer Nomex suits',
            'High-insulation thermal gel',
            'Flame-retardant hoods and visors',
            'CO2 extinguishers and fire blankets',
        ],
    },
    'cablage-wirework': {
        name: '3D Wire Work & Film Rigging',
        shortDesc:
            'Stunt harnesses, suspensions, explosion propulsion and film wall-running.',
        fullDesc:
            'Using aeronautical cable systems, redirect pulleys and ergonomic harnesses worn under clothing, the stunt performer works on suspended scenes. This module trains propulsion by human or pneumatic counterweight (deadman drop, ratchets), simulating blast waves or aerial acrobatics, with a fluidity of movement suited to filming.',
        cinemaContext:
            'Superhero films, backward propulsion after a ballistic shot, acrobatic flights in action cinema.',
        equipment: [
            'Integrated stunt harnesses',
            'Kevlar and aeronautical steel cables',
            'Sealed-bearing pulleys',
            'Hip and lumbar protection plates',
        ],
    },
    'forces-speciales': {
        name: 'Weapon Handling & Tactical Roles',
        shortDesc:
            'Synchronised tactical unit movement, realistic handling of prop and blank-firing weapons, wall abseiling.',
        fullDesc:
            'This module teaches the precise movement of tactical units on screen: handling blank-firing weapons, coordinated progression through corridors and stairwells, hand signals and abseiling descents. Trainees rehearse on camera to perfect the credibility and realism of their postures.',
        cinemaContext:
            'Infiltrations, urban action shoot-outs, police operations and heist scenes.',
        equipment: [
            'Prop and blank-firing weapon replicas',
            'Action holsters',
            'Abseil ropes and descenders',
            'Film tactical vests',
        ],
    },
    'parkour-yamakasi': {
        name: 'Parkour & Yamakasi Method',
        shortDesc: 'Fast crossing of urban obstacles, fluidity and Parkour technique with Malik Diouf.',
        fullDesc:
            'Parkour at the CUC draws on the direct expertise of Malik Diouf, co-founder of the Yamakasi group. On a modular Parkour Park covering several hundred square metres, stunt performers learn the arm jump, cat leap, wall pass, rolled landings on hard ground, and how to chain trajectories in urban environments without losing speed.',
        cinemaContext:
            'Rooftop chases, agile escapes, realistic urban action scenes with no digital trickery.',
        equipment: [
            'Dedicated modular Parkour Park',
            'Metal structures and vaulting bars',
            'Shock-absorbing platforms',
            'Concrete and raw wood surfaces',
        ],
    },
    'chutes-sa-hauteur': {
        name: 'Drops from Standing Height & Furniture Breaks',
        shortDesc: 'Learning ground landings, shock absorption and impacts on film furniture.',
        fullDesc:
            "This module teaches absorbing impacts on the body's damping areas in order to protect the head, joints and spine. Training also includes passing through resin glass and breakable film furniture.",
        cinemaContext:
            'Knock-outs, fights, being thrown against set elements, falling to the ground after an impact.',
        equipment: [
            'Flat neoprene elbow and knee pads',
            'Breakable film furniture (balsa)',
            'Resin film glass',
            'Concrete and tiled floor surfaces',
        ],
    },
    'armes-blanches': {
        name: 'Historical & Modern Edged Weapon Handling',
        shortDesc: 'Katanas, swords, rapiers and parrying weapons in screen choreography.',
        fullDesc:
            'Edged weapon combat demands geometric rigour: blade safety, thrust distance, parries and striking intent. Stunt performers handle aluminium and foam training weapons before moving on to screen weapons. The work covers period combat for historical cinema as well as contemporary combat.',
        cinemaContext: 'Historical epics, period combat, fencing duels and modern sabre action scenes.',
        equipment: [
            'Practice katanas and bokkens',
            'Aluminium screen medieval swords',
            'Rapiers and parrying daggers',
            'Stage shields',
        ],
    },
    'chute-escalier': {
        name: 'Stair Falls',
        shortDesc:
            'Forward, backward and sideways tumbles on concrete and metal steps with discreet protection.',
        fullDesc:
            'A spectacular exercise, the stair fall demands precise rolling technique to control the trajectory and avoid trauma. Stunt performers learn to chain cushioned contacts on the steps, maintain core bracing and finish their fall along the camera axis.',
        cinemaContext:
            'Close-quarters confrontations in stairwells, shoving matches and falls from height.',
        equipment: [
            'Modular training staircase',
            'D3O protection worn under clothing',
            'Ramp guiding system',
            'Low-angle cameras',
        ],
    },
    'acrobatie-physique': {
        name: 'Stunt Acrobatics & Gymnastics',
        shortDesc:
            'Twists, somersaults, back handsprings and floor acrobatics to prepare dynamic throws and dodges.',
        fullDesc:
            'Acrobatics at the CUC prepares the body for the demands of physical stunts and action scenes. In the training halls equipped with a foam cube pit and trampolines, trainees develop spatial awareness before adapting their moves to filming constraints (hard floors, costumes and camera angles).',
        cinemaContext: 'Spectacular dodges, vaulting over vehicles, impact rolls.',
        equipment: [
            '50m³ foam cube pit',
            'Professional gymnastics trampolines',
            'Tumbling tracks and platforms',
            '40cm landing mats',
        ],
    },
};

async function rest(pathname, init = {}) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, {
        ...init,
        headers: { ...HEADERS, ...(init.headers || {}) },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${body}`);
    return body ? JSON.parse(body) : null;
}

async function upsertDiscipline(entityId, payload) {
    if (DRY) return;
    await rest('site_translations?on_conflict=entity,entity_id,locale', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
            entity: 'discipline',
            entity_id: entityId,
            locale: 'en',
            payload,
            is_published: true,
        }),
    });
}

const existingRows = (await rest('site_disciplines?select=id,name&order=order_index.asc')) || [];
const existingIds = new Set(existingRows.map((row) => row.id));

const review = [];
review.push('# Revue — Traductions EN des disciplines (`discipline`)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/seed_disciplines_translations_en.mjs\`.`);
review.push('');
review.push(`Mode : **${DRY ? 'dry-run (aucune écriture)' : 'application en base'}**`);
review.push('');
review.push(`Disciplines en base : **${existingRows.length}** — entrées du présent semis : **${Object.keys(DISCIPLINE_TRANSLATIONS).length}**.`);
review.push('');
review.push('| id | nom EN | contexte EN | équipements |');
review.push('|---|---|---|---|');
review.push('');

let seeded = 0;
for (const [id, fields] of Object.entries(DISCIPLINE_TRANSLATIONS)) {
    if (existingIds.size > 0 && !existingIds.has(id)) {
        console.warn(`⚠️  ${id} absent de site_disciplines — ignoré (aucune ligne inventée).`);
        review.push(`| \`${id}\` | _(absent de la base — ignoré)_ | — | — |`);
        continue;
    }

    const [existing] = (await rest(
        `site_translations?select=payload&entity=eq.discipline&entity_id=eq.${encodeURIComponent(id)}&locale=eq.en`
    )) || [];
    const payload = { ...(existing?.payload || {}), ...fields };

    console.log(`${DRY ? '[dry] ' : ''}discipline/${id} — ${fields.name}`);
    await upsertDiscipline(id, payload);
    seeded += 1;

    review.push(
        `| \`${id}\` | ${fields.name} | ${fields.cinemaContext} | ${fields.equipment.length} |`
    );
}

review.push('');
review.push(`**${seeded}** discipline(s) traduite(s).`);
review.push('');
review.push(
    `${DRY ? 'DRY-RUN — aucune écriture.' : 'Overlays publiés en base.'} Contrôle : \`node scripts/audit_en_pages_french.mjs\`.`
);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-traductions-disciplines-en.md', review.join('\n'), 'utf8');

console.log('');
console.log(`${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — revue : plans/revue-traductions-disciplines-en.md`);
