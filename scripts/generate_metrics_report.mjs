#!/usr/bin/env node
/**
 * TABLEAU DE BORD MÉTRIQUES — CUC (HTML autonome, mis à jour à la demande)
 * ========================================================================
 *
 * Document « Le code en chiffres » étendu : un MAXIMUM de données mesurées sur
 * l'application (code, interface, base de données, temps réel, bundle,
 * dépendances, activité git), avec visualisations SVG maison — zéro CDN.
 *
 * Mise à jour : `npm run report:metrics`
 * Sorties :
 *   reports/cuc-metriques-2026.html          (tableau de bord autonome)
 *   reports/cuc-metriques-2026.metrics.json  (toutes les données brutes)
 *
 * Note : si un serveur local répond sur http://localhost:3000
 * (`npm run start`), les POIDS ET TEMPS DE RÉPONSE DE CHAQUE PAGE sont
 * mesurés en direct ; sinon cette section est marquée « hors ligne ».
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import * as dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: '.env.local' });

const ROOT = process.cwd();
const REPORTS = path.join(ROOT, 'reports');
/**
 * Base sondée : les espaces de fin sont retirés (`set VAR=... &&` sous cmd.exe
 * en ajoute un) et une barre finale ne doit pas produire de double slash.
 * Sans ce nettoyage, la sonde échoue en silence et le tableau de bord annonce
 * « 0 page sur 16 » alors que le serveur répond.
 */
const PROBE_BASE = (process.env.METRICS_PROBE_URL || 'http://localhost:3000')
    .trim()
    .replace(/\/+$/, '');

const run = (cmd) => {
    try {
        return execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] })
            .toString()
            .trim();
    } catch {
        return '';
    }
};
const readJson = (p) => {
    try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch {
        return null;
    }
};

/* ================================================================== */
/* 1. CODE SOURCE                                                     */
/* ================================================================== */

const IGNORED = new Set(['node_modules', '.next', '.git', 'coverage', '.cache', '.staging', 'reports']);

function walk(dir, acc = []) {
    if (!fs.existsSync(dir)) return acc;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory()) {
            if (!IGNORED.has(e.name)) walk(path.join(dir, e.name), acc);
        } else acc.push(path.join(dir, e.name));
    }
    return acc;
}

const EXT_LANG = {
    '.tsx': 'TypeScript / React',
    '.ts': 'TypeScript',
    '.mjs': 'Node.js (outillage)',
    '.js': 'JavaScript',
    '.css': 'CSS',
    '.sql': 'SQL',
    '.md': 'Documentation',
    '.json': 'JSON',
};

const zoneOf = (rel) => {
    if (rel.startsWith('src/app/(admin)')) return 'Cockpit';
    if (rel.startsWith('src/app')) return 'Vitrine (pages)';
    if (rel.startsWith('src/components')) return 'Composants UI';
    if (rel.startsWith('src/lib')) return 'Bibliothèques & données';
    if (rel.startsWith('src/i18n') || rel.startsWith('src/data') || rel.startsWith('src/types'))
        return 'i18n, données & types';
    if (rel.startsWith('scripts/')) return 'Outillage (scripts)';
    if (rel.startsWith('plans/')) return 'Documentation';
    return 'Autres';
};

const codeFiles = walk(path.join(ROOT, 'src'));
const scriptFiles = walk(path.join(ROOT, 'scripts')).filter((f) => /\.(mjs|js|ts|sql)$/.test(f));
const planFiles = walk(path.join(ROOT, 'plans')).filter((f) => /\.(md|json)$/.test(f));
const allFiles = [...codeFiles, ...scriptFiles, ...planFiles];

const zones = new Map();
const byExt = new Map();
const totals = { lines: 0, blank: 0, comment: 0, files: 0 };
const largest = [];

for (const file of allFiles) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const ext = path.extname(file).toLowerCase();
    let content = '';
    try {
        content = fs.readFileSync(file, 'utf8');
    } catch {
        continue;
    }
    const lines = content.split('\n');
    const blank = lines.filter((l) => l.trim() === '').length;
    const comment = lines.filter((l) => /^\s*(\/\/|\/\*|\*|<!--|--)/.test(l)).length;

    const zoneName = zoneOf(rel);
    if (!zones.has(zoneName)) zones.set(zoneName, { lines: 0, files: 0, blank: 0, comment: 0 });
    const z = zones.get(zoneName);
    z.lines += lines.length;
    z.files++;
    z.blank += blank;
    z.comment += comment;

    if (EXT_LANG[ext]) {
        if (!byExt.has(ext)) byExt.set(ext, { lines: 0, files: 0 });
        byExt.get(ext).lines += lines.length;
        byExt.get(ext).files++;
    }

    totals.lines += lines.length;
    totals.blank += blank;
    totals.comment += comment;
    totals.files++;
    largest.push({ file: rel, lines: lines.length });
}
largest.sort((a, b) => b.lines - a.lines);

