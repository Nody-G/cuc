#!/usr/bin/env node
/**
 * Audit consolidé du projet CUC.
 *
 * Remplace les anciens scripts redondants :
 *   - audit_architecture.js        (taille des fichiers)
 *   - audit_hashes_and_anchors.mjs (ancres # et hrefs suspects)
 *   - audit_hrefs.mjs              (routes internes invalides)
 *   - audit_links.js               (détection des routes + liens)
 *
 * Usage :
 *   node scripts/audit.mjs                        # rapport complet
 *   node scripts/audit.mjs --strict               # code de sortie 1 si problème détecté (CI)
 *   node scripts/audit.mjs --write-size-baseline  # régénère la dette SRP après extraction
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const APP = path.join(SRC, 'app');
const STRICT = process.argv.includes('--strict');
const WRITE_SIZE_BASELINE = process.argv.includes('--write-size-baseline');

/** Plafond SRP (AGENTS.md § 2) : 300 lignes par fichier d'application. */
const MAX_LINES = 300;
const SIZE_BASELINE_PATH = path.join(ROOT, 'scripts', 'size-baseline.json');

const IGNORED_DIRS = new Set(['node_modules', '.next', '.git', 'coverage']);
const CODE_EXT = /\.(tsx|ts|jsx|js|mjs|css)$/;
const SCAN_EXT = /\.(tsx|ts|jsx|js|mjs)$/;

/** Parcours récursif d'un dossier. */
function walk(dir, filter, acc = []) {
    if (!fs.existsSync(dir)) return acc;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!IGNORED_DIRS.has(entry.name)) walk(path.join(dir, entry.name), filter, acc);
        } else if (filter(entry.name)) {
            acc.push(path.join(dir, entry.name));
        }
    }
    return acc;
}

const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');

/* ------------------------------------------------------------------ */
/* 1. Routes détectées depuis l'App Router                            */
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

/* ------------------------------------------------------------------ */
/* 2. Collecte des liens internes + ancres                            */
/* ------------------------------------------------------------------ */
// Les fichiers de test utilisent des chemins fictifs (ex. `/stages`) pour
// valider les helpers : ils sont exclus de l'audit des routes.
const isTestFile = (name) => /\.(test|spec)\.(tsx?|jsx?|mjs)$/.test(name);
const sourceFiles = walk(SRC, (n) => SCAN_EXT.test(n) && !isTestFile(n));

