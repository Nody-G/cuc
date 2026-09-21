#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Overlays EN des ÉVÉNEMENTS (`site_events`) et des PARTENAIRES
 * (`site_partners`)
 * ==============================================================================
 * Ces deux tables portent du texte éditorial français (titre, sous-titre,
 * description, équipements, accroches commerciales). Leur anglais vit dans
 * `site_translations` (entités `event` et `partner`), consommé par les helpers
 * `apply-*-overlay` et par le Cockpit de traduction.
 *
 * Doctrine : traduction fidèle, aucun fait ajouté ; identifiant inconnu en base
 * SIGNALÉ et ignoré ; revue écrite à chaque exécution.
 *
 * Usage :
 *   node scripts/seed_events_partners_translations_en.mjs --dry
 *   node scripts/seed_events_partners_translations_en.mjs
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

/** Traductions EN des 3 événements — clé = `event.entity_id`. */
const EVENT_TRANSLATIONS = {
    'team-building': {
        title: 'Stunt & Action Team Building',
        subtitle: 'Team cohesion and personal challenge in full immersion',
        badge: 'COMPANIES & SEMINARS',
        description:
            'Bring your teams together around physical stunt workshops open to everyone: an introduction to screen falls, choreographed fights and airbag jumps under strict safety supervision.',
        features: [
            'Supervision by professional stunt performers',
            'Open to all fitness levels',
            'Private dojos and structures',
            'Video souvenir report included',
        ],
        price_indicator: 'From €120 / participant',
        cta_text: 'Request a team building quote',
    },
    spectacles: {
        title: 'Live Stunt Shows',
        subtitle: 'Stunt and Yamakasi choreography for your events',
        badge: 'LIVE SHOWS & FESTIVALS',
        description:
            'Bespoke performances combining aerial work, parkour, fight stunts and pyrotechnic effects for theme parks, festivals and product launches.',
        features: [
            'Bespoke staging and scripting',
            'Team of 2 to 15 performers',
            'Self-contained equipment and safety',
            'Indoors or outdoors',
        ],
        price_indicator: 'Quote on specifications',
        cta_text: 'Book a live show',
    },
    airbag: {
        title: 'Giant Airbag Rental & Animations',
        subtitle: 'The travelling thrill attraction for all your events',
        badge: 'SUPERVISED MOBILE ANIMATION',
        description:
            'Deployment of our professional stunt airbag with a jump platform up to 10 metres. Guaranteed thrills for your audiences in complete safety.',
        features: [
            'Certified to film-industry safety standards',
            'Qualified CUC operators included',
            'Fast set-up and dismantling',
            'Capacity up to 120 jumps / hour',
        ],
        price_indicator: 'Day and weekend packages',
        cta_text: 'Rent the giant airbag',
    },
};

/** Traductions EN des partenaires — clé = `partner.entity_id`. */
const PARTNER_TRANSLATIONS = {
    qualiopi: {
        description:
            'Quality certification for training programmes (AFDAS and France Travail eligible).',
    },
    nike: { description: 'Sports equipment brand (sportswear and footwear).' },
    'rxr-protect': {
        description:
            'Inflatable body protection vests and equipment (Air Shock Absorber technology).',
    },
    gravity: { description: 'Clothing and streetwear for parkour and freerunning.' },
    c17: { description: 'Physical special effects, pyrotechnics and armoury for film.' },
    kiloutou: {
        description: 'Rental of aerial platforms, lifting equipment and site machinery.',
    },
    'tm-incendie': {
        description: 'Sale and maintenance of fire safety equipment and extinguishers.',
    },
    'action-cascade': {
        description: 'Stunt team and stunt coordination for film shoots and live shows.',
    },
    'aya-catch': {
        description: 'French professional wrestling school and association for scripted wrestling.',
    },
    'cascade-demo-team': {
        description: 'Martial arts demonstration troupe (XMA) and martial acrobatics.',
    },
    'xtrem-video': {
        description: 'Production and distribution of action and extreme sports video content.',
    },
    taffcoeur: { description: 'Video production studio, music videos and live show recordings.' },
    'mfr-le-cateau': {
        description: 'Accommodation and meals for trainees in Le Cateau-Cambrésis.',
    },
    bsn: { description: 'Sports nutrition and food supplements for athletes.' },
};

const review = [];
review.push('# Revue — Traductions EN des événements (`event`) et partenaires (`partner`)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/seed_events_partners_translations_en.mjs\`.`);
review.push('');
review.push(`Mode : **${DRY ? 'dry-run (aucune écriture)' : 'application en base'}**`);
review.push('');

let seeded = 0;
const skipped = [];

async function seedEntity(entity, translations, table) {
    const rows = (await rest(`${table}?select=id`)) || [];
    const ids = new Set(rows.map((row) => row.id));
    review.push(`## ${entity} — ${rows.length} ligne(s) en base`);
    review.push('');
    review.push('| id | traduction |');
    review.push('|---|---|');
    for (const [id, fields] of Object.entries(translations)) {
        if (ids.size > 0 && !ids.has(id)) {
            console.warn(`⚠️  ${entity}/${id} absent de ${table} — ignoré (aucune ligne inventée).`);
            skipped.push(`${entity}/${id}`);
            review.push(`| \`${id}\` | _(absent de la base — ignoré)_ |`);
            continue;
        }
        const [existing] = (await rest(
            `site_translations?select=payload&entity=eq.${entity}&entity_id=eq.${encodeURIComponent(id)}&locale=eq.en`
        )) || [];
        const payload = { ...(existing?.payload || {}), ...fields };
        if (!DRY) {
            await rest('site_translations?on_conflict=entity,entity_id,locale', {
                method: 'POST',
                headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
                body: JSON.stringify({
                    entity,
                    entity_id: id,
                    locale: 'en',
                    payload,
                    is_published: true,
                }),
            });
        }
        seeded += 1;
        console.log(`${DRY ? '[dry] ' : ''}${entity}/${id} — ${Object.keys(fields).length} champ(s)`);
        review.push(`| \`${id}\` | ${Object.keys(fields).join(', ')} |`);
    }
    review.push('');
}

await seedEntity('event', EVENT_TRANSLATIONS, 'site_events');
await seedEntity('partner', PARTNER_TRANSLATIONS, 'site_partners');

review.push(`**${seeded}** overlay(s) semé(s).${skipped.length ? ` Ignorés : ${skipped.join(', ')}.` : ''}`);
review.push('');
review.push(
    `${DRY ? 'DRY-RUN — aucune écriture.' : 'Overlays publiés en base.'} Contrôle : \`npm run i18n:audit:entities\`.`
);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-traductions-evenements-partenaires-en.md', review.join('\n'), 'utf8');

console.log('');
console.log(`${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — revue : plans/revue-traductions-evenements-partenaires-en.md`);
