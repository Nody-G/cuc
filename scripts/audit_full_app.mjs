#!/usr/bin/env node
/**
 * AUDIT COMPLET DE L'APPLICATION CUC
 * ==================================
 *
 * État des lieux factuel et reproductible de l'application (vitrine + Cockpit).
 * Ce script NE CORRIGE RIEN : il détecte et rapporte.
 *
 * Contrôles :
 *   1. Routes            — énumération des routes de l'App Router
 *   2. Liens internes    — href/Link pointant vers une route inexistante
 *   3. Ancres            — #ancre sans id correspondant dans la cible
 *   4. Doublons          — liens répétés dans une même structure (Footer/Nav)
 *   5. Orphelins         — composants .tsx jamais importés
 *   6. URLs legacy       — campus-universcascades.com/wp-content
 *   7. Badges IA         — doctrine « Zéro AI Slop » (AGENTS.md)
 *   8. Handles sociaux   — contradictions de handles entre fichiers
 *
 * Usage :
 *   node scripts/audit_full_app.mjs             # rapport console + fichiers
 *   node scripts/audit_full_app.mjs --strict    # code 1 si anomalie détectée
 *   node scripts/audit_full_app.mjs --quiet     # pas de sortie console détaillée
 *
 * Sorties :
 *   scripts/audit_full_app_report.json
 *   plans/audit-complet-app-2026.md
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const APP = path.join(SRC, 'app');
const SCRIPTS = path.join(ROOT, 'scripts');
const PLANS = path.join(ROOT, 'plans');

const STRICT = process.argv.includes('--strict');
const QUIET = process.argv.includes('--quiet');

const IGNORED_DIRS = new Set([
    'node_modules',
    '.next',
    '.git',
    'coverage',
    '.cache',
    '.staging',
]);

const SCAN_EXT = /\.(tsx|ts|jsx|js|mjs)$/;
const CODE_EXT = /\.(tsx|ts|jsx|js|mjs|css)$/;

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

function walk(dir, filter, acc = []) {
    if (!fs.existsSync(dir)) return acc;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!IGNORED_DIRS.has(entry.name)) {
                walk(path.join(dir, entry.name), filter, acc);
            }
        } else if (filter(entry.name)) {
            acc.push(path.join(dir, entry.name));
        }
    }
    return acc;
}

const isTestFile = (name) => /\.(test|spec)\.(tsx?|jsx?|mjs)$/.test(name);

/** Ligne (1-based) d'un index dans un texte. */
function lineOf(text, index) {
    let line = 1;
    for (let i = 0; i < index && i < text.length; i++) {
        if (text[i] === '\n') line++;
    }
    return line;
}

/* ------------------------------------------------------------------ */
/* 1. Routes de l'App Router                                           */
/* ------------------------------------------------------------------ */

function detectRoutes(dir = APP, base = '', acc = []) {
    if (!fs.existsSync(dir)) return acc;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            const isGroup = entry.name.startsWith('(') || entry.name.startsWith('_');
            detectRoutes(
                path.join(dir, entry.name),
                isGroup ? base : `${base}/${entry.name}`,
                acc
            );
        } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
            acc.push(base === '' ? '/' : base);
        }
    }
    return acc;
}

const routes = [...new Set(detectRoutes())].sort();
const routeSet = new Set(routes);

/** Routes dynamiques ([slug]) → regex de correspondance. */
const dynamicRoutes = routes
    .filter((r) => r.includes('['))
    .map((r) => ({
        route: r,
        re: new RegExp(
            '^' +
            r
                .split('/')
                .map((seg) =>
                    seg.startsWith('[') ? '[^/]+' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                )
                .join('/') +
            '$'
        ),
    }));

function routeExists(href) {
    const clean = href.split('#')[0].split('?')[0];
    if (clean === '' || clean === '/') return true;
    if (routeSet.has(clean)) return true;
    return dynamicRoutes.some((d) => d.re.test(clean));
}

