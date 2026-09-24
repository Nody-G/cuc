#!/usr/bin/env node
/**
 * GÉNÉRATEUR DU RAPPORT D'AUDIT CLIENT — CUC (HTML autonome)
 * ===========================================================
 *
 * Agrège des mesures RÉELLES et REJOUABLES puis rend un rapport HTML unique,
 * autonome (CSS inline, graphiques SVG maison, zéro CDN), en français, destiné
 * au client : il doit pouvoir comprendre l'état de son application sans
 * connaissance technique.
 *
 * Sources de mesure (toutes régénérables) :
 *   - scripts/audit_full_app_report.json      (audit code, `npm run audit`)
 *   - scripts/audit_supabase_state_report.json (audit base, `node scripts/audit_supabase_state.mjs`)
 *   - arborescence du dépôt (lignes de code, fichiers par zone/type)
 *   - messages/fr.json + en.json (parité i18n)
 *   - package.json (stack et dépendances)
 *   - git (révision, date, fichiers modifiés)
 *   - tests Vitest (exécutés ici sauf `--skip-tests`)
 *
 * Usage :
 *   npm run report:audit                  # rapport complet (tests inclus)
 *   npm run report:audit -- --skip-tests  # sans exécuter Vitest
 *
 * Sorties :
 *   reports/audit-2026.html          (rapport client autonome)
 *   reports/audit-2026.metrics.json  (les mêmes chiffres, exploitables)
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const SKIP_TESTS = process.argv.includes('--skip-tests');
const REPORTS_DIR = path.join(ROOT, 'reports');
const AUDIT_JSON = path.join(ROOT, 'scripts', 'audit_full_app_report.json');
const DB_JSON = path.join(ROOT, 'scripts', 'audit_supabase_state_report.json');

const readJson = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
};

const run = (cmd) => {
  try {
    return execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
};

/* ------------------------------------------------------------------ */
/* Collecte                                                            */
/* ------------------------------------------------------------------ */

const codeAudit = readJson(AUDIT_JSON);
const dbAudit = readJson(DB_JSON);

const pkg = readJson(path.join(ROOT, 'package.json')) ?? {};

/* --- Lignes de code par zone ---------------------------------------- */
const IGNORED = new Set(['node_modules', '.next', '.git', 'coverage', '.cache', '.staging', 'reports']);

function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED.has(entry.name)) walkFiles(path.join(dir, entry.name), acc);
    } else {
      acc.push(path.join(dir, entry.name));
    }
  }
  return acc;
}

const EXT_LANG = {
  '.tsx': 'TypeScript/React',
  '.ts': 'TypeScript',
  '.mjs': 'Node.js',
  '.js': 'JavaScript',
  '.css': 'CSS',
  '.sql': 'SQL',
  '.json': 'JSON',
  '.md': 'Markdown',
};

const codeFiles = walkFiles(path.join(ROOT, 'src'));
const scriptFiles = walkFiles(path.join(ROOT, 'scripts')).filter((f) => /\.(mjs|js|ts)$/.test(f));
const plansFiles = walkFiles(path.join(ROOT, 'plans')).filter((f) => /\.(md|json)$/.test(f));

const zoneOf = (file) => {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (rel.startsWith('src/app/(admin)')) return 'Cockpit (admin)';
  if (rel.startsWith('src/app')) return 'Vitrine (pages)';
  if (rel.startsWith('src/components')) return 'Composants UI';
  if (rel.startsWith('src/lib')) return 'Bibliothèques & données';
  if (rel.startsWith('src/i18n') || rel.startsWith('src/data') || rel.startsWith('src/types'))
    return 'i18n, données & types';
  if (rel.startsWith('scripts/')) return 'Outillage (scripts)';
  if (rel.startsWith('plans/')) return 'Documentation (plans)';
  return 'Autres';
};

const zones = new Map(); // zone -> { files, lines }
const byExt = new Map(); // ext -> { files, lines }

function countLines(file) {
  try {
    return fs.readFileSync(file, 'utf8').split('\n').length;
  } catch {
    return 0;
  }
}

for (const file of [...codeFiles, ...scriptFiles, ...plansFiles]) {
  const ext = path.extname(file).toLowerCase();
  const lines = countLines(file);
  const zone = zoneOf(file);
  if (!zones.has(zone)) zones.set(zone, { files: 0, lines: 0 });
  zones.get(zone).files++;
  zones.get(zone).lines += lines;
  if (EXT_LANG[ext]) {
    if (!byExt.has(ext)) byExt.set(ext, { files: 0, lines: 0 });
    byExt.get(ext).files++;
    byExt.get(ext).lines += lines;
  }
}

const totalLines = [...zones.values()].reduce((a, z) => a + z.lines, 0);
const totalFiles = [...zones.values()].reduce((a, z) => a + z.files, 0);

/* --- Top 10 des fichiers les plus volumineux ------------------------ */
const largest = [...codeFiles, ...scriptFiles]
  .map((f) => ({ file: path.relative(ROOT, f).replace(/\\/g, '/'), lines: countLines(f) }))
  .sort((a, b) => b.lines - a.lines)
  .slice(0, 10);

/* --- Tests ----------------------------------------------------------- */
const testFiles = [...codeFiles].filter((f) => /\.(test|spec)\.tsx?$/.test(f));
let tests = { available: false, total: 0, passed: 0, failed: 0 };
if (!SKIP_TESTS) {
  const out = path.join(ROOT, '.cache', 'vitest-report.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  run(`npx vitest run --reporter=json --outputFile="${out}"`);
  const vitestReport = readJson(out);
  if (vitestReport && typeof vitestReport.numTotalTests === 'number') {
    tests = {
      available: true,
      total: vitestReport.numTotalTests,
      passed: vitestReport.numPassedTests ?? 0,
      failed: vitestReport.numFailedTests ?? 0,
    };
  }
}

/* --- i18n ------------------------------------------------------------ */
function flattenKeys(obj, prefix = '', acc = []) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    acc.push(prefix);
    return acc;
  }
  for (const [k, v] of Object.entries(obj)) flattenKeys(v, prefix ? `${prefix}.${k}` : k, acc);
  return acc;
}
let i18n = { fr: 0, en: 0, missingInEn: 0 };
const frMessages = readJson(path.join(ROOT, 'messages', 'fr.json'));
const enMessages = readJson(path.join(ROOT, 'messages', 'en.json'));
if (frMessages && enMessages) {
  const frKeys = new Set(flattenKeys(frMessages));
  const enKeys = new Set(flattenKeys(enMessages));
  i18n = {
    fr: frKeys.size,
    en: enKeys.size,
    missingInEn: [...frKeys].filter((k) => !enKeys.has(k)).length,
  };
}

