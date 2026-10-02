#!/usr/bin/env node
/**
 * CUC — Audit du poids JS par route (budget mesuré, pas intention).
 *
 * Source : les HTML prérendus du build (`.next/server/app/**`) — chaque page liste
 * les chunks `/_next/static/**.js` qu'elle référence ; on gzip-somme leur poids
 * (c'est ce que reçoit le navigateur au premier chargement) et on compare :
 *   - au plafond absolu par route (`scripts/route-weight-budget.json`) — opposable ;
 *   - à `plans/route-weight-baseline.json` — garde-fou de non-régression relative.
 *
 * Mesure honnête : les scripts `nomodule` (ex. chunk legacy `polyfills-*.js`) sont
 * EXCLUS du poids de premier chargement — aucun navigateur moderne ne les télécharge —
 * mais restés comptés et affichés à part pour transparence. Tout autre chunk est compté.
 *
 * Contrat : échec (code 2) si un plafond dur est franchi OU si +5 % > baseline ;
 * avertissement à moins de 10 % d’un plafond dur ou > +2 % de baseline ; nouvelle
 * route ou route disparue du build : signalée, jamais ignorée.
 *
 * Usage : `node scripts/audit_route_weight.mjs [--baseline]`.
 * Sortie : `plans/revue-poids-routes.md`.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP_DIR = join(ROOT, '.next', 'server', 'app');
/* Ratchet monotone : baseline introduite sous scripts/ (cf. contrainte de l’audit). */
const RATCHET_FILE = join(ROOT, 'scripts', 'route-weight-ratchet.json');
const BUDGET_FILE = join(ROOT, 'scripts', 'route-weight-budget.json');
const REPORT_FILE = join(ROOT, 'plans', 'revue-poids-routes.md');

const FAIL_RATIO = 0.05;
const WARN_RATIO = 0.02;
const regenerateBaseline = process.argv.includes('--baseline');

function fail(message) {
    console.error(`[audit:route-weight] ${message}`);
    process.exit(2);
}

function readJson(file, label) {
    if (!existsSync(file)) fail(`${label} absent — attendu : ${relative(ROOT, file)}.`);
    try {
        return JSON.parse(readFileSync(file, 'utf8'));
    } catch {
        fail(`${label} illisible (JSON invalide).`);
    }
}

if (!existsSync(APP_DIR)) fail('Aucun build trouvé (.next/server/app) — exécuter `npm run build` d’abord.');

/* 1. Routes publiques prérendues + poids gzip des chunks réellement chargés --- */

function listHtmlFiles(dir, out = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) listHtmlFiles(full, out);
        else if (full.endsWith('.html')) out.push(full);
    }
    return out;
}

/** `fr/*` et `en/*` concrets uniquement (les gabarits `[slug]` portent les mêmes chunks). */
const routes = [...new Set(
    listHtmlFiles(APP_DIR)
        .map((file) => `/${relative(APP_DIR, file).split(sep).join('/').replace(/\.html$/, '')}`)
        .filter((route) => /^\/(fr|en)(\/|$)/.test(route) && !route.includes('[')),
)].sort();
if (routes.length === 0) fail('Aucune route publique prérendue détectée — build incomplet ?');

const STATIC_JS_RE = /\/_next\/(static\/[^"'()\s>]+?\.js)(?:[?#][^"'()\s>]*)?/g;
/* Balise <script ... nomodule ...> : attribut rendu `noModule=""` par React — insensible à la casse. */
const NOMODULE_SCRIPT_RE = /<script\b[^>]*\bnoModule\b[^>]*>/gi;
const SCRIPT_SRC_RE = /\bsrc\s*=\s*"([^"]+?)"/i;
/* Chunk `polyfills-*.js` (legacy) : uniquement chargé via `nomodule`. */
const POLYFILLS_RE = /(^|\/)polyfills-[^/]*\.js$/;

