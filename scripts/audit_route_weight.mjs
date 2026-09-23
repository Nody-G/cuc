#!/usr/bin/env node
/**
 * ==============================================================================
 * CUC — Audit du poids JS par route (budget mesuré, pas intention)
 * ==============================================================================
 * Source de mesure : les HTML **prérendus du build** (`.next/server/app/**`).
 * Chaque page liste les chunks qu'elle charge réellement (`/_next/static/...`) ;
 * on somme leur taille **gzip** et on compare à `plans/route-weight-baseline.json`.
 *
 * Le build Turbopack de Next 16 n'émet plus `app-build-manifest.json` : les HTML
 * prérendus sont la source la plus fidèle (c'est ce que reçoit le navigateur) —
 * et la plus stable d'un bundler à l'autre.
 *
 * Contrat :
 *   - échec au-delà de **+5 %** par route (code 2) ;
 *   - avertissement au-delà de **+2 %** ;
 *   - nouvelle route ou route disparue du build : signalée, jamais ignorée.
 *
 * Usage :
 *   node scripts/audit_route_weight.mjs              # contrôle (nécessite un build)
 *   node scripts/audit_route_weight.mjs --baseline   # régénère la baseline (après revue)
 *
 * Sortie : `plans/revue-poids-routes.md`.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP_DIR = join(ROOT, '.next', 'server', 'app');
const BASELINE_FILE = join(ROOT, 'plans', 'route-weight-baseline.json');
const REPORT_FILE = join(ROOT, 'plans', 'revue-poids-routes.md');

const FAIL_RATIO = 0.05;
const WARN_RATIO = 0.02;

const regenerateBaseline = process.argv.includes('--baseline');

function fail(message) {
    console.error(`[audit:route-weight] ${message}`);
    process.exit(2);
}

if (!existsSync(APP_DIR)) {
    fail('Aucun build trouvé (.next/server/app) — exécuter `npm run build` d’abord.');
}

/* 1. Inventaire des routes publiques prérendues ----------------------------- */

function listHtmlFiles(dir, out = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) listHtmlFiles(full, out);
        else if (full.endsWith('.html')) out.push(full);
    }
    return out;
}

function routeOf(file) {
    const rel = relative(APP_DIR, file).split(sep).join('/');
    return `/${rel.replace(/\.html$/, '')}`;
}

/** Routes publiques concrètes uniquement : `fr/*` et `en/*`. Les gabarits
 *  dynamiques (`[slug]`) sont exclus — les routes concrètes portent les mêmes
 *  chunks et servent de référence. */
function isPublicRoute(route) {
    if (!/^\/(fr|en)(\/|$)/.test(route)) return false;
    return !route.includes('[');
}

const routes = [...new Set(listHtmlFiles(APP_DIR).map(routeOf).filter(isPublicRoute))].sort();

if (routes.length === 0) {
    fail('Aucune route publique prérendue détectée — build incomplet ?');
}

/* 2. Poids gzip des chunks réellement chargés ------------------------------- */

