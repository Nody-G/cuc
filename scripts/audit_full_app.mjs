#!/usr/bin/env node
/**
 * AUDIT COMPLET DE L'APPLICATION CUC — v2
 * ========================================
 *
 * État des lieux factuel et reproductible de l'application (vitrine + Cockpit).
 * Ce script NE CORRIGE RIEN : il détecte et rapporte.
 *
 * Contrôles (ERREURS) :
 *   1.  Routes            — énumération des routes de l'App Router (locale normalisée)
 *   2.  Liens internes    — href/Link pointant vers une route inexistante
 *   3.  Ancres            — #ancre sans id correspondant dans la cible
 *   4.  Doublons          — liens répétés dans une même structure (Footer/Nav)
 *   5.  Orphelins         — composants .tsx jamais importés
 *   6.  URLs legacy       — campus-universcascades.com/wp-content (références vivantes)
 *   7.  Badges IA         — doctrine « Zéro AI Slop » (AGENTS.md)
 *   8.  Handles sociaux   — contradictions de handles entre fichiers
 *   9.  Largeur vitrine   — `max-w-7xl` résiduel hors largeur canonique 1600 px
 *   10. Realtime          — canal Realtime sans nettoyage (fuite d'abonnement)
 *
 * Contrôles (AVERTISSEMENTS) :
 *   11. Realtime manquant — composant client à données live sans abonnement
 *   12. Parité i18n       — clés manquantes entre messages/fr.json et en.json
 *   13. Metadata          — route publique sans source de metadata (layout/page)
 *
 * CORRECTIONS v2 (faux positifs de la v1, prouvés par inspection) :
 *   - ROUTE `/[locale]` : la regex de la route racine `^/[^/]+$` appariait TOUTE
 *     URL à un segment — l'audit ne pouvait structurellement jamais détecter un
 *     lien cassé à 1 ou 2 segments (« 0 lien cassé » était un FAUX NÉGATIF).
 *     Correction : normalisation du segment locale avant appariement.
 *   - ACRONYME `ADD` : le motif `/\bADD\b/` flaggait le verbe SQL DDL
 *     (`ADD COLUMN`, `ADD TABLE`, `ADD CONSTRAINT`) et les commentaires
 *     d'échafaudage. Correction : assertion négative sur les mots-clés DDL.
 *   - `TACTIQUE` / `EXTRÊME` : énumération LÉGITIME des niveaux de discipline
 *     (`src/types/index.ts`, `disciplines.ts`, filtres du Cockpit). Ces deux
 *     libellés sont retirés des motifs « badges marketing » — les interdire
 *     revenait à déclarer le domaine métier lui-même non conforme.
 *   - SCRIPTS DE DOCTRINE : les scripts `audit_*`, `verify_*`, `hunt_*`,
 *     `check_*`, `diagnose_*` DÉFINISSENT les motifs interdits (listes de
 *     remplacement, regex de détection). Leurs occurrences sont comptées
 *     comme « métadonnées de doctrine », jamais comme violations.
 *   - LIGNES DE SANITISATION (`x.replace('ADD', 'Parkour')`) filtrées par
 *     heuristique de méta-programmation sur la ligne du match.
 *
 * Usage :
 *   node scripts/audit_full_app.mjs             # rapport console + fichiers
 *   node scripts/audit_full_app.mjs --strict    # code 1 si anomalie (erreur)
 *   node scripts/audit_full_app.mjs --quiet     # pas de sortie console détaillée
 *
 * Sorties :
 *   scripts/audit_full_app_report.json
 *   plans/audit-general-2026.md
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

/** Libellé de la ligne contenant l'index (pour heuristiques de contexte). */
function lineTextOf(text, index) {
    const start = text.lastIndexOf('\n', index) + 1;
    const end = text.indexOf('\n', index);
    return text.slice(start, end === -1 ? text.length : end);
}

/* ------------------------------------------------------------------ */
/* 1. Routes de l'App Router — locale normalisée                       */
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
            acc.push({ route: base === '' ? '/' : base, dir });
        }
    }
    return acc;
}

/**
 * Retire un éventuel segment de locale racine (`/[locale]`, `/[lang]`…) :
 * les liens applicatifs sont écrits SANS locale (next-intl l'injecte au
 * moment de la navigation), donc la comparaison doit être faite à iso-locale.
 */