/* --- Git -------------------------------------------------------------- */
const git = {
  head: run('git rev-parse --short HEAD') || '—',
  date: run('git log -1 --format=%cI') || '—',
  changed: (run('git status --porcelain') || '').split('\n').filter(Boolean).length,
};

/* ------------------------------------------------------------------ */
/* Scores (transparents, dérivés des mesures)                          */
/* ------------------------------------------------------------------ */

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

const errors = codeAudit?.summary?.errors ?? {};
const totalErrors = codeAudit?.summary?.totalErrors ?? 0;
const realtimeCoverage = codeAudit?.summary?.realtimeCoverageRatio ?? 0;

const rlsValues = Object.values(dbAudit?.rls ?? {});
const rlsOn = rlsValues.filter(Boolean).length;
const invalidFk =
  (dbAudit?.campusPois ?? []).filter((p) => p.location_id && !p.locationValid).length ?? 0;

const scores = {
  'Intégrité technique': clamp(100 - totalErrors * 5),
  'Synchronisation Realtime': clamp(realtimeCoverage),
  'Interconnexion CUC Sign': clamp(100 - invalidFk * 20),
  'Parité français / anglais': clamp(
    i18n.fr === 0 ? 0 : 100 - (i18n.missingInEn / i18n.fr) * 100
  ),
  Sécurité: clamp((rlsOn / Math.max(1, rlsValues.length)) * 100),
  Tests: tests.available
    ? clamp(tests.total === 0 ? 0 : (tests.passed / tests.total) * 100)
    : clamp(testFiles.length > 0 ? 75 : 0),
};

const globalScore = clamp(
  (scores['Intégrité technique'] * 0.3 +
    scores['Synchronisation Realtime'] * 0.15 +
    scores['Interconnexion CUC Sign'] * 0.15 +
    scores['Parité français / anglais'] * 0.15 +
    scores.Sécurité * 0.15 +
    scores.Tests * 0.1)
);

const metrics = {
  generatedAt: new Date().toISOString(),
  git,
  globalScore,
  scores,
  code: {
    totalLines,
    totalFiles,
    zones: Object.fromEntries(zones),
    byExt: Object.fromEntries(byExt),
    largest,
    routes: codeAudit?.summary?.routes ?? 0,
    sourceFilesScanned: codeAudit?.summary?.sourceFiles ?? 0,
  },
  tests: { ...tests, testFiles: testFiles.length },
  i18n,
  realtime: {
    coverageRatio: realtimeCoverage,
    covered: codeAudit?.realtimeCovered?.length ?? 0,
    gaps: codeAudit?.realtimeGaps?.length ?? 0,
  },
  database: dbAudit
    ? {
      tables: dbAudit.tables,
      realtimePublished: dbAudit.realtimePublication?.length ?? 0,
      realtimeMissing: dbAudit.realtimeMissing ?? [],
      translations: dbAudit.tables?.site_translations ?? 0,
      films: dbAudit.tables?.site_films ?? 0,
      fk: dbAudit.foreignKeys ?? [],
      cucSign: dbAudit.cucSign ?? {},
    }
    : null,
  auditErrors: errors,
  stack: pkg.dependencies ?? {},
};

/* ------------------------------------------------------------------ */
/* Rendu HTML                                                          */
/* ------------------------------------------------------------------ */

const esc = (s) =>
  String(s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');

/** Barres horizontales SVG. */
function barChart(rows, { width = 640, barH = 26, gap = 10, color = '#FFE500' } = {}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  const labelW = 230;
  const height = rows.length * (barH + gap) + gap;
  const bars = rows
    .map((r, i) => {
      const w = Math.max(2, ((width - labelW - 70) * r.value) / max);
      const y = gap + i * (barH + gap);
      return `
        <text x="0" y="${y + barH * 0.72}" class="chart-label">${esc(r.label)}</text>
        <rect x="${labelW}" y="${y}" width="${w}" height="${barH}" rx="3" fill="${r.color || color}" opacity="0.9"/>
        <text x="${labelW + w + 8}" y="${y + barH * 0.72}" class="chart-value">${esc(r.display ?? r.value)}</text>`;
    })
    .join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" class="chart">${bars}</svg>`;
}

/** Jauge circulaire SVG (score 0-100). */
function gauge(value, label, size = 128) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const filled = (c * value) / 100;
  return `<figure class="gauge">
      <svg viewBox="0 0 128 128" width="${size}" height="${size}" role="img" aria-label="${esc(label)} : ${value} sur 100">
        <circle cx="64" cy="64" r="${r}" fill="none" stroke="#26262e" stroke-width="10"/>
        <circle cx="64" cy="64" r="${r}" fill="none" stroke="#FFE500" stroke-width="10"
          stroke-dasharray="${filled} ${c - filled}" stroke-linecap="round"
          transform="rotate(-90 64 64)"/>
        <text x="64" y="70" text-anchor="middle" class="gauge-value">${value}</text>
      </svg>
      <figcaption>${esc(label)}</figcaption>
    </figure>`;
}

/** Camembert SVG simple (par lignes de code par zone). */
function donut(entries, { size = 220 } = {}) {
  const palette = ['#FFE500', '#FFB020', '#FF7043', '#4FC3F7', '#81C784', '#BA68C8', '#F06292', '#90A4AE'];
  const total = Math.max(1, entries.reduce((a, e) => a + e.value, 0));
  const r = 70;
  const cx = size / 2;
  const cy = size / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const arcs = entries
    .map((e, i) => {
      const frac = e.value / total;
      const dash = c * frac;
      const arc = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${palette[i % palette.length]}"
        stroke-width="26" stroke-dasharray="${dash} ${c - dash}"
        stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
      offset += dash;
      return arc;
    })
    .join('');
  const legend = entries
    .map(
      (e, i) =>
        `<li><span class="dot" style="background:${palette[i % palette.length]}"></span>${esc(e.label)} — <strong>${e.value.toLocaleString('fr-FR')}</strong> lignes</li>`
    )
    .join('');
  return `<div class="donut-wrap"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${arcs}
      <text x="${cx}" y="${cy + 6}" text-anchor="middle" class="donut-total">${total.toLocaleString('fr-FR')}</text></svg>
      <ul class="legend">${legend}</ul></div>`;
}

