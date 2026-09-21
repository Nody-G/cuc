#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Contrôle des invariants des overlays EN de pages (`site_translations`)
 * ==============================================================================
 * L'édition anglaise du Cockpit n'écrit **que le diff** avec le français. Ce
 * script vérifie que la base respecte bien ce contrat, page par page :
 *
 *   1. aucune valeur vide, blanche ou nulle — une valeur vidée revient au
 *      français, elle ne doit jamais être publiée ;
 *   2. aucune racine verrouillée traduite (`layout_sections`, `og_image`, `slug`,
 *      `is_published`, horodatages), ni aucune clé technique dans un OBJET :
 *      ces clés viennent toujours du français ;
 *   3. un tableau est écrit en bloc : il doit avoir la même longueur que le
 *      français, les mêmes ancres `id` au même index, porter ses clés techniques
 *      à l'identique — et ses items doivent être complets, sinon la vitrine
 *      afficherait des champs vides ;
 *   4. aucune clé inventée hors du contenu français.
 *
 * Produit `plans/revue-edition-en-pages.md` et sort en code 2 si un invariant est
 * violé (une régression doit être visible en intégration continue).
 *
 * Usage :
 *   node scripts/verify_page_translation_invariants.mjs
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

/** Racines jamais traduites (miroir de `PAGE_LOCKED_ROOTS`). */
const LOCKED_ROOTS = new Set([
    'layout_sections',
    'og_image',
    'slug',
    'id',
    'is_published',
    'created_at',
    'updated_at',
    'published_at',
]);

/** Clés non traduisibles par nature (miroir du module partagé). */
const NEVER_TRANSLATED_KEYS = new Set(['id', 'slug', 'key', 'anchor']);
const TECHNICAL_KEY =
    /(url|link|href|image|img|bg_|poster|logo|icon|video_url|_id|order|is_visible|is_active|show|count|number|price|date|phone|email|code)$/i;
const isTechnicalKey = (key) => NEVER_TRANSLATED_KEYS.has(key) || TECHNICAL_KEY.test(key);

/** Champs éditoriaux d'une page, tels que l'overlay peut les surcharger. */
const EDITORIAL_ROOTS = [
    'title',
    'meta_title',
    'meta_description',
    'hero',
    'sections',
    'sections_data',
];