function stripLocaleSegment(route) {
    return route.replace(/^\/(\[[^\]]+\])/, '') || '/';
}

/** Retire un éventuel préfixe de locale explicite (`/fr`, `/en`) d'un href. */
function stripLocaleHref(href) {
    return href.replace(/^\/(fr|en)(?=\/|$)/, '') || '/';
}

const routeEntries = [...new Map(detectRoutes().map((r) => [r.route, r])).values()]
    .sort((a, b) => a.route.localeCompare(b.route));
const routes = routeEntries.map((r) => r.route);
const routeDirs = new Map(routeEntries.map((r) => [r.route, r.dir]));

/** Routes à locale retirée (ex. `/[locale]/contact-cuc` → `/contact-cuc`). */
const normalizedRoutes = routes.map(stripLocaleSegment);

/** Routes statiques normalisées — la locale est retirée AVANT le filtre. */
const staticRouteSet = new Set(normalizedRoutes.filter((r) => !r.includes('[')));

/** Routes dynamiques (hors `[locale]`) → regex de correspondance. */
const dynamicRoutes = normalizedRoutes
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
    const candidates = [clean, stripLocaleHref(clean)];
    for (const candidate of candidates) {
        const normalized = stripLocaleSegment(candidate);
        if (staticRouteSet.has(normalized)) return true;
        if (dynamicRoutes.some((d) => d.re.test(normalized))) return true;
    }
    return false;
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
 */
const ASSET_EXT_RE = /\.(?:png|jpe?g|webp|avif|gif|svg|ico|bmp|tiff?|mp4|webm|mov|m4v|mp3|wav|ogg|pdf|woff2?|ttf|otf|eot|css|js|json|xml|txt|webmanifest)$/i;

function isAssetPath(href) {
    return ASSET_EXT_RE.test(href.split('#')[0].split('?')[0]);
}

const brokenLinks = []; // { file, line, href }
const anchorRefs = []; // { file, line, href, route, hash }
const allIds = new Map(); // id -> [files]

const ID_RE = /\bid\s*=\s*["']([^"']+)["']/g;

for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const relFile = rel(file);

    let m;
    ID_RE.lastIndex = 0;
    while ((m = ID_RE.exec(content)) !== null) {
        const id = m[1];
        if (!allIds.has(id)) allIds.set(id, []);
        allIds.get(id).push(relFile);
    }

    HREF_RE.lastIndex = 0;
    while ((m = HREF_RE.exec(content)) !== null) {
        const href = m[1] ?? m[2];
        if (!href) continue;
        if (!href.startsWith('/') && !href.startsWith('#')) continue;
        if (href.startsWith('//')) continue;
        if (href.includes('${')) continue; // template non résoluble

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

    PROP_RE.lastIndex = 0;
    while ((m = PROP_RE.exec(content)) !== null) {
        const href = m[1];
        if (!href.startsWith('/')) continue;
        if (href.startsWith('//')) continue;
        if (href.includes('${')) continue;
        if (isAssetPath(href)) continue;
        if (!routeExists(href)) {
            brokenLinks.push({ file: relFile, line: lineOf(content, m.index), href });
        }
    }
}

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

const NAV_FILES = [
    path.join(SRC, 'data', 'navigation.ts'),
    path.join(SRC, 'components', 'layout', 'Footer.tsx'),
    path.join(SRC, 'components', 'layout', 'Navbar.tsx'),
];

for (const file of NAV_FILES) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const relFile = rel(file);

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

