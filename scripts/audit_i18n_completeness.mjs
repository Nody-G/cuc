#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Audit de COMPLÉTUDE i18n FR → EN (niveau champ, pas niveau ligne)
 * ==============================================================================
 * `audit_i18n_parity.mjs` vérifie qu'une page A une traduction. Celui-ci vérifie
 * que la traduction est COMPLÈTE : il compare, feuille par feuille, le contenu
 * éditorial FR réellement en base avec l'overlay EN de `site_translations`.
 *
 * Deux gisements distincts :
 *   1. `site_pages` (hero, sections_data) → traduisible via l'overlay ;
 *   2. copie en dur dans les composants `.tsx` → NON traduisible en l'état
 *      (elle doit rejoindre la base ou `messages/*.json`).
 *
 * Produit `plans/revue-traductions-manquantes.md` (feuille de travail
 * éditoriale) et sort en code 2 si la couverture descend sous le seuil.
 *
 * Usage :
 *   node scripts/audit_i18n_completeness.mjs
 *   node scripts/audit_i18n_completeness.mjs --threshold=95
 * ==============================================================================
 */
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const thresholdArg = process.argv.find((a) => a.startsWith('--threshold='));
const THRESHOLD = thresholdArg ? Number(thresholdArg.split('=')[1]) : 90;

/**
 * Textes légitimement IDENTIQUES dans les deux langues : noms propres, noms de
 * marque ou termes employés tels quels en français. La valeur FR est comparée
 * pour que l'exception tombe d'elle-même si le contenu source change.
 */
const INTENTIONAL_SAME = {
    '/': {
        'hero.title': 'CAMPUS UNIVERS CASCADES',
        'sections_data.about.founder_name': 'LUCAS DOLLFUS',
        'sections_data.partners.badge': 'COLLABORATIONS & STUDIOS',
        'sections_data.qualiopi.afdas_badge': 'AFDAS & AFDAS PRO',
        'sections_data.qualiopi.france_travail_badge': 'FRANCE TRAVAIL (AIF)',
    },
    'contact-cuc': { 'hero.badge': 'CONTACT & ADMISSIONS' },
    'team-building-cascades': {
        'meta.title': 'Team Building',
        'sections_data.workshops[2].title': 'Parkour & Yamakasi',
    },
    'stunt-workshop-cuc': {
        'meta.meta_title': 'International Stunt Workshop | Campus Univers Cascades',
        'hero.title': 'INTERNATIONAL STUNT WORKSHOP',
    },
};

/** Motifs documentés : nom propre, marque, institution, ou terme identique en FR et EN. */
const INTENTIONAL_REASON = {
    '/': {
        'hero.title': 'nom de la marque',
        'sections_data.about.founder_name': 'nom de personne',
        'sections_data.partners.badge': 'terme identique en français et en anglais',
        'sections_data.qualiopi.afdas_badge': "nom de l'organisme de financement",
        'sections_data.qualiopi.france_travail_badge': "nom de l'opérateur public",
    },
    'contact-cuc': { 'hero.badge': 'terme identique en français et en anglais' },
    'team-building-cascades': {
        'meta.title': 'terme identique en français et en anglais',
        'sections_data.workshops[2].title': 'discipline désignée par son nom propre',
    },
    'stunt-workshop-cuc': {
        'meta.meta_title': "nom de l'événement international",
        'hero.title': "nom de l'événement international",
    },
};

const isIntentionalSame = (slug, path, frValue) =>
    INTENTIONAL_SAME[slug]?.[path] === frValue;

/**
 * Clés techniques : jamais traduites.
 * `id` est volontairement exclu des champs éditoriaux : ces valeurs servent
 * d'ancres, de clés React et de filtres dans les composants — les traduire
 * casserait la page (un `id` traduit ne correspondrait plus à son ancre).
 */
const TECHNICAL = /(url|link|href|image|img|bg_|poster|logo|icon|video_url|_id|order|is_visible|is_active|show|count|number|price|date|phone|email|code)$/i;
const NEVER_TRANSLATED = new Set(['id', 'slug', 'key', 'anchor']);

/** Un nom de clé technique (segment final du chemin, hors index de tableau). */
function lastKeyOf(keyPath) {
    return (keyPath.split('.').pop() || '').replace(/\[\d+\]/g, '');
}