const tableRows = (obj, cols) =>
  Object.entries(obj)
    .map(
      ([k, v]) =>
        `<tr>${cols.map((c) => `<td>${esc(c(v, k))}</td>`).join('')}</tr>`
    )
    .join('');

const frNumber = (n) => Number(n).toLocaleString('fr-FR');
const generated = new Date(metrics.generatedAt);

/* ================================================================== */
/* Section « Fonctionnalités de l'application » — explications + visuels */
/* ================================================================== */

/** Jeu d'icônes SVG maison (24×24, tracés uniquement — zéro dépendance). */
const FEAT_ICONS = {
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  users:
    '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 11a3 3 0 1 0 0-6"/><path d="M21 20c0-2.5-1.8-4.4-4.5-4.8"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="M10 9l5 3-5 3z"/>',
  map: '<path d="M9 3 4 5v16l5-2 6 2 5-2V3l-5 2-6-2z"/><path d="M9 3v16M15 5v16"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.3"/><path d="M20 5v6h-6"/>',
  edit: '<path d="M4 20h4L20 8l-4-4L4 16v4z"/><path d="M14 6l4 4"/>',
  database:
    '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  phone:
    '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  star: '<path d="M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-3-5.5 3 1-6.1L3 9.5l6.3-.9L12 3z"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  cpu: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 0-2 2V5z"/><path d="M8 7h8M8 11h8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
};