async function rest(pathname) {
    const res = await fetch(`${URL_BASE}/rest/v1/${pathname}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`${pathname} → ${res.status} ${await res.text()}`);
    return res.json();
}

const lastKeyOf = (keyPath) => (keyPath.split('.').pop() || '').replace(/\[\d+\]/g, '');

/** Une feuille est éditoriale si elle porte du texte traduisible (règles du module). */
function isEditorialLeaf(value, keyPath) {
    if (typeof value !== 'string') return false;
    const v = value.trim();
    if (v.length < 3) return false;
    const key = lastKeyOf(keyPath);
    if (isTechnicalKey(key)) return false;
    if (/^(https?:)?\/\//.test(v) || v.startsWith('/')) return false;
    if (/^[#\d\s.,%°+-]+$/.test(v)) return false;
    return true;
}

function flatten(node, prefix = '', out = {}) {
    if (node === null || node === undefined) return out;
    if (Array.isArray(node)) {
        node.forEach((item, i) => flatten(item, `${prefix}[${i}]`, out));
        return out;
    }
    if (typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) {
            if (LOCKED_ROOTS.has(k)) continue;
            flatten(v, prefix ? `${prefix}.${k}` : k, out);
        }
        return out;
    }
    if (prefix && isEditorialLeaf(node, prefix)) out[prefix] = node;
    return out;
}

/**
 * Contrôles sur un payload hors tableaux : vides, racines verrouillées, clés
 * techniques. À l'intérieur d'un tableau, une clé technique est **attendue** :
 * le tableau remplace le français en bloc, il doit donc transporter ses ancres.
 */
function inspectPayload(payload, pageSlug, violations) {
    const walk = (node, keyPath = '', insideArray = false) => {
        if (node === null || node === undefined) {
            violations.push({ slug: pageSlug, kind: 'valeur nulle', path: keyPath || '(racine)' });
            return;
        }
        if (typeof node === 'string') {
            if (node.trim() === '') {
                violations.push({ slug: pageSlug, kind: 'valeur vide', path: keyPath || '(racine)' });
            }
            return;
        }
        if (Array.isArray(node)) {
            node.forEach((item, i) => walk(item, `${keyPath}[${i}]`, true));
            return;
        }
        if (typeof node === 'object') {
            for (const [key, value] of Object.entries(node)) {
                const childPath = keyPath ? `${keyPath}.${key}` : key;
                if (!keyPath && LOCKED_ROOTS.has(key)) {
                    violations.push({ slug: pageSlug, kind: 'racine verrouillée', path: key });
                } else if (isTechnicalKey(key) && !insideArray) {
                    violations.push({ slug: pageSlug, kind: 'clé technique traduite', path: childPath });
                }
                walk(value, childPath, insideArray);
            }
        }
    };

    walk(payload);
}

/**
 * Contrôles sur les tableaux, comparés au français :
 *   - même longueur, mêmes ancres `id` à la même position ;
 *   - clés techniques (images, liens, ordres) identiques au français ;
 *   - items complets : aucune feuille éditoriale française manquante.
 */
function inspectArrays(frNode, payloadNode, pageSlug, keyPath, stale, violations) {
    if (Array.isArray(frNode)) {
        if (!Array.isArray(payloadNode)) return;
        const idMismatch = [];

        frNode.forEach((item, i) => {
            const other = payloadNode[i];
            const itemPath = `${keyPath}[${i}]`;
            if (
                item === null ||
                other === null ||
                typeof item !== 'object' ||
                typeof other !== 'object'
            ) {
                return;
            }
            if (item.id !== undefined && other.id !== undefined && item.id !== other.id) {
                idMismatch.push(itemPath);
            }

            for (const [key, value] of Object.entries(other)) {
                if (!isTechnicalKey(key)) continue;
                if (JSON.stringify(value) !== JSON.stringify(item[key])) {
                    violations.push({
                        slug: pageSlug,
                        kind: 'clé technique modifiée dans un tableau',
                        path: `${itemPath}.${key}`,
                    });
                }
            }

            for (const key of Object.keys(item)) {
                if (isTechnicalKey(key)) continue;
                if (!(key in other)) {
                    violations.push({
                        slug: pageSlug,
                        kind: 'item incomplet (champ français manquant)',
                        path: `${itemPath}.${key}`,
                    });
                }
            }

            inspectArrays(item, other, pageSlug, itemPath, stale, violations);
        });

        if (payloadNode.length !== frNode.length || idMismatch.length > 0) {
            stale.push({
                slug: pageSlug,
                path: keyPath,
                frLength: frNode.length,
                enLength: payloadNode.length,
                idMismatch,
            });
        }
        return;
    }

    if (frNode !== null && typeof frNode === 'object') {
        if (payloadNode === null || typeof payloadNode !== 'object' || Array.isArray(payloadNode)) {
            return;
        }
        for (const [key, value] of Object.entries(frNode)) {
            if (LOCKED_ROOTS.has(key)) continue;
            inspectArrays(
                value,
                payloadNode[key],
                pageSlug,
                keyPath ? `${keyPath}.${key}` : key,
                stale,
                violations
            );
        }
    }
}

/** Clés présentes dans l'overlay mais absentes du contenu français. */
function findUnknownPaths(frNode, payloadNode, keyPath = '', out = []) {
    if (payloadNode === null || typeof payloadNode !== 'object' || Array.isArray(payloadNode)) {
        return out;
    }
    for (const [key, value] of Object.entries(payloadNode)) {
        const childPath = keyPath ? `${keyPath}.${key}` : key;
        if (Array.isArray(value)) continue; // un tableau est écrit en bloc, ses feuilles viennent du FR
        const frValue = frNode !== null && typeof frNode === 'object' ? frNode[key] : undefined;
        if (typeof value === 'object' && value !== null) {
            if (frValue === undefined) {
                out.push(childPath);
            } else {
                findUnknownPaths(frValue, value, childPath, out);
            }
            continue;
        }
        if (frValue === undefined) out.push(childPath);
    }
    return out;
}

console.log('🔍 Contrôle des overlays EN de pages…');

const pages = await rest(
    'site_pages?select=slug,title,meta_title,meta_description,hero,sections,sections_data,layout_sections&order=slug.asc'
);
const overlays = await rest(
    'site_translations?select=entity_id,payload,is_published&entity=eq.page&locale=eq.en&order=entity_id.asc'
);
const overlayBySlug = new Map(overlays.map((row) => [row.entity_id, row]));

const violations = [];
const staleArrays = [];
const unknownPaths = [];
const rows = [];
let totalLeaves = 0;
let totalTranslated = 0;

for (const page of pages) {
    const overlay = overlayBySlug.get(page.slug);
    const payload = overlay?.payload || {};
    const fr = {};
    for (const root of EDITORIAL_ROOTS) {
        if (page[root] !== undefined && page[root] !== null) fr[root] = page[root];
    }

    inspectPayload(payload, page.slug, violations);
    inspectArrays(fr, payload, page.slug, '', staleArrays, violations);
    unknownPaths.push(...findUnknownPaths(fr, payload).map((p) => ({ slug: page.slug, path: p })));

    const frLeaves = flatten(fr);
    const enLeaves = flatten(payload);
    const frPaths = Object.keys(frLeaves);
    const translated = frPaths.filter(
        (p) => enLeaves[p] !== undefined && enLeaves[p] !== frLeaves[p]
    ).length;

    totalLeaves += frPaths.length;
    totalTranslated += translated;

    rows.push({
        slug: page.slug,
        hasRow: Boolean(overlay),
        published: overlay?.is_published ?? null,
        total: frPaths.length,
        translated,
        percent: frPaths.length === 0 ? 100 : Math.round((translated / frPaths.length) * 100),
    });
}

const globalPercent = totalLeaves === 0 ? 100 : Math.round((totalTranslated / totalLeaves) * 100);
const blocking = violations.length + staleArrays.length + unknownPaths.length;

const md = [];
md.push('# Revue — Édition anglaise des pages (Cockpit)');
md.push('');
md.push(`Généré le ${new Date().toISOString()} par \`scripts/verify_page_translation_invariants.mjs\`.`);
md.push('');
md.push('## Synthèse');
md.push('');
md.push(`- Pages contrôlées : **${pages.length}** (dont **${overlayBySlug.size}** avec un overlay EN)`);
md.push(
    `- Couverture anglaise globale : **${globalPercent} %** (${totalTranslated}/${totalLeaves} feuilles)`
);
md.push(`- Violations d'invariants : **${violations.length}**`);
md.push(`- Tableaux désalignés du français : **${staleArrays.length}**`);
md.push(`- Chemins inconnus (absents du contenu français) : **${unknownPaths.length}**`);
md.push('');
md.push('Invariants vérifiés (ceux de `src/lib/i18n/localized-merge.ts`) :');
md.push('');
md.push('1. aucune valeur vide publiée — une valeur vidée revient au français ;');
md.push('2. aucune racine verrouillée traduite (`layout_sections`, `og_image`, identité, états) et');
md.push('   aucune clé technique dans un objet ;');
md.push('3. tableaux écrits en bloc : même longueur, mêmes ancres `id`, clés techniques');
md.push('   identiques au français et items complets ;');
md.push('4. aucune clé inventée hors du contenu français.');
md.push('');

md.push('## Couverture par page');
md.push('');
md.push('| Page | Overlay | Publié | Feuilles FR | Traduites | Couverture |');
md.push('|---|---|---|---|---|---|');
for (const r of rows) {
    md.push(
        `| \`${r.slug}\` | ${r.hasRow ? 'oui' : '**non**'} | ${r.published === null ? '—' : r.published ? 'oui' : 'non'
        } | ${r.total} | ${r.translated} | ${r.percent} % |`
    );
}
md.push('');

md.push('## Violations');
md.push('');
if (violations.length === 0) {
    md.push(
        'Aucune : aucun payload ne contient de valeur vide, de racine verrouillée, de clé technique traduite ni d’item de tableau incomplet.'
    );
} else {
    md.push('| Page | Type | Chemin |');
    md.push('|---|---|---|');
    for (const v of violations.slice(0, 200)) {
        md.push(`| \`${v.slug}\` | ${v.kind} | \`${v.path}\` |`);
    }
    if (violations.length > 200) md.push(`| … | ${violations.length - 200} autre(s) | — |`);
}
md.push('');

md.push('## Tableaux désalignés');
md.push('');
if (staleArrays.length === 0) {
    md.push('Aucun : chaque tableau anglais a la même longueur et les mêmes ancres que le français.');
} else {
    md.push('| Page | Tableau | Items FR | Items EN | Ancre déplacée |');
    md.push('|---|---|---|---|---|');
    for (const s of staleArrays) {
        md.push(
            `| \`${s.slug}\` | \`${s.path || '(racine)'}\` | ${s.frLength} | ${s.enLength} | ${s.idMismatch.length > 0 ? s.idMismatch.join(', ') : '—'
            } |`
        );
    }
    md.push('');
    md.push('Un tableau désaligné décrit une page qui n’existe plus : la liste anglaise doit être');
    md.push('révisée dans le Cockpit (elle n’est plus enregistrée tant que la structure diverge).');
}
md.push('');

md.push('## Chemins inconnus');
md.push('');
if (unknownPaths.length === 0) {
    md.push('Aucun : chaque clé anglaise existe dans le contenu français.');
} else {
    md.push('| Page | Chemin |');
    md.push('|---|---|');
    for (const u of unknownPaths.slice(0, 100)) md.push(`| \`${u.slug}\` | \`${u.path}\` |`);
}
md.push('');

const outPath = path.join('plans', 'revue-edition-en-pages.md');
fs.writeFileSync(outPath, md.join('\n'), 'utf8');

console.log(`✅ Revue écrite : ${outPath}`);
console.log(
    `📊 Couverture anglaise globale : ${globalPercent} % (${totalTranslated}/${totalLeaves} feuilles)`
);
if (blocking > 0) {
    console.error(
        `❌ ${violations.length} violation(s), ${staleArrays.length} tableau(x) désaligné(s), ${unknownPaths.length} chemin(s) inconnu(s).`
    );
    process.exit(2);
}
console.log('✅ Invariants respectés sur toutes les pages.');