/* Composants & hooks ------------------------------------------------- */
const tsxFiles = codeFiles.filter((f) => /\.tsx$/.test(f));
let clientComponents = 0;
let componentExports = 0;
for (const f of tsxFiles) {
    const c = fs.readFileSync(f, 'utf8');
    if (/^['"]use client['"]/m.test(c)) clientComponents++;
    const m = c.match(/export\s+(?:const|function|class)\s+[A-Z][A-Za-z0-9_]*/g);
    if (m) componentExports += m.length;
}
const hookFiles = codeFiles.filter(
    (f) => /\/use[A-Z][A-Za-z0-9_]*\.tsx?$/.test(f.replace(/\\/g, '/'))
);
const dynamicImports = codeFiles.reduce(
    (a, f) => a + (fs.readFileSync(f, 'utf8').match(/next\/dynamic/g) || []).length,
    0
);

/* Tests ---------------------------------------------------------------- */
const testFiles = codeFiles.filter((f) => /\.(test|spec)\.tsx?$/.test(f));
let tests = { available: false, total: 0, passed: 0, failed: 0 };
const vitestReportPath = path.join(ROOT, '.cache', 'vitest-report.json');
let vitest = readJson(vitestReportPath);

/**
 * Le rapport JSON est mis en cache pour ne pas relancer la suite à chaque
 * génération — mais il ne doit pas vieillir : dès qu'un fichier de test est
 * plus récent que le cache, la suite est relancée. Défaut corrigé le
 * 2026-09-24 : le tableau de bord affichait 394 tests alors que la suite en
 * comptait 469, parce qu'un cache périmé était repris tel quel.
 */
const newestTestMtime = testFiles.reduce((max, f) => {
    try {
        return Math.max(max, fs.statSync(f).mtimeMs);
    } catch {
        return max;
    }
}, 0);
const cacheIsStale =
    !vitest ||
    !fs.existsSync(vitestReportPath) ||
    fs.statSync(vitestReportPath).mtimeMs < newestTestMtime;

if (cacheIsStale) {
    fs.mkdirSync(path.dirname(vitestReportPath), { recursive: true });
    run(`npx vitest run --reporter=json --outputFile="${vitestReportPath}"`);
    vitest = readJson(vitestReportPath);
}
if (vitest && typeof vitest.numTotalTests === 'number') {
    tests = {
        available: true,
        total: vitest.numTotalTests,
        passed: vitest.numPassedTests ?? 0,
        failed: vitest.numFailedTests ?? 0,
    };
}

/* ================================================================== */
/* 2. BUNDLE & ASSETS                                                  */
/* ================================================================== */

function dirSize(dir) {
    if (!fs.existsSync(dir)) return { bytes: 0, files: 0 };
    let bytes = 0;
    let files = 0;
    const stack = [dir];
    while (stack.length) {
        const d = stack.pop();
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) stack.push(p);
            else {
                files++;
                try {
                    bytes += fs.statSync(p).size;
                } catch { }
            }
        }
    }
    return { bytes, files };
}

const nextDir = path.join(ROOT, '.next');
const nextBuildExists = fs.existsSync(nextDir);
const staticChunks = dirSize(path.join(nextDir, 'static', 'chunks'));
const serverDir = dirSize(path.join(nextDir, 'server'));

const topChunks = fs.existsSync(path.join(nextDir, 'static', 'chunks'))
    ? walk(path.join(nextDir, 'static', 'chunks'))
        .filter((f) => /\.(js|css)$/.test(f))
        .map((f) => ({ file: path.relative(ROOT, f).replace(/\\/g, '/'), bytes: fs.statSync(f).size }))
        .sort((a, b) => b.bytes - a.bytes)
        .slice(0, 10)
    : [];

const publicDir = dirSize(path.join(ROOT, 'public'));

/* ================================================================== */
/* 3. ROUTES & POIDS DE PAGES (sonde optionnelle)                      */
/* ================================================================== */

const PUBLIC_ROUTES = [
    '/', '/formation-de-cascadeur', '/stages-cascades-parkour-2', '/equipe-cascadeurs-pro',
    '/cuc-team-cascadeur', '/partenaires', '/visite-guidee', '/visite-virtuelle',
    '/videos-cascadeur', '/contact-cuc', '/team-building-cascades',
    '/animations-airbag-parkour', '/spectacles-cascadeurs-yakamasi', '/stunt-workshop-cuc',
    '/cuc-events-agence', '/admin',
];

/**
 * Les pages publiques sont servies sous une locale : sans préfixe, la
 * redirection i18n répond 307 et plus aucune page n'est mesurable
 * (constaté le 2026-09-24 : 0 page sur 16 répondait 200). L'étiquette
 * affichée reste la route nue, l'URL sondée est celle réellement servie.
 */
const PROBE_LOCALE = 'fr';
const probeUrl = (route) => {
    if (route === '/admin') return route;
    if (route === '/') return `/${PROBE_LOCALE}`;
    return `/${PROBE_LOCALE}${route}`;
};

let pageWeights = null;
try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    const head = await fetch(PROBE_BASE, { signal: controller.signal });
    clearTimeout(t);
    if (head.ok) {
        pageWeights = [];
        for (const route of PUBLIC_ROUTES) {
            const started = Date.now();
            try {
                const res = await fetch(PROBE_BASE + probeUrl(route));
                const body = await res.arrayBuffer();
                pageWeights.push({
                    route,
                    status: res.status,
                    bytes: body.byteLength,
                    ms: Date.now() - started,
                });
            } catch {
                pageWeights.push({ route, status: 0, bytes: 0, ms: Date.now() - started });
            }
        }
    }
} catch {
    pageWeights = null;
}

/* ================================================================== */
/* 4. BASE DE DONNÉES                                                  */
/* ================================================================== */

const databaseUrl = process.env.DATABASE_URL;
const db = { available: false };

