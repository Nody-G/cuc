#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Semis générique des overlays EN : COQUILLE (footer) + RÉSEAUX SOCIAUX
 * ==============================================================================
 * Deux gisements que les audits par champs ne couvraient pas :
 *
 *   1. `footer` — les textes de STRUCTURE (signature, description, copyright,
 *      libellés légaux) ne sont pas des `labels` de colonnes/liens : ils sont
 *      appliqués par `applyFooterLabels` (hook `useFooter`) via des clés
 *      conventionnelles `brand.*` / `legal.*`.
 *   2. `social_link` — les `display_hint` de `site_social_links` (ex.
 *      « Réponse rapide ») sont des données en base, sans table de traduction :
 *      on les surcharge via l'entité `social_link` de `site_translations`.
 *
 * Idempotent : fusion dans le payload EN existant, upsert sur
 * (entity, entity_id, locale). Fichier de revue écrit à CHAQUE exécution.
 *
 * Usage :
 *   node scripts/seed_entity_translations_en.mjs --dry
 *   node scripts/seed_entity_translations_en.mjs
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

/** Clés `labels` du payload footer (conventions `brand.*` / `legal.*` incluses). */
const FOOTER_LABELS = {
    'brand.tagline': "Founded in 2008 • World's largest stunt school",
    'brand.description':
        'Professional training centre for stunt performers, coordinators and action designers for the international film industry. State-of-the-art facilities.',
    'legal.copyright':
        '© 2008-2026 Campus Univers Cascades — All rights reserved. Qualiopi certified organisation.',

    // Colonnes et liens (repli : le FR reste affiché si un id n'existe pas).
    formations: 'Training',
    'formation-pro-2ans': '2-Year Pro Programme',
    'formule-decouverte': 'Discovery Course (12 days)',
    'stages-weekend': 'Weekend Workshops (€250)',
    afdas: 'AFDAS Funding',
    'workshop-international': 'International Workshop',
    campus: 'The Campus',
    'visite-guidee-campus': 'Guided Campus Tour',
    'visite-virtuelle-360': '360° Virtual Tour',
    'zoe-bell-hall': 'Zoé Bell Hall & Pit',
    'cuc-tower': 'CUC Tower',
    dojos: 'Fight Dojos',
    equipe: 'The Team',
    'equipe-cascadeurs': 'Stunt Team',
    videos: 'Videos & Demos',
    tournages: 'Filming',
    'cuc-team': 'CUC Team & Action Design',
    partenaires: 'Partners & Studios',
    contact: 'Contact & Access',
    'contact-cuc': 'Contact & Projects',
    'carte-acces': 'Map & Access',
    boutique: 'Official Shop',

    // Barre légale (clés `legal.<id>` consommées par `applyFooterLabels`).
    'legal.mentions-legales': 'Legal Notice',
    'legal.reglement': 'Rules & Registration',
};

/** Champs traduisibles de `site_social_links` (entité `social_link`). */
const SOCIAL_LINKS = {
    youtube: { display_hint: 'Stunt Team channel' },
    whatsapp: { display_hint: 'Fast reply' },
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

async function upsert(entity, entityId, payload) {
    if (DRY) return;
    await rest('site_translations?on_conflict=entity,entity_id,locale', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
            entity,
            entity_id: entityId,
            locale: 'en',
            payload,
            is_published: true,
        }),
    });
}

const review = [];
review.push('# Revue — Traductions EN de la coquille (footer + réseaux sociaux)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/seed_entity_translations_en.mjs\`.`);
review.push('');
review.push(`Mode : **${DRY ? 'dry-run (aucune écriture)' : 'application en base'}**`);
review.push('');

/* ------------------------------------------------------------------ *
 * 1. Footer — fusion des `labels` (dont `brand.*` / `legal.*`)
 * ------------------------------------------------------------------ */
const [footerRow] = (await rest('site_footer?select=id,structure&id=eq.main')) || [];
if (!footerRow?.structure) {
    console.error('❌ site_footer/main introuvable — rien à semer.');
    process.exitCode = 2;
} else {
    // Vérifie que chaque clé existe bien dans la structure FR (ids réels).
    const structure = footerRow.structure;
    const knownIds = new Set([
        ...(structure.columns || []).map((c) => c.id),
        ...(structure.columns || []).flatMap((c) => (c.links || []).map((l) => l.id)),
        'brand.tagline',
        'brand.description',
        'legal.copyright',
        ...(structure.legal?.links || []).map((l) => `legal.${l.id}`),
    ]);
    const unknown = Object.keys(FOOTER_LABELS).filter((k) => !knownIds.has(k));
    if (unknown.length) {
        console.warn(`⚠️  Clés sans cible en base (ignorées) : ${unknown.join(', ')}`);
    }

    const [existing] = (await rest(
        'site_translations?select=payload&entity=eq.footer&entity_id=eq.main&locale=eq.en'
    )) || [];
    const payload = {
        ...(existing?.payload || {}),
        labels: { ...((existing?.payload || {}).labels || {}), ...FOOTER_LABELS },
    };

    review.push('## Footer (`footer` / `main`)');
    review.push('');
    review.push(`- Clés traduites : **${Object.keys(FOOTER_LABELS).length}**`);
    for (const [key, value] of Object.entries(FOOTER_LABELS)) {
        review.push(`- \`${key}\` → ${value}`);
    }
    review.push('');

    console.log(`${DRY ? '[dry] ' : ''}footer/main — ${Object.keys(FOOTER_LABELS).length} clé(s) de libellé`);
    await upsert('footer', 'main', payload);
}

/* ------------------------------------------------------------------ *
 * 2. Réseaux sociaux — champs traduisibles (`display_hint`, `label`)
 * ------------------------------------------------------------------ */
const socialRows = (await rest('site_social_links?select=id,label,display_hint')) || [];
const socialById = new Map(socialRows.map((row) => [row.id, row]));

review.push('## Réseaux sociaux (`social_link`)');
review.push('');
review.push('| id | Champ | EN |');
review.push('|---|---|---|');

for (const [socialId, fields] of Object.entries(SOCIAL_LINKS)) {
    const frRow = socialById.get(socialId);
    if (!frRow) {
        console.error(`❌ Réseau « ${socialId} » absent de site_social_links — ignoré.`);
        process.exitCode = 2;
        continue;
    }

    const [existing] = (await rest(
        `site_translations?select=payload&entity=eq.social_link&entity_id=eq.${encodeURIComponent(socialId)}&locale=eq.en`
    )) || [];
    const payload = { ...(existing?.payload || {}), ...fields };

    for (const [field, value] of Object.entries(fields)) {
        review.push(`| \`${socialId}\` | \`${field}\` | ${value} |`);
    }
    console.log(`${DRY ? '[dry] ' : ''}social_link/${socialId} — ${Object.keys(fields).join(', ')}`);
    await upsert('social_link', socialId, payload);
}

review.push('');
review.push(
    `${DRY ? 'DRY-RUN — aucune écriture.' : 'Overlays publiés en base.'} Relancer le crawler \`audit_en_pages_french.mjs\` pour vérifier.`
);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-traductions-coquille-en.md', `${review.join('\n')}\n`, 'utf8');

console.log('');
console.log(`${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — revue : plans/revue-traductions-coquille-en.md`);
console.log('');
