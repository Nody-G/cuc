#!/usr/bin/env node
/**
 * CUC — Mètre du POIDS HTML par route (WS-F / F0).
 *
 * Contrepartie de `audit_route_weight.mjs` (qui mesure le JS gzip). Ici on mesure
 * les OCTETS réellement servis par page : la taille du HTML prérendu
 * (`.next/server/app/**`) et, à part, la part du payload de vol RSC inliné
 * (`self.__next_f.push(...)`) — c'est là que vivait l'inlining du catalogue i18n
 * complet avant WS-F/F1.
 *
 * MODE : rapport, **non bloquant** (aucune régression de CI). Un dépassement de
 * plafond est signalé « hors cible » mais ne fait jamais échouer la commande,
 * sauf `--strict`. Les plafonds de `plans/route-html-budget.json` sont une cible
 * d'ingénierie (cf. `.agents/rules/client_bundle_budget.md`).
 *
 * Usage :
 *   node scripts/audit_html_weight.mjs             → rapport + delta vs baseline
 *   node scripts/audit_html_weight.mjs --baseline  → écrit la baseline (snapshot)
 *   node scripts/audit_html_weight.mjs --strict    → sort en code 2 si hors cible
 *
 * Sortie : `plans/revue-poids-html.md` (+ `scripts/route-html-baseline.json`).
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APP_DIR = join(ROOT, '.next', 'server', 'app');
const BUDGET_FILE = join(ROOT, 'plans', 'route-html-budget.json');
const BASELINE_FILE = join(ROOT, 'scripts', 'route-html-baseline.json');
const REPORT_FILE = join(ROOT, 'plans', 'revue-poids-html.md');

const writeBaseline = process.argv.includes('--baseline');
const strict = process.argv.includes('--strict');

const toKb = (bytes) => Math.round((bytes / 1024) * 10) / 10;
const formatDelta = (bytes) => `${bytes >= 0 ? '+' : ''}${toKb(bytes)} Ko`;

if (!existsSync(APP_DIR)) {
    console.error('[audit:html-weight] Aucun build (.next/server/app) — lancer `npm run build` d’abord.');
    process.exit(0); // non bloquant
}

/* 1. Routes publiques prérendues (`fr`/`en`, gabarits `[…]` exclus). */
function listHtmlFiles(dir, out = []) {
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) listHtmlFiles(full, out);
        else if (full.endsWith('.html')) out.push(full);
    }
    return out;
}

/** `/fr/cuc-team-cascadeur.html` → `/fr/cuc-team-cascadeur` ; `fr.html` → `/fr`. */
function routeKey(file) {
    return `/${relative(APP_DIR, file).split(sep).join('/').replace(/\.html$/, '')}`;
}

/** `/fr/cuc-team-cascadeur` → `/cuc-team-cascadeur` (clé du budget, sans locale). */
function slugKey(route) {
    return route.replace(/^\/(fr|en)(?=\/|$)/, '') || '/';
}

/** Somme des corps `self.__next_f.push([1,"…"])` = payload de vol inliné. */
function flightBytes(html) {
    const pushRe = /self\.__next_f\.push\(\[1,([\s\S]*?)\]\)</g;
    let total = 0;
    let match;
    while ((match = pushRe.exec(html)) !== null) total += match[1].length;
    return total;
}

const files = listHtmlFiles(APP_DIR).filter(
    (file) => /^(fr|en)([\\/]|\.html)/.test(relative(APP_DIR, file)) && !relative(APP_DIR, file).includes('[')
);

if (files.length === 0) {
    console.error('[audit:html-weight] Aucune page publique prérendue détectée.');
    process.exit(0);
}

const rows = files
    .map((file) => {
        const raw = readFileSync(file, 'utf8');
        const bytes = statSync(file).size;
        const flight = flightBytes(raw);
        return { file, route: routeKey(file), slug: slugKey(routeKey(file)), bytes, flight };
    })
    .sort((a, b) => b.bytes - a.bytes);

/* 2. Budget (cible d'ingénierie) — jamais bloquant en mode rapport. */
let budget = null;
if (existsSync(BUDGET_FILE)) {
    try {
        budget = JSON.parse(readFileSync(BUDGET_FILE, 'utf8'));
    } catch {
        budget = null;
    }
}

function capOf(route) {
    if (!budget) return { scope: 'sans plafond', capKb: Infinity, targetKb: null };
    const tier = budget.routes?.[route];
    const config = tier ? budget.tiers?.[tier] : null;
    return {
        scope: config ? `palier ${tier}` : 'plafond absolu',
        capKb:
            (config && typeof config.hardCapKb === 'number' ? config.hardCapKb : null) ??
            budget.absoluteCapKb ??
            Infinity,
        targetKb: (config && typeof config.targetKb === 'number' ? config.targetKb : null) ?? null,
    };
}