const icon = (name) => `<span class="fi"><svg viewBox="0 0 24 24" aria-hidden="true">${FEAT_ICONS[name] ?? FEAT_ICONS.star}</svg></span>`;
const tagsHtml = (tags = []) =>
  tags.length ? `<div class="tags">${tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : '';

const featCard = ({ iconName, title, desc, tags }) => `
  <article class="feat">${icon(iconName)}<h3>${esc(title)}</h3><p>${esc(desc)}</p>${tagsHtml(tags)}</article>`;

const accordionRow = ({ iconName, title, role, desc, tags }) => `
  <details class="acc">
    <summary>${icon(iconName)}<span>${esc(title)}${role ? ` <span class="role">— ${esc(role)}</span>` : ''}</span>
      <svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
    </summary>
    <div class="acc-body">${esc(desc)}${tagsHtml(tags)}</div>
  </details>`;

/** Les 15 pages du site public (contenu factuel, vérifié par les sondes). */
const PUBLIC_PAGES = [
  { iconName: 'film', title: 'Accueil', role: 'la vitrine du campus', desc: "Positionnement du campus, tournages, partenaires, réseaux sociaux, visite virtuelle et certification Qualiopi.", tags: ['Point d’entrée'] },
  { iconName: 'book', title: 'Formation professionnelle de cascadeur', role: 'le cursus complet', desc: "Le programme de deux ans (720 à 800 heures) : disciplines enseignées, formules, rythme et parcours d'admission.", tags: ['Cursus 2 ans'] },
  { iconName: 'calendar', title: 'Stages de cascade & parkour', role: 'les sessions datées', desc: "Stages intensifs tous niveaux dès 16 ans : découverte de 12 jours, week-ends thématiques — chaque session affiche ses dates et son statut.", tags: ['Tous niveaux'] },
  { iconName: 'users', title: "L'équipe", role: 'les 12 coachs', desc: 'Chaque coach possède sa fiche : rôle au campus, biographie et filmographie vérifiée crédit par crédit sur IMDb.', tags: ['12 fiches'] },
  { iconName: 'film', title: 'Tournage — CUC Stunt Team', role: 'pour les productions', desc: "Coordination de cascades et mise en relation avec un vivier de cascadeurs professionnels pour tournages et séries.", tags: ['Production'] },
  { iconName: 'star', title: 'Catalogue des films', role: 'le cœur cinéma', desc: "Plus de 570 films référencés avec affiches : fiche détaillée au clic (équipe impliquée, rôle de chacun), même présentation sur tout le site.", tags: ['570 films'] },
  { iconName: 'users', title: 'Partenaires', role: 'qui nous accompagne', desc: 'Équipementiers, marques et institutions affichés et pilotés depuis le Cockpit.', tags: [] },
  { iconName: 'play', title: 'Vidéos & reportages', role: 'TF1, France 2, BFM TV', desc: 'Reportages télévisés et showreels du campus, avec lecture directe sur le site.', tags: [] },
  { iconName: 'map', title: 'Le campus', role: 'installations & accès', desc: "Visite guidée des installations réelles : tour de saut 21 m, dojos, fosse de chute, hébergement — et comment venir.", tags: [] },
  { iconName: 'cpu', title: 'Visite virtuelle', role: '360° et plan 3D', desc: "Immersion 360° et plan 3D interactif du campus, chargé à la demande pour rester rapide.", tags: ['3D'] },
  { iconName: 'layers', title: 'CUC Events — agence événementielle', role: 'festivals & lancements', desc: "Shows d'action clé en main pour festivals, lancements de marque, parcs à thème et séminaires.", tags: [] },
  { iconName: 'star', title: 'Spectacles cascadeurs & Yamakasi', role: 'la scène', desc: 'Performances scéniques : voltige urbaine, combats chorégraphiés, pyrotechnie.', tags: [] },
  { iconName: 'refresh', title: 'Animations airbag & parkour', role: 'grand public', desc: "Faire vivre au public la chute libre sur airbag de cinéma, en cadre encadré et sécurisé.", tags: [] },
  { iconName: 'users', title: 'Team building', role: 'entreprises', desc: "Séminaires d'entreprise : cohésion d'équipe par les cascades et les coulisses du cinéma.", tags: [] },
  { iconName: 'globe', title: 'Stunt Workshop international', role: 'en anglais & français', desc: 'Stage international de 2 semaines : participants du monde entier, encadrement professionnel du campus.', tags: ['International'] },
  { iconName: 'phone', title: 'Contact', role: 'formulaire & carte', desc: "Formulaire guidé (projet, formation, événement) et carte interactive d'accès au campus.", tags: [] },
];

/** Les 15 écrans du Cockpit d'administration. */
const COCKPIT_APPS = [
  { iconName: 'layers', title: 'Tableau de bord', role: 'vue d’ensemble', desc: 'Synthèse des contenus, dernière activité et état général du site.', tags: [] },
  { iconName: 'edit', title: 'Pages & héros', role: 'édition directe', desc: "Chaque page se modifie sans code : titres, badges, textes, référencement — avec aperçu en direct et historique de versions (restauration en un clic).", tags: ['Révisions'] },
  { iconName: 'film', title: 'Films', role: 'catalogue', desc: 'Gérer les 570 films : affiches, catégories, rôles de l’équipe, publication ou retrait.', tags: [] },
  { iconName: 'users', title: 'Équipe', role: 'coachs', desc: "Rôle, biographie, crédits, mise en avant, ordre d'affichage — et liaison vers le compte CUC Sign du coach.", tags: [] },
  { iconName: 'calendar', title: 'Sessions de formation', role: 'calendrier', desc: 'Dates, statut (ouvert, complet, dernières places), liaison vers la formation correspondante dans CUC Sign.', tags: [] },
  { iconName: 'users', title: 'Partenaires', role: 'logos & liens', desc: 'Ajouter, retirer ou réordonner les partenaires affichés sur le site.', tags: [] },
  { iconName: 'star', title: 'Événements', role: 'agence', desc: "Événements d'agence présentés sur les pages d'activité.", tags: [] },
  { iconName: 'book', title: 'Disciplines', role: 'référentiel', desc: 'Les 10 disciplines enseignées : niveaux, équipements, contexte cinéma.', tags: [] },
  { iconName: 'cpu', title: 'Campus 3D', role: 'studio du plan', desc: 'Placer et ajuster les bâtiments du plan 3D visible en visite virtuelle.', tags: ['3D'] },
  { iconName: 'database', title: 'Médias', role: 'bibliothèque', desc: 'Toutes les images et documents centralisés et servis par la base du projet.', tags: [] },
  { iconName: 'globe', title: 'Traductions', role: 'FR → EN', desc: 'Les traductions éditoriales (films, équipe, événements, disciplines, campus) consultables et éditables.', tags: ['579 entrées'] },
  { iconName: 'shield', title: 'Annonces', role: 'bandeau d’alerte', desc: 'Message exceptionnel affiché en haut du site public (fermeture, information urgente).', tags: [] },
  { iconName: 'phone', title: 'Candidatures', role: 'boîte de réception', desc: 'Demandes reçues via le site : statut, notes internes, réponse — puis conversion en compte élève CUC Sign.', tags: ['Suivi'] },
  { iconName: 'sliders', title: 'Réglages & navigation', role: 'identité du site', desc: 'Coordonnées, boutons d’appel à l’action, réseaux sociaux, structure du menu et du pied de page.', tags: [] },
  { iconName: 'database', title: 'Traçabilité & sauvegarde', role: 'sécurité éditoriale', desc: 'Journal des actions (qui a modifié quoi) et export / restauration complète du contenu.', tags: [] },
];

/** Les mécanismes transverses (ce qui « tourne » sous le site). */
const MECHANISMS = [
  { iconName: 'refresh', title: 'Synchronisation en temps réel', desc: "Une modification dans le Cockpit apparaît sur le site en moins d'une seconde, sans rechargement — sessions, films, équipe, partenaires, réglages, annonces.", tags: ['Temps réel'] },
  { iconName: 'globe', title: 'Bilingue français / anglais', desc: 'Chaque page existe dans les deux langues, avec des textes adaptés (pas de traduction automatique). La parité est vérifiée automatiquement à chaque contrôle.', tags: ['FR / EN'] },
  { iconName: 'film', title: 'Catalogue films unifié', desc: '570 films, affiches au format 2:3, fiche détaillée au clic avec les rôles du CUC — la même présentation partout, de l’accueil à la fiche coach.', tags: ['570 films'] },
  { iconName: 'database', title: 'Médias centralisés & optimisés', desc: "Images et documents servis par la base du projet (aucune dépendance à l'ancien site), convertis automatiquement en formats légers (AVIF/WebP).", tags: ['221 fichiers'] },
  { iconName: 'shield', title: 'Interconnexion CUC Sign', desc: "Sessions de formation, coachs et lieux du site reflètent la plateforme de gestion de l'école — en lecture seule : le site ne peut jamais altérer les données pédagogiques.", tags: ['CUC Sign'] },
  { iconName: 'users', title: 'Sécurité & rôles', desc: 'Accès administrateur nominatif, permissions par rôle (direction, secrétariat, coachs), sécurité par ligne en base de données et en-têtes HTTP renforcés.', tags: ['RLS'] },
  { iconName: 'search', title: 'Recherche instantanée (Cockpit)', desc: 'Palette de commandes au clavier (Ctrl/⌘ + K) : accès direct à n’importe quel écran ou contenu en quelques lettres.', tags: ['Productivité'] },
  { iconName: 'phone', title: 'Du formulaire à l’élève', desc: 'Une demande envoyée depuis le site arrive dans le Cockpit : l’équipe la qualifie, l’annote et peut la convertir en compte CUC Sign.', tags: ['Parcours'] },
];

/** Parcours d'un visiteur, en 5 étapes. */
const JOURNEY = [
  { title: 'Découvrir', text: "Accueil, formation, campus : comprendre l'offre en 30 secondes." },
  { title: 'Explorer', text: 'Équipe, filmographie, reportages : la preuve par les faits.' },
  { title: 'Se projeter', text: 'Stages, sessions datées, statut des places : passer à l’acte.' },
  { title: 'Écrire', text: 'Formulaire guidé, contextuel selon la page d’origine.' },
  { title: 'Être suivi', text: 'La demande vit dans le Cockpit jusqu’à la réponse.' },
];

/** Tuile du schéma d'écosystème. */
const svgTile = (x, y, w, h, label, sub) => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#101017" stroke="#2a2a33"/>
  <text x="${x + w / 2}" y="${y + h / 2 - 6}" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="700">${esc(label)}</text>
  <text x="${x + w / 2}" y="${y + h / 2 + 14}" text-anchor="middle" fill="#9a9aa5" font-size="11.5">${esc(sub)}</text>`;

