#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Audit des BADGES sans traduction anglaise
 * ==============================================================================
 * Un badge (surtitre doré, étiquette d'étape, catégorie d'atelier…) non traduit
 * s'affiche en français sur les pages anglaises : c'est le défaut visé.
 *
 * Le parcours est **conscient des index de tableaux** (`items[0].badge`) : une
 * résolution naïve par `split('.')` ne sait pas traverser `items[0]` et déclare
 * à tort des traductions manquantes.
 *
 * Périmètre : `site_pages` (hero, sections, sections_data) et `site_films`
 * (`tag`). Les entités déjà couvertes par leurs propres overlays (événements,
 * partenaires, POIs, coachs, programmes, disciplines) ne sont pas concernées.
 *
 * Usage :
 *   node scripts/audit_missing_badge_translations.mjs           (rapport)
 *   node scripts/audit_missing_badge_translations.mjs --strict  (code 2 si manquant)
 * ==============================================================================
 */
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const STRICT = process.argv.includes('--strict');

if (!URL_BASE || !KEY) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.');
    process.exit(1);
}

const HEADERS = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function rest(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
    return res.json();
}

/** Clés qui portent un badge affiché. */
const BADGE_KEY = /^(badge|tag|category|step_badge|duration_badge|[a-z_]*_badge)$/;

/** Valeurs légitimement identiques en FR et EN (noms propres, organismes, marques). */
const INTENTIONAL_SAME = new Set([
    'CAMPUS UNIVERS CASCADES',
    'LUCAS DOLLFUS',
    'AFDAS & AFDAS PRO',
    'FRANCE TRAVAIL (AIF)',
    'EUROPACORP',
    'NETFLIX',
    'UNIVERSAL',
    'WARNER BROS',
    'SONY PICTURES',
    'MARVEL STUDIOS',
    'LIONSGATE',
    'EON PROD',
    'ROBERT DE NIRO',
    'TOMER SISLEY',
    'JET LI & ACTION',
    'SCIENCE-FICTION',
    'ACTION SCI-FI',
    'ACTION MANGA',
    'NETFLIX ACTION',
    'Parkour & Yamakasi',
    // « COLLABORATIONS & STUDIOS » : terme identique en français et en anglais
    // (déjà documenté par `scripts/audit_i18n_completeness.mjs`).
    'COLLABORATIONS & STUDIOS',
]);

/**
 * Aplatit un contenu en `{ chemin: valeur }` pour les feuilles de badge.
 * Les index de tableaux sont conservés sous la forme `items[0].badge`.
 */
function flattenBadges(node, prefix = '', out = {}) {
    if (node === null || node === undefined) return out;
    if (Array.isArray(node)) {
        node.forEach((item, i) => flattenBadges(item, `${prefix}[${i}]`, out));
        return out;
    }
    if (typeof node === 'object') {
        for (const [key, value] of Object.entries(node)) {
            const childPath = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'string') {
                const leafKey = key.replace(/\[\d+\]/g, '');
                if (BADGE_KEY.test(leafKey) && value.trim().length >= 3) out[childPath] = value;
                continue;
            }
            flattenBadges(value, childPath, out);
        }
        return out;
    }
    return out;
}

/** Résout un chemin `a.b[0].c` dans un objet, index de tableaux compris. */
function resolvePath(root, dottedPath) {
    const segments = dottedPath.split('.');
    let current = root;
    for (const segment of segments) {
        if (current === null || current === undefined) return undefined;
        const match = segment.match(/^([^[\]]+)((?:\[\d+\])*)$/);
        if (!match) return undefined;
        const [, key, indexes] = match;
        current = current[key];
        for (const indexMatch of indexes.matchAll(/\[(\d+)\]/g)) {
            if (!Array.isArray(current)) return undefined;
            current = current[Number(indexMatch[1])];
        }
    }
    return current;
}

const pages = await rest(
    'site_pages?select=slug,hero,sections,sections_data,layout_sections&order=slug.asc'
);
const films = await rest('site_films?select=id,title,tag&order=title.asc');
const overlays = await rest('site_translations?select=entity,entity_id,payload&locale=eq.en');

