#!/usr/bin/env node
/**
 * MIGRATION — Badges & sous-titres de hero : dédoublonnage FR/EN
 * ==============================================================
 *
 * Aligne la base sur la revue éditoriale (voir `plans/revue-badges-hero.md`) :
 *   A. `site_pages.hero.badge` — suppression des doublons badge × méta / titre,
 *      normalisation typographique de l'espace avant « • » ;
 *   B. `site_pages.hero.subtitle` — retrait des chiffres dupliqués par le
 *      badge (formation) et des chaînes TV dupliquées par la méta (videos) ;
 *   C. `site_translations` (overlays ANGLAIS) — mêmes règles appliquées aux
 *      badges et sous-titres EN, restés sur les anciennes formulations.
 *
 * INCIDENT & RÉPARATION (2026-09-21, consigné pour la traçabilité) :
 * la première version de la normalisation utilisait
 * `regexp_replace(..., E'\\1 •')` — or dans une chaîne E'' PostgreSQL, `\1`
 * est un échappement OCTAL (U+0001), PAS une rétro-référence : le caractère
 * précédant « • » était consommé sur quatre badges. Les quatre valeurs
 * d'origine, consignées dans le dry-run, sont RESTAURÉES par littéraux ; la
 * normalisation est calculée côté JavaScript puis écrite par valeur littérale.
 * Le rapport VÉRIFIE qu'aucun caractère de contrôle ne subsiste.
 *
 * Doctrine : DRY-RUN documenté AVANT écriture.
 *   node scripts/apply_hero_badge_cleanup_migration.mjs          # aperçu
 *   node scripts/apply_hero_badge_cleanup_migration.mjs --write  # applique
 */

import fs from 'node:fs';
import path from 'node:path';
import * as dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const WRITE = process.argv.includes('--write');
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || /\[YOUR-PASSWORD\]|\[MOT_DE_PASSE\]/.test(databaseUrl)) {
    console.error('DATABASE_URL manquant ou placeholder dans .env.local.');
    process.exit(1);
}

/** A. Badges FR (identiques aux fallbacks code). */
const NEW_BADGES = {
    'stunt-workshop-cuc': 'STAGE INTERNATIONAL',
    'videos-cascadeur': 'REPORTAGES TÉLÉVISION',
    'spectacles-cascadeurs-yamakasi': 'LE CINÉMA S’INVITE SUR SCÈNE',
    'team-building-cascades': 'SÉMINAIRES & ENTREPRISES',
    partenaires: 'ILS NOUS ACCOMPAGNENT',
    'formation-de-cascadeur': '2 ANS • 720H À 800H',
    'contact-cuc': 'ADMISSIONS & PROJETS',
    'stages-cascades-parkour-2': 'TOUS NIVEAUX • DÈS 16 ANS',
};

/** Valeurs restaurées après l'incident d'échappement octal (voir en-tête). */
const REPAIRED_BADGES = {
    '/': 'PREMIER CENTRE EUROPÉEN • ACTION DESIGN & CASCADE CINÉMA',
    'animations-airbag-parkour': 'AIRBAG DE CINÉMA • ENCADREMENT PROFESSIONNEL',
    'cuc-events-agence': 'AGENCE ÉVÉNEMENTIELLE D’ACTION • SHOWS CLÉ EN MAIN',
    'cuc-team-cascadeur': 'COORDINATION DE CASCADES • CINÉMA',
};

/** B. Sous-titres FR dédoublonnés (badge/meta portent déjà ces informations). */
const NEW_SUBTITLES_FR = {
    'formation-de-cascadeur':
        "Un cursus pour maîtriser l'ensemble des disciplines de la cascade physique et cinématographique.",
    'videos-cascadeur':
        "Découvrez les coulisses de l'entraînement des cascadeurs du CUC et les showreels du Campus Univers Cascades.",
};

/** C. Overlays ANGLAIS (entity='page') : badges et sous-titres alignés sur le FR. */
const OVERLAY_HERO_EN = {
    'contact-cuc': { badge: 'ADMISSIONS & PROJECTS' },
    'videos-cascadeur': {
        badge: 'TV REPORTS',
        subtitle:
            'Go behind the scenes of CUC stunt training and discover the Campus Univers Cascades showreels.',
    },
    'stunt-workshop-cuc': { badge: 'INTERNATIONAL WORKSHOP' },
    'stages-cascades-parkour-2': { badge: 'ALL LEVELS • FROM 16' },
    'formation-de-cascadeur': {
        badge: '2 YEARS • 720-800 HOURS',
        subtitle: 'A programme to master the full range of physical and film stunt disciplines.',
    },
    'spectacles-cascadeurs-yamakasi': { badge: 'CINEMA ON STAGE' },
    'team-building-cascades': { badge: 'SEMINARS & COMPANIES' },
    partenaires: { badge: 'SUPPORTING US' },
};

/** Détecte tout caractère de contrôle (U+0001…) dans les badges. */
const CTRL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/;

const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