/** Une valeur n'est retenue que si c'est du texte éditorial plausible. */
function isEditorial(value, keyPath) {
    if (typeof value !== 'string') return false;
    const v = value.trim();
    if (v.length < 3) return false;
    const lastKey = lastKeyOf(keyPath);
    if (NEVER_TRANSLATED.has(lastKey)) return false;
    if (TECHNICAL.test(lastKey)) return false;
    if (/^(https?:)?\/\//.test(v) || v.startsWith('/')) return false;
    if (/^[#\d\s.,%°+-]+$/.test(v)) return false;
    return true;
}

/** Aplatit un objet en { chemin: valeur } pour toutes les feuilles éditoriales. */
function flatten(node, prefix = '', out = {}) {
    if (node === null || node === undefined) return out;
    if (Array.isArray(node)) {
        node.forEach((item, i) => flatten(item, `${prefix}[${i}]`, out));
        return out;
    }
    if (typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) {
            flatten(v, prefix ? `${prefix}.${k}` : k, out);
        }
        return out;
    }
    if (isEditorial(node, prefix)) out[prefix] = node;
    return out;
}

async function rest(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
    return res.json();
}

const pages = await rest(
    'site_pages?select=slug,title,meta_title,meta_description,hero,sections_data&order=slug.asc'
);
const translations = await rest(
    'site_translations?select=entity_id,payload&entity=eq.page&locale=eq.en'
);
const bySlug = new Map(translations.map((t) => [t.entity_id, t.payload || {}]));

const results = [];
let totalLeaves = 0;
let totalCovered = 0;

for (const p of pages) {
    const fr = {
        meta: {
            title: p.title,
            meta_title: p.meta_title,
            meta_description: p.meta_description,
        },
        hero: p.hero || {},
        sections_data: p.sections_data || {},
    };
    const frLeaves = flatten(fr);
    const en = bySlug.get(p.slug) || {};
    const enLeaves = flatten({
        meta: { title: en.title, meta_title: en.meta_title, meta_description: en.meta_description },
        hero: en.hero || {},
        sections_data: en.sections_data || {},
    });

    const missing = Object.entries(frLeaves).filter(([k, v]) => {
        if (isIntentionalSame(p.slug, k, v)) return false;
        const t = enLeaves[k];
        return !t || t === v; // absent OU identique au FR (= non traduit)
    });
    const intentional = Object.entries(frLeaves).filter(([k, v]) =>
        isIntentionalSame(p.slug, k, v)
    );

    totalLeaves += Object.keys(frLeaves).length;
    totalCovered += Object.keys(frLeaves).length - missing.length;

    results.push({
        slug: p.slug,
        total: Object.keys(frLeaves).length,
        missing,
        intentional,
        hasRow: bySlug.has(p.slug),
    });
}

results.sort((a, b) => b.missing.length - a.missing.length);

/* ------------------------------------------------------------------ *
 * Copie en dur dans les composants : non traduisible par conception.
 * ------------------------------------------------------------------ */
const SRC = path.join(process.cwd(), 'src');
const FRENCH_HINT =
    /\b(le|la|les|des|une|un|et|pour|avec|sur|dans|notre|nos|vos|est|sont|vous|nous|formations?|cascadeurs?|campus|equipe|équipe|stage|depuis)\b/i;
const ACCENTS = /[àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/;

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

const hardcoded = [];
for (const file of walk(SRC)) {
    if (!file.endsWith('.tsx')) continue;
    // Le Cockpit est FR par conception (il n'est ni routé ni indexé en EN) :
    // compter sa copie comme « manquante » fausserait la mesure.
    if (path.relative(SRC, file).includes('(admin)')) continue;
    const src = fs.readFileSync(file, 'utf8');
    let count = 0;
    // Texte JSX : >mot(s)< hors accolades, et libellés de props visibles.
    for (const m of src.matchAll(/>\s*([A-ZÀ-Ç][^<>{}\n]{6,120})\s*</g)) {
        const text = m[1].trim();
        if (ACCENTS.test(text) || FRENCH_HINT.test(text)) count += 1;
    }
    for (const m of src.matchAll(/(?:label|title|badge|subtitle|placeholder|alt|aria-label)=["']([^"']{6,120})["']/g)) {
        const text = m[1].trim();
        if (ACCENTS.test(text) || FRENCH_HINT.test(text)) count += 1;
    }
    if (count > 0) hardcoded.push({ file: path.relative(process.cwd(), file), count });
}
hardcoded.sort((a, b) => b.count - a.count);

/* ------------------------------------------------------------------ *
 * Rapport
 * ------------------------------------------------------------------ */
const coverage = totalLeaves ? Math.round((totalCovered / totalLeaves) * 1000) / 10 : 100;

const lines = [];
lines.push('# Revue — Traductions EN manquantes (niveau champ)');
lines.push('');
lines.push(`Généré le ${new Date().toISOString()} par [\`audit_i18n_completeness.mjs\`](scripts/audit_i18n_completeness.mjs:1).`);
lines.push('');
lines.push('## Synthèse');
lines.push('');
lines.push(`- Champs éditoriaux FR en base (\`site_pages\`) : **${totalLeaves}**`);
lines.push(`- Champs couverts en EN : **${totalCovered}**`);
lines.push(`- **Couverture : ${coverage} %** (seuil d'échec : ${THRESHOLD} %)`);
lines.push(`- Pages concernées par au moins un manque : **${results.filter((r) => r.missing.length).length}**`);
lines.push(`- Fichiers de composants contenant de la copie FR en dur : **${hardcoded.length}**`);
lines.push('');
lines.push('## Deux gisements, deux traitements');
lines.push('');
lines.push('| Gisement | Nature | Traitement |');
lines.push('|---|---|---|');
lines.push('| `site_pages` (hero, sections_data) | Donnée éditable | Traduisible dès maintenant via l’overlay `site_translations` (déjà fusionné par `usePageDynamicContent`) |');
lines.push('| Copie en dur dans les `.tsx` | Code | **Non traduisible en l’état** : à déplacer vers la base ou `messages/*.json` |');
lines.push('');
const intentionalRows = results.flatMap((r) =>
    (r.intentional || []).map(([k, v]) => ({ slug: r.slug, k, v }))
);
if (intentionalRows.length) {
    lines.push('## Textes identiques par conception (noms propres)');
    lines.push('');
    lines.push(
        'Ces valeurs sont volontairement identiques en FR et EN : noms propres ou termes employés tels quels. Elles ne sont **pas** comptées comme manquantes, et l’exception tombe d’elle-même si le contenu FR change.'
    );
    lines.push('');
    lines.push('| Page | Champ | Valeur | Motif |');
    lines.push('|---|---|---|---|');
    for (const r of intentionalRows) {
        const reason = INTENTIONAL_REASON[r.slug]?.[r.k] || '—';
        lines.push(
            `| \`${r.slug}\` | \`${r.k}\` | ${r.v.replace(/\|/g, '\\|')} | ${reason} |`
        );
    }
    lines.push('');
}

lines.push('## Détail par page — champs à traduire');
lines.push('');

for (const r of results) {
    if (!r.missing.length) continue;
    lines.push(`### \`${r.slug}\` — ${r.missing.length}/${r.total} champ(s) manquant(s)`);
    lines.push('');
    if (!r.hasRow) lines.push('> ⚠️ Aucune ligne `site_translations` pour cette page.');
    lines.push('');
    lines.push('| Champ | Valeur FR à traduire |');
    lines.push('|---|---|');
    for (const [k, v] of r.missing) {
        const shown = v.length > 220 ? `${v.slice(0, 220)}…` : v;
        lines.push(`| \`${k}\` | ${shown.replace(/\|/g, '\\|')} |`);
    }
    lines.push('');
}

lines.push('## Copie FR en dur dans les composants (non traduisible en l’état)');
lines.push('');
lines.push('| Fichier | Occurrences détectées |');
lines.push('|---|---|');
for (const h of hardcoded) lines.push(`| \`${h.file}\` | ${h.count} |`);
lines.push('');

fs.writeFileSync(
    path.join(process.cwd(), 'plans', 'revue-traductions-manquantes.md'),
    lines.join('\n'),
    'utf8'
);

console.log('');
console.log(`Couverture EN : ${coverage} % (${totalCovered}/${totalLeaves} champs éditoriaux)`);
console.log(`Pages avec manques : ${results.filter((r) => r.missing.length).length}/${results.length}`);
console.log(`Composants avec copie FR en dur : ${hardcoded.length}`);
console.log('');
for (const r of results.slice(0, 12)) {
    if (r.missing.length) console.log(`  ${String(r.missing.length).padStart(3)} manquants  ${r.slug}`);
}
console.log('');
console.log('Rapport : plans/revue-traductions-manquantes.md');
console.log('');

if (coverage < THRESHOLD) process.exitCode = 2;
