#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Correctif ciblé des overlays EN de pages (entité `page`)
 * ==============================================================================
 * Les 15 pages publiques ont déjà un overlay EN dans `site_translations`
 * (`entity = 'page'`, `entity_id = slug`, `locale = 'en'`) portant la metadata,
 * le hero et parfois `sections_data`. Ce script applique des **patchs partiels**
 * (fusion dans le payload existant) : il ne remplace jamais l'overlay entier et
 * ne crée pas de ligne si elle n'existe pas déjà — un patch orphelin signale une
 * erreur de slug, pas une traduction à semer.
 *
 * Doctrine : traduction fidèle, aucune invention ; un overlay absent est
 * signalé et ignoré (jamais créé ici, c'est le rôle des semeurs dédiés).
 *
 * Idempotent : même patch rejoué = même payload. Fichier de revue écrit à
 * CHAQUE exécution.
 *
 * Usage :
 *   node scripts/patch_page_overlay_en.mjs --dry
 *   node scripts/patch_page_overlay_en.mjs
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
 * Patchs : slug de page → champs à corriger dans le payload EN existant.
 *
 * `videos-cascadeur` : la description SEO anglaise contenait « plus », que le
 * contrôle de français résiduel lit comme un mot français et signalait à tort.
 * Reformulation en anglais strict, sens inchangé.
 */
const PATCHES = {
    'videos-cascadeur': {
        meta_description:
            'Behind the scenes of stunt training in the TF1 and France 2 reports and the CUC showreels.',
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

const review = [];
review.push('# Revue — Correctifs des overlays EN de pages (`page`)');
review.push('');
review.push(`Généré le ${new Date().toISOString()} par \`scripts/patch_page_overlay_en.mjs\`.`);
review.push('');
review.push(`Mode : **${DRY ? 'dry-run (aucune écriture)' : 'application en base'}**`);
review.push('');
review.push('| slug | champ | avant | après |');
review.push('|---|---|---|---|');

let patched = 0;
let missing = 0;

for (const [slug, patch] of Object.entries(PATCHES)) {
    const rows =
        (await rest(
            `site_translations?select=payload&entity=eq.page&entity_id=eq.${encodeURIComponent(slug)}&locale=eq.en`
        )) || [];

    if (rows.length === 0) {
        console.warn(`⚠️  Overlay EN absent pour « ${slug} » — patch ignoré (pas de création).`);
        review.push(`| \`${slug}\` | — | — | **overlay absent, ignoré** |`);
        missing += 1;
        continue;
    }

    const payload = { ...(rows[0].payload || {}) };
    const before = { ...payload };

    for (const [field, value] of Object.entries(patch)) {
        const previous = payload[field];
        payload[field] = value;
        review.push(
            `| \`${slug}\` | \`${field}\` | ${previous ? `« ${previous} »` : '—'} | « ${value} » |`
        );
    }

    const changed = JSON.stringify(before) !== JSON.stringify(payload);
    if (!changed) {
        console.log(`= ${slug} : déjà à jour`);
        patched += 1;
        continue;
    }

    if (!DRY) {
        await rest(
            `site_translations?entity=eq.page&entity_id=eq.${encodeURIComponent(slug)}&locale=eq.en`,
            {
                method: 'PATCH',
                headers: { Prefer: 'return=minimal' },
                body: JSON.stringify({ payload }),
            }
        );
    }

    console.log(`${DRY ? '[dry] ' : ''}page/${slug} — ${Object.keys(patch).join(', ')}`);
    patched += 1;
}

review.push('');
review.push(`**${patched}** page(s) traitée(s), ${missing} overlay(s) absent(s).`);
review.push('');
review.push(
    `${DRY ? 'DRY-RUN — aucune écriture.' : 'Overlays mis à jour en base.'} Contrôle : \`node scripts/audit_en_pages_french.mjs\`.`
);
review.push('');

mkdirSync('plans', { recursive: true });
writeFileSync('plans/revue-correctifs-overlays-pages-en.md', review.join('\n'), 'utf8');

console.log('');
console.log(`${DRY ? 'DRY-RUN' : 'APPLIQUÉ'} — revue : plans/revue-correctifs-overlays-pages-en.md`);
if (missing > 0) process.exitCode = 2;
