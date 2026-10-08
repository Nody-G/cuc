#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Semis des overlays EN des POINTS DU CAMPUS (entité `campus_poi`)
 * ==============================================================================
 * `site_campus_pois` porte les zones et installations du domaine (table
 * `site_campus_pois`, lue par `getCampusPOIs()` puis affichée par le plan
 * interactif du campus). Ces textes sont des DONNÉES : ils n'existent pas dans
 * les catalogues `messages/*.json` et restaient donc en français sur les pages
 * anglaises.
 *
 * On sème ici l'overlay EN (nom, catégorie, description, badge et
 * spécifications) via `site_translations`, que
 * `useEntityOverlays('campus_poi')` applique à l'affichage — le panneau de
 * détail du radar affiche en effet le badge et les specs de la zone.
 *
 * Doctrine : traduction fidèle de l'existant, aucune valeur inventée. Les
 * identifiants doivent correspondre aux lignes réelles de `site_campus_pois` ;
 * un identifiant inconnu est signalé et ignoré plutôt que créé.
 *
 * Idempotent : fusion dans le payload EN existant, upsert sur
 * (entity, entity_id, locale). Fichier de revue écrit à CHAQUE exécution.
 *
 * Usage :
 *   node scripts/seed_campus_pois_translations_en.mjs --dry
 *   node scripts/seed_campus_pois_translations_en.mjs
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
 * Traductions EN des POIs — calquées sur le FR en base, sans ajout de fait.
 * Clé = `site_campus_pois.id`.
 */
const POI_TRANSLATIONS = {
    'tower-21m': {
        name: '21m Jump Tower',
        category: 'Height & Free Falls',
        description:
            'Opened in late 2024, this is the tallest stunt jump tower in Europe. Platforms at 5m, 8m, 12m, 16m and 21m for jumps onto a giant airbag.',
        badge: 'OPENED OCT. 2024',
        specs: '21m height • 5/8/12/16/21m platforms • Drop beam • APAVE certified',
    },
    'grand-dojo': {
        name: 'Grand Dojo & 600m² Tatami',
        category: 'Fights & Martial Arts',
        description:
            'Covered space dedicated to martial choreography, film fights, throws and ground acrobatics on a shock-absorbing floor.',
        badge: 'CHOREOGRAPHY SPACE',
        specs: '600m² tatami • Punching bags • Mobile brick wall • Ring',
    },
    'airbag-zone': {
        name: 'Fall Pit & Giant Airbag',
        category: 'Impact Safety',
        description:
            'Secured outdoor landing area for high falls, full-body burn stunts and vehicle ejections.',
        badge: 'IMPACT ZONE',
        specs: '15x15m inflatable airbag • 60cm fall mat • Cube pit',
    },
    'rigging-cables': {
        name: '3D Rigging Structure & Wire Work',
        category: 'Cable Special Effects',
        description:
            'Gantries and high-speed winches used to simulate explosive propulsion, flight and studio wire stunts.',
        badge: '3D RIGGING',
        specs: 'Motorised winches • Jerk vest harness • 35m flight lines',
    },
    'mfr-residence': {
        name: 'Trainee Residence & Refectory',
        category: 'Accommodation & Logistics',
        description:
            'Shared rooms, residential accommodation, refectory for full board and video debrief rooms on the wooded grounds.',
        badge: 'FULL BOARD',
        specs: '60 beds capacity • Professional kitchen • Trainee lounge',
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

async function upsertPoi(entityId, payload) {
    if (DRY) return;
    await rest('site_translations?on_conflict=entity,entity_id,locale', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
            entity: 'campus_poi',
            entity_id: entityId,
            locale: 'en',
            payload,
            is_published: true,
        }),
    });
}

const review = [];
review.push('# Revue — Traductions EN des points du campus (`campus_poi`)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/seed_campus_pois_translations_en.mjs\`.`);
review.push('');
review.push(`Mode : **${DRY ? 'dry-run (aucune écriture)' : 'application en base'}**`);
review.push('');

/**
 * Colonnes réelles de `site_campus_pois` : le badge affiché par le radar vient de
 * `level`, et les specs sont composées (`surface`, `features`, `equipment`) —
 * il n'existe NI colonne `badge` NI colonne `specs` en base.
 */
const rows =
    (await rest(
        'site_campus_pois?select=id,name,category,description,level,surface,features,equipment'
    )) || [];

/** Reconstitue les specs FR telles que l'application les affiche (badge/specs). */
function frenchSpecs(row) {
    if (!row) return '—';
    return [row.surface, ...(row.features || []), ...(row.equipment || [])]
        .filter(Boolean)
        .join(' • ');
}
const known = new Set(rows.map((row) => row.id));
console.log(`📦 site_campus_pois : ${rows.length} objet(s) en base`);

const unknown = Object.keys(POI_TRANSLATIONS).filter((id) => !known.has(id));
if (unknown.length) {
    console.warn(`⚠️  Identifiants absents de la base (ignorés) : ${unknown.join(', ')}`);
}

review.push('| id | FR (base) | EN semé | badge FR (`level`) → EN | specs FR (surface/features/equipment) → EN |');
review.push('|---|---|---|---|---|');
let seeded = 0;

for (const [id, fields] of Object.entries(POI_TRANSLATIONS)) {
    if (!known.has(id)) continue;
    const fr = rows.find((row) => row.id === id);
    review.push(
        `| \`${id}\` | ${fr?.name ?? '—'} | ${fields.name} | ${fr?.level ?? '—'} → ${fields.badge} | ${frenchSpecs(fr)} → ${fields.specs} |`
    );

    const [existing] = (await rest(
        `site_translations?select=payload&entity=eq.campus_poi&entity_id=eq.${encodeURIComponent(id)}&locale=eq.en`
    )) || [];
    const payload = { ...(existing?.payload || {}), ...fields };

    console.log(`${DRY ? '[dry] ' : ''}campus_poi/${id} — ${fields.name} / ${fields.category}`);
    await upsertPoi(id, payload);
    seeded += 1;
}

review.push('');
review.push(`**${seeded}** point(s) traduit(s) sur ${rows.length} en base.`);
review.push('');
review.push(
    `${DRY ? 'DRY-RUN — aucune écriture.' : 'Overlays publiés en base.'} Contrôle : \`node scripts/audit_en_pages_french.mjs\`.`
);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-traductions-pois-en.md', review.join('\n'), 'utf8');

console.log('');
console.log(`${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — revue : plans/revue-traductions-pois-en.md`);
if (unknown.length) process.exitCode = 2;