/* ------------------------------------------------------------------ */
/* 2-3. Liens internes + ancres                                        */
/* ------------------------------------------------------------------ */

const sourceFiles = walk(SRC, (n) => SCAN_EXT.test(n) && !isTestFile(n));

const HREF_RE = /href\s*=\s*(?:["']([^"']*)["']|\{[`"']([^`"']*)["'`]\})/g;
const PROP_RE = /(?:href|url|link|path)\s*:\s*['"`]([^'"`]+)['"`]/g;

/**
 * Un chemin interne pointant vers un ASSET (image, police, média, favicon…)
 * n'est PAS une route : il est servi depuis /public ou Supabase Storage.
 * Sans ce filtre, les fallbacks `image: '/images/partenaires/nike.jpg'` de
 * site-service.ts étaient signalés à tort comme des liens cassés.
 */
const ASSET_EXT_RE = /\.(?:png|jpe?g|webp|avif|gif|svg|ico|bmp|tiff?|mp4|webm|mov|m4v|mp3|wav|ogg|pdf|woff2?|ttf|otf|eot|css|js|json|xml|txt|webmanifest)$/i;

function isAssetPath(href) {
    return ASSET_EXT_RE.test(href.split('#')[0].split('?')[0]);
}

const brokenLinks = []; // { file, line, href }
const anchorRefs = []; // { file, line, href, route, hash }
const allIds = new Map(); // id -> [files]

// Collecte des id= déclarés dans le JSX
const ID_RE = /\bid\s*=\s*["']([^"']+)["']/g;

for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const relFile = rel(file);

    // id= déclarés
    let m;
    ID_RE.lastIndex = 0;
    while ((m = ID_RE.exec(content)) !== null) {
        const id = m[1];
        if (!allIds.has(id)) allIds.set(id, []);
        allIds.get(id).push(relFile);
    }

    // href= littéraux
    HREF_RE.lastIndex = 0;
    while ((m = HREF_RE.exec(content)) !== null) {
        const href = m[1] ?? m[2];
        if (!href) continue;
        if (!href.startsWith('/') && !href.startsWith('#')) continue;
        if (href.startsWith('//')) continue;
        // Interpolation de template literal (`/${path}`) : non résoluble statiquement.
        if (href.includes('${')) continue;

        const line = lineOf(content, m.index);

        if (href.startsWith('#')) {
            anchorRefs.push({ file: relFile, line, href, route: null, hash: href.slice(1) });
            continue;
        }

        if (!isAssetPath(href) && !routeExists(href)) {
            brokenLinks.push({ file: relFile, line, href });
        }

        const hashIdx = href.indexOf('#');
        if (hashIdx !== -1) {
            anchorRefs.push({
                file: relFile,
                line,
                href,
                route: href.slice(0, hashIdx),
                hash: href.slice(hashIdx + 1),
            });
        }
    }

    // propriétés d'objet (href/url/link/path)
    PROP_RE.lastIndex = 0;
    while ((m = PROP_RE.exec(content)) !== null) {
        const href = m[1];
        if (!href.startsWith('/')) continue;
        if (href.startsWith('//')) continue;
        // Interpolation de template literal (`/${path}`) : non résoluble statiquement.
        if (href.includes('${')) continue;
        if (isAssetPath(href)) continue;
        if (!routeExists(href)) {
            brokenLinks.push({ file: relFile, line: lineOf(content, m.index), href });
        }
    }
}

// Ancres orphelines : hash sans id correspondant nulle part
const orphanAnchors = [];
const seenAnchor = new Set();
for (const a of anchorRefs) {
    if (allIds.has(a.hash)) continue;
    const key = `${a.hash}`;
    if (seenAnchor.has(key)) continue;
    seenAnchor.add(key);
    orphanAnchors.push(a);
}

/* ------------------------------------------------------------------ */
/* 4. Doublons de liens dans une même structure                        */
/* ------------------------------------------------------------------ */

const duplicateLinks = [];

/**
 * Détecte les doublons dans les structures de navigation/footer déclarées
 * dans les fichiers de données (src/data/navigation.ts) et les composants
 * de layout.
 */
const NAV_FILES = [
    path.join(SRC, 'data', 'navigation.ts'),
    path.join(SRC, 'components', 'layout', 'Footer.tsx'),
    path.join(SRC, 'components', 'layout', 'Navbar.tsx'),
];

for (const file of NAV_FILES) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const relFile = rel(file);

    // Regroupe par colonne/section : on segmente sur les marqueurs de colonne.
    // `cta` est inclus : un bouton d'appel à l'action (« Contact & Projets »)
    // est un élément d'interface distinct d'un lien de navigation, même s'il
    // partage la même destination. Sans ce marqueur, le CTA serait compté comme
    // doublon du lien « Contact » du menu — faux positif.
    const segments = content.split(/(?=\b(?:column|section|group|columnTitle|title|cta)\s*:)/i);
    for (const seg of segments) {
        const hrefs = [];
        const re = /(?:href|url)\s*:\s*['"`]([^'"`]+)['"`]/g;
        let mm;
        while ((mm = re.exec(seg)) !== null) hrefs.push(mm[1]);
        const counts = new Map();
        for (const h of hrefs) counts.set(h, (counts.get(h) || 0) + 1);
        for (const [h, c] of counts) {
            if (c > 1) {
                duplicateLinks.push({ file: relFile, href: h, count: c });
            }
        }
    }
}

/* ------------------------------------------------------------------ */
/* 5. Composants orphelins                                             */
/* ------------------------------------------------------------------ */

const componentFiles = walk(
    path.join(SRC, 'components'),
    (n) => /\.tsx$/.test(n) && !isTestFile(n)
);

/**
 * Un composant est « orphelin » s'il n'est JAMAIS importé.
 * On ne cherche donc que les instructions d'import (statiques et dynamiques),
 * jamais une simple mention du nom (qui produirait des faux négatifs : un
 * composant se mentionnant lui-même, ou cité dans un commentaire).
 *
 * IMPORTANT : ne PAS utiliser un motif glouton du type
 * `import\s+(?:[\s\S]*?)\s+from\s*['"]...` — il traverse tout le fichier et
 * apparie le `from` d'une instruction ULTÉRIEURE dès qu'un `import 'x.css'`
 * (sans `from`) apparaît, ce qui produit des faux orphelins en masse.
 * On ancre donc chaque forme d'import indépendamment, sans traversée de ligne.
 */
const IMPORT_SPECS = [
    // import ... from '...'   (statique nommé / défaut / namespace)
    // `[\s\S]` (et non `\s`) : un import nommé peut s'étaler sur plusieurs
    // lignes (`import {\n  A,\n  B,\n} from '...'`). On borne la traversée au
    // premier `from` rencontré pour ne jamais sauter vers une instruction
    // ultérieure.
    /\bimport\s+(?:type\s+)?[\s\S]*?\bfrom\s*['"`]([^'"`]+)['"`]/g,
    // import '...'            (effet de bord)
    /\bimport\s*['"`]([^'"`]+)['"`]/g,
    // import('...')           (dynamique)
    /\bimport\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    // require('...')          (CommonJS)
    /\brequire\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
];

/**
 * Ré-exports de barrel (`export { X } from './X'`, `export * from './X'`).
 * Indispensable : les sections de page sont consommées via un index
 * (`@/components/sections/home`) ; sans résoudre ces ré-exports, TOUS les
 * composants du barrel étaient signalés orphelins à tort.
 */
const REEXPORT_SPECS = [
    /\bexport\s+(?:type\s+)?(?:\*|\{[\s\S]*?\})\s+from\s*['"`]([^'"`]+)['"`]/g,
];

/**
 * Résout un spécimen d'import en chemin de fichier canonique SANS extension.
 * Un import de dossier (`@/components/sections/home`) doit être ramené à son
 * fichier d'index (`.../home/index`) : sans cette normalisation, le barrel
 * n'était jamais reconnu et tous ses composants étaient dits orphelins.
 */
function resolveModuleKey(spec, fromFile) {
    let base;
    if (spec.startsWith('@/')) base = path.join(SRC, spec.slice(2));
    else if (spec.startsWith('.')) base = path.resolve(path.dirname(fromFile), spec);
    else return null;

    const candidates = [
        base,
        `${base}.tsx`, `${base}.ts`, `${base}.jsx`, `${base}.js`, `${base}.mjs`,
        path.join(base, 'index.tsx'), path.join(base, 'index.ts'),
        path.join(base, 'index.jsx'), path.join(base, 'index.js'),
    ];
    for (const c of candidates) {
        if (fs.existsSync(c) && fs.statSync(c).isFile()) {
            return c.replace(/\\/g, '/').replace(/\.(tsx|ts|jsx|js|mjs)$/, '');
        }
    }
    // Aucun fichier réel : on garde la clé brute (import externe / manquant).
    return base.replace(/\\/g, '/');
}

/** Index : chemin de module résolu (sans extension) -> fichiers qui l'importent. */
const importedModules = new Map(); // moduleKey -> Set<file>

for (const src of sourceFiles) {
    const content = fs.readFileSync(src, 'utf8');
    for (const re of IMPORT_SPECS) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(content)) !== null) {
            const key = resolveModuleKey(m[1], src);
            if (!key) continue;
            if (!importedModules.has(key)) importedModules.set(key, new Set());
            importedModules.get(key).add(rel(src));
        }
    }
}

/**
 * Résolution des barrels : si un module (le barrel) est importé ET qu'il
 * ré-exporte d'autres modules, ces derniers sont considérés comme référencés.
 * On itère jusqu'à point fixe (barrels imbriqués).
 *
 * `resolveModuleKey` ramène déjà `@/components/sections/home` à
 * `.../sections/home/index` : la clé du barrel est donc directement présente
 * dans `importedModules` dès lors qu'un fichier l'importe.
 */
let changed = true;
let guard = 0;
while (changed && guard++ < 10) {
    changed = false;
    for (const src of sourceFiles) {
        const content = fs.readFileSync(src, 'utf8');
        for (const re of REEXPORT_SPECS) {
            re.lastIndex = 0;
            let m;
            while ((m = re.exec(content)) !== null) {
                // Le barrel est le fichier qui porte le ré-export.
                const barrelKey = src
                    .replace(/\\/g, '/')
                    .replace(/\.(tsx|ts|jsx|js|mjs)$/, '');
                // Ne propager que si le barrel est lui-même référencé.
                if (!importedModules.has(barrelKey)) continue;
                // Le module ré-exporté devient référencé.
                const target = resolveModuleKey(m[1], src);
                if (!target) continue;
                if (!importedModules.has(target)) {
                    importedModules.set(target, new Set());
                    changed = true;
                }
            }
        }
    }
}

const orphanComponents = [];
for (const file of componentFiles) {
    // Clé canonique sans extension (identique à celle produite par resolveModuleKey).
    const key = file.replace(/\\/g, '/').replace(/\.tsx$/, '');
    if (!importedModules.has(key)) orphanComponents.push(rel(file));
}

/* ------------------------------------------------------------------ */
/* 6. URLs legacy WordPress                                            */
/* ------------------------------------------------------------------ */

const WP_RE = /https?:\/\/(?:www\.)?campus-universcascades\.com\/wp-content\/[^\s"'`)\\]*/gi;

/**
 * Le registre de migration (mapping, inventaire, manifeste, classification)
 * contient PAR NATURE toutes les URLs d'origine : c'est le grand livre de la
 * migration, pas une référence vivante. On l'exclut du décompte actionnable
 * pour ne pas noyer les vraies occurrences résiduelles.
 */
const MIGRATION_LEDGER = new Set([
    'scripts/media_url_mapping.json',
    'scripts/media_url_mapping.md',
    'scripts/media_inventory.json',
    'scripts/media_inventory.md',
    'scripts/media_classification.json',
    'scripts/media_classification.md',
    'scripts/media_download_manifest.json',
    'scripts/live_cuc_images.json',
    'scripts/media_rewrite_report.json',
    'scripts/media_rewrite_report.md',
    'scripts/verify_media_url_coverage.mjs',
    'scripts/rewrite_media_urls.mjs',
    'scripts/audit_full_app.mjs',
    'scripts/audit_full_app_report.json',
]);

const legacyUrls = []; // { file, line, url } — références vivantes
const legacyLedger = []; // { file, count } — registre de migration (informatif)

const legacyScanTargets = [
    ...sourceFiles,
    ...walk(SCRIPTS, (n) => /\.(mjs|js|ts|sql|json|md)$/.test(n)),
];

for (const file of legacyScanTargets) {
    const relFile = rel(file);
    const content = fs.readFileSync(file, 'utf8');
    const isLedger = MIGRATION_LEDGER.has(relFile);
    let m;
    let count = 0;
    WP_RE.lastIndex = 0;
    while ((m = WP_RE.exec(content)) !== null) {
        count++;
        if (!isLedger) {
            legacyUrls.push({ file: relFile, line: lineOf(content, m.index), url: m[0] });
        }
    }
    if (isLedger && count > 0) legacyLedger.push({ file: relFile, count });
}

/* ------------------------------------------------------------------ */
/* 7. Badges IA / doctrine « Zéro AI Slop »                            */
/* ------------------------------------------------------------------ */

const SLOP_PATTERNS = [
    // Superlatifs bannis (AGENTS.md)
    { re: /\blégendaire\b/gi, label: 'superlatif: légendaire' },
    { re: /\bréférence suprême\b/gi, label: 'superlatif: référence suprême' },
    { re: /\bgun-?fu cinématique\b/gi, label: 'superlatif: gun-fu cinématique' },
    { re: /\bchutes massives\b/gi, label: 'superlatif: chutes massives' },
    { re: /\bdossier pro complet\b/gi, label: 'superlatif: dossier pro complet' },
    { re: /\bélite\b/gi, label: 'superlatif: élite' },
    // Badges marketing creux
    { re: /\bHOLLYWOOD ACTION\b/gi, label: 'badge: HOLLYWOOD ACTION' },
    { re: /\bPRO STAFF\b/gi, label: 'badge: PRO STAFF' },
    { re: /\bWORLDWIDE\b/gi, label: 'badge: WORLDWIDE' },
    { re: /\bBOX-OFFICE\b/gi, label: 'badge: BOX-OFFICE' },
    { re: /\bTACTIQUE\b/gi, label: 'badge: TACTIQUE' },
    { re: /\bSUCCÈS MONDIAL\b/gi, label: 'badge: SUCCÈS MONDIAL' },
    { re: /\bEXTRÊME\b/gi, label: 'badge: EXTRÊME' },
    // Terminologie Parkour (doctrine Malik Diouf)
    { re: /\bArt du Déplacement\b/gi, label: 'doctrine: Art du Déplacement (utiliser Parkour)' },
    { re: /\bArt du Deplacement\b/gi, label: 'doctrine: Art du Deplacement (utiliser Parkour)' },
    { re: /\bADD\b/g, label: 'doctrine: acronyme ADD (utiliser Parkour)' },
    // Clichés LLM
    { re: /plongez au c[œo]ur/gi, label: 'cliché: plongez au cœur' },
    { re: /\bfleuron\b/gi, label: 'cliché: fleuron' },
    { re: /\binégalé\b/gi, label: 'cliché: inégalé' },
    { re: /\bmachine de guerre\b/gi, label: 'cliché: machine de guerre' },
    { re: /\bclasse mondiale\b/gi, label: 'cliché: classe mondiale' },
    { re: /\bcursus élite\b/gi, label: 'cliché: cursus élite' },
];

const slopHits = []; // { file, line, label, excerpt }

const slopScanTargets = [
    ...sourceFiles,
    ...walk(SCRIPTS, (n) => /\.(mjs|js|ts|sql)$/.test(n)),
];

for (const file of slopScanTargets) {
    const content = fs.readFileSync(file, 'utf8');
    for (const { re, label } of SLOP_PATTERNS) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(content)) !== null) {
            const line = lineOf(content, m.index);
            const start = Math.max(0, m.index - 40);
            const end = Math.min(content.length, m.index + m[0].length + 40);
            slopHits.push({
                file: rel(file),
                line,
                label,
                excerpt: content.slice(start, end).replace(/\s+/g, ' ').trim(),
            });
        }
    }
}

/* ------------------------------------------------------------------ */
/* 8. Handles sociaux contradictoires                                  */
/* ------------------------------------------------------------------ */

const SOCIAL_RE =
    /https?:\/\/(?:www\.)?(instagram|youtube|tiktok|facebook)\.com\/(@?[A-Za-z0-9._\-/]+)/gi;

const socialOccurrences = []; // { file, line, platform, handle, url }
for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    let m;
    SOCIAL_RE.lastIndex = 0;
    while ((m = SOCIAL_RE.exec(content)) !== null) {
        const platform = m[1].toLowerCase();
        let handle = m[2].replace(/\/$/, '');
        if (platform === 'youtube' && handle.startsWith('@')) {
            handle = handle.toLowerCase();
        }
        socialOccurrences.push({
            file: rel(file),
            line: lineOf(content, m.index),
            platform,
            handle,
            url: m[0],
        });
    }
}

// Regroupe par plateforme et détecte les handles divergents
const socialByPlatform = new Map();
for (const o of socialOccurrences) {
    if (!socialByPlatform.has(o.platform)) socialByPlatform.set(o.platform, new Map());
    const byHandle = socialByPlatform.get(o.platform);
    if (!byHandle.has(o.handle)) byHandle.set(o.handle, []);
    byHandle.get(o.handle).push(o);
}

const socialConflicts = [];
for (const [platform, byHandle] of socialByPlatform) {
    // Ignore les handles de partenaires/coachs (chemins profonds ou comptes tiers)
    const campusHandles = [...byHandle.keys()].filter((h) =>
        /campus/i.test(h)
    );
    if (campusHandles.length > 1) {
        socialConflicts.push({
            platform,
            handles: campusHandles.map((h) => ({
                handle: h,
                occurrences: byHandle.get(h).map((o) => `${o.file}:${o.line}`),
            })),
        });
    }
}

/* ------------------------------------------------------------------ */
/* Rapport                                                             */
/* ------------------------------------------------------------------ */

const report = {
    generatedAt: new Date().toISOString(),
    summary: {
        routes: routes.length,
        sourceFiles: sourceFiles.length,
        brokenLinks: brokenLinks.length,
        orphanAnchors: orphanAnchors.length,
        duplicateLinks: duplicateLinks.length,
        orphanComponents: orphanComponents.length,
        legacyUrls: legacyUrls.length,
        legacyLedgerFiles: legacyLedger.length,
        slopHits: slopHits.length,
        socialConflicts: socialConflicts.length,
    },
    routes,
    brokenLinks,
    orphanAnchors,
    duplicateLinks,
    orphanComponents,
    legacyUrls,
    legacyLedger,
    slopHits,
    socialConflicts,
    socialOccurrences,
};

fs.writeFileSync(
    path.join(SCRIPTS, 'audit_full_app_report.json'),
    JSON.stringify(report, null, 2),
    'utf8'
);

/* ---------------------- Rapport markdown -------------------------- */

const md = [];
md.push('# Audit complet de l\'application CUC');
md.push('');
md.push(`**Généré le :** ${new Date().toISOString()}`);
md.push('');
md.push('> État des lieux factuel. Aucune correction appliquée.');
md.push('');
md.push('## Synthèse');
md.push('');
md.push('| Contrôle | Anomalies |');
md.push('|---|---|');
md.push(`| Routes détectées | ${routes.length} |`);
md.push(`| Fichiers source scannés | ${sourceFiles.length} |`);
md.push(`| Liens internes cassés | ${brokenLinks.length} |`);
md.push(`| Ancres orphelines | ${orphanAnchors.length} |`);
md.push(`| Doublons de liens | ${duplicateLinks.length} |`);
md.push(`| Composants orphelins | ${orphanComponents.length} |`);
md.push(`| URLs legacy WordPress | ${legacyUrls.length} |`);
md.push(`| Occurrences AI Slop | ${slopHits.length} |`);
md.push(`| Conflits de handles sociaux | ${socialConflicts.length} |`);
md.push('');

function section(title, items, render) {
    md.push(`## ${title}`);
    md.push('');
    if (items.length === 0) {
        md.push('Aucune anomalie détectée.');
        md.push('');
        return;
    }
    for (const item of items) md.push(render(item));
    md.push('');
}

section('Liens internes cassés', brokenLinks, (b) => `- \`${b.href}\` — ${b.file}:${b.line}`);

section(
    'Ancres orphelines',
    orphanAnchors,
    (a) => `- \`#${a.hash}\` — ${a.file}:${a.line}`
);

section(
    'Doublons de liens',
    duplicateLinks,
    (d) => `- \`${d.href}\` ×${d.count} — ${d.file}`
);

section('Composants orphelins', orphanComponents, (c) => `- \`${c}\``);

section(
    'URLs legacy WordPress',
    legacyUrls,
    (u) => `- \`${u.url}\` — ${u.file}:${u.line}`
);

section(
    'Occurrences AI Slop',
    slopHits,
    (s) => `- **${s.label}** — ${s.file}:${s.line} — \`${s.excerpt}\``
);

section(
    'Conflits de handles sociaux',
    socialConflicts,
    (c) =>
        `- **${c.platform}** : ` +
        c.handles
            .map((h) => `\`${h.handle}\` (${h.occurrences.join(', ')})`)
            .join(' vs ')
);

md.push('## Routes détectées');
md.push('');
for (const r of routes) md.push(`- \`${r}\``);
md.push('');

fs.mkdirSync(PLANS, { recursive: true });
fs.writeFileSync(path.join(PLANS, 'audit-complet-app-2026.md'), md.join('\n'), 'utf8');

/* ---------------------- Sortie console ---------------------------- */

if (!QUIET) {
    console.log('=== Audit complet de l\'application CUC ===');
    console.log('');
    console.log(`Routes détectées          : ${routes.length}`);
    console.log(`Fichiers source scannés   : ${sourceFiles.length}`);
    console.log(`Liens internes cassés     : ${brokenLinks.length}`);
    console.log(`Ancres orphelines         : ${orphanAnchors.length}`);
    console.log(`Doublons de liens         : ${duplicateLinks.length}`);
    console.log(`Composants orphelins      : ${orphanComponents.length}`);
    console.log(`URLs legacy WordPress     : ${legacyUrls.length}`);
    console.log(`Occurrences AI Slop       : ${slopHits.length}`);
    console.log(`Conflits handles sociaux  : ${socialConflicts.length}`);
    console.log('');
    console.log('Rapports écrits :');
    console.log('  - scripts/audit_full_app_report.json');
    console.log('  - plans/audit-complet-app-2026.md');
}

const totalAnomalies =
    brokenLinks.length +
    orphanAnchors.length +
    duplicateLinks.length +
    orphanComponents.length +
    legacyUrls.length +
    slopHits.length +
    socialConflicts.length;

if (STRICT && totalAnomalies > 0) {
    console.log('');
    console.log(`STRICT : ${totalAnomalies} anomalie(s) détectée(s).`);
    process.exit(1);
}