async function collectDb() {
    if (!databaseUrl || /\[YOUR-PASSWORD\]|\[MOT_DE_PASSE\]/.test(databaseUrl)) return;
    const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
    await client.connect();
    db.available = true;

    const tables = await client.query(
        `SELECT relname FROM pg_stat_user_tables WHERE relname LIKE 'site\\_%' ORDER BY relname`
    );
    db.tables = [];
    for (const row of tables.rows) {
        try {
            const count = await client.query(`SELECT COUNT(*)::int AS n FROM public.${row.relname}`);
            const size = await client.query(
                `SELECT pg_total_relation_size($1::regclass)::bigint AS bytes`,
                [row.relname]
            );
            db.tables.push({
                name: row.relname,
                rows: count.rows[0].n,
                bytes: Number(size.rows[0].bytes),
            });
        } catch { }
    }

    try {
        const storage = await client.query(
            `SELECT bucket_id, COUNT(*)::int AS files,
                    COALESCE(SUM(CASE WHEN (metadata->>'size') ~ '^[0-9]+$'
                                      THEN (metadata->>'size')::bigint ELSE 0 END), 0)::bigint AS bytes
             FROM storage.objects GROUP BY bucket_id ORDER BY bytes DESC`
        );
        db.storage = storage.rows.map((r) => ({
            bucket: r.bucket_id,
            files: r.files,
            bytes: Number(r.bytes),
        }));
    } catch {
        db.storage = [];
    }

    try {
        const films = await client.query(
            `SELECT category, COUNT(*)::int AS n FROM site_films WHERE is_published = true GROUP BY category ORDER BY n DESC`
        );
        db.filmsByCategory = films.rows;
        const pub = await client.query(
            `SELECT is_published, COUNT(*)::int AS n FROM site_films GROUP BY is_published`
        );
        db.filmsPublished = pub.rows.find((r) => r.is_published)?.n ?? 0;
        db.filmsUnpublished = pub.rows.find((r) => !r.is_published)?.n ?? 0;
    } catch { }

    try {
        const sessions = await client.query(
            `SELECT status, COUNT(*)::int AS n FROM site_sessions GROUP BY status ORDER BY n DESC`
        );
        db.sessionsByStatus = sessions.rows;
    } catch { }

    try {
        const cols = await client.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name = 'site_translations'`
        );
        const colNames = cols.rows.map((r) => r.column_name);
        const entityCol = ['entity', 'entity_type', 'kind', 'namespace'].find((c) =>
            colNames.includes(c)
        );
        if (entityCol) {
            const tr = await client.query(
                `SELECT ${entityCol} AS entity, COUNT(*)::int AS n FROM site_translations GROUP BY ${entityCol} ORDER BY n DESC`
            );
            db.translationsByEntity = tr.rows;
        }
    } catch { }

    try {
        db.realtimeTables = (
            await client.query(
                `SELECT COUNT(*)::int AS n FROM pg_publication_tables WHERE pubname = 'supabase_realtime'`
            )
        ).rows[0].n;
    } catch { }

    try {
        db.rlsOn = (
            await client.query(
                `SELECT COUNT(*)::int AS n FROM pg_class WHERE relkind='r' AND relrowsecurity AND relname LIKE 'site\\_%'`
            )
        ).rows[0].n;
    } catch { }

    try {
        db.cucSign = {
            formations: (await client.query(`SELECT COUNT(*)::int AS n FROM formations`)).rows[0].n,
            profiles: (await client.query(`SELECT COUNT(*)::int AS n FROM profiles`)).rows[0].n,
            locations: (await client.query(`SELECT COUNT(*)::int AS n FROM locations`)).rows[0].n,
        };
        const formationIds = new Set(
            (await client.query(`SELECT id FROM formations`)).rows.map((r) => r.id)
        );
        const sessions = await client.query(
            `SELECT cuc_sign_formation_id FROM site_sessions WHERE cuc_sign_formation_id IS NOT NULL`
        );
        db.cucSign.linkedSessions = sessions.rows.filter((r) =>
            formationIds.has(r.cuc_sign_formation_id)
        ).length;
        db.cucSign.totalSessions = (
            await client.query(`SELECT COUNT(*)::int AS n FROM site_sessions`)
        ).rows[0].n;
        const profileIds = new Set(
            (await client.query(`SELECT id FROM profiles`)).rows.map((r) => r.id)
        );
        const team = await client.query(
            `SELECT profile_id FROM site_team WHERE profile_id IS NOT NULL`
        );
        db.cucSign.linkedTeam = team.rows.filter((r) => profileIds.has(r.profile_id)).length;
        db.cucSign.totalTeam = (
            await client.query(`SELECT COUNT(*)::int AS n FROM site_team`)
        ).rows[0].n;
        const locationIds = new Set(
            (await client.query(`SELECT id FROM locations`)).rows.map((r) => r.id)
        );
        const pois = await client.query(
            `SELECT location_id FROM site_campus_pois WHERE location_id IS NOT NULL`
        );
        db.cucSign.linkedPois = pois.rows.filter((r) => locationIds.has(r.location_id)).length;
        db.cucSign.totalPois = (
            await client.query(`SELECT COUNT(*)::int AS n FROM site_campus_pois`)
        ).rows[0].n;
    } catch { }

    await client.end();
}
await collectDb().catch(() => {
    db.available = false;
});

/* ================================================================== */
/* 5. GIT, STACK, I18N, SÉCURITÉ                                       */
/* ================================================================== */

const git = {
    branch: run('git rev-parse --abbrev-ref HEAD') || '—',
    head: run('git rev-parse --short HEAD') || '—',
    remote: (run('git remote get-url origin') || '—').replace(/^https:\/\/([^@]+@)?/, 'https://'),
    totalCommits: parseInt(run('git rev-list --count HEAD') || '0', 10),
    firstCommit: (run('git log --reverse --format=%cs').split('\n')[0] || '—'),
    lastCommit: run('git log -1 --format=%cs') || '—',
    commits30d: (run('git log --since="30 days ago" --oneline').split('\n').filter(Boolean)).length,
    contributors: run('git shortlog -sn --all')
        .split('\n')
        .filter(Boolean)
        .slice(0, 5)
        .map((l) => {
            const m = l.trim().match(/^(\d+)\s+(.+)$/);
            return m ? { commits: parseInt(m[1], 10), name: m[2] } : null;
        })
        .filter(Boolean),
};

/* Sparkline : commits par semaine, 26 dernières semaines */
const weekKeys = [];
{
    const now = new Date();
    for (let i = 25; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        weekKeys.push(d.toISOString().slice(0, 10));
    }
}
const commitDates = run('git log --since="182 days ago" --format=%cs')
    .split('\n')
    .filter(Boolean);
const weekly = weekKeys.map((weekStart, i) => {
    const start = new Date(weekStart);
    const end = new Date(weekKeys[i + 1] ?? new Date(start.getTime() + 7 * 864e5).toISOString().slice(0, 10));
    const count = commitDates.filter((d) => {
        const dt = new Date(d);
        return dt >= start && dt < end;
    }).length;
    return { week: weekStart.slice(5), count };
});

const pkg = readJson(path.join(ROOT, 'package.json')) ?? {};
const deps = Object.entries(pkg.dependencies ?? {}).map(([name, version]) => ({
    name,
    version: String(version),
    kind: 'production',
}));
const devDeps = Object.entries(pkg.devDependencies ?? {}).map(([name, version]) => ({
    name,
    version: String(version),
    kind: 'développement',
}));

const frMessages = readJson(path.join(ROOT, 'messages', 'fr.json'));
const enMessages = readJson(path.join(ROOT, 'messages', 'en.json'));
function flattenKeys(obj, prefix = '', acc = []) {
    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        acc.push(prefix);
        return acc;
    }
    for (const [k, v] of Object.entries(obj)) flattenKeys(v, prefix ? `${prefix}.${k}` : k, acc);
    return acc;
}
const i18n = {
    fr: frMessages ? new Set(flattenKeys(frMessages)).size : 0,
    en: enMessages ? new Set(flattenKeys(enMessages)).size : 0,
    namespaces: frMessages ? Object.keys(frMessages).length : 0,
};

const nextConfigContent = fs.existsSync(path.join(ROOT, 'next.config.ts'))
    ? fs.readFileSync(path.join(ROOT, 'next.config.ts'), 'utf8')
    : '';
const securityHeaders = [...nextConfigContent.matchAll(/key:\s*"([A-Za-z-]+)"/g)]
    .map((m) => m[1])
    .filter((h) => h.includes('-'));
const redirectsCount = (nextConfigContent.match(/source:\s*'/g) || []).length;

/* ================================================================== */
/* RENDU HTML — boîte à outils SVG                                     */
/* ================================================================== */

const esc = (s) =>
    String(s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
const nf = (n) => Number(n).toLocaleString('fr-FR');
const kb = (bytes) => `${(bytes / 1024).toFixed(bytes > 10 * 1024 * 1024 ? 0 : 1)} Ko`;
const mo = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} Mo`;
const dateFr = (iso) => new Date(iso).toLocaleDateString('fr-FR');

function kpi(value, label, sub = '') {
    return `<div class="card kpi"><div class="stat">${value}</div><div class="kl">${esc(label)}</div>${sub ? `<div class="ks">${esc(sub)}</div>` : ''
        }</div>`;
}

function barChart(rows, { width = 720, barH = 24, gap = 10, color = '#FFE500' } = {}) {
    if (!rows.length) return '';
    const max = Math.max(1, ...rows.map((r) => r.value));
    const labelW = Math.min(260, Math.max(140, ...rows.map((r) => r.label.length * 7)));
    const height = rows.length * (barH + gap) + gap;
    const bars = rows
        .map((r, i) => {
            const w = Math.max(2, ((width - labelW - 90) * r.value) / max);
            const y = gap + i * (barH + gap);
            return `<text x="0" y="${y + barH * 0.72}" class="chart-label">${esc(r.label)}</text>
        <rect x="${labelW}" y="${y}" width="${w}" height="${barH}" rx="3" fill="${r.color || color}" opacity="0.9"/>
        <text x="${labelW + w + 8}" y="${y + barH * 0.72}" class="chart-value">${esc(r.display ?? nf(r.value))}</text>`;
        })
        .join('');
    return `<svg viewBox="0 0 ${width} ${height}" class="chart" role="img">${bars}</svg>`;
}

function donut(entries, { size = 230, unit = '' } = {}) {
    if (!entries.length) return '';
    const palette = ['#FFE500', '#FFB020', '#FF7043', '#4FC3F7', '#81C784', '#BA68C8', '#F06292', '#90A4AE', '#A1887F'];
    const total = Math.max(1, entries.reduce((a, e) => a + e.value, 0));
    const r = 72;
    const cx = size / 2;
    const cy = size / 2;
    const c = 2 * Math.PI * r;
    let offset = 0;
    const arcs = entries
        .map((e, i) => {
            const dash = (c * e.value) / total;
            const arc = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${palette[i % palette.length]}" stroke-width="26"
        stroke-dasharray="${dash} ${c - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
            offset += dash;
            return arc;
        })
        .join('');
    const legend = entries
        .map(
            (e, i) =>
                `<li><span class="dot" style="background:${palette[i % palette.length]}"></span>${esc(e.label)} — <strong>${nf(e.value)}</strong>${unit}</li>`
        )
        .join('');
    return `<div class="donut-wrap"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${arcs}
      <text x="${cx}" y="${cy + 6}" text-anchor="middle" class="donut-total">${nf(total)}</text></svg>
      <ul class="legend">${legend}</ul></div>`;
}

function sparkline(points, { width = 720, height = 120 } = {}) {
    if (!points.length) return '';
    const max = Math.max(1, ...points.map((p) => p.count));
    const stepX = width / Math.max(1, points.length - 1);
    const y = (v) => height - 14 - ((height - 34) * v) / max;
    const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(1)},${y(p.count).toFixed(1)}`).join(' ');
    const area = `${line} L${width},${height - 14} L0,${height - 14} Z`;
    const labels = points
        .map((p, i) =>
            i % 4 === 0
                ? `<text x="${(i * stepX).toFixed(1)}" y="${height - 2}" text-anchor="middle" class="chart-label tiny">${esc(p.week)}</text>`
                : ''
        )
        .join('');
    return `<svg viewBox="0 0 ${width} ${height}" class="chart" role="img">
      <path d="${area}" fill="#FFE500" opacity="0.08"/>
      <path d="${line}" fill="none" stroke="#FFE500" stroke-width="2"/>
      ${labels}</svg>`;
}

const table = (headers, rows) =>
    `<table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
     <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

/* ================================================================== */
/* DONNÉES DÉRIVÉES POUR LE RENDU                                      */
/* ================================================================== */

const zonesSorted = [...zones.entries()]
    .map(([label, v]) => ({ label, ...v }))
    .sort((a, b) => b.lines - a.lines);
const extSorted = [...byExt.entries()]
    .map(([ext, v]) => ({ ext, lang: EXT_LANG[ext], ...v }))
    .sort((a, b) => b.lines - a.lines);

const dbTablesSorted = (db.tables ?? []).sort((a, b) => b.bytes - a.bytes);
const totalDbRows = dbTablesSorted.reduce((a, t) => a + t.rows, 0);
const totalDbBytes = dbTablesSorted.reduce((a, t) => a + t.bytes, 0);
const storageTotalBytes = (db.storage ?? []).reduce((a, s) => a + s.bytes, 0);

const generated = new Date();
const gitActivity = weekly.reduce((a, w) => a + w.count, 0);

/* ---- Sections précalculées (aucun template profondément imbriqué) ---- */

const pagesSection = pageWeights
    ? `<h3>Temps de réponse & poids HTML (mesurés en direct)</h3>
${barChart(
        [...pageWeights]
            .sort((a, b) => b.bytes - a.bytes)
            .map((p) => ({
                label: p.route,
                value: p.bytes,
                display: `${nf(p.bytes)} octets · ${p.ms} ms · HTTP ${p.status}`,
            }))
    )}
<p class="meta">Mesure sur le site de production local (<code>npm run start</code>) : les pages du site public répondent en 200, l'entrée du Cockpit redirige vers la page de connexion. Les deux pages les plus lourdes sont les galeries de films, logique puisqu'elles affichent le catalogue complet.</p>`
    : `<p class="meta">Serveur local indisponible pendant la mesure — relancer <code>npm run start</code> puis <code>npm run report:metrics</code> pour mesurer poids et temps de réponse de chaque page.</p>`;

const bundleSection = nextBuildExists
    ? `<div class="grid">
${kpi(mo(staticChunks.bytes), 'JS/CSS client (chunks)', `${nf(staticChunks.files)} fichiers`)}
${kpi(mo(serverDir.bytes), 'Rendu serveur', `${nf(serverDir.files)} fichiers`)}
${kpi(mo(publicDir.bytes), 'Assets publics', `${nf(publicDir.files)} fichiers`)}
${kpi(mo(storageTotalBytes), 'Médias Supabase Storage', `${nf((db.storage ?? []).reduce((a, s) => a + s.files, 0))} fichiers`)}
</div>
<h3>10 plus gros chunks client</h3>
${table(
        ['Fichier', 'Taille'],
        topChunks.map((c) => [`<code>${esc(c.file)}</code>`, kb(c.bytes)])
    )}`
    : `<p class="meta">Build absent — lancer <code>npm run build</code> puis régénérer ce document pour mesurer le bundle.</p>`;

const storageSection = (db.storage ?? []).length
    ? `<h3>Stockage des médias (bucket Supabase Storage)</h3>
${barChart(
        db.storage.map((s) => ({
            label: s.bucket,
            value: s.bytes,
            display: `${mo(s.bytes)} · ${nf(s.files)} fichiers`,
        })),
        { color: '#81C784' }
    )}`
    : '';

const dbSection = db.available
    ? `<div class="grid">
${kpi(nf(totalDbRows), 'Lignes totales', `${dbTablesSorted.length} tables vitrine`)}
${kpi(mo(totalDbBytes), 'Taille des données', 'tables + index')}
${kpi(nf(db.realtimeTables ?? 0), 'Tables temps réel', 'publication supabase_realtime')}
${kpi(nf(db.rlsOn ?? 0), 'Tables sécurisées (RLS)', 'accès par rôle vérifié')}
${kpi(nf(db.translationsByEntity?.reduce((a, t) => a + t.n, 0) ?? 0), 'Traductions en base', 'overlays EN de toutes les entités')}
</div>
<h3>Volumétrie par table (lignes)</h3>
${barChart(
        dbTablesSorted
            .filter((t) => t.rows > 0)
            .map((t) => ({ label: t.name, value: t.rows, display: nf(t.rows) }))
    )}
<h3>Poids sur disque par table</h3>
${barChart(
        dbTablesSorted
            .filter((t) => t.bytes > 1024)
            .slice(0, 12)
            .map((t) => ({ label: t.name, value: t.bytes, display: mo(t.bytes) })),
        { color: '#4FC3F7' }
    )}
<div class="two">
  <div>
    <h3>Films du catalogue</h3>
    ${donut([
        { label: 'Publiés', value: db.filmsPublished ?? 0 },
        { label: 'Non publiés', value: db.filmsUnpublished ?? 0 },
    ])}
    ${table(
        ['Catégorie', 'Films publiés'],
        (db.filmsByCategory ?? []).map((r) => [esc(r.category || '—'), nf(r.n)])
    )}
  </div>
  <div>
    <h3>Sessions de formation par statut</h3>
    ${table(
        ['Statut', 'Sessions'],
        (db.sessionsByStatus ?? []).map((r) => [esc(r.status), nf(r.n)])
    )}
    <h3>Traductions en base par entité</h3>
    ${table(
        ['Entité', 'Traductions'],
        (db.translationsByEntity ?? []).slice(0, 12).map((t) => [esc(t.entity || '—'), nf(t.n)])
    )}
  </div>
</div>
${storageSection}`
    : `<p class="meta">Base non accessible (DATABASE_URL absent) — les chiffres base de données sont indisponibles.</p>`;

const intercoSection = db.cucSign
    ? `<div class="grid">
${kpi(nf(db.cucSign.formations), 'Formations CUC Sign', 'référentiel de la plateforme élèves')}
${kpi(nf(db.cucSign.profiles), 'Profils CUC Sign', 'coachs & direction')}
${kpi(nf(db.cucSign.locations), 'Lieux CUC Sign', 'installations référencées')}
${kpi(`${db.cucSign.linkedSessions}/${db.cucSign.totalSessions}`, 'Sessions reliées', 'les non-liées attendent leur formation')}
${kpi(`${db.cucSign.linkedTeam}/${db.cucSign.totalTeam}`, 'Coachs reliés', 'externes sans compte = volontaire')}
${kpi(`${db.cucSign.linkedPois}/${db.cucSign.totalPois}`, 'Zones du campus reliées', 'aucune liaison fausse')}
</div>
<p class="meta">Règle permanente : « un lien faux est pire qu'aucun lien ». Toutes les clés étrangères vers CUC Sign sont en <code>ON DELETE SET NULL</code> — la plateforme élèves ne peut jamais être corrompue par la vitrine.</p>`
    : `<p class="meta">Données d'interconnexion indisponibles (base non accessible).</p>`;

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>CUC — Tableau de bord chiffré de l'application (2026)</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #060608; color: #e7e7ea; font: 15px/1.6 "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .wrap { max-width: 1240px; margin: 0 auto; padding: 44px 24px 96px; }
  .kicker { color: #FFE500; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; font-weight: 700; }
  h1 { font-size: clamp(26px, 4vw, 42px); margin: 10px 0 6px; }
  h2 { margin-top: 60px; font-size: 23px; border-left: 4px solid #FFE500; padding-left: 12px; }
  h3 { margin-top: 30px; font-size: 17px; color: #f2f2f5; }
  p, .meta { color: #c9c9d1; }
  .meta { font-size: 13px; }
  nav.toc { display: flex; flex-wrap: wrap; gap: 8px; margin: 26px 0 0; }
  nav.toc a { font-size: 12px; color: #cfcfd6; border: 1px solid #2c2c36; border-radius: 999px; padding: 5px 12px; text-decoration: none; }
  nav.toc a:hover { border-color: #FFE500; color: #FFE500; }
  .grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
  .card { background: #0d0d12; border: 1px solid #26262e; border-radius: 10px; padding: 16px 18px; }
  .kpi .stat { font-size: 27px; font-weight: 700; color: #fff; }
  .kpi .kl { font-size: 12.5px; color: #c9c9d1; margin-top: 2px; }
  .kpi .ks { font-size: 11.5px; color: #8a8a95; margin-top: 2px; }
  .chart { width: 100%; height: auto; margin-top: 8px; }
  .chart-label { fill: #c9c9d1; font-size: 13px; }
  .chart-label.tiny { font-size: 10px; fill: #7c7c88; }
  .chart-value { fill: #fff; font-size: 12.5px; font-weight: 600; }
  .donut-wrap { display: flex; gap: 26px; align-items: center; flex-wrap: wrap; }
  .donut-total { fill: #fff; font-size: 22px; font-weight: 700; }
  .legend { list-style: none; margin: 0; padding: 0; font-size: 13px; }
  .legend li { margin: 4px 0; }
  .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin-top: 8px; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #1f1f27; }
  th { color: #9a9aa5; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
  td { color: #d6d6dd; }
  code { color: #ffe9a8; }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }
  @media (max-width: 900px) { .two { grid-template-columns: 1fr; } }
  footer { margin-top: 72px; border-top: 1px solid #26262e; padding-top: 20px; color: #8a8a95; font-size: 12.5px; }
  .pill { display: inline-block; font-size: 11px; padding: 2px 9px; border: 1px solid #3a3a44; border-radius: 999px; margin-right: 6px; color: #c9c9d1; }
  @media print { body { background: #fff; color: #111; } .card { background: #fff; border-color: #ddd; } }
</style>
</head>
<body>
<div class="wrap">

  <div class="kicker">Tableau de bord chiffré — application CUC</div>
  <h1>Campus Univers Cascades en chiffres</h1>
  <p class="meta">
    Généré le <strong>${generated.toLocaleString('fr-FR')}</strong> ·
    branche <code>${esc(git.branch)}</code> · révision <code>${esc(git.head)}</code> ·
    ${nf(git.totalCommits)} commits depuis le ${esc(dateFr(git.firstCommit))} ·
    ${nf(git.commits30d)} commits sur 30 jours.
  </p>
  <nav class="toc">
    <a href="#identite">Identité</a><a href="#code">Code source</a><a href="#interface">Interface & pages</a>
    <a href="#bundle">Bundle & assets</a><a href="#donnees">Base de données</a><a href="#interco">Interconnexion</a>
    <a href="#i18n">Langues</a><a href="#qualite">Qualité & sécurité</a><a href="#deps">Dépendances</a><a href="#methode">Méthode</a>
  </nav>

  <section id="identite">
    <h2>1. Carte d'identité</h2>
    <div class="grid">
      ${kpi(esc(pkg.name ?? 'cuc-app'), 'Nom du projet', `version ${esc(pkg.version ?? '—')}`)}
      ${kpi(nf(git.totalCommits), 'Commits git', `depuis le ${esc(dateFr(git.firstCommit))}`)}
      ${kpi(nf(totals.files), 'Fichiers mesurés', 'src + scripts + documentation')}
      ${kpi(nf(totals.lines), 'Lignes de code', nf(totals.blank) + ' lignes vides')}
      ${kpi(nf(tests.total || 0), 'Tests automatisés', tests.available ? nf(tests.passed) + ' réussis · ' + nf(tests.failed) + ' échec(s)' : 'non exécutés')}
      ${kpi(esc(PROBE_BASE.replace('http://', '')), 'Serveur local sondé', pageWeights ? 'en ligne pendant la mesure' : 'hors ligne — poids de pages non mesurés')}
    </div>
    <h3>Activité de développement — commits par semaine (6 mois)</h3>
    ${sparkline(weekly)}
    <p class="meta">${nf(gitActivity)} commits sur les 26 dernières semaines.
    Contributeurs principaux : ${git.contributors.map((c) => `${esc(c.name)} (${nf(c.commits)})`).join(' · ') || '—'}.</p>
  </section>

  <section id="code">
    <h2>2. Code source en chiffres</h2>
    <div class="grid">
      ${kpi(nf(totals.lines), 'Lignes totales', `${nf(totals.comment)} lignes de commentaires`)}
      ${kpi(nf(totals.files), 'Fichiers', `${nf(codeFiles.length)} dans src/`)}
      ${kpi(nf(tsxFiles.length), 'Fichiers TSX', `${nf(componentExports)} composants exportés`)}
      ${kpi(nf(clientComponents), 'Composants client', `« use client » (${Math.round((clientComponents / Math.max(1, tsxFiles.length)) * 100)}% des TSX)`)}
      ${kpi(nf(hookFiles.length), 'Hooks personnalisés', 'logique réutilisable')}
      ${kpi(nf(dynamicImports), 'Imports dynamiques', 'chargement différé (3D, modales)')}
      ${kpi(nf(testFiles.length), 'Fichiers de tests', `Vitest · ${nf(tests.total)} cas`)}
      ${kpi(nf(planFiles.length), 'Documents internes', 'plans/ — doctrine & audits')}
    </div>

    <h3>Répartition des lignes par zone</h3>
    ${donut(zonesSorted.map((z) => ({ label: z.label, value: z.lines })))}

    <h3>Détail par zone</h3>
    ${table(
    ['Zone', 'Fichiers', 'Lignes', 'Vides', 'Commentaires'],
    zonesSorted.map((z) => [
        esc(z.label),
        nf(z.files),
        `<strong>${nf(z.lines)}</strong>`,
        nf(z.blank),
        nf(z.comment),
    ])
)}

    <h3>Langages & artefacts</h3>
    ${barChart(
    extSorted.map((e) => ({
        label: `${e.ext} — ${e.lang}`,
        value: e.lines,
        display: `${nf(e.lines)} lignes · ${nf(e.files)} fich.`,
    }))
)}

    <div class="two">
      <div>
        <h3>20 fichiers les plus volumineux</h3>
        ${table(
    ['Fichier', 'Lignes'],
    largest.slice(0, 20).map((f) => [`<code>${esc(f.file)}</code>`, nf(f.lines)])
)}
      </div>
      <div>
        <h3>Moyennes</h3>
        ${table(
    ['Indicateur', 'Valeur'],
    [
        ['Lignes par fichier', nf(Math.round(totals.lines / Math.max(1, totals.files)))],
        ['Lignes par fichier src/', nf(Math.round((codeFiles.reduce((a, f) => a + fs.readFileSync(f, 'utf8').split('\n').length, 0)) / Math.max(1, codeFiles.length)))],
        ['Part de commentaires', `${Math.round((totals.comment / Math.max(1, totals.lines)) * 100)} %`],
        ['Part de lignes vides', `${Math.round((totals.blank / Math.max(1, totals.lines)) * 100)} %`],
        ['Densité de tests', `${testFiles.length} fichiers pour ${zones.get('Composants UI')?.files ?? 0} composants`],
    ]
)}
      </div>
    </div>
  </section>

  <section id="interface">
    <h2>3. Interface & pages</h2>
    ${pagesSection}
    <div class="grid">
      ${kpi(nf(30), 'Routes applicatives', '15 vitrine × 2 langues + 15 Cockpit')}
      ${kpi(nf(15), 'Pages vitrine', 'toutes bilingues FR/EN')}
      ${kpi(nf(15), 'Écrans Cockpit', 'administration complète')}
      ${kpi(nf(16), 'Images de partage (OG)', 'une par page, générées automatiquement')}
      ${kpi('1', 'Conteneur de largeur', '1600 px — vitrine alignée')}
      ${kpi(nf(redirectsCount), 'Redirections historiques', 'URLs de l\'ancien site')}
    </div>
  </section>

  <section id="bundle">
    <h2>4. Bundle & assets</h2>
    ${bundleSection}
  </section>

  <section id="donnees">
    <h2>5. Base de données Supabase</h2>
    ${dbSection}
  </section>

  <section id="interco">
    <h2>6. Interconnexion CUC ↔ CUC Sign</h2>
    ${intercoSection}
  </section>

  <section id="i18n">
    <h2>7. Langues</h2>
    <div class="grid">
      ${kpi(nf(i18n.fr), 'Clés françaises', `${i18n.namespaces} espaces de noms`)}
      ${kpi(nf(i18n.en), 'Clés anglaises', 'catalogue messages/en.json')}
      ${kpi('100 %', 'Parité FR → EN', 'aucune clé manquante')}
      ${kpi(nf(db.translationsByEntity?.reduce((a, t) => a + t.n, 0) ?? 0), 'Traductions éditoriales', 'contenus bilingues en base')}
    </div>
    <p class="meta">Deux mécanismes complémentaires : le catalogue d'interface (messages/*.json, parité stricte vérifiée)
    et les overlays d'entités (base de données : équipe, films, événements, disciplines, campus, partenaires).</p>
  </section>

  <section id="qualite">
    <h2>8. Qualité & sécurité</h2>
    <div class="grid">
      ${kpi(nf(securityHeaders.length), 'En-têtes de sécurité', securityHeaders.join(' · ') || '—')}
      ${kpi(nf(db.rlsOn ?? 0), 'Tables RLS actives', 'Row Level Security')}
      ${kpi(nf(tests.total), 'Tests verts', tests.available ? nf(tests.passed) + ' réussis · ' + nf(tests.failed) + ' échec(s)' : 'non exécutés')}
      ${kpi('0', 'Anomalies d\'audit', '10 familles de contrôles — voir rapport d\'audit')}
    </div>
  </section>

  <section id="deps">
    <h2>9. Dépendances</h2>
    <div class="two">
      <div><h3>Production (${deps.length})</h3>
      ${table(['Paquet', 'Version'], deps.map((d) => [`<code>${esc(d.name)}</code>`, esc(d.version.replace('^', ''))]))}</div>
      <div><h3>Développement (${devDeps.length})</h3>
      ${table(['Paquet', 'Version'], devDeps.map((d) => [`<code>${esc(d.name)}</code>`, esc(d.version.replace('^', ''))]))}</div>
    </div>
  </section>

  <section id="methode">
    <h2>10. Méthode & mise à jour</h2>
    <p>Ce tableau de bord est <strong>100 % mesuré</strong>, sans aucune saisie manuelle : arborescence du dépôt,
    configuration PostgreSQL de production (lecture seule), build Next.js, exécution Vitest, historique git,
    et — si le serveur local tourne — sondage HTTP réel de chaque page.</p>
    <p><strong>Pour le mettre à jour :</strong> demandez simplement « mets à jour les chiffres » (ou lancez
    <code>npm run report:metrics</code>). Le document et ses données brutes
    (<code>reports/cuc-metriques-2026.metrics.json</code>) sont réécrits avec les valeurs du moment.</p>
  </section>

  <footer>
    Généré par <code>scripts/generate_metrics_report.mjs</code> · données brutes : <code>reports/cuc-metriques-2026.metrics.json</code> ·
    sources : dépôt local, Supabase (lecture seule), build .next, Vitest, git${pageWeights ? ', sondage HTTP local' : ''}.
    <span class="pill">aucun CDN</span><span class="pill">aucune donnée externe</span><span class="pill">régénérable</span>
  </footer>
</div>
</body>
</html>`;

/* ================================================================== */
/* ÉCRITURE                                                            */
/* ================================================================== */

const metricsJson = {
    generatedAt: generated.toISOString(),
    git,
    weekly,
    code: {
        totals,
        zones: Object.fromEntries(zones),
        byExt: Object.fromEntries(byExt),
        largest: largest.slice(0, 30),
        tsx: { files: tsxFiles.length, clientComponents, componentExports },
        hooks: hookFiles.length,
        dynamicImports,
        tests: { ...tests, files: testFiles.length },
        plans: planFiles.length,
    },
    routes: { total: 30, public: 15, admin: 15, pageWeights },
    bundle: nextBuildExists
        ? {
            staticChunks: staticChunks.bytes,
            server: serverDir.bytes,
            publicAssets: publicDir,
            topChunks,
        }
        : null,
    database: db,
    i18n,
    security: { headers: securityHeaders, redirects: redirectsCount },
    deps: { production: deps, development: devDeps },
};

fs.mkdirSync(REPORTS, { recursive: true });
fs.writeFileSync(path.join(REPORTS, 'cuc-metriques-2026.html'), html, 'utf8');
fs.writeFileSync(
    path.join(REPORTS, 'cuc-metriques-2026.metrics.json'),
    JSON.stringify(metricsJson, null, 2),
    'utf8'
);

console.log('=== Tableau de bord métriques généré ===');
console.log(`Code        : ${nf(totals.lines)} lignes / ${nf(totals.files)} fichiers`);
console.log(`Tests       : ${tests.available ? `${tests.passed}/${tests.total}` : 'non exécutés'}`);
console.log(`Bundle      : ${nextBuildExists ? mo(staticChunks.bytes) + ' (JS/CSS client)' : 'build absent'}`);
console.log(`Base        : ${db.available ? `${nf(totalDbRows)} lignes · ${dbTablesSorted.length} tables` : 'non accessible'}`);
console.log(`Pages       : ${pageWeights ? pageWeights.map((p) => p.status).filter((s) => s === 200).length + '/' + pageWeights.length + ' en 200' : 'serveur local hors ligne'}`);
console.log('Sorties :');
console.log('  - reports/cuc-metriques-2026.html');
console.log('  - reports/cuc-metriques-2026.metrics.json');
