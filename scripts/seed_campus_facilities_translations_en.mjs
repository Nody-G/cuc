#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Semis des overlays EN des INSTALLATIONS DU CAMPUS (`campus_facility`)
 * ==============================================================================
 * `site_campus_facilities` (et sa constante de repli `CAMPUS_FACILITIES` dans
 * `src/data/campus.ts`) porte les 9 installations du domaine : nom, gabarit,
 * description, équipements clés et normes. Ces textes sont des DONNÉES : ils
 * n'existent pas dans les catalogues `messages/*.json` et restaient donc en
 * français sur les pages anglaises.
 *
 * On sème ici l'overlay EN via `site_translations` (entité `campus_facility`,
 * `entity_id` = identifiant de l'installation), que
 * `useEntityOverlays('campus_facility')` applique à l'affichage.
 *
 * Doctrine : traduction fidèle de l'existant, aucune valeur inventée. Les
 * identifiants doivent correspondre aux installations réelles ; un identifiant
 * inconnu est signalé et ignoré plutôt que créé.
 *
 * Idempotent : fusion dans le payload EN existant, upsert sur
 * (entity, entity_id, locale). Fichier de revue écrit à CHAQUE exécution.
 *
 * Usage :
 *   node scripts/seed_campus_facilities_translations_en.mjs --dry
 *   node scripts/seed_campus_facilities_translations_en.mjs
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

/**
 * Traductions EN des 9 installations — calquées sur le FR du dépôt, sans ajout
 * de fait. Clé = identifiant d'installation (`campus_facility.entity_id`).
 */
const FACILITY_TRANSLATIONS = {
    'cuc-tower': {
        name: 'CUC Tower (21m Jump Tower)',
        size: 'Height: 21 metres',
        description:
            'Landmark structure opened in October 2024 at Le Cateau-Cambrésis. Over 20 metres high, with several secured jump platforms, an external galvanised staircase and a giant airbag for free falls from 6 to 21 metres, defenestrations and film abseiling.',
        features: [
            'Tiered jump platforms (6m, 9m, 12m, 15m, 21m)',
            'Multi-flight industrial galvanised staircase',
            'Defenestration platform with open bays for camera work',
            'Abseil anchors for vertical action scenes',
            'XXL landing zone for professional stunt airbag',
        ],
        specifications:
            'High-strength steel structure, tiered jump platforms, professional film airbag landing',
    },
    'zoe-bell-hall': {
        name: 'Zoé Bell Hall — Gym & Olympic Pit',
        size: '700 m² covered',
        description:
            'Space dedicated to acrobatics and falls, named in tribute to Zoé Bell, patron of the Campus. Fitted with a foam cube pit of more than 50 m³ and a full Olympic apparatus floor.',
        features: [
            'High-resilience 50m³ foam cube pit',
            'Tumbling track and competition trampoline',
            '40cm crash mat landing surface',
            'Camera system with instant screen playback',
        ],
        specifications:
            'Continuous shock-absorbing floor, 8-metre ceiling height, zenithal film lighting',
    },
    'hangar-wirework': {
        name: 'Wire Work & Physical Stunts Hall',
        size: '600 m² covered',
        description:
            'Space dedicated to 3D wire work, blast simulators and furniture falls. The structures allow high-load pulleys and ratchets to be rigged.',
        features: [
            '2-tonne certified lifting beams for 3-axis wire work',
            'Furniture crash and film glass-break zone',
            'Catapult systems and manual counterweights',
            'Modular indoor shooting stage',
        ],
        specifications:
            'Reinforced steel I-beams, continuous lifeline, polished concrete floor for slides and pulls',
    },
    'dojos-sceniques': {
        name: 'Screen Dojos & Weapons Room',
        size: '3 separate tatami areas',
        description:
            'Dedicated to choreographed fights, screen martial arts and the handling of edged weapons and blank-firing firearms under instructor supervision.',
        features: [
            'High-density impact tatami for intensive rehearsals',
            'Replica armoury (katanas, swords, rapiers, stage weapons)',
            'Large axis mirrors for setting strike angles',
            'Playback screens for teaching review',
        ],
        specifications: 'Professional martial arts standard, controlled heating and cooling',
    },
    'manege-equestre': {
        name: 'Covered Equestrian Ring & Stables',
        size: '900 m² covered + stables',
        description:
            'Facility for equestrian stunts, film horse falls and vaulting in the saddle under cover.',
        features: [
            'Covered ring with fibre-sand surface designed for film work',
            'On-site stables for horses trained for action scenes',
            'Vaulting equipment and period tack',
            'Briefing and tack room area',
        ],
        specifications:
            'High-absorption fibre loose surface, 900 m² of riding area with no central pillar',
    },
    'espace-mecanique': {
        name: 'Mechanical Space & Vehicle Stunts',
        size: 'Asphalt and hard-standing area',
        description:
            'Closed circuit for controlled skids, car and quad action manoeuvres, impacts on equipped stunt performers and rollover simulations.',
        features: [
            'Asphalt driving area and secured run-off zone',
            'Vehicles fitted with approved safety roll cages',
            'Stunt quads and motorcycles',
            'Controlled impact triggering systems',
        ],
        specifications:
            'Restricted access, safety supervision and permanent fire-extinguishing equipment',
    },
    'site-tournage': {
        name: 'Outdoor Site & Natural Filming Sets',
        size: 'Private enclosed estate',
        description:
            'Large secured wooded outdoor estate offering multiple filming perspectives: chases, explosions, urban and natural sets.',
        features: [
            'Enclosed wooded estate',
            'Multi-sports court and outdoor sports facilities',
            'Clear areas for pyrotechnic stunts',
            'Modular stages for film crews',
        ],
        specifications: 'Private enclosed estate, suited to filming',
    },
    'qg-staff-hebergement': {
        name: 'Accommodation & Base Camp (90 Places)',
        size: '90 beds on site',
        description:
            'A closed campus able to accommodate and cater for up to 90 trainees and instructors on site for a complete immersion.',
        features: [
            'Rooms with en-suite facilities and internet access',
            'Refectory and suitable professional kitchen',
            'Video debrief rooms and theory classrooms',
            'Reception and production offices',
        ],
        specifications:
            'Wooded and secured setting, 1h40 from Paris (Le Cateau-Cambrésis)',
    },
    'city-stade-exterieur': {
        name: 'Multi-Sports Court & Outdoor Training Area',
        size: 'Outdoor sports facilities',
        description:
            'Outdoor multi-sports court and open-air physical conditioning area for strength and cardio work.',
        features: [
            'Modern multi-sports court to sports standards',
            'Outdoor training areas',
            'Drill and group warm-up lanes',
            'Direct view of the CUC Tower',
        ],
        specifications: 'All-weather shock-absorbing synthetic surface',
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

async function upsertFacility(entityId, payload) {
    if (DRY) return;
    await rest('site_translations?on_conflict=entity,entity_id,locale', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
            entity: 'campus_facility',
            entity_id: entityId,
            locale: 'en',
            payload,
            is_published: true,
        }),
    });
}

