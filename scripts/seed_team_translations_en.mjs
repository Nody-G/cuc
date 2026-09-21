#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Semis des overlays EN des COACHS (entité `team` de site_translations)
 * ==============================================================================
 * Cause racine corrigée : `getEntityOverlays('team')` n'avait aucun consommateur
 * et AUCUN overlay EN n'existait en base — les fiches coachs (dont Lucas Dollfus)
 * restaient donc intégralement en français en mode anglais.
 *
 * Méthode (doctrine) :
 *   - traductions par CHEMIN (`title`, `bio`, `specialties[i]`), appliquées sur
 *     la fiche FR RÉELLE lue dans `site_team` — jamais retapée ;
 *   - les tableaux `specialties` sont écrits EN ENTIER (alignement d'index) ;
 *   - fusion dans le payload EN existant, upsert sur (entity, entity_id, locale) ;
 *   - fichier de revue `plans/revue-traductions-coachs-en.md` écrit À CHAQUE
 *     exécution (dry inclus) — on relit avant de synchroniser.
 *
 * Rédaction factuelle (doctrine « zéro AI slop ») : traduction fidèle des fiches
 * FR, aucun titre ni exploit ajouté.
 *
 * Usage :
 *   node scripts/seed_team_translations_en.mjs --dry
 *   node scripts/seed_team_translations_en.mjs
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
 * Traductions EN par coach. Les clés absentes laissent le FR en place.
 * Les tableaux `specialties` sont complets et alignés sur l'index FR.
 */
const TRANSLATIONS = {
    'lucas-dollfus': {
        role: 'Founder & Managing Director',
        title: 'Stunt Coordinator & Lead Instructor',
        bio: 'Founder of Campus Univers Cascades in 2008. Lucas Dollfus coordinates stunts for feature films, series and live events, applying a training method built on technical rigour, safety and versatility.',
        specialties: ['Stunt coordination', 'Action design', 'On-set safety', 'High falls'],
    },
    'jerome-gaspard': {
        role: 'Head of Training',
        title: 'Film Stunt Coordinator',
        bio: 'Stunt coordinator and instructor at the CUC with more than 30 years of experience and over 200 productions. A former high-level gymnast and founder of Action Cascade and France-Cascade, he designs and coordinates major physical and mechanical stunts for film.',
        specialties: ['Stunt coordination', 'High falls', 'Rigging', 'Armed combat'],
    },
    'vincent-bouillon': {
        role: 'Fight & Fall Specialist',
        bio: 'Professional stunt performer, member of the Cascade Demo Team and Hitz International. Winner of a Taurus World Stunt Award for John Wick 4 and nominated as best coordinator for The Killer (John Woo). He is notably the exclusive stunt double for Keanu Reeves and Tomer Sisley.',
        specialties: ['Choreographed fights', 'Tricking & martial arts', 'Physical falls', 'Film doubling'],
    },
    'malik-diouf': {
        role: 'Co-founder of the Yamakasi',
        title: 'Parkour Lead',
        bio: 'A founding member of the Yamakasi group. Malik Diouf teaches Parkour and urban obstacle crossing at the CUC, combining acting performance, action coordination and a rigorous approach to teaching.',
        specialties: ['Parkour', 'Obstacle crossing', 'Physical conditioning', 'Urban agility'],
    },
    'franck-blanc': {
        title: 'Coach — 3D Rigging, Fire Torches & Pyrotechnics',
        bio: 'Deputy director of the CUC and an experienced professional stunt performer. Franck Blanc supervises fire stunts (human torches), high falls and 3D rigging systems under a strict thermal and kinetic safety protocol.',
        specialties: ['Human torches', 'Studio rigging', 'High falls', 'Risk management'],
    },
    'kefi-abrikh': {
        role: 'Action Designer & Choreographer',
        title: 'Specialist in Fight Choreography & Second Unit',
        bio: 'Stunt coordinator, fight choreographer and second-unit director. Founder of AC Stunts, he works on the design, pre-cutting and choreography of intense confrontations for international blockbusters.',
        specialties: ['Action design', 'Fight choreography', 'Technical shot design', 'Previsualisation'],
    },
    'maurice-chan': {
        role: 'Lead Instructor',
        title: 'Specialist in Fights, Falls & Martial Comedy',
        bio: 'Stunt performer, fight choreographer and co-founder of the Cascade Demo Team (1997). Author of a reference book on physical stunts, he teaches martial rigour, kinetic timing and high-intensity falls.',
        specialties: ['Martial arts & Wushu', 'Fight choreography', 'Action comedy', 'Synchronised falls'],
    },
    'michel-bouis': {
        title: 'Specialist in Falls and Weapons Handling',
        bio: 'Professional stunt performer for over thirty years, credited on more than 240 French and international productions. He teaches high falls, weapons handling and close-quarters combat, with a focus on safety and repeatability of movement on set.',
        specialties: ['High falls', 'Weapons handling', 'Close-quarters combat', 'Vehicle stunts'],
    },
    'amedeo-cazzella': {
        title: 'Specialist in Fights & Weapons Handling',
        bio: 'Stunt performer, fight coordinator and co-founder of the Cascade Demo Team (1997). A recognised specialist in edged-weapon handling and stage fencing for historical and modern action cinema.',
        specialties: ['Edged weapons', 'Stage fencing', 'Armed choreography', 'Stunt coordination'],
    },
    'niels-dalery': {
        title: 'Specialist in Acrobatics & Freerunning',
        bio: 'Stunt performer, professional freerunner and French Speed Running champion (2013). At the CUC, Niels Dalery teaches ground acrobatics, aerial rotations and freerunning applied to film stunts.',
        specialties: ['Ground acrobatics', 'Urban freerunning', 'Stage tricks', 'Trampoline'],
    },
    'bastien-trouve': {
        bio: 'Instructor at the CUC and a professional stunt performer working on feature films, television series and action concepts.',
        specialties: ['Stage combat', 'Weapons handling', 'Physical falls', 'Parkour'],
    },
    'alan-cueff': {
        bio: 'Instructor at the CUC and professional stunt performer with a BPJEPS AGA qualification. He works on physical stunts, acrobatics and tactical movement for television and film productions.',
        specialties: ['Acrobatics', 'Physical falls', 'Driving stunts', 'Tactical movement'],
    },
};

/** Fiches coachs RÉELLES en base — la vérité, jamais retapée. */
async function rest(pathname, init = {}) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, {
        ...init,
        headers: { ...HEADERS, ...(init.headers || {}) },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${body}`);
    return body ? JSON.parse(body) : null;
}

const teamRows = await rest('site_team?select=id,name,role,title,bio,specialties&order=order_index.asc');
const existingOverlays = await rest(
    'site_translations?select=entity_id,payload&entity=eq.team&locale=eq.en'
);
const existingByCoach = new Map(existingOverlays.map((row) => [row.entity_id, row.payload || {}]));
const teamById = new Map(teamRows.map((row) => [row.id, row]));

let applied = 0;
const review = [];
review.push('# Revue — Traductions EN des coachs (entité `team`)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/seed_team_translations_en.mjs\`.`);
review.push('');
review.push(`Mode : **${DRY ? 'dry-run (aucune écriture)' : 'application en base'}**`);
review.push('');
review.push('| Coach | Champs EN fournis |');
review.push('|---|---|');

for (const [coachId, fields] of Object.entries(TRANSLATIONS)) {
    const frRow = teamById.get(coachId);
    if (!frRow) {
        console.error(`❌ Coach « ${coachId} » absent de site_team — ignoré.`);
        process.exitCode = 2;
        continue;
    }

    // Garde-fou : les spécialités EN doivent être alignées sur la fiche FR.
    if (
        fields.specialties &&
        Array.isArray(frRow.specialties) &&
        fields.specialties.length !== frRow.specialties.length
    ) {
        console.error(
            `❌ ${coachId} : ${fields.specialties.length} spécialité(s) EN pour ${frRow.specialties.length} FR — alignement d'index invalide.`
        );
        process.exitCode = 2;
        continue;
    }

    const payload = {
        ...(existingByCoach.get(coachId) || {}),
        ...fields,
    };

    review.push(
        `| \`${coachId}\` (${frRow.name}) | ${Object.keys(fields).join(', ')} |`
    );
    console.log(
        `${DRY ? '[dry] ' : ''}team/${coachId} (${frRow.name}) — ${Object.keys(fields).join(', ')}`
    );

    if (!DRY) {
        await rest('site_translations?on_conflict=entity,entity_id,locale', {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({
                entity: 'team',
                entity_id: coachId,
                locale: 'en',
                payload,
                is_published: true,
            }),
        });
    }
    applied += 1;
}

review.push('');
review.push(
    `${applied}/${teamRows.length} fiche(s) coach couverte(s) en EN — ${DRY ? 'dry-run, rien n’a été écrit.' : 'overlays publiés en base.'}`
);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-traductions-coachs-en.md', `${review.join('\n')}\n`, 'utf8');

console.log('');
console.log(`${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — ${applied} fiche(s) coach EN traitée(s).`);
console.log('Revue : plans/revue-traductions-coachs-en.md');
console.log('');
