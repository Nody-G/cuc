#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Overlays EN des PROGRAMMES DE FORMATION (`site_programs` → `program`)
 * ==============================================================================
 * Les 6 programmes portent titre, description et durée en français : ce sont
 * des DONNÉES de vitrine, absentes des catalogues. Leur anglais vit dans
 * `site_translations` (entité `program`, `entity_id` = identifiant du programme)
 * et alimente le Cockpit de traduction ainsi que les vues qui lisent la table.
 *
 * Doctrine : traduction fidèle des textes du dépôt (`src/data/programs.ts`),
 * aucun fait ajouté ; identifiant inconnu SIGNALÉ et ignoré ; revue à chaque
 * exécution.
 *
 * Usage :
 *   node scripts/seed_programs_translations_en.mjs --dry
 *   node scripts/seed_programs_translations_en.mjs
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

async function rest(pathname, init = {}) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, {
        ...init,
        headers: { ...HEADERS, ...(init.headers || {}) },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${body.slice(0, 200)}`);
    return body ? JSON.parse(body) : null;
}

/** Traductions EN des 6 programmes — clé = `program.entity_id`. */
const PROGRAM_TRANSLATIONS = {
    'pro-longue-duree': {
        title: 'Two-Year Professional Stunt Course',
        duration: '2 years (9 to 10 courses)',
        description:
            'The benchmark programme for entering the action film industry. 9 to 10 immersive 12-day courses spread over two years. Continuous assessment, multidisciplinary work and real film-set experience.',
    },
    'stage-decouverte': {
        title: 'Discovery & Selection Course',
        duration: '12 consecutive days',
        description:
            'The essential entry point. It reveals the pace and demands of the stunt profession with no commitment to the long course. At the end of these 12 days, the teaching team gives its admission verdict for the long programme.',
    },
    'weekend-immersion': {
        title: 'Weekend Immersion Package',
        duration: '2 days (Friday 5pm to Sunday 5:30pm)',
        description:
            'An immersion into the world of film stunts. Sleep on campus, share daily life with professional stunt performers and learn the basics of falls, screen fights and giant airbag jumps.',
    },
    'afdas-artistes-interpretes': {
        title: 'AFDAS Course — Performing Artists',
        duration: '2 weeks (10 working days)',
        description:
            'A course designed to give actors and performers total credibility in action scenes. Learn to take hits, fall safely, handle prop weapons and work effectively with stunt coordinators.',
    },
    'stunt-summer-camp': {
        title: 'Stunt Summer Camp (Leisure & Skill Development)',
        duration: '1 week (Sunday afternoon to Friday evening)',
        description:
            'The annual gathering of the action community. A vibrant summer week combining demanding training, personal challenge and a festival atmosphere. Make giant strides on our state-of-the-art facilities alongside the best instructors in France.',
    },
    'afdas-cascadeurs-pro': {
        title: 'AFDAS Course — PRO Stunt Performers (Provence Studios)',
        duration: 'Dedicated skill-development session',
        description:
            'Skill-development course held at the film studios of Provence Studios (Martigues). Intended for professionals wanting to deepen their rigging techniques, falls and pyrotechnic safety on film sets.',
    },
};

const rows = (await rest('site_programs?select=id,title,duration,description')) || [];
const ids = new Set(rows.map((row) => row.id));

const review = [];
review.push('# Revue — Traductions EN des programmes (`program`)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/seed_programs_translations_en.mjs\`.`);
review.push('');
review.push(`Mode : **${DRY ? 'dry-run (aucune écriture)' : 'application en base'}**`);
review.push('');
review.push(`Programmes en base : **${rows.length}** — entrées du semis : **${Object.keys(PROGRAM_TRANSLATIONS).length}**.`);
review.push('');
review.push('| id | titre FR | titre EN | durée EN |');
review.push('|---|---|---|---|');

let seeded = 0;
const skipped = [];

for (const [id, fields] of Object.entries(PROGRAM_TRANSLATIONS)) {
    const row = rows.find((entry) => entry.id === id);
    if (ids.size > 0 && !ids.has(id)) {
        console.warn(`⚠️  ${id} absent de site_programs — ignoré (aucune ligne inventée).`);
        skipped.push(id);
        review.push(`| \`${id}\` | _(absent de la base — ignoré)_ | — | — |`);
        continue;
    }

    const [existing] = (await rest(
        `site_translations?select=payload&entity=eq.program&entity_id=eq.${encodeURIComponent(id)}&locale=eq.en`
    )) || [];
    const payload = { ...(existing?.payload || {}), ...fields };

    if (!DRY) {
        await rest('site_translations?on_conflict=entity,entity_id,locale', {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({
                entity: 'program',
                entity_id: id,
                locale: 'en',
                payload,
                is_published: true,
            }),
        });
    }

    seeded += 1;
    console.log(`${DRY ? '[dry] ' : ''}program/${id} — ${fields.title}`);
    review.push(`| \`${id}\` | ${row?.title ?? '—'} | ${fields.title} | ${fields.duration} |`);
}

review.push('');
review.push(`**${seeded}** programme(s) traduit(s).${skipped.length ? ` Ignorés : ${skipped.join(', ')}.` : ''}`);
review.push('');
review.push(
    `${DRY ? 'DRY-RUN — aucune écriture.' : 'Overlays publiés en base.'} Contrôle : \`npm run i18n:audit:entities\`.`
);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-traductions-programmes-en.md', review.join('\n'), 'utf8');

console.log('');
console.log(`${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — revue : plans/revue-traductions-programmes-en.md`);