const IMPORT_SPECS = [
    /\bimport\s+(?:type\s+)?[\s\S]*?\bfrom\s*['"`]([^'"`]+)['"`]/g,
    /\bimport\s*['"`]([^'"`]+)['"`]/g,
    /\bimport\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /\brequire\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
];

const REEXPORT_SPECS = [
    /\bexport\s+(?:type\s+)?(?:\*|\{[\s\S]*?\})\s+from\s*['"`]([^'"`]+)['"`]/g,
];

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
    return base.replace(/\\/g, '/');
}

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
                const barrelKey = src
                    .replace(/\\/g, '/')
                    .replace(/\.(tsx|ts|jsx|js|mjs)$/, '');
                if (!importedModules.has(barrelKey)) continue;
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
    const key = file.replace(/\\/g, '/').replace(/\.tsx$/, '');
    if (!importedModules.has(key)) orphanComponents.push(rel(file));
}

/* ------------------------------------------------------------------ */
/* 6. URLs legacy WordPress                                            */
/* ------------------------------------------------------------------ */

const WP_RE = /https?:\/\/(?:www\.)?campus-universcascades\.com\/wp-content\/[^\s"'`)\\]*/gi;

/**
 * Longue traîne de migration : les artefacts de registre (mappings, inventaires,
 * manifestes) contiennent PAR NATURE toutes les URLs d'origine — c'est le grand
 * livre de la migration, pas une référence vivante.
 */
const MIGRATION_LEDGER = new Set([
    'scripts/verify_media_url_coverage.mjs',
    'scripts/rewrite_media_urls.mjs',
    'scripts/audit_full_app.mjs',
    'scripts/audit_full_app_report.json',
]);

/** En-tête d'obsolescence dans les 60 premières lignes d'un script. */
function hasObsoleteHeader(content) {
    const head = content.split('\n').slice(0, 60).join('\n');
    return /OBSOL[ÈE]TE|NE PAS RELANCER|SCRIPT HISTORIQUE/i.test(head);
}

const legacyUrls = []; // références vivantes (actionnables)
const legacyLedger = []; // { file, count } — registre/métadonnées (informatif)

const legacyScanTargets = [
    ...sourceFiles.map((f) => ({ file: f, ledger: false })),
    ...walk(SCRIPTS, (n) => /\.(mjs|js|ts|sql|json|md)$/.test(n)).map((f) => ({
        file: f,
        // Les artefacts `.json` / `.md` sous `scripts/` sont des registres ;
        // les scripts historiques marqués OBSOLÈTE sortent aussi du décompte.
        ledger: /\.(json|md)$/i.test(f) || MIGRATION_LEDGER.has(rel(f)),
    })),
];

for (const { file, ledger } of legacyScanTargets) {
    const relFile = rel(file);
    const content = fs.readFileSync(file, 'utf8');
    const isLedger = ledger || hasObsoleteHeader(content);
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

/**
 * Doctrines appliquées (AGENTS.md) :
 *  - superlatifs creux bannis ;
 *  - badges marketing creux bannis ;
 *  - terminologie Parkour (« ADD » et « Art du Déplacement » interdits).
 *
 * NOTE : « Tactique » et « Extrême » ne figurent PLUS dans les motifs —
 * ce sont des NIVEAUX DE DISCIPLINE légitimes (types/index.ts, disciplines.ts,
 * filtres du Cockpit). Les bannir reviendrait à invalider le domaine métier.
 */
const SLOP_PATTERNS = [
    { re: /\blégendaire\b/gi, label: 'superlatif: légendaire' },
    { re: /\bréférence suprême\b/gi, label: 'superlatif: référence suprême' },
    { re: /\bgun-?fu cinématique\b/gi, label: 'superlatif: gun-fu cinématique' },
    { re: /\bchutes massives\b/gi, label: 'superlatif: chutes massives' },
    { re: /\bdossier pro complet\b/gi, label: 'superlatif: dossier pro complet' },
    { re: /\bélite\b/gi, label: 'superlatif: élite' },
    { re: /\bHOLLYWOOD ACTION\b/gi, label: 'badge: HOLLYWOOD ACTION' },
    { re: /\bPRO STAFF\b/gi, label: 'badge: PRO STAFF' },
    { re: /\bWORLDWIDE\b/gi, label: 'badge: WORLDWIDE' },
    { re: /\bBOX-OFFICE\b/gi, label: 'badge: BOX-OFFICE' },
    { re: /\bSUCCÈS MONDIAL\b/gi, label: 'badge: SUCCÈS MONDIAL' },
    { re: /\bArt du Déplacement\b/gi, label: 'doctrine: Art du Déplacement (utiliser Parkour)' },
    { re: /\bArt du Deplacement\b/gi, label: 'doctrine: Art du Deplacement (utiliser Parkour)' },
    // L'acronyme banni, MAIS jamais le verbe SQL DDL (`ADD COLUMN`, `ADD TABLE`…).
    {
        re: /\bADD\b(?!\s+(?:COLUMN|CONSTRAINT|TABLE|FUNCTION|POLICY|TRIGGER|INDEX|PRIMARY|FOREIGN|UNIQUE|CHECK|DEFAULT|NOT|VALUES|IF)\b)/g,
        label: 'doctrine: acronyme ADD (utiliser Parkour)',
    },
    { re: /plongez au c[œo]ur/gi, label: 'cliché: plongez au cœur' },
    { re: /\bfleuron\b/gi, label: 'cliché: fleuron' },
    { re: /\binégalé\b/gi, label: 'cliché: inégalé' },
    { re: /\bmachine de guerre\b/gi, label: 'cliché: machine de guerre' },
    { re: /\bclasse mondiale\b/gi, label: 'cliché: classe mondiale' },
    { re: /\bcursus élite\b/gi, label: 'cliché: cursus élite' },
];

/**
 * Scripts qui DÉFINISSENT la doctrine (listes de motifs, cartes de
 * remplacement, assertions de vérification) : leurs occurrences sont des
 * métadonnées, pas des violations de contenu.
 */
const DOCTRINE_ENFORCER_RE = /^scripts\/(?:audit_|verify_|hunt_|check_|diagnose_)/;

/** Ligne de méta-programmation (mapping/regex) plutôt que de contenu servi. */
const METAPROG_LINE_RE = /\.replace\s*\(|→|->\s*['"]|re\s*:\s*\/|label\s*:\s*['"]|SOURCE|MAP\b/;

const slopHits = []; // actionnables
const slopDoctrineMeta = []; // métadonnées de doctrine (informatif)

const slopScanTargets = [
    ...sourceFiles,
    ...walk(SCRIPTS, (n) => /\.(mjs|js|ts|sql)$/.test(n)),
];

for (const file of slopScanTargets) {
    const relFile = rel(file);
    const content = fs.readFileSync(file, 'utf8');
    const isSource = relFile.startsWith('src/');
    const isEnforcer = DOCTRINE_ENFORCER_RE.test(relFile);
    for (const { re, label } of SLOP_PATTERNS) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(content)) !== null) {
            const line = lineOf(content, m.index);
            const excerptStart = Math.max(0, m.index - 40);
            const excerptEnd = Math.min(content.length, m.index + m[0].length + 40);
            const excerpt = content
                .slice(excerptStart, excerptEnd)
                .replace(/\s+/g, ' ')
                .trim();
            const entry = { file: relFile, line, label, excerpt };

            if (!isSource) {
                // Les scripts (outillage, curation, sanitisation, seeds,
                // migrations) mentionnent les termes bannis comme OUTILS ou
                // données historiques — jamais comme contenu servi au public.
                // Une occurrence y est une métadonnée de doctrine, pas une
                // violation : l'action porte sur `src/**`.
                slopDoctrineMeta.push(entry);
            } else if (isEnforcer || METAPROG_LINE_RE.test(lineTextOf(content, m.index))) {
                // Ligne de sanitisation (`replace`, mapping `→`, regex) : la
                // mention du terme banni y est un OUTIL de correction.
                slopDoctrineMeta.push(entry);
            } else {
                slopHits.push(entry);
            }
        }
    }
}

/* ------------------------------------------------------------------ */
/* 8. Handles sociaux contradictoires                                  */
/* ------------------------------------------------------------------ */

const SOCIAL_RE =
    /https?:\/\/(?:www\.)?(instagram|youtube|tiktok|facebook)\.com\/(@?[A-Za-z0-9._\-/]+)/gi;

const socialOccurrences = [];
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

const socialByPlatform = new Map();
for (const o of socialOccurrences) {
    if (!socialByPlatform.has(o.platform)) socialByPlatform.set(o.platform, new Map());
    const byHandle = socialByPlatform.get(o.platform);
    if (!byHandle.has(o.handle)) byHandle.set(o.handle, []);
    byHandle.get(o.handle).push(o);
}

const socialConflicts = [];
for (const [platform, byHandle] of socialByPlatform) {
    const campusHandles = [...byHandle.keys()].filter((h) => /campus/i.test(h));
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
/* 8bis. Redirections next.config.ts                                   */
/* ------------------------------------------------------------------ */

/**
 * Deux défauts détectables exhaustivement :
 *   1. destination interne qui ne correspond à AUCUNE route réelle
 *      (redirection vers un 404) ;
 *   2. chaîne de redirections (destination elle-même source d'une autre
 *      redirection) — source d'allers-retours et de pénalités SEO.
 */
const redirectProblems = [];
const redirectChains = [];

const NEXT_CONFIG_PATH = path.join(ROOT, 'next.config.ts');
if (fs.existsSync(NEXT_CONFIG_PATH)) {
    const configContent = fs.readFileSync(NEXT_CONFIG_PATH, 'utf8');
    const REDIRECT_RE =
        /source:\s*['"]([^'"]+)['"][\s\S]{0,140}?destination:\s*['"]([^'"]+)['"]/g;
    const redirectsFound = [];
    let m;
    while ((m = REDIRECT_RE.exec(configContent)) !== null) {
        redirectsFound.push({ source: m[1], destination: m[2] });
    }
    const sourceSet = new Set(redirectsFound.map((r) => r.source));
    for (const r of redirectsFound) {
        if (r.destination.startsWith('/') && !isAssetPath(r.destination.split('#')[0]) && !routeExists(r.destination)) {
            redirectProblems.push({
                source: r.source,
                destination: r.destination,
                reason: 'destination introuvable (404)',
            });
        }
        if (sourceSet.has(r.destination)) {
            redirectChains.push({ source: r.source, destination: r.destination });
        }
    }
    if (redirectChains.length > 0) {
        for (const chain of redirectChains) {
            redirectProblems.push({
                source: chain.source,
                destination: chain.destination,
                reason: 'chaîne de redirections',
            });
        }
    }
}

/* ------------------------------------------------------------------ */
/* 9. Largeur canonique de la vitrine                                  */
/* ------------------------------------------------------------------ */

/**
 * Décision produit (2026-09-21) : la vitrine adopte la largeur de la page
 * équipe — classe unique `.page-shell` définie dans `globals.css`
 * (max-width 1600 px). Tout `max-w-7xl` / `max-w-6xl` résiduel dans les
 * zones publiques est une incohérence de mise en page.
 */
const CANONICAL_WIDTH_RE = /page-shell|max-w-\[1600px\]/g;
const LEGACY_WIDTH_RE = /\bmax-w-(?:7xl|6xl)\b/g;

const WIDTH_ZONES = [
    path.join(APP, '(site)'),
    path.join(SRC, 'components', 'sections'),
    path.join(SRC, 'components', 'layout'),
];

const widthViolations = []; // { file, line, class }
const widthStats = { canonical: 0, legacy: 0, filesWithCanonical: new Set() };

for (const zone of WIDTH_ZONES) {
    for (const file of walk(zone, (n) => /\.tsx$/.test(n) && !isTestFile(n))) {
        const relFile = rel(file);
        const content = fs.readFileSync(file, 'utf8');
        let m;
        LEGACY_WIDTH_RE.lastIndex = 0;
        while ((m = LEGACY_WIDTH_RE.exec(content)) !== null) {
            widthViolations.push({ file: relFile, line: lineOf(content, m.index), class: m[0] });
            widthStats.legacy++;
        }
        const canonicalMatches = content.match(CANONICAL_WIDTH_RE);
        const canonicalCount = canonicalMatches ? canonicalMatches.length : 0;
        if (canonicalCount > 0) {
            widthStats.canonical += canonicalCount;
            widthStats.filesWithCanonical.add(relFile);
        }
    }
}

/* ------------------------------------------------------------------ */
/* 10-11. Couverture Supabase Realtime                                 */
/* ------------------------------------------------------------------ */

const PUBLIC_DATA_ZONES = [
    path.join(APP, '(site)'),
    path.join(SRC, 'components'),
    path.join(SRC, 'lib', 'hooks'),
];

const SITE_SERVICE_GETTER_RE = /\b(get[A-Z][A-Za-z0-9]+)\s*(?:<[^>]*>)?\s*\(/g;

const realtimeGaps = []; // { file, getters } — avertissement
const realtimeLeaks = []; // { file } — canal sans nettoyage (erreur)
const realtimeCovered = []; // { file }

for (const zone of PUBLIC_DATA_ZONES) {
    for (const file of walk(zone, (n) => /\.tsx?$/.test(n) && !isTestFile(n))) {
        // Exclut le Cockpit (zone admin) : son realtime est centralisé dans CockpitApp.
        if (rel(file).startsWith('src/app/(admin)/')) continue;
        const content = fs.readFileSync(file, 'utf8');
        const relFile = rel(file);

        // La couverture Realtime passe soit par le canal local
        // (`createSafeChannel`), soit par le hook partagé
        // (`useRealtimeRefresh`) — les deux comptent comme abonnement.
        const usesSafeChannelDirectly = content.includes('createSafeChannel');
        const hasSafeChannel =
            usesSafeChannelDirectly || content.includes('useRealtimeRefresh');
        const hasRemoveSafeChannel = content.includes('removeSafeChannel');
        const importsClientSupabase =
            /from\s*['"`]@\/lib\/supabase\/client['"`]/.test(content) ||
            content.includes('@/lib/data/site-service');
        const isClientComponent = /^['"]use client['"]/m.test(content);

        // Fuite = canal créé LOCALEMENT sans nettoyage. Les consommateurs du
        // hook `useRealtimeRefresh` sont hors périmètre : le hook possède le
        // cycle de vie complet (souscription + `removeSafeChannel`).
        if (usesSafeChannelDirectly && !hasRemoveSafeChannel) {
            realtimeLeaks.push({ file: relFile });
        }

        if (!importsClientSupabase || !isClientComponent) continue;

        // Getters réellement appelés (getFilms, getTeam, getPageContent…)
        const getters = new Set();
        let m;
        SITE_SERVICE_GETTER_RE.lastIndex = 0;
        while ((m = SITE_SERVICE_GETTER_RE.exec(content)) !== null) {
            if (
                [
                    'getItem',
                    'getElementById',
                    'getAttribute',
                    'getBoundingClientRect',
                    'getContext',
                    'getComputedStyle',
                    'getTime',
                    'getFullYear',
                    'getDate',
                    'getDay',
                    'getMonth',
                    'getHours',
                    'getMinutes',
                    'getSeconds',
                    'getMilliseconds',
                    'getTimezoneOffset',
                    'getRandomValues',
                ].includes(m[1])
            ) {
                continue;
            }
            getters.add(m[1]);
        }

        if (hasSafeChannel) {
            realtimeCovered.push({ file: relFile });
        } else if (getters.size > 0) {
            realtimeGaps.push({ file: relFile, getters: [...getters].sort() });
        }
    }
}

/* ------------------------------------------------------------------ */
/* 12. Parité i18n (messages fr ↔ en)                                  */
/* ------------------------------------------------------------------ */

function flattenKeys(obj, prefix = '', acc = []) {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        acc.push(prefix);
        return acc;
    }
    for (const [k, v] of Object.entries(obj)) {
        flattenKeys(v, prefix ? `${prefix}.${k}` : k, acc);
    }
    return acc;
}

const i18nParity = { frKeys: 0, enKeys: 0, missingInEn: [], extraInEn: [] };
try {
    const frPath = path.join(ROOT, 'messages', 'fr.json');
    const enPath = path.join(ROOT, 'messages', 'en.json');
    if (fs.existsSync(frPath) && fs.existsSync(enPath)) {
        const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
        const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
        const frKeys = new Set(flattenKeys(fr));
        const enKeys = new Set(flattenKeys(en));
        i18nParity.frKeys = frKeys.size;
        i18nParity.enKeys = enKeys.size;
        i18nParity.missingInEn = [...frKeys].filter((k) => !enKeys.has(k)).sort();
        i18nParity.extraInEn = [...enKeys].filter((k) => !frKeys.has(k)).sort();
    }
} catch (err) {
    i18nParity.parseError = String(err);
}

/* ------------------------------------------------------------------ */
/* 13. Metadata par route publique                                     */
/* ------------------------------------------------------------------ */

const metadataGaps = [];
const METADATA_RE = /generateMetadata|export\s+const\s+metadata\b/;

for (const { route, dir } of routeEntries) {
    if (route.startsWith('/admin')) continue;
    const layoutPath = path.join(dir, 'layout.tsx');
    const pagePath = path.join(dir, 'page.tsx');
    let hasMetadata = false;
    for (const p of [layoutPath, pagePath]) {
        if (fs.existsSync(p) && METADATA_RE.test(fs.readFileSync(p, 'utf8'))) {
            hasMetadata = true;
            break;
        }
    }
    // Le layout racine de locale peut porter les metadata globales.
    if (!hasMetadata) {
        const localeRootLayout = path.join(APP, '(site)', '[locale]', 'layout.tsx');
        if (fs.existsSync(localeRootLayout)) {
            const rootContent = fs.readFileSync(localeRootLayout, 'utf8');
            if (METADATA_RE.test(rootContent) && route === '/[locale]') hasMetadata = true;
        }
    }
    if (!hasMetadata) metadataGaps.push({ route });
}

/* ------------------------------------------------------------------ */
/* Rapport                                                             */
/* ------------------------------------------------------------------ */

const realtimeCoverageRatio =
    realtimeCovered.length + realtimeGaps.length > 0
        ? Math.round(
            (realtimeCovered.length / (realtimeCovered.length + realtimeGaps.length)) * 100
        )
        : 100;

const errors = {
    brokenLinks: brokenLinks.length,
    orphanAnchors: orphanAnchors.length,
    duplicateLinks: duplicateLinks.length,
    orphanComponents: orphanComponents.length,
    legacyUrls: legacyUrls.length,
    slopHits: slopHits.length,
    socialConflicts: socialConflicts.length,
    redirectIssues: redirectProblems.length,
    widthViolations: widthViolations.length,
    realtimeLeaks: realtimeLeaks.length,
};

const warnings = {
    realtimeGaps: realtimeGaps.length,
    i18nMissingInEn: i18nParity.missingInEn.length,
    i18nExtraInEn: i18nParity.extraInEn.length,
    metadataGaps: metadataGaps.length,
};

const totalErrors = Object.values(errors).reduce((a, b) => a + b, 0);
const totalWarnings = Object.values(warnings).reduce((a, b) => a + b, 0);

const report = {
    generatedAt: new Date().toISOString(),
    summary: {
        routes: routes.length,
        sourceFiles: sourceFiles.length,
        errors,
        warnings,
        totalErrors,
        totalWarnings,
        realtimeCoverageRatio,
    },
    routes,
    brokenLinks,
    orphanAnchors,
    duplicateLinks,
    orphanComponents,
    legacyUrls,
    legacyLedger,
    slopHits,
    slopDoctrineMeta,
    socialConflicts,
    socialOccurrences,
    widthViolations,
    widthStats: {
        canonicalUsages: widthStats.canonical,
        legacyUsages: widthStats.legacy,
        filesWithCanonical: [...widthStats.filesWithCanonical].sort(),
    },
    realtimeGaps,
    realtimeLeaks,
    realtimeCovered,
    i18nParity,
    metadataGaps,
};

fs.writeFileSync(
    path.join(SCRIPTS, 'audit_full_app_report.json'),
    JSON.stringify(report, null, 2),
    'utf8'
);

/* ---------------------- Rapport markdown -------------------------- */

const md = [];
md.push('# Audit général de l\'application CUC');
md.push('');
md.push(`**Généré le :** ${new Date().toISOString()}`);
md.push('');
md.push('> État des lieux factuel. Aucune correction appliquée.');
md.push('');
md.push('## Synthèse');
md.push('');
md.push('| Contrôle | Valeur |');
md.push('|---|---|');
md.push(`| Routes détectées | ${routes.length} |`);
md.push(`| Fichiers source scannés | ${sourceFiles.length} |`);
md.push(`| Liens internes cassés | ${brokenLinks.length} |`);
md.push(`| Ancres orphelines | ${orphanAnchors.length} |`);
md.push(`| Doublons de liens | ${duplicateLinks.length} |`);
md.push(`| Composants orphelins | ${orphanComponents.length} |`);
md.push(`| URLs legacy WordPress (vivantes) | ${legacyUrls.length} |`);
md.push(`| URLs legacy (registres/scripts obsolètes) | ${legacyLedger.reduce((a, l) => a + l.count, 0)} |`);
md.push(`| Occurrences doctrine (actionnables) | ${slopHits.length} |`);
md.push(`| Occurrences doctrine (métadonnées de scripts) | ${slopDoctrineMeta.length} |`);
md.push(`| Conflits de handles sociaux | ${socialConflicts.length} |`);
md.push(`| Redirections invalides/chaînées | ${redirectProblems.length} |`);
md.push(`| Écarts de largeur (max-w-7xl/6xl) | ${widthViolations.length} |`);
md.push(`| Canaux Realtime sans nettoyage | ${realtimeLeaks.length} |`);
md.push(`| Composants live sans Realtime | ${realtimeGaps.length} |`);
md.push(`| Couverture Realtime (composants live) | ${realtimeCoverageRatio} % |`);
md.push(`| Clés i18n fr → en manquantes | ${i18nParity.missingInEn.length} |`);
md.push(`| Clés i18n en surnuméraires | ${i18nParity.extraInEn.length} |`);
md.push(`| Routes publiques sans metadata | ${metadataGaps.length} |`);
md.push('');

function section(title, items, render, limit = 60) {
    md.push(`## ${title}`);
    md.push('');
    if (items.length === 0) {
        md.push('Aucune anomalie détectée.');
        md.push('');
        return;
    }
    for (const item of items.slice(0, limit)) md.push(render(item));
    if (items.length > limit) md.push(`- … et ${items.length - limit} autre(s).`);
    md.push('');
}

section('Liens internes cassés', brokenLinks, (b) => `- \`${b.href}\` — ${b.file}:${b.line}`);
section('Ancres orphelines', orphanAnchors, (a) => `- \`#${a.hash}\` — ${a.file}:${a.line}`);
section('Doublons de liens', duplicateLinks, (d) => `- \`${d.href}\` ×${d.count} — ${d.file}`);
section('Composants orphelins', orphanComponents, (c) => `- \`${c}\``);
section('URLs legacy WordPress (vivantes)', legacyUrls, (u) => `- \`${u.url}\` — ${u.file}:${u.line}`);
section('Occurrences doctrine (actionnables)', slopHits, (s) => `- **${s.label}** — ${s.file}:${s.line}`);
section(
    'Conflits de handles sociaux',
    socialConflicts,
    (c) =>
        `- **${c.platform}** : ` +
        c.handles.map((h) => `\`${h.handle}\` (${h.occurrences.join(', ')})`).join(' vs ')
);
section(
    'Redirections invalides ou chaînées',
    redirectProblems,
    (r) => `- \`${r.source}\` → \`${r.destination}\` — ${r.reason}`
);
section('Écarts de largeur', widthViolations, (w) => `- \`${w.class}\` — ${w.file}:${w.line}`, 80);
section('Canaux Realtime sans nettoyage', realtimeLeaks, (r) => `- \`${r.file}\``);
section(
    'Composants live sans Realtime',
    realtimeGaps,
    (g) => `- \`${g.file}\` — getters : ${g.getters.join(', ')}`,
    80
);
section(
    'Clés i18n manquantes en anglais',
    i18nParity.missingInEn,
    (k) => `- \`${k}\``,
    100
);
section('Routes sans metadata', metadataGaps, (m) => `- \`${m.route}\``);

md.push('## Routes détectées');
md.push('');
for (const r of routes) md.push(`- \`${r}\``);
md.push('');

fs.mkdirSync(PLANS, { recursive: true });
fs.writeFileSync(path.join(PLANS, 'audit-general-2026.md'), md.join('\n'), 'utf8');

/* ---------------------- Sortie console ---------------------------- */

if (!QUIET) {
    console.log('=== Audit général de l\'application CUC (v2) ===');
    console.log('');
    console.log('ERREURS');
    console.log(`  Liens internes cassés     : ${errors.brokenLinks}`);
    console.log(`  Ancres orphelines         : ${errors.orphanAnchors}`);
    console.log(`  Doublons de liens         : ${errors.duplicateLinks}`);
    console.log(`  Composants orphelins      : ${errors.orphanComponents}`);
    console.log(`  URLs legacy WordPress     : ${errors.legacyUrls}`);
    console.log(`  Occurrences doctrine      : ${errors.slopHits} (+${slopDoctrineMeta.length} métadonnées)`);
    console.log(`  Conflits handles sociaux  : ${errors.socialConflicts}`);
    console.log(`  Redirections invalides    : ${errors.redirectIssues}`);
    console.log(`  Écarts de largeur         : ${errors.widthViolations}`);
    console.log(`  Canaux sans nettoyage     : ${errors.realtimeLeaks}`);
    console.log('');
    console.log('AVERTISSEMENTS');
    console.log(`  Composants live sans RT   : ${warnings.realtimeGaps} (couverture ${realtimeCoverageRatio} %)`);
    console.log(`  Clés i18n fr→en manquantes: ${warnings.i18nMissingInEn}`);
    console.log(`  Clés i18n en surnuméraires: ${warnings.i18nExtraInEn}`);
    console.log(`  Routes sans metadata      : ${warnings.metadataGaps}`);
    console.log('');
    console.log('Rapports écrits :');
    console.log('  - scripts/audit_full_app_report.json');
    console.log('  - plans/audit-general-2026.md');
}

if (STRICT && totalErrors > 0) {
    console.log('');
    console.log(`STRICT : ${totalErrors} erreur(s) détectée(s).`);
    process.exit(1);
}