/** `/_next/static/chunks/x.js` → `static/chunks/x.js` (forme du groupe capturé). */
function normalizeStaticPath(url) {
    const match = /\/_next\/(static\/[^"'()\s>?#]+?\.js)/.exec(url);
    return match ? match[1] : null;
}

const gzipCache = new Map();
const missingChunks = new Set();

function chunkBytes(staticPath) {
    const file = join(ROOT, '.next', 'static', ...staticPath.replace(/^static\//, '').split('/'));
    if (!existsSync(file)) {
        missingChunks.add(staticPath);
        return 0;
    }
    if (!gzipCache.has(file)) gzipCache.set(file, gzipSync(readFileSync(file)).length);
    return gzipCache.get(file);
}

/**
 * Références JS d'un HTML prérendu, séparées en :
 * - `firstLoad` : tous les chunks réellement téléchargés au premier écran
 *   (balises <script src> modulaires, <link rel="preload" as="script">, données inline) ;
 * - `legacy` : scripts `nomodule` (polyfills legacy) — jamais téléchargés par un
 *   navigateur moderne, comptés à part pour transparence, jamais silencieusement perdus.
 */
function extractChunks(html) {
    const legacy = new Set();
    for (const tag of html.matchAll(NOMODULE_SCRIPT_RE)) {
        const src = SCRIPT_SRC_RE.exec(tag[0]);
        if (!src) continue;
        const normalized = normalizeStaticPath(src[1]);
        if (normalized) legacy.add(normalized);
    }

    const all = new Set();
    STATIC_JS_RE.lastIndex = 0;
    let match;
    while ((match = STATIC_JS_RE.exec(html)) !== null) all.add(match[1]);
    for (const chunk of all) if (POLYFILLS_RE.test(chunk)) legacy.add(chunk);

    const firstLoad = [...all].filter((chunk) => !legacy.has(chunk));
    return { firstLoad, legacy: [...legacy] };
}

const toKb = (bytes) => Math.round((bytes / 1024) * 10) / 10;
const formatDelta = (ratio) => `${ratio >= 0 ? '+' : ''}${(ratio * 100).toFixed(1)} %`;

const rows = routes
    .map((route) => {
        const html = readFileSync(join(APP_DIR, ...`${route.slice(1)}.html`.split('/')), 'utf8');
        const { firstLoad, legacy } = extractChunks(html);
        let bytes = 0;
        for (const chunk of firstLoad) bytes += chunkBytes(chunk);
        let legacyBytes = 0;
        for (const chunk of legacy) legacyBytes += chunkBytes(chunk);
        return { route, bytes, kb: toKb(bytes), legacyBytes, legacyKb: toKb(legacyBytes), legacyChunks: legacy };
    })
    .sort((a, b) => b.bytes - a.bytes);
const measured = new Set(rows.map(({ route }) => route));
const legacyUnion = new Set();
for (const { legacyChunks } of rows) for (const chunk of legacyChunks) legacyUnion.add(chunk);
const legacyUnionKb = toKb([...legacyUnion].reduce((sum, chunk) => sum + chunkBytes(chunk), 0));

function writeReport(lines) {
    writeFileSync(REPORT_FILE, lines.join('\n') + '\n');
}

function reportHeader(extra) {
    return [
        '# Revue — Poids JS par route (budget)',
        '',
        `Généré le ${new Date().toISOString()} par \`scripts/audit_route_weight.mjs\`.`,
        '',
        'Mesure : somme **gzip** des chunks JS réellement téléchargés au premier écran (HTML',
        'prérendu public `fr/*`, `en/*`) — les scripts `nomodule` (chunk legacy `polyfills-*.js`)',
        'sont **exclus** car aucun navigateur moderne ne les télécharge, et listés à part ci-dessous.',
        'Cibles aspirantes : `scripts/route-weight-budget.json` (paliers A/B + plafond absolu) —',
        'la dette restante est affichée mais **non bloquante** tant que le ratchet tient.',
        'Garde-fou bloquant (ratchet monotone) : `scripts/route-weight-ratchet.json` — échec si',
        '**> +5 %** au-dessus du ratchet ; avertissement : **> +2 %**. Régénérer (après revue) :',
        '`npm run audit:route-weight:baseline`.',
        '',
        extra,
    ];
}

if (regenerateBaseline) {
    const payload = {
        version: 1,
        generatedAt: new Date().toISOString(),
        unit: 'gzip-bytes',
        note: 'Ratchet monotone : poids gzip de premier chargement par route. Ne peut que baisser ; régénérer avec `npm run audit:route-weight:baseline` après revue.',
        routes: Object.fromEntries(rows.map(({ route, bytes }) => [route, bytes])),
    };
    writeFileSync(RATCHET_FILE, JSON.stringify(payload, null, 2) + '\n');
    writeReport(reportHeader(
        `## Ratchet régénéré (${rows.length} routes)\n\n` +
        rows.map(({ route, kb }) => `- \`${route}\` — **${kb} Ko**`).join('\n')
    ));
    console.log(`[audit:route-weight] Ratchet écrit (${rows.length} routes) : scripts${sep}route-weight-ratchet.json`);
    console.log(`[audit:route-weight] Rapport : plans${sep}revue-poids-routes.md`);
    process.exit(0);
}

/* 2. Plafonds absolus par route (contrat machine) ---------------------------- */

const budget = readJson(BUDGET_FILE, 'BudgetJS');
if (!budget || typeof budget.routes !== 'object' || budget.routes === null) fail('Budget invalide (`routes` requise).');
if (!budget.tiers || typeof budget.tiers !== 'object') fail('Budget invalide (`tiers` requis).');
if (typeof budget.absoluteCapKb !== 'number') fail('Budget invalide (`absoluteCapKb` requis).');

const nearRatio = typeof budget.nearCapRatio === 'number' ? budget.nearCapRatio : 0.1;
/** `/fr` → `/`, `/fr/contact-cuc` → `/contact-cuc` : clé indépendante de la locale. */
const slugOf = (route) => route.replace(/^\/(fr|en)(?=\/|$)/, '') || '/';

function capOf(route) {
    const tier = budget.routes[slugOf(route)];
    const config = tier ? budget.tiers[tier] : null;
    return {
        tier: tier ?? null,
        targetKb: config && typeof config.targetKb === 'number' ? config.targetKb : null,
        capKb: config && typeof config.hardCapKb === 'number' ? config.hardCapKb : budget.absoluteCapKb,
        scope: config ? `palier ${tier}` : 'plafond absolu',
    };
}

const overCap = [];
const nearCap = [];
const overTarget = [];
const unmapped = [];
for (const { route, kb } of rows) {
    const { tier, targetKb, capKb, scope } = capOf(route);
    if (!tier) unmapped.push(route);
    if (kb > capKb || kb > budget.absoluteCapKb) overCap.push({ route, kb, capKb, scope });
    else if (kb > capKb * (1 - nearRatio)) nearCap.push({ route, kb, capKb, scope });
    else if (targetKb !== null && kb > targetKb) overTarget.push({ route, kb, targetKb });
}
overCap.sort((a, b) => b.kb - b.capKb - (a.kb - a.capKb));

function budgetStatus(kb, capKb, targetKb) {
    if (kb > capKb || kb > budget.absoluteCapKb) return 'hors cible';
    if (kb > capKb * (1 - nearRatio)) return 'proche';
    if (targetKb !== null && kb > targetKb) return 'cible dépassée';
    return 'OK';
}

/* 3. Ratchet monotone (garde-fou de non-régression, seul échec bloquant) ------ */

if (!existsSync(RATCHET_FILE)) {
    // Amorçage : premier passage sans ratchet → on scelle les poids actuels (aucun échec).
    const seed = {
        version: 1,
        generatedAt: new Date().toISOString(),
        unit: 'gzip-bytes',
        note: 'Ratchet monotone : poids gzip de premier chargement par route. Ne peut que baisser ; régénérer avec `npm run audit:route-weight:baseline` après revue.',
        routes: Object.fromEntries(rows.map(({ route, bytes }) => [route, bytes])),
    };
    writeFileSync(RATCHET_FILE, JSON.stringify(seed, null, 2) + '\n');
    console.log(`[audit:route-weight] Ratchet amorcé (${rows.length} routes) : scripts${sep}route-weight-ratchet.json`);
}

const baseline = readJson(RATCHET_FILE, 'Ratchet');
if (!baseline || typeof baseline.routes !== 'object' || baseline.routes === null) {
    fail('Ratchet invalide (clé `routes` absente).');
}

const fails = [];
const warns = [];
const improvements = [];
const added = [];
const removed = [];
for (const { route, bytes } of rows) {
    if (!(route in baseline.routes)) {
        added.push(route);
        continue;
    }
    const baseBytes = baseline.routes[route];
    if (typeof baseBytes !== 'number') {
        added.push(route);
        continue;
    }
    if (baseBytes <= 0) {
        // Route légitime à 0 octet (coquille dynamique sans chunk) : toute charge ajoutée est une régression.
        if (bytes > 0) fails.push({ route, kb: toKb(bytes), baseKb: 0, ratio: Infinity });
        continue;
    }
    const ratio = (bytes - baseBytes) / baseBytes;
    const entry = { route, kb: toKb(bytes), baseKb: toKb(baseBytes), ratio };
    if (ratio > FAIL_RATIO) fails.push(entry);
    else if (ratio > WARN_RATIO) warns.push(entry);
    else if (ratio < -WARN_RATIO) improvements.push(entry);
}
for (const route of Object.keys(baseline.routes)) if (!measured.has(route)) removed.push(route);
fails.sort((a, b) => b.ratio - a.ratio);
warns.sort((a, b) => b.ratio - a.ratio);

/* 4. Rapport + verdict ------------------------------------------------------- */

const section = (title, items) => (items.length ? [`## ${title}`, '', ...items, ''] : []);
const overCapLine = ({ route, kb, capKb, scope }) => `\`${route}\` — ${kb} Ko > cible aspirante ${capKb} Ko (${scope})`;
const baselineLine = ({ route, kb, baseKb, ratio }) => `\`${route}\` — ${kb} Ko (ratchet ${baseKb} Ko, ${formatDelta(ratio)})`;

const verdictLines = fails.length === 0
    ? [
        `**OK (ratchet)** — ${rows.length} routes mesurées : aucune régression > +5 % vs ratchet.`,
        '',
        `- régressions ratchet (> +5 %) : 0`,
        `- cibles aspirantes dépassées (dette suivie, non bloquant) : ${overCap.length}`,
        `- proches d’une cible (< 10 %) : ${nearCap.length}`,
        `- dérives ratchet (> +2 %) : ${warns.length}`,
        `- améliorations (< −2 % ratchet) : ${improvements.length}`,
        `- nouvelles routes (hors ratchet) : ${added.length}`,
        `- routes absentes du build : ${removed.length}`,
        `- routes sans palier déclaré (cible absolue seule) : ${unmapped.length}`,
        `- scripts \`nomodule\` exclus du poids (transparence) : ${legacyUnion.size} chunk(s), ${legacyUnionKb} Ko`,
    ]
    : [
        `**ÉCHEC (ratchet)** — ${fails.length} régression(s) > +5 % vs ratchet :`,
        '',
        ...fails.map((entry) => `- ${baselineLine(entry)}`),
    ];

const detailSections = [
    ...section('Cibles aspirantes dépassées (dette suivie — non bloquant sous ratchet)',
        overCap.map(({ route, kb, capKb, scope }) => `- \`${route}\` — ${kb} Ko / cible ${capKb} Ko (${scope})`)),
    ...section('Proches d’une cible (< 10 %)',
        nearCap.map(({ route, kb, capKb, scope }) => `- \`${route}\` — ${kb} Ko / ${capKb} Ko (${scope})`)),
    ...section('Au-dessus de la cible de palier (sous la cible aspirante)',
        overTarget.map(({ route, kb, targetKb }) => `- \`${route}\` — ${kb} Ko (cible ${targetKb} Ko)`)),
    ...section('Routes publiques sans palier déclaré (cible absolue seule)', unmapped.map((route) => `- \`${route}\``)),
    ...section('Avertissements ratchet (> +2 %)', warns.map((entry) => `- ${baselineLine(entry)}`)),
    ...section('Nouvelles routes (hors ratchet — régénérer après revue)', added.map((route) => `- \`${route}\``)),
    ...section('Routes du ratchet absentes du build', removed.map((route) => `- \`${route}\``)),
    ...section('Scripts `nomodule` exclus du poids (legacy — jamais téléchargés par un navigateur moderne)',
        legacyUnion.size
            ? [
                `Total exclu : **${legacyUnionKb} Ko** gzip sur ${legacyUnion.size} chunk(s).`,
                '',
                ...[...legacyUnion].map((chunk) => `- \`${chunk}\` — ${toKb(chunkBytes(chunk))} Ko`),
            ]
            : ['Aucun script `nomodule` détecté dans les HTML prérendus.']),
    ...section('Chunks référencés mais introuvables (build incomplet ?)', [...missingChunks].map((chunk) => `- \`${chunk}\``)),
];

writeReport(reportHeader([
    '## Verdict',
    '',
    ...verdictLines,
    '',
    '## Budget par route (cibles aspirantes + ratchet bloquant)',
    '',
    '| Route | Palier | Poids | Cible | Cible aspirante | Statut |',
    '| --- | :---: | ---: | ---: | ---: | :---: |',
    ...rows.map(({ route, kb }) => {
        const { tier, targetKb, capKb } = capOf(route);
        const target = targetKb !== null ? `${targetKb} Ko` : '—';
        return `| \`${route}\` | ${tier ?? '—'} | ${kb} Ko | ${target} | ${capKb} Ko | ${budgetStatus(kb, capKb, targetKb)} |`;
    }),
    '',
    '## Routes les plus lourdes (top 10)',
    '',
    '| Route | Poids | Ratchet | Δ |',
    '| --- | ---: | ---: | ---: |',
    ...rows.slice(0, 10).map(({ route, kb, bytes }) => {
        const baseBytes = baseline.routes[route];
        const base = typeof baseBytes === 'number' ? `${toKb(baseBytes)} Ko` : '—';
        const delta = typeof baseBytes === 'number' && baseBytes > 0 ? formatDelta((bytes - baseBytes) / baseBytes) : '—';
        return `| \`${route}\` | ${kb} Ko | ${base} | ${delta} |`;
    }),
    '',
    ...detailSections,
].join('\n')));

console.log(`[audit:route-weight] ${rows.length} routes publiques mesurées (JS gzip de premier chargement, HTML prérendus).`);
if (legacyUnion.size > 0) console.log(`[audit:route-weight] Exclus (non comptés) : ${legacyUnion.size} script(s) nomodule — ${legacyUnionKb} Ko gzip : ${[...legacyUnion].join(', ')}`);
console.log(`[audit:route-weight] Rapport : plans${sep}revue-poids-routes.md`);

if (fails.length > 0) {
    console.error(`[audit:route-weight] ÉCHEC (ratchet) — ${fails.length} route(s) au-dessus de +5 % du ratchet :`);
    for (const entry of fails) console.error(`  - ${baselineLine(entry)}`);
    process.exit(2);
}

if (overCap.length > 0) {
    console.warn(`[audit:route-weight] INFO — ${overCap.length} route(s) au-dessus de leur cible aspirante (dette suivie, non bloquant) :`);
    for (const entry of overCap) console.warn(`  - ${overCapLine(entry)}`);
}
if (nearCap.length > 0) {
    console.warn(`[audit:route-weight] AVERTISSEMENT — ${nearCap.length} route(s) à moins de 10 % d’une cible :`);
    for (const { route, kb, capKb } of nearCap) console.warn(`  - ${route} : ${kb} Ko / ${capKb} Ko`);
}
if (warns.length > 0) {
    console.warn(`[audit:route-weight] AVERTISSEMENT — ${warns.length} route(s) au-dessus de +2 % du ratchet :`);
    for (const entry of warns) console.warn(`  - ${baselineLine(entry)}`);
}
console.log('[audit:route-weight] OK — ratchet respecté (aucune régression > +5 %).');