const nearRatio = typeof budget?.nearCapRatio === 'number' ? budget.nearCapRatio : 0.1;

function statusOf(kb, capKb, targetKb) {
    if (kb > capKb) return 'hors cible';
    if (kb > capKb * (1 - nearRatio)) return 'proche';
    if (targetKb !== null && kb > targetKb) return 'cible dépassée';
    return 'OK';
}

/* 3. Baseline (snapshot) pour le AVANT/APRÈS. */
let baseline = null;
if (!writeBaseline && existsSync(BASELINE_FILE)) {
    try {
        baseline = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));
    } catch {
        baseline = null;
    }
}

const snapshot = {
    version: 1,
    generatedAt: new Date().toISOString(),
    unit: 'bytes',
    note: 'Snapshot du poids HTML par route (WS-F / F0). Régénérer avec `npm run audit:html-weight:baseline` après revue.',
    routes: Object.fromEntries(rows.map(({ route, bytes, flight }) => [route, { bytes, flight }])),
};

if (writeBaseline) {
    writeFileSync(BASELINE_FILE, JSON.stringify(snapshot, null, 2) + '\n');
    console.log(`[audit:html-weight] Baseline écrite (${rows.length} pages) : scripts${sep}route-html-baseline.json`);
}

/* 4. Rapport. */
const lines = [
    '# Revue — Poids HTML par route (WS-F / F0)',
    '',
    `Généré le ${new Date().toISOString()} par \`scripts/audit_html_weight.mjs\`.`,
    '',
    'Mesure : **octets HTML réellement servis** sur les pages prérendues `fr`/`en`',
    '(fichiers `.next/server/app/**`) ; la colonne « vol RSC » isole la part du payload',
    '`self.__next_f.push(...)` (catalogue i18n + overlays + données sérialisées).',
    '',
    'Mode **non bloquant** : les plafonds de `plans/route-html-budget.json` sont une',
    'cible d’ingénierie, pas un verrou de CI (utiliser `--strict` pour rendre opposable).',
    '',
    '| Route | HTML | vol RSC | Δ baseline | cible | plafond | statut |',
    '| :--- | ---: | ---: | ---: | ---: | ---: | :--- |',
];

const overCap = [];
for (const { route, slug, bytes, flight } of rows) {
    const { capKb, targetKb, scope } = capOf(slug);
    const kb = toKb(bytes);
    const status = statusOf(kb, capKb, targetKb);
    if (status === 'hors cible') overCap.push({ route, kb, capKb, scope });
    const base = baseline?.routes?.[route];
    const delta = typeof base?.bytes === 'number' ? formatDelta(bytes - base.bytes) : '—';
    lines.push(
        `| \`${route}\` | ${toKb(bytes)} Ko | ${toKb(flight)} Ko | ${delta} | ${targetKb !== null ? `${targetKb} Ko` : '—'
        } | ${Number.isFinite(capKb) ? `${capKb} Ko` : '—'} | ${status} |`
    );
}

lines.push('', `Total pages mesurées : **${rows.length}**.`);
if (baseline) {
    const totalNow = rows.reduce((s, r) => s + r.bytes, 0);
    const totalBase = Object.values(baseline.routes ?? {}).reduce((s, r) => s + (r?.bytes ?? 0), 0);
    lines.push(`Total HTML : **${toKb(totalNow)} Ko** (${formatDelta(totalNow - totalBase)} vs baseline).`);
}
if (overCap.length > 0) {
    lines.push('', '### Routes au-dessus de leur plafond (cible d’ingénierie)', '');
    for (const { route, kb, capKb, scope } of overCap.sort((a, b) => b.kb - b.capKb - (a.kb - a.capKb))) {
        lines.push(`- \`${route}\` — ${kb} Ko (> ${capKb} Ko, ${scope})`);
    }
}

writeFileSync(REPORT_FILE, lines.join('\n') + '\n');

console.log(`[audit:html-weight] ${rows.length} pages mesurées. Rapport : plans${sep}revue-poids-html.md`);
const focus = ['/fr/cuc-team-cascadeur', '/en/cuc-team-cascadeur', '/fr', '/fr/visite-virtuelle'];
for (const route of focus) {
    const row = rows.find((r) => r.route === route);
    if (row) console.log(`[audit:html-weight] ${route.padEnd(28)} ${toKb(row.bytes)} Ko (vol RSC ${toKb(row.flight)} Ko)`);
}
const top = rows[0];
if (top) console.log(`[audit:html-weight] Plus lourde : ${top.route} — ${toKb(top.bytes)} Ko`);

if (strict && overCap.length > 0) process.exit(2);