const HREF_RE = /href\s*=\s*(?:["']([^"']*)["']|\{[`"']([^`"']*)["'`]\})/g;
const PROP_RE = /(?:href|url|link|path)\s*:\s*['"`]([^'"`]+)['"`]/g;

const internalLinks = []; // { file, href, route, hash }
const suspicious = []; // { file, href }

for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const fileRel = rel(file);

    const collect = (raw) => {
        if (!raw) return;
        if (raw === '#' || raw === '' || raw.startsWith('javascript:')) {
            suspicious.push({ file: fileRel, href: raw });
            return;
        }
        if (!raw.startsWith('/') && !raw.startsWith('#')) return; // externe / mailto / tel
        const hashIdx = raw.indexOf('#');
        let route = hashIdx >= 0 ? raw.slice(0, hashIdx) : raw;
        const queryIdx = route.indexOf('?');
        if (queryIdx >= 0) route = route.slice(0, queryIdx); // ?demande=… n'est pas la route
        const hash = hashIdx >= 0 ? raw.slice(hashIdx + 1) : '';
        internalLinks.push({ file: fileRel, href: raw, route, hash });
    };

    for (const m of content.matchAll(HREF_RE)) collect(m[1] ?? m[2]);
    for (const m of content.matchAll(PROP_RE)) collect(m[1]);
}

/* ------------------------------------------------------------------ */
/* 3. Validation des routes internes                                  */
/* ------------------------------------------------------------------ */
const routeSet = new Set(routes);
/* Les liens next-intl sont écrits sans préfixe de locale (`/contact-cuc`) alors que
   la route détectée est `/[locale]/contact-cuc` : accepter la variante publique. */
for (const route of routes) {
    const m = route.match(/^\/\[locale\](.*)$/);
    if (m) routeSet.add(m[1] === '' ? '/' : m[1]);
}
const invalidRoutes = [];

/** Chemins d'assets statiques servis depuis /public (jamais des routes). */
const ASSET_RE = /\.(png|jpe?g|gif|svg|webp|avif|ico|css|js|mjs|json|txt|xml|woff2?|ttf|otf|mp4|webm|pdf)$/i;

for (const link of internalLinks) {
    let route = link.route;
    if (!route || route === '#') continue; // ancre pure sur la page courante
    if (route.includes('${')) continue; // template literal dynamique
    if (ASSET_RE.test(route)) continue; // asset statique
    if (route.length > 1 && route.endsWith('/')) route = route.slice(0, -1);
    if (!routeSet.has(route)) invalidRoutes.push(link);
}

/* ------------------------------------------------------------------ */
/* 4. Validation des ancres (#id)                                     */
/* ------------------------------------------------------------------ */
const idCache = new Map();
function fileHasId(file, id) {
    if (!fs.existsSync(file)) return false;
    if (!idCache.has(file)) idCache.set(file, fs.readFileSync(file, 'utf8'));
    // Accepte `id="x"` (JSX) et `id: 'x'` (donnée rendue via `id={...}`, ex. étapes de stages).
    return new RegExp(`id[=:]\\s*["']${id}["']`).test(idCache.get(file));
}

const missingAnchors = [];
for (const link of internalLinks) {
    if (!link.hash) continue;
    const id = link.hash;
    const candidates = [];
    if (!link.route || link.route === '/') {
        candidates.push(path.join(APP, 'page.tsx'));
    } else {
        candidates.push(path.join(APP, link.route.replace(/^\//, ''), 'page.tsx'));
    }
    candidates.push(
        path.join(SRC, 'components/layout/Navbar.tsx'),
        path.join(SRC, 'components/layout/Footer.tsx')
    );

    let found = candidates.some((c) => fileHasId(c, id));
    if (!found) found = sourceFiles.some((f) => fileHasId(f, id));
    if (!found) missingAnchors.push(link);
}

/* ------------------------------------------------------------------ */
/* 5. Taille des fichiers                                             */
/* ------------------------------------------------------------------ */
const sized = walk(SRC, (n) => CODE_EXT.test(n)).map((f) => {
    const content = fs.readFileSync(f, 'utf8');
    return { path: rel(f), lines: content.split('\n').length, bytes: fs.statSync(f).size };
});
sized.sort((a, b) => b.lines - a.lines);

/* Catalogues de DONNÉES pures (littéraux de contenu, pas de logique ni d'UI) :
   hors plafond composant (AGENTS.md § 2 vise les composants UI et la logique).
   Les découper nuirait à la règle anti-sur-fragmentation. */
const SIZE_EXEMPT = [/^src\/data\//, /^src\/lib\/data\/site\/defaults\//];

/* ------------------------------------------------------------------ */
/* 5bis. Plafond SRP — ratchet (AGENTS.md § 2 : 300 lignes max)       */
/* ------------------------------------------------------------------ */
// Les fichiers déjà au-dessus du plafond vivent dans `scripts/size-baseline.json` :
// ils ne peuvent que rétrécir. Une extraction qui les fait passer sous 300 lignes
// permet de les retirer de la baseline (régénérer : --write-size-baseline).
function readSizeBaseline() {
    try {
        return JSON.parse(fs.readFileSync(SIZE_BASELINE_PATH, 'utf8'));
    } catch {
        return {};
    }
}

const sizeBaseline = readSizeBaseline();
const sizeViolations = [];
const sizeRatchet = [];

for (const f of sized) {
    if (f.lines <= MAX_LINES) continue;
    if (SIZE_EXEMPT.some((re) => re.test(f.path))) continue;
    const baseline = sizeBaseline[f.path];
    if (baseline === undefined) {
        sizeViolations.push({ ...f, reason: `nouveau fichier > ${MAX_LINES} lignes` });
    } else if (f.lines > baseline) {
        sizeViolations.push({ ...f, reason: `+${f.lines - baseline} lignes vs baseline ${baseline}` });
    } else {
        sizeRatchet.push({ ...f, baseline });
    }
}

if (WRITE_SIZE_BASELINE) {
    // N'inscrit que la dette réellement suivie : les catalogues exemptés
    // (`SIZE_EXEMPT`) ne doivent pas figer une autorisation de croissance.
    const next = Object.fromEntries(
        sized
            .filter((f) => f.lines > MAX_LINES && !SIZE_EXEMPT.some((re) => re.test(f.path)))
            .map((f) => [f.path, f.lines])
    );
    fs.writeFileSync(SIZE_BASELINE_PATH, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    console.log(
        `Baseline SRP écrite : ${rel(SIZE_BASELINE_PATH)} (${Object.keys(next).length} fichier(s) suivis > ${MAX_LINES} lignes, hors exemptés)`
    );
}

/* ------------------------------------------------------------------ */
/* Rapport                                                            */
/* ------------------------------------------------------------------ */
const line = (s) => console.log(s);
const section = (title) => line(`\n=== ${title} ===`);

section(`ROUTES DÉTECTÉES (${routes.length})`);
routes.forEach((r) => line(`  ${r}`));

section('LIENS INTERNES');
line(`  Total scanné : ${internalLinks.length}`);
line(`  Routes invalides : ${invalidRoutes.length}`);
invalidRoutes.forEach((l) => line(`    ✗ ${l.file} → ${l.href}`));

section('ANCRES MANQUANTES');
line(`  Ancres non résolues : ${missingAnchors.length}`);
missingAnchors.forEach((l) => line(`    ✗ ${l.file} → ${l.href}`));

section('HREFS SUSPECTS (#, vide, javascript:)');
line(`  Total : ${suspicious.length}`);
suspicious.forEach((s) => line(`    ⚠ ${s.file} → "${s.href}"`));

section('TOP 15 FICHIERS LES PLUS VOLUMINEUX');
sized.slice(0, 15).forEach((f) =>
    line(`  ${String(f.lines).padStart(5)} lignes | ${(f.bytes / 1024).toFixed(1).padStart(6)} Ko | ${f.path}`)
);

section(`PLAFOND SRP (${MAX_LINES} LIGNES — AGENTS.md § 2)`);
line(`  Dette baseline (ne peut que rétrécir) : ${sizeRatchet.length} fichier(s)`);
sizeRatchet.forEach((f) =>
    line(`    • ${String(f.lines).padStart(5)} lignes (baseline ${f.baseline}) | ${f.path}`)
);
line(`  Violations : ${sizeViolations.length}`);
sizeViolations.forEach((f) => line(`    ✗ ${f.reason} | ${f.path}`));

const problems =
    invalidRoutes.length + missingAnchors.length + suspicious.length + sizeViolations.length;
section('RÉSULTAT');
line(`  ${problems === 0 ? '✓ Aucun problème détecté.' : `✗ ${problems} problème(s) détecté(s).`}`);

if (STRICT && problems > 0) process.exit(1);