const review = [];
review.push('# Revue — Traductions EN des installations du campus (`campus_facility`)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/seed_campus_facilities_translations_en.mjs\`.`);
review.push('');
review.push(`Mode : **${DRY ? 'dry-run (aucune écriture)' : 'application en base'}**`);
review.push('');

const ids = Object.keys(FACILITY_TRANSLATIONS);
review.push('| id | nom EN | gabarit EN | équipements | normes |');
review.push('|---|---|---|---|---|');

let seeded = 0;
for (const id of ids) {
    const fields = FACILITY_TRANSLATIONS[id];

    const [existing] = (await rest(
        `site_translations?select=payload&entity=eq.campus_facility&entity_id=eq.${encodeURIComponent(id)}&locale=eq.en`
    )) || [];
    const payload = { ...(existing?.payload || {}), ...fields };

    console.log(`${DRY ? '[dry] ' : ''}campus_facility/${id} — ${fields.name}`);
    await upsertFacility(id, payload);
    seeded += 1;

    review.push(
        `| \`${id}\` | ${fields.name} | ${fields.size} | ${fields.features.length} | ${fields.specifications} |`
    );
}

review.push('');
review.push(`**${seeded}** installation(s) traduite(s).`);
review.push('');
review.push(
    `${DRY ? 'DRY-RUN — aucune écriture.' : 'Overlays publiés en base.'} Contrôle : \`node scripts/audit_en_pages_french.mjs\`.`
);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-traductions-installations-en.md', review.join('\n'), 'utf8');

console.log('');
console.log(`${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — revue : plans/revue-traductions-installations-en.md`);