const STATIC_JS_RE = /\/_next\/(static\/[^"'()\s>]+?\.js)(?:[?#][^"'()\s>]*)?/g;
const gzipCache = new Map();
const missingChunks = new Set();

function chunkBytes(staticPath) {
    const rel = staticPath.replace(/^static\//, '');
    const file = join(ROOT, '.next', 'static', ...rel.split('/'));
    if (!existsSync(file)) {
        missingChunks.add(staticPath);
        return 0;
    }
    if (!gzipCache.has(file)) {
        gzipCache.set(file, gzipSync(readFileSync(file)).length);
    }
    return gzipCache.get(file);
}

const weights = new Map();

for (const route of routes) {
    const html = readFileSync(join(APP_DIR, ...`${route.slice(1)}.html`.split('/')), 'utf8');
    const chunks = new Set();
    let match;
    STATIC_JS_RE.lastIndex = 0;
    while ((match = STATIC_JS_RE.exec(html)) !== null) chunks.add(match[1]);

    let bytes = 0;
    for (const chunk of chunks) bytes += chunkBytes(chunk);
    weights.set(route, bytes);
}

/* 3. Comparaison à la baseline ---------------------------------------------- */

const toKb = (bytes) => Math.round((bytes / 1024) * 10) / 10;
const formatDelta = (ratio) => `${ratio >= 0 ? '+' : ''}${(ratio * 100).toFixed(1)} %`;

const rows = [...weights.entries()]
    .map(([route, bytes]) => ({ route, bytes, kb: toKb(bytes) }))
    .sort((a, b) => b.bytes - a.bytes);

function reportHeader(extra) {
    return [
        '# Revue — Poids JS par route (budget)',
        '',
        `Généré le ${new Date().toISOString()} par \`scripts/audit_route_weight.mjs\`.`,
        '',
        'Mesure : somme **gzip** des chunks JS référencés par le HTML prérendu de chaque',
        'route publique (`fr/*`, `en/*`) — c’est ce que reçoit le navigateur au premier',
        'chargement. Baseline : `plans/route-weight-baseline.json`. Seuils : échec **> +5 %**,',
        'avertissement **> +2 %**. Régénérer la baseline (après revue) :',
        '`npm run audit:route-weight:baseline`.',
        '',
        extra,
    ];
}

function writeReport(lines) {
    writeFileSync(REPORT_FILE, lines.join('\n') + '\n');
}

if (regenerateBaseline) {
    const payload = {
        version: 1,
        generatedAt: new Date().toISOString(),
        unit: 'gzip-bytes',
        note: 'Somme gzip des chunks JS des HTML prérendus publics. Régénérer avec `npm run audit:route-weight:baseline` après revue.',
        routes: Object.fromEntries(rows.map(({ route, bytes }) => [route, bytes])),
    };
    writeFileSync(BASELINE_FILE, JSON.stringify(payload, null, 2) + '\n');

    writeReport(
        reportHeader(
            `## Baseline régénérée (${rows.length} routes)\n\n` +
            rows
                .map(({ route, kb }) => `- \`${route}\` — **${kb} Ko**`)
                .join('\n')
        )
    );

    console.log(`[audit:route-weight] Baseline écrite : plans${sep}route-weight-baseline.json (${rows.length} routes).`);
    console.log(`[audit:route-weight] Rapport : plans${sep}revue-poids-routes.md`);
    process.exit(0);
}

if (!existsSync(BASELINE_FILE)) {
    fail('Baseline absente — exécuter `npm run audit:route-weight:baseline` après revue.');
}

let baseline;
try {
    baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));
} catch {
    fail('Baseline illisible (JSON invalide).');
}

if (!baseline || typeof baseline.routes !== 'object' || baseline.routes === null) {
    fail('Baseline invalide (clé `routes` absente).');
}

const fails = [];
const warns = [];
const improvements = [];
const added = [];
const removed = [];

for (const { route, bytes } of rows) {
    const baseBytes = baseline.routes[route];
    if (typeof baseBytes !== 'number' || baseBytes <= 0) {
        added.push(route);
        continue;
    }
    const ratio = (bytes - baseBytes) / baseBytes;
    const entry = { route, kb: toKb(bytes), baseKb: toKb(baseBytes), ratio };
    if (ratio > FAIL_RATIO) fails.push(entry);
    else if (ratio > WARN_RATIO) warns.push(entry);
    else if (ratio < -WARN_RATIO) improvements.push(entry);
}

for (const route of Object.keys(baseline.routes)) {
    if (!weights.has(route)) removed.push(route);
}

fails.sort((a, b) => b.ratio - a.ratio);
warns.sort((a, b) => b.ratio - a.ratio);

/* 4. Rapport + verdict ------------------------------------------------------ */

const verdictLines = [];
if (fails.length === 0) {
    verdictLines.push(
        `**OK** — ${rows.length} routes mesurées, aucune au-dessus de +5 %.`,
        '',
        `- avertissements (> +2 %) : ${warns.length}`,
        `- améliorations (< −2 %) : ${improvements.length}`,
        `- nouvelles routes (hors baseline) : ${added.length}`,
        `- routes absentes du build : ${removed.length}`
    );
} else {
    verdictLines.push(
        `**ÉCHEC** — ${fails.length} route(s) au-dessus de +5 % :`,
        '',
        ...fails.map(
            ({ route, kb, baseKb, ratio }) =>
                `- \`${route}\` — ${kb} Ko (baseline ${baseKb} Ko, ${formatDelta(ratio)})`
        )
    );
}

const detailSections = [];
if (warns.length > 0) {
    detailSections.push(
        '## Avertissements (> +2 %)',
        '',
        ...warns.map(
            ({ route, kb, baseKb, ratio }) =>
                `- \`${route}\` — ${kb} Ko (baseline ${baseKb} Ko, ${formatDelta(ratio)})`
        ),
        ''
    );
}
if (added.length > 0) {
    detailSections.push(
        '## Nouvelles routes (hors baseline — régénérer la baseline après revue)',
        '',
        ...added.map((route) => `- \`${route}\``),
        ''
    );
}
if (removed.length > 0) {
    detailSections.push('## Routes de la baseline absentes du build', '', ...removed.map((route) => `- \`${route}\``), '');
}
if (missingChunks.size > 0) {
    detailSections.push(
        '## Chunks référencés mais introuvables (build incomplet ?)',
        '',
        ...[...missingChunks].map((chunk) => `- \`${chunk}\``),
        ''
    );
}

writeReport(
    reportHeader(
        [
            '## Verdict',
            '',
            ...verdictLines,
            '',
            '## Routes les plus lourdes (top 10)',
            '',
            '| Route | Poids | Baseline | Δ |',
            '| --- | ---: | ---: | ---: |',
            ...rows.slice(0, 10).map(({ route, kb, bytes }) => {
                const baseBytes = baseline.routes[route];
                const delta =
                    typeof baseBytes === 'number' && baseBytes > 0
                        ? formatDelta((bytes - baseBytes) / baseBytes)
                        : '—';
                return `| \`${route}\` | ${kb} Ko | ${typeof baseBytes === 'number' ? toKb(baseBytes) + ' Ko' : '—'} | ${delta} |`;
            }),
            '',
            ...detailSections,
        ].join('\n')
    )
);

console.log(`[audit:route-weight] ${rows.length} routes publiques mesurées (JS gzip, HTML prérendus).`);
console.log(`[audit:route-weight] Rapport : plans${sep}revue-poids-routes.md`);

if (fails.length > 0) {
    console.error(`[audit:route-weight] ÉCHEC — ${fails.length} route(s) au-dessus de +5 % :`);
    for (const { route, kb, baseKb, ratio } of fails) {
        console.error(`  - ${route} : ${kb} Ko (baseline ${baseKb} Ko, ${formatDelta(ratio)})`);
    }
    process.exit(2);
}

if (warns.length > 0) {
    console.warn(`[audit:route-weight] AVERTISSEMENT — ${warns.length} route(s) au-dessus de +2 % :`);
    for (const { route, kb, baseKb, ratio } of warns) {
        console.warn(`  - ${route} : ${kb} Ko (baseline ${baseKb} Ko, ${formatDelta(ratio)})`);
    }
}

console.log('[audit:route-weight] OK — aucun écart > +5 % sur la baseline.');