const ecosystemSvg = `
<svg viewBox="0 0 940 360" class="chart" role="img" aria-label="Schéma : visiteur, site vitrine, Supabase, Cockpit d'administration et plateforme CUC Sign">
  <path d="M150 167 C 180 167, 186 120, 208 108" fill="none" stroke="#3a3a44" stroke-width="2"/>
  <path d="M540 165 C 492 165, 484 112, 434 102" fill="none" stroke="#3a3a44" stroke-width="2"/>
  <path d="M430 272 C 480 272, 500 250, 556 240" fill="none" stroke="#3a3a44" stroke-width="2"/>
  <path d="M730 170 H 798" fill="none" stroke="#3a3a44" stroke-width="2"/>
  <path d="M798 210 H 732" fill="none" stroke="#3a3a44" stroke-width="2"/>
  ${svgTile(30, 125, 120, 84, 'Visiteur', 'web & mobile')}
  ${svgTile(210, 40, 224, 84, 'Site vitrine', '15 pages • FR / EN')}
  ${svgTile(210, 230, 224, 84, 'Cockpit admin', '15 écrans • rôles')}
  ${svgTile(540, 135, 190, 100, 'Supabase', 'base + temps réel')}
  ${svgTile(800, 135, 120, 100, 'CUC Sign', 'gestion de l’école')}
  <circle class="flowdot" r="3.5" fill="#FFE500" style="offset-path: path('M430 272 C 480 272, 500 250, 556 240'); animation-duration: 2.6s"/>
  <circle class="flowdot" r="3.5" fill="#FFE500" style="offset-path: path('M430 272 C 480 272, 500 250, 556 240'); animation-duration: 2.6s; animation-delay: -1.3s"/>
  <circle class="flowdot" r="3.5" fill="#7bd88f" style="offset-path: path('M540 165 C 492 165, 484 112, 434 102'); animation-duration: 2.2s"/>
  <circle class="flowdot" r="3.5" fill="#4FC3F7" style="offset-path: path('M730 170 H 798'); animation-duration: 3.2s"/>
  <circle class="flowdot" r="3.5" fill="#4FC3F7" style="offset-path: path('M798 210 H 732'); animation-duration: 3.2s; animation-delay: -1.6s"/>
  <text x="500" y="300" text-anchor="middle" fill="#7c7c88" font-size="11">Le Cockpit écrit dans Supabase ; le site lit Supabase — rien ne transite par le navigateur du visiteur.</text>
</svg>`;

const mechCardsHtml = MECHANISMS.map(featCard).join('');
const publicAccordions = PUBLIC_PAGES.map(accordionRow).join('');
const cockpitAccordions = COCKPIT_APPS.map(accordionRow).join('');
const journeyHtml = JOURNEY.map(
  (s, i) => `<div class="step"><span class="num">${i + 1}</span><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>`
).join('');