const pageSnapshot = async () =>
    (await client.query(`SELECT slug, hero->>'badge' AS badge, hero->>'subtitle' AS subtitle FROM site_pages ORDER BY slug`)).rows;
const overlaySnapshot = async () =>
    (
        await client.query(
            `SELECT entity_id, payload->'hero'->>'badge' AS badge, payload->'hero'->>'subtitle' AS subtitle
             FROM site_translations WHERE entity='page' AND locale='en' ORDER BY entity_id`
        )
    ).rows;

await client.connect();
const beforePages = await pageSnapshot();
const beforeOverlays = await overlaySnapshot();

/* Normalisation typographique : calculée en JS, jamais en rétro-référence SQL. */
const spaceFixes = [];
{
    const rows = await client.query(
        `SELECT slug, hero->>'badge' AS badge FROM site_pages WHERE hero->>'badge' LIKE '%•%'`
    );
    for (const row of rows.rows) {
        const badge = String(row.badge);
        const fixed = badge.replace(/([^ ])•/g, (match) => match[0] + ' •');
        if (fixed !== badge) spaceFixes.push({ slug: row.slug, badge: fixed });
    }
}

const statements = [];

/* A1. Badges FR cibles */
for (const [slug, badge] of Object.entries(NEW_BADGES)) {
    statements.push({
        label: `badge ${slug} → « ${badge} »`,
        sql: `UPDATE site_pages SET hero = jsonb_set(hero, '{badge}', to_jsonb($1::text)) WHERE slug = $2`,
        params: [badge, slug],
    });
}
/* A2. Réparations post-incident */
for (const [slug, badge] of Object.entries(REPAIRED_BADGES)) {
    statements.push({
        label: `réparation ${slug} → « ${badge} »`,
        sql: `UPDATE site_pages SET hero = jsonb_set(hero, '{badge}', to_jsonb($1::text)) WHERE slug = $2`,
        params: [badge, slug],
    });
}
/* A3. Espacement « • » */
for (const fix of spaceFixes) {
    statements.push({
        label: `espace avant « • » (${fix.slug})`,
        sql: `UPDATE site_pages SET hero = jsonb_set(hero, '{badge}', to_jsonb($1::text)) WHERE slug = $2`,
        params: [fix.badge, fix.slug],
    });
}
/* B. Sous-titres FR */
for (const [slug, subtitle] of Object.entries(NEW_SUBTITLES_FR)) {
    statements.push({
        label: `sous-titre FR ${slug}`,
        sql: `UPDATE site_pages SET hero = jsonb_set(hero, '{subtitle}', to_jsonb($1::text)) WHERE slug = $2`,
        params: [subtitle, slug],
    });
}
/* C. Overlays EN */
for (const [slug, fields] of Object.entries(OVERLAY_HERO_EN)) {
    if (fields.badge) {
        statements.push({
            label: `badge EN ${slug} → « ${fields.badge} »`,
            sql: `UPDATE site_translations SET payload = jsonb_set(payload, '{hero,badge}', to_jsonb($1::text)), updated_at = now()
                  WHERE entity='page' AND entity_id=$2 AND locale='en'`,
            params: [fields.badge, slug],
        });
    }
    if (fields.subtitle) {
        statements.push({
            label: `sous-titre EN ${slug}`,
            sql: `UPDATE site_translations SET payload = jsonb_set(payload, '{hero,subtitle}', to_jsonb($1::text)), updated_at = now()
                  WHERE entity='page' AND entity_id=$2 AND locale='en'`,
            params: [fields.subtitle, slug],
        });
    }
}

const results = [];
if (WRITE) {
    await client.query('BEGIN');
    try {
        for (const st of statements) {
            const res = await client.query(st.sql, st.params);
            results.push({ label: st.label, rows: res.rowCount });
        }
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        results.push({ label: 'transaction', rows: 0, error: err.message });
    }
}

/* Snapshots « après » : réels en écriture, prédits en dry-run. */
let afterPages;
let afterOverlays;
if (WRITE) {
    afterPages = await pageSnapshot();
    afterOverlays = await overlaySnapshot();
} else {
    afterPages = beforePages.map((row) => ({
        ...row,
        badge: NEW_BADGES[row.slug] ?? REPAIRED_BADGES[row.slug] ?? spaceFixes.find((f) => f.slug === row.slug)?.badge ?? row.badge,
        subtitle: NEW_SUBTITLES_FR[row.slug] ?? row.subtitle,
    }));
    afterOverlays = beforeOverlays.map((row) => ({
        ...row,
        badge: OVERLAY_HERO_EN[row.entity_id]?.badge ?? row.badge,
        subtitle: OVERLAY_HERO_EN[row.entity_id]?.subtitle ?? row.subtitle,
    }));
}

const ctrlRows = afterPages.filter((row) => typeof row.badge === 'string' && CTRL_RE.test(row.badge));
await client.end();