const overlayIndex = new Map(
    overlays.map((row) => [`${row.entity}::${row.entity_id}`, row.payload || {}])
);

const missing = [];

const check = (entity, entityId, label, source) => {
    const fr = flattenBadges(source);
    const overlay = overlayIndex.get(`${entity}::${entityId}`) || {};
    for (const [path_, value] of Object.entries(fr)) {
        if (INTENTIONAL_SAME.has(value.trim())) continue;
        const en = resolvePath(overlay, path_);
        if (typeof en === 'string' && en.trim() !== '') continue;
        missing.push({ entity, entityId, label, path: path_, value });
    }
};

for (const page of pages) {
    check('page', page.slug, page.slug, {
        hero: page.hero,
        sections: page.sections,
        sections_data: page.sections_data,
    });
}

/**
 * `site_films.tag` n'est rendu par **aucun** composant public (vérifié dans
 * `src/`) : une étiquette absente de l'overlay EN n'y produit donc aucun défaut
 * d'affichage. On les recense séparément, sans les compter comme manquantes —
 * écrire une traduction que rien ne consomme serait du texte orphelin.
 */
const notDisplayed = [];
for (const film of films) {
    if (!film.tag) continue;
    const fr = flattenBadges({ tag: film.tag });
    const overlay = overlayIndex.get(`film::${film.id}`) || {};
    for (const [badgePath, value] of Object.entries(fr)) {
        if (INTENTIONAL_SAME.has(value.trim())) continue;
        const en = resolvePath(overlay, badgePath);
        if (typeof en === 'string' && en.trim() !== '') continue;
        notDisplayed.push({ filmId: film.id, title: film.title, path: badgePath, value });
    }
}

console.log('=== BADGES FR SANS TRADUCTION EN ===\n');
const byEntity = new Map();
for (const item of missing) {
    const key = `${item.entity}:${item.entityId}`;
    byEntity.set(key, (byEntity.get(key) || 0) + 1);
}
for (const [key, count] of [...byEntity.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`${String(count).padStart(3)} × ${key}`);
}
console.log(`\nTotal : ${missing.length} badge(s) sans équivalent anglais\n`);

for (const item of missing) {
    console.log(`  • [${item.entity}:${item.entityId}] ${item.path} = « ${item.value} »`);
}

const md = [];
md.push('# Revue — Badges sans traduction anglaise');
md.push('');
md.push(`Généré le ${new Date().toISOString()} par \`scripts/audit_missing_badge_translations.mjs\`.`);
md.push('');
md.push(`- Badges **affichés** sans équivalent EN : **${missing.length}**`);
md.push(`- Pages concernées : **${new Set(missing.map((m) => `${m.entity}:${m.entityId}`)).size}**`);
md.push(`- Étiquettes \`site_films.tag\` non affichées, donc hors périmètre : **${notDisplayed.length}**`);
md.push('');
if (missing.length === 0) {
    md.push('Aucun badge affiché n’est laissé en français sur les pages anglaises.');
} else {
    md.push('| Entité | Chemin | Valeur FR |');
    md.push('|---|---|---|');
    for (const item of missing) {
        md.push(`| \`${item.entity}:${item.entityId}\` | \`${item.path}\` | « ${item.value} » |`);
    }
}
md.push('');
md.push('## Étiquettes non affichées (`site_films.tag`)');
md.push('');
md.push(
    'Aucun composant public ne rend `site_films.tag` : ces étiquettes ne peuvent pas apparaître'
);
md.push('en français sur une page anglaise. Elles sont listées pour traçabilité.');
md.push('');
if (notDisplayed.length > 0) {
    md.push('| Film | Étiquette FR |');
    md.push('|---|---|');
    for (const item of notDisplayed) {
        md.push(`| \`${item.filmId}\` | « ${item.value} » |`);
    }
}
md.push('');

const outPath = path.join('plans', 'revue-badges-sans-traduction.md');
fs.writeFileSync(outPath, md.join('\n'), 'utf8');
console.log(`\nRevue écrite : ${outPath}`);

if (STRICT && missing.length > 0) {
    console.error(`\n❌ ${missing.length} badge(s) sans traduction anglaise.`);
    process.exit(2);
}