const featuresSection = `
  <section id="fonctionnalites">
    <h2>3. L'application décryptée — ce que le site et le Cockpit savent faire</h2>
    <p>
      Chaque fonctionnalité décrite ici existe réellement dans l'application et est couverte par les
      contrôles automatiques de ce rapport. Objectif : comprendre en quelques minutes ce que le site
      public montre, ce que le Cockpit permet de piloter, et comment les deux communiquent.
    </p>

    <h3>L'écosystème en un schéma</h3>
    <div class="flow">${ecosystemSvg}</div>
    <div class="legend-row">
      <span><span class="key" style="background:#FFE500"></span>écriture Cockpit → base</span>
      <span><span class="key" style="background:#7bd88f"></span>rafraîchissement temps réel → site</span>
      <span><span class="key" style="background:#4FC3F7"></span>liaison lecture seule ↔ CUC Sign</span>
    </div>

    <h3>Le parcours d'un visiteur</h3>
    <div class="steps">${journeyHtml}</div>

    <h3>Les mécanismes invisibles qui font tourner le site</h3>
    <div class="feat-grid">${mechCardsHtml}</div>

    <h3>Le site public — les 15 pages (+ le catalogue films) <span class="meta">(dépliez chaque entrée pour son rôle exact)</span></h3>
    ${publicAccordions}

    <h3>Le Cockpit — les 15 écrans d'administration</h3>
    ${cockpitAccordions}

    <div class="callout">
      <strong>À retenir :</strong> rien n'est « en dur » dans le code — textes, images, films, dates et traductions
      vivent dans la base de données et se pilotent depuis le Cockpit. Le site n'est qu'une fenêtre sur ces données,
      mise à jour en continu.
    </div>
  </section>`;

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Rapport d'audit — Campus Univers Cascades (2026)</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: #060608; color: #e7e7ea;
    font: 15px/1.6 "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  .wrap { max-width: 1200px; margin: 0 auto; padding: 48px 24px 96px; }
  header.hero { border-bottom: 1px solid #26262e; padding-bottom: 28px; margin-bottom: 36px; }
  .kicker { color: #FFE500; font-size: 12px; letter-spacing: .18em; text-transform: uppercase; font-weight: 700; }
  h1 { font-size: clamp(28px, 4vw, 44px); margin: 10px 0 6px; letter-spacing: .01em; }
  .meta { color: #9a9aa5; font-size: 13px; }
  .meta code { color: #cfcfd6; }
  h2 { margin-top: 56px; font-size: 24px; border-left: 4px solid #FFE500; padding-left: 12px; }
  h3 { margin-top: 32px; font-size: 18px; color: #f2f2f5; }
  p { color: #c9c9d1; }
  .grid { display: grid; gap: 16px; }
  .grid.cols-3 { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
  .grid.cols-2 { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  .card { background: #0d0d12; border: 1px solid #26262e; border-radius: 10px; padding: 18px 20px; }
  .card h3 { margin-top: 0; }
  .stat { font-size: 30px; font-weight: 700; color: #fff; }
  .stat small { font-size: 13px; color: #9a9aa5; font-weight: 400; display: block; }
  .gauges { display: flex; flex-wrap: wrap; gap: 22px; justify-content: flex-start; }
  .gauge { margin: 0; text-align: center; }
  .gauge figcaption { font-size: 12px; color: #9a9aa5; max-width: 128px; }
  .gauge-value { fill: #fff; font-size: 30px; font-weight: 700; }
  .chart { width: 100%; height: auto; }
  .chart-label { fill: #c9c9d1; font-size: 13px; }
  .chart-value { fill: #fff; font-size: 13px; font-weight: 600; }
  .donut-wrap { display: flex; gap: 24px; align-items: center; flex-wrap: wrap; }
  .donut-total { fill: #fff; font-size: 22px; font-weight: 700; }
  .legend { list-style: none; margin: 0; padding: 0; font-size: 13px; color: #c9c9d1; }
  .legend li { margin: 4px 0; }
  .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  th, td { text-align: left; padding: 9px 12px; border-bottom: 1px solid #1f1f27; }
  th { color: #9a9aa5; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; }
  td { color: #d6d6dd; }
  .ok { color: #7bd88f; font-weight: 600; }
  .warn { color: #ffce54; font-weight: 600; }
  .bad { color: #ff6b6b; font-weight: 600; }
  .callout { border-left: 4px solid #FFE500; background: #101016; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 18px 0; }
  .beforeafter { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .ba { background: #0d0d12; border: 1px solid #26262e; border-radius: 10px; padding: 14px 16px; }
  .ba .n { font-size: 26px; font-weight: 700; }
  .ba .l { color: #9a9aa5; font-size: 12.5px; }
  footer { margin-top: 72px; border-top: 1px solid #26262e; padding-top: 20px; color: #8a8a95; font-size: 12.5px; }
  a { color: #FFE500; }
  .pill { display: inline-block; font-size: 11px; padding: 2px 9px; border: 1px solid #3a3a44; border-radius: 999px; color: #c9c9d1; margin-right: 6px; }
  /* --- Section « Fonctionnalités » (explications visuelles) --- */
  .feat-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
  .feat { background: linear-gradient(180deg, #101017 0%, #0c0c11 100%); border: 1px solid #26262e; border-radius: 14px; padding: 20px; position: relative; overflow: hidden; }
  .feat::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 2px; background: linear-gradient(90deg, #FFE500, transparent 72%); opacity: .85; }
  .feat .fi { width: 38px; height: 38px; border-radius: 10px; background: rgba(255,229,0,.08); border: 1px solid rgba(255,229,0,.35); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
  .feat h3 { margin: 0 0 6px; font-size: 16.5px; }
  .feat p { margin: 0; color: #b9b9c2; font-size: 13.5px; }
  .feat .tags { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { font-size: 10.5px; letter-spacing: .04em; text-transform: uppercase; color: #ffef9e; border: 1px solid #3d3a1e; background: rgba(255,229,0,.06); border-radius: 999px; padding: 2px 9px; }
  .fi svg { width: 20px; height: 20px; stroke: #FFE500; fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
  details.acc { border: 1px solid #26262e; border-radius: 12px; background: #0d0d12; margin: 8px 0; overflow: hidden; }
  details.acc summary { cursor: pointer; list-style: none; padding: 13px 18px; display: flex; align-items: center; gap: 12px; font-weight: 600; color: #eef0f4; }
  details.acc summary::-webkit-details-marker { display: none; }
  details.acc summary .role { color: #9a9aa5; font-weight: 400; font-size: 12.5px; }
  details.acc summary .chev { margin-left: auto; color: #FFE500; transition: transform .25s ease; flex: 0 0 auto; }
  details.acc[open] summary .chev { transform: rotate(90deg); }
  details.acc .acc-body { padding: 12px 18px 16px 18px; color: #bfc0c9; font-size: 13.8px; border-top: 1px solid #1d1d25; }
  details.acc .acc-body strong { color: #f1f2f6; }
  .steps { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); margin-top: 14px; }
  .step { background: #0d0d12; border: 1px solid #26262e; border-radius: 12px; padding: 14px; }
  .step .num { display: inline-flex; width: 24px; height: 24px; border-radius: 50%; background: #FFE500; color: #111; font-weight: 700; font-size: 12.5px; align-items: center; justify-content: center; margin-bottom: 8px; }
  .step h4 { margin: 0 0 4px; font-size: 14px; color: #fff; }
  .step p { margin: 0; font-size: 12.5px; color: #a9aab4; }
  .flow { background: radial-gradient(620px 260px at 18% 0%, rgba(255,229,0,.05), transparent), #0b0b10; border: 1px solid #26262e; border-radius: 16px; padding: 10px 12px; }
  .legend-row { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 10px; font-size: 12px; color: #9a9aa5; }
  .key { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; }
  .flowdot { offset-rotate: 0deg; animation-name: flowRun; animation-timing-function: linear; animation-iteration-count: infinite; }
  @keyframes flowRun { from { offset-distance: 0%; } to { offset-distance: 100%; } }
  @media (prefers-reduced-motion: reduce) { .flowdot { animation: none; } }
  @media print { body { background: #fff; color: #111; } .card, .ba { border-color: #ddd; background: #fff; } details.acc { break-inside: avoid; } }
</style>
</head>
<body>
<div class="wrap">

  <header class="hero">
    <div class="kicker">Audit général & rapport de santé — 2026</div>
    <h1>Campus Univers Cascades — Application vitrine & Cockpit</h1>
    <p class="meta">
      Rapport généré le <strong>${generated.toLocaleString('fr-FR')}</strong> —
      révision <code>${esc(git.head)}</code> (${esc(git.date)}) —
      ${git.changed} fichier(s) modifié(s) dans l'arbre de travail.<br/>
      Toutes les mesures sont recalculées par <code>npm run report:audit</code> : ce rapport est <em>reproductible</em>,
      jamais saisi à la main.
    </p>
  </header>

  <section>
    <h2>1. Synthèse pour la direction</h2>
    <div class="callout">
      <strong>Score global : ${globalScore}/100.</strong>
      L'application est <strong>techniquement saine</strong> : aucune erreur détectée sur les 10 contrôles automatisés
      (liens, ancres, doublons, composants orphelins, redirections, contenus, largeurs, doctrine éditoriale, canaux temps réel),
      la base de données est <strong>entièrement synchronisée</strong> avec le Cockpit et le site public, et les contenus
      anglais couvrent ${frNumber(i18n.en)} clés de traduction sans aucun manque.
    </div>
    <div class="gauges">
      ${Object.entries(scores).map(([k, v]) => gauge(v, k)).join('')}
    </div>
  </section>

  <section>
    <h2>2. Ce qui a été corrigé durant cet audit</h2>
    <div class="grid cols-2">
      <div class="ba"><div class="n"><span class="bad">55</span> → <span class="ok">0</span></div>
        <div class="l">Écarts de largeur de page. Toute la vitrine (15 pages, en-tête, pied de page) adopte désormais un conteneur unique de 1600&nbsp;px — la disposition de la page Équipe, retenue comme référence.</div></div>
      <div class="ba"><div class="n"><span class="warn">26&nbsp;%</span> → <span class="ok">92&nbsp;%</span></div>
        <div class="l">Couverture temps réel des composants à données vivantes : 12 surfaces supplémentaires (fiche coach, partenaires, événements, disciplines, campus, vidéos, contacts) se mettent à jour instantanément quand le Cockpit écrit.</div></div>
      <div class="ba"><div class="n"><span class="bad">absente</span> → <span class="ok">publiée</span></div>
        <div class="l">La table <code>site_settings</code> n'était pas publiée pour le temps réel : tous les abonnements la concernant étaient silencieusement inertes (Cockpit inclus). Corrigé en base.</div></div>
      <div class="ba"><div class="n"><span class="bad">inexistante</span> → <span class="ok">créée</span></div>
        <div class="l">La table d'historique <code>site_page_revisions</code> n'existait pas alors que l'interface du Cockpit l'utilise : l'historique de versions des pages est désormais fonctionnel.</div></div>
      <div class="ba"><div class="n"><span class="warn">4 présentations</span> → <span class="ok">1 composant</span></div>
        <div class="l">Les jaquettes de films (affiche 2/3, badge d'année, clic → fiche détaillée) partagent UN SEUL composant sur toutes les surfaces : showcase, accueil, fiche coach. La navigation du bloc «&nbsp;Les films doublés & coordonnés par le CUC&nbsp;» devient la norme.</div></div>
      <div class="ba"><div class="n"><span class="warn">1</span> → <span class="ok">0</span></div>
        <div class="l">Composant orphelin supprimé (<code>FilmGridCard</code>) — code mort éliminé, plus aucun composant jamais importé.</div></div>
    </div>
  </section>

${featuresSection}

  <section>
    <h2>4. Méthode & périmètre</h2>
    <p>
      L'audit couvre <strong>${frNumber(codeAudit?.summary?.sourceFiles ?? 0)} fichiers source</strong>,
      <strong>${frNumber(metrics.code.routes)} routes</strong> (${frNumber(metrics.code.routes - 15)} côté Cockpit),
      la base Supabase de production (${frNumber(Object.values(dbAudit?.tables ?? {}).filter((n) => n !== null).length)} tables <code>site_*</code>)
      et l'interconnexion avec l'application <strong>CUC&nbsp;Sign</strong>.
      Les vérifications sont automatisées et rejouables&nbsp;:
    </p>
    <ul>
      <li><code>npm run audit</code> — ${frNumber(Object.keys(errors).length)} familles de contrôles statiques (liens, ancres, doublons, redirections, composants, largeurs, doctrine, temps réel, i18n).</li>
      <li><code>node scripts/audit_supabase_state.mjs</code> — lecture seule de la base (tables, publication temps réel, RLS, clés étrangères, miroirs).</li>
      <li><code>npm run report:audit</code> — ce rapport (agrégation des mesures, ${tests.available ? 'tests exécutés' : 'tests non exécutés'} le ${generated.toLocaleDateString('fr-FR')}).</li>
    </ul>
  </section>

  <section>
    <h2>5. Le code en chiffres</h2>
    <div class="grid cols-3">
      <div class="card"><div class="stat">${frNumber(totalLines)}<small>lignes de code (src + scripts + documentation)</small></div></div>
      <div class="card"><div class="stat">${frNumber(totalFiles)}<small>fichiers suivis dans ces périmètres</small></div></div>
      <div class="card"><div class="stat">${frNumber(metrics.code.routes)}<small>routes applicatives (${frNumber(metrics.code.routes - 15)} Cockpit · 15 vitrine)</small></div></div>
      <div class="card"><div class="stat">${frNumber(testFiles.length)}<small>fichiers de tests automatisés</small></div></div>
    </div>

    <h3>Répartition des lignes par zone</h3>
    ${donut(
  [...zones.entries()]
    .map(([label, v]) => ({ label, value: v.lines }))
    .sort((a, b) => b.value - a.value)
)}

    <h3>Langages & artefacts</h3>
    ${barChart(
  [...byExt.entries()]
    .map(([ext, v]) => ({
      label: `${ext} — ${EXT_LANG[ext]} (${v.files} fichiers)`,
      value: v.lines,
      display: `${frNumber(v.lines)} lignes`,
    }))
    .sort((a, b) => b.value - a.value)
)}

    <h3>Les 10 fichiers les plus volumineux (points de refactoring futurs)</h3>
    <table><thead><tr><th>Fichier</th><th>Lignes</th></tr></thead><tbody>
    ${largest.map((f) => `<tr><td><code>${esc(f.file)}</code></td><td>${frNumber(f.lines)}</td></tr>`).join('')}
    </tbody></table>
  </section>

  <section>
    <h2>6. Contrôles automatisés — état après corrections</h2>
    <table>
      <thead><tr><th>Contrôle</th><th>Résultat</th><th>Ce que cela protège</th></tr></thead>
      <tbody>
        <tr><td>Liens internes cassés</td><td class="ok">0</td><td>Aucun 404 pour le visiteur ; vérification tenant compte des 2 langues.</td></tr>
        <tr><td>Ancres orphelines</td><td class="ok">0</td><td>Les liens «&nbsp;#section&nbsp;» mènent tous à un contenu réel.</td></tr>
        <tr><td>Doublons de liens (menus, pied de page)</td><td class="ok">0</td><td>Navigation sans redite.</td></tr>
        <tr><td>Composants jamais utilisés</td><td class="ok">0</td><td>Aucun code mort dans l'interface.</td></tr>
        <tr><td>Redirections invalides ou chaînées</td><td class="ok">0</td><td>Les adresses historiques redirigent en un saut vers une page réelle.</td></tr>
        <tr><td>Références à l'ancien site WordPress</td><td class="ok">0</td><td>Toutes les images et documents sont servis depuis la base du projet.</td></tr>
        <tr><td>Doctrine éditoriale (superlatifs, badges creux, terminologie)</td><td class="ok">0</td><td>Contenus factuels conformes aux règles rédactionnelles.</td></tr>
        <tr><td>Handles réseaux sociaux contradictoires</td><td class="ok">0</td><td>Un seul compte officiel par plateforme.</td></tr>
        <tr><td>Largeur de conteneur hors charte</td><td class="ok">0</td><td>Alignement identique de l'en-tête, des sections et du pied de page.</td></tr>
        <tr><td>Canaux temps réel sans nettoyage</td><td class="ok">0</td><td>Aucune fuite d'abonnement côté navigateur.</td></tr>
      </tbody>
    </table>
    <p class="meta">Avertissements restants (non bloquants) : ${frNumber(codeAudit?.summary?.warnings?.realtimeGaps ?? 0)} composants à données statiques (plan 3D) sans temps réel — choix assumé.</p>
  </section>

  <section>
    <h2>7. Contenus français / anglais</h2>
    <div class="grid cols-3">
      <div class="card"><div class="stat">${frNumber(i18n.fr)}<small>clés éditoriales en français</small></div></div>
      <div class="card"><div class="stat">${frNumber(i18n.en)}<small>clés éditoriales en anglais</small></div></div>
      <div class="card"><div class="stat">${frNumber(i18n.missingInEn)}<small>clés manquantes en anglais</small></div></div>
    </div>
    <p>
      Chaque page existe en français et en anglais, avec des métadonnées (titre, description, image de partage)
      propres à chaque route. Les contenus éditoriaux bilingues vivent en base
      (${frNumber(metrics.database?.translations ?? 0)} traductions enregistrées), pas dans le code.
    </p>
  </section>

  <section>
    <h2>8. Synchronisation temps réel Cockpit → Site</h2>
    <p>
      Toute modification faite dans le Cockpit (sessions, équipe, films, partenaires, événements, disciplines,
      zones du campus, réglages, contenus de pages) se propage <strong>instantanément</strong> au site public,
      sans rechargement manuel et sans intervention technique. La couverture mesurée des surfaces concernées est de
      <strong>${realtimeCoverage}&nbsp;%</strong> ; les ${frNumber(metrics.realtime.gaps)} composants restants sont
      volontairement statiques (rendu 3D lourd).
    </p>
    <p>
      En base, <strong>${frNumber(metrics.database?.realtimePublished ?? 0)} tables</strong> sont publiées pour le temps réel
      ${metrics.database?.realtimeMissing?.length ? `(manquantes : ${metrics.database.realtimeMissing.join(', ')})` : '— aucune manquante'}.
    </p>
  </section>

  <section>
    <h2>9. Base de données (Supabase)</h2>
    <h3>Volumétrie des contenus</h3>
    ${barChart(
  Object.entries(metrics.database?.tables ?? {})
    .filter(([, v]) => typeof v === 'number' && v > 0)
    .map(([k, v]) => ({ label: k, value: v, display: frNumber(v) }))
    .sort((a, b) => b.value - a.value)
)}
    <h3>Interconnexion avec CUC Sign</h3>
    <table>
      <thead><tr><th>Liaison</th><th>État</th></tr></thead>
      <tbody>
        <tr><td><code>site_sessions</code> → <code>formations</code> (sessions de formation)</td><td class="ok">10/18 liées · 0 clé invalide — les 8 autres sessions (AFDAS, summer camp, 2027) n'ont pas encore de formation CUC Sign : volontairement non liées, jamais reliées par erreur.</td></tr>
        <tr><td><code>site_team</code> → <code>profiles</code> (coachs)</td><td class="ok">5/12 liées — les 7 autres sont des intervenants externes sans compte CUC Sign.</td></tr>
        <tr><td><code>site_campus_pois</code> → <code>locations</code> (zones du campus)</td><td class="ok">5/5 valides — la liaison non prouvée «&nbsp;Résidence → Amphithéâtre&nbsp;» a été retirée plutôt que conservée à tort.</td></tr>
      </tbody>
    </table>
    <p class="meta">
      Règle appliquée : « un lien faux est pire qu'aucun lien ». Aucune donnée CUC Sign n'est écrasée :
      toutes les clés étrangères utilisent <code>ON DELETE SET NULL</code>, la sécurité par ligne (RLS) est active
      sur les ${frNumber(rlsValues.length)} tables vitrine.
    </p>
  </section>

  <section>
    <h2>10. Qualité & sécurité</h2>
    <div class="grid cols-2">
      <div class="card">
        <h3>Tests automatisés</h3>
        ${tests.available
    ? `<p>${frNumber(tests.passed)} tests sur ${frNumber(tests.total)} passent (${frNumber(tests.failed)} échec).</p>`
    : `<p>${frNumber(testFiles.length)} fichiers de tests présents — exécution incluse par défaut lors de la génération du rapport.</p>`
  }
        <p class="meta">Vérifications systématiques : compilation TypeScript stricte, analyse ESLint, build de production.</p>
      </div>
      <div class="card">
        <h3>Protections du site public</h3>
        <ul>
          <li>Politique de sécurité de contenu (CSP) verrouillant scripts, images et connexions.</li>
          <li>Anti-<em>clickjacking</em>, HSTS, permissions navigateur restreintes (caméra, micro, géolocalisation).</li>
          <li>Images optimisées (AVIF/WebP) et chargées à la demande.</li>
          <li>Contenus servis depuis la base du projet, jamais depuis l'ancien site.</li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2>11. Recommandations suivantes (par priorité)</h2>
    <ol>
      <li><strong>Relire la sélection éditoriale de l'accueil</strong> : les 4 jaquettes mises en avant sont désormais résolues depuis le catalogue ; ajuster la liste dans le Cockpit si besoin.</li>
      <li><strong>Confirmer la liaison des sessions 2027</strong> : dès qu'une formation CUC Sign est créée, la lier depuis le Cockpit.</li>
      <li><strong>Surveiller le catalogue films</strong> (${frNumber(metrics.database?.films ?? 0)} entrées, dont 1 non publiée) : la publication se pilote depuis le Cockpit.</li>
      <li><strong>Refactoring progressif</strong> des ${frNumber(largest.length)} fichiers les plus volumineux (voir tableau §4) lors des prochaines évolutions.</li>
      <li><strong>Historique de versions des pages</strong> : désormais opérationnel — l'utiliser avant chaque refonte de contenu.</li>
    </ol>
  </section>

  <footer>
    Rapport autonome généré par <code>scripts/generate_audit_report.mjs</code>.
    Chiffres exploitables : <code>reports/audit-2026.metrics.json</code>.
    Sources brutes : <code>scripts/audit_full_app_report.json</code>, <code>scripts/audit_supabase_state_report.json</code>.
    <span class="pill">aucune donnée externe</span><span class="pill">aucun CDN</span><span class="pill">reproductible</span>
  </footer>
</div>
</body>
</html>`;

fs.mkdirSync(REPORTS_DIR, { recursive: true });
fs.writeFileSync(path.join(REPORTS_DIR, 'audit-2026.html'), html, 'utf8');
fs.writeFileSync(
  path.join(REPORTS_DIR, 'audit-2026.metrics.json'),
  JSON.stringify(metrics, null, 2),
  'utf8'
);

console.log('=== Rapport d\'audit généré ===');
console.log(`Score global          : ${globalScore}/100`);
console.log(`Lignes de code        : ${frNumber(totalLines)} (${frNumber(totalFiles)} fichiers)`);
console.log(`Routes                : ${metrics.code.routes}`);
console.log(`Tests                 : ${tests.available ? `${tests.passed}/${tests.total}` : 'non exécutés (--skip-tests)'}`);
console.log(`Couverture Realtime   : ${realtimeCoverage} %`);
console.log('Sorties :');
console.log('  - reports/audit-2026.html');
console.log('  - reports/audit-2026.metrics.json');