/* ---------------------- Rapport ---------------------------- */
const md = [];
md.push('# Revue — Badges & sous-titres de hero (base, FR + EN)');
md.push('');
md.push(`**Mode :** ${WRITE ? 'APPLIQUÉ (--write)' : 'DRY-RUN (aucune écriture)'}`);
md.push(`**Généré le :** ${new Date().toISOString()}`);
md.push('');
md.push('## Règle appliquée');
md.push('');
md.push(
    'Un badge = une information ; la méta porte le détail que le badge ne porte pas ; le sous-titre ne répète ni le badge ni la méta. Le français et l’anglais sont traités **ensemble** (les overlays EN étaient restés sur les anciennes formulations).'
);
md.push('');
md.push('## Incident d’échappement octal & réparation');
md.push('');
md.push(
    'La première normalisation SQL (`E\'\\1 •\'`) a consommé le caractère précédant « • » sur quatre badges (échappement octal au lieu d’une rétro-référence) — réparés par littéraux :'
);
md.push('');
for (const [slug, badge] of Object.entries(REPAIRED_BADGES)) {
    md.push(`- \`${slug}\` → « ${badge} »`);
}
md.push('');
md.push('## Avant → Après — badges FR (`site_pages`)');
md.push('');
md.push('| Page | Badge avant | Badge après |');
md.push('| --- | --- | --- |');
const afterMap = new Map(afterPages.map((r) => [r.slug, r]));
for (const row of beforePages) {
    md.push(`| \`${row.slug}\` | ${row.badge ?? '—'} | ${afterMap.get(row.slug)?.badge ?? '—'} |`);
}
md.push('');
md.push('## Sous-titres FR ajustés');
md.push('');
for (const [slug, subtitle] of Object.entries(NEW_SUBTITLES_FR)) {
    md.push(`- \`${slug}\` → « ${subtitle} »`);
}
md.push('');
md.push('## Overlays ANGLAIS alignés (`site_translations`)');
md.push('');
md.push('| Page | Badge EN avant | Badge EN après |');
md.push('| --- | --- | --- |');
const afterOverlayMap = new Map(afterOverlays.map((r) => [r.entity_id, r]));
for (const row of beforeOverlays) {
    const next = afterOverlayMap.get(row.entity_id);
    if (next && next.badge !== row.badge) {
        md.push(`| \`${row.entity_id}\` | ${row.badge ?? '—'} | ${next.badge ?? '—'} |`);
    }
}
md.push('');
if (WRITE) {
    md.push('### Exécution');
    md.push('');
    for (const r of results) {
        md.push(`- ${r.label} : ${r.error ? `✖ ${r.error}` : `${r.rows} ligne(s)`}`);
    }
    md.push('');
}
md.push('### Vérification');
md.push('');
md.push(
    ctrlRows.length === 0
        ? '- ✔ Aucun caractère de contrôle résiduel dans les badges.'
        : `- ✖ ${ctrlRows.length} badge(s) CONTIENNENT encore un caractère de contrôle : ${ctrlRows.map((r) => r.slug).join(', ')}`
);
md.push('');
md.push('Le code (fallbacks `site-service`) est aligné par');
md.push('[`apply_hero_badge_cleanup.mjs`](scripts/apply_hero_badge_cleanup.mjs:1).');
md.push('');

fs.mkdirSync(path.join(process.cwd(), 'plans'), { recursive: true });
fs.writeFileSync(
    path.join(process.cwd(), 'plans', 'revue-migration-hero-badges-2026.md'),
    md.join('\n'),
    'utf8'
);

console.log(`=== Migration badges & sous-titres de hero — ${WRITE ? 'APPLIQUÉE' : 'DRY-RUN'} ===`);
const changedPages = beforePages.filter((r) => afterMap.get(r.slug)?.badge !== r.badge || afterMap.get(r.slug)?.subtitle !== r.subtitle);
for (const row of changedPages) {
    const next = afterMap.get(row.slug);
    if (next.badge !== row.badge) console.log(`  [badge] ${row.slug} : ${row.badge} → ${next.badge}`);
    if (next.subtitle !== row.subtitle) console.log(`  [sous-titre] ${row.slug} : modifié`);
}
const changedOverlays = beforeOverlays.filter(
    (r) => afterOverlayMap.get(r.entity_id)?.badge !== r.badge || afterOverlayMap.get(r.entity_id)?.subtitle !== r.subtitle
);
for (const row of changedOverlays) {
    const next = afterOverlayMap.get(row.entity_id);
    if (next.badge !== row.badge) console.log(`  [EN badge] ${row.entity_id} : ${row.badge} → ${next.badge}`);
    if (next.subtitle !== row.subtitle) console.log(`  [EN sous-titre] ${row.entity_id} : modifié`);
}
console.log(
    `${changedPages.length} page(s) FR + ${changedOverlays.length} overlay(s) EN ${WRITE ? 'modifiés' : 'à modifier'}.`
);
console.log(
    ctrlRows.length === 0
        ? 'Vérification : aucun caractère de contrôle résiduel.'
        : `⚠ ${ctrlRows.length} badge(s) avec caractère de contrôle.`
);
if (!WRITE) console.log('\nRelancer avec --write pour appliquer.');
console.log('Rapport : plans/revue-migration-hero-badges-2026.md');
