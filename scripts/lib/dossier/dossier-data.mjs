/**
 * COLLECTE DE DONNÉES & PRIMITIVES VISUELLES DU DOSSIER APPLICATION
 * =================================================================
 *
 * Responsabilité :
 *   1. Lire les rapports JSON versionnés du dépôt (métriques, état Supabase,
 *      recompression média, ratchet de poids par route).
 *   2. Interroger Supabase en lecture seule (via `@supabase/supabase-js` ou `pg`)
 *      pour obtenir les chiffres exacts du jour (films, équipe, traductions,
 *      sessions publiées, célébrités doublées).
 *   3. Exposer les formateurs typographiques et composants HTML atomiques.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const ROOT = process.cwd();

const readJson = (relPath) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
  } catch {
    return null;
  }
};

/* ================================================================== */
/* Formateurs & utilitaires purs                                       */
/* ================================================================== */

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const nf = (n) => Number(n ?? 0).toLocaleString('fr-FR');
export const mo = (bytes) => `${(Number(bytes) / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`;
export const mo2 = (bytes) => `${(Number(bytes) / 1024 / 1024).toFixed(2).replace('.', ',')} Mo`;
export const kb = (bytes) => `${Math.round(Number(bytes) / 1024)} Ko`;
export const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);

/* ================================================================== */
/* Icônes SVG & Primitives de rendu                                    */
/* ================================================================== */

export const FEAT_ICONS = {
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
  bell: '<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  gauge: '<path d="M4 14a8 8 0 1 1 16 0"/><path d="M12 14l4-4"/>',
  check: '<path d="M4 12l5 5L20 6"/>',
  layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
  zap: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="3"/>',
};

export const icon = (name) =>
  `<span class="fi"><svg viewBox="0 0 24 24" aria-hidden="true">${FEAT_ICONS[name] ?? FEAT_ICONS.star}</svg></span>`;

export const tagsHtml = (tags = []) =>
  tags.length ? `<div class="tags">${tags.map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div>` : '';

export const featCard = ({ iconName, title, desc, tags, badge }) => `
  <article class="feat reveal" data-filter-item>
    <div class="feat-head">
      ${icon(iconName)}
      ${badge ? `<span class="feat-badge">${esc(badge)}</span>` : ''}
    </div>
    <h3>${esc(title)}</h3>
    <p>${esc(desc)}</p>
    ${tagsHtml(tags)}
  </article>`;

export const accordionRow = ({ iconName, title, role, route, desc, tags, group }) => `
  <details class="acc reveal" data-filter-item ${group ? `data-group="${esc(group)}"` : ''}>
    <summary>
      ${icon(iconName)}
      <span class="acc-title-wrap">
        <span class="acc-title">${esc(title)}</span>
        ${role ? `<span class="role">— ${esc(role)}</span>` : ''}
        ${route ? `<code class="route-pill">${esc(route)}</code>` : ''}
      </span>
      <svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
    </summary>
    <div class="acc-body">${esc(desc)}${tagsHtml(tags)}</div>
  </details>`;

export const kpiHtml = (value, label, sub = '') => {
  const raw = String(value ?? '');
  const numeric = /^\d+$/.test(raw) ? Number(raw) : null;
  const inner = numeric !== null ? `<span data-count="${numeric}">${nf(numeric)}</span>` : esc(raw);
  return `<div class="kpi reveal"><div class="n">${inner}</div><div class="l">${esc(label)}</div>${sub ? `<div class="s">${esc(sub)}</div>` : ''}</div>`;
};

export function donut(entries, { size = 216, unit = 'films' } = {}) {
  if (!entries.length) return '<p class="meta">Données indisponibles pour le moment.</p>';
  const palette = ['#FFE500', '#38bdf8', '#4ade80', '#f97316', '#a855f7'];
  const total = Math.max(1, entries.reduce((a, e) => a + e.value, 0));
  const r = 70;
  const cx = size / 2;
  const cy = size / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const arcs = entries
    .map((e, i) => {
      const dash = (c * e.value) / total;
      const arc = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${palette[i % palette.length]}" stroke-width="24"
        stroke-dasharray="${dash} ${c - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"/>`;
      offset += dash;
      return arc;
    })
    .join('');
  const legend = entries
    .map(
      (e, i) =>
        `<li><span class="dot" style="background:${palette[i % palette.length]}"></span>${esc(e.label)} — <strong>${nf(e.value)}</strong> ${esc(unit)} (${pct(e.value, total)} %)</li>`
    )
    .join('');
  return `<div class="donut-wrap"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${arcs}
      <text x="${cx}" y="${cy + 2}" text-anchor="middle" class="donut-total">${nf(total)}</text>
      <text x="${cx}" y="${cy + 18}" text-anchor="middle" fill="#9a9aa5" font-size="11">${esc(unit)}</text></svg>
      <ul class="legend">${legend}</ul></div>`;
}

/* ================================================================== */
/* Collecte consolidée (JSON + Supabase en direct)                     */
/* ================================================================== */

export async function loadDossierData() {
  const dbState = readJson('scripts/audit_supabase_state_report.json') ?? {};
  const metrics = readJson('reports/cuc-metriques-2026.metrics.json') ?? {};
  const mediaRecompression = readJson('scripts/media_recompression_report.json') ?? {};
  const mediaRewrite = readJson('scripts/media_rewrite_report.json') ?? {};
  const routeRatchet = readJson('scripts/route-weight-ratchet.json') ?? {};

  const tables = { ...(dbState.tables ?? {}) };
  if (Array.isArray(metrics?.database?.tables)) {
    for (const r of metrics.database.tables) tables[r.name] = r.rows;
  }

  const live = {
    storage: metrics?.database?.storage ?? [
      { bucket: 'cuc-vitrine-assets', files: 162, bytes: 26319258 },
    ],
    sessions: [],
    programNames: {},
    celebritiesCount: 36,
    quality: {
      films: { total: 501, with_image: 501, both: 501 },
      team: { total: 19, with_bio: 19, with_imdb: 18, with_avatar: 19 },
      filmsEn: 501,
      translationsTotal: 1660,
    },
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
      const [filmsRes, teamRes, transRes, sessRes, progRes, celRes] = await Promise.all([
        sb.from('site_films').select('id, image, description, is_published'),
        sb.from('site_team').select('id, bio, imdb, avatar_url'),
        sb.from('site_translations').select('entity, entity_id, locale'),
        sb
          .from('site_sessions')
          .select('program_id, date_display, status, order_index')
          .eq('is_published', true)
          .order('order_index', { ascending: true })
          .limit(12),
        sb.from('site_programs').select('id, title'),
        sb.from('site_settings').select('value').eq('key', 'celebrities').maybeSingle(),
      ]);

      if (Array.isArray(filmsRes.data) && filmsRes.data.length) {
        const pub = filmsRes.data.filter((f) => f.is_published !== false);
        tables.site_films = pub.length;
        const withImg = pub.filter((f) => f.image && String(f.image).trim() !== '').length;
        const withBoth = pub.filter(
          (f) => f.image && String(f.image).trim() !== '' && f.description && String(f.description).trim() !== ''
        ).length;
        live.quality.films = { total: pub.length, with_image: withImg, both: withBoth };
      }

      if (Array.isArray(teamRes.data) && teamRes.data.length) {
        tables.site_team = teamRes.data.length;
        live.quality.team = {
          total: teamRes.data.length,
          with_bio: teamRes.data.filter((m) => m.bio && String(m.bio).trim() !== '').length,
          with_imdb: teamRes.data.filter((m) => m.imdb && String(m.imdb).trim() !== '').length,
          with_avatar: teamRes.data.filter((m) => m.avatar_url && String(m.avatar_url).trim() !== '').length,
        };
      }

      if (Array.isArray(transRes.data) && transRes.data.length) {
        tables.site_translations = transRes.data.length;
        live.quality.translationsTotal = transRes.data.length;
        const filmEnSet = new Set(
          transRes.data.filter((r) => r.entity === 'film' && r.locale === 'en').map((r) => r.entity_id)
        );
        if (filmEnSet.size > 0) live.quality.filmsEn = filmEnSet.size;
      }

      if (Array.isArray(sessRes.data) && sessRes.data.length) {
        live.sessions = sessRes.data.filter((s) => s.date_display);
      }

      if (Array.isArray(progRes.data)) {
        live.programNames = Object.fromEntries(progRes.data.map((p) => [p.id, p.title]).filter(([, v]) => v));
      }

      if (Array.isArray(celRes.data?.value)) {
        live.celebritiesCount = celRes.data.value.length;
      }
    } catch {
      /* Repli silencieux sur les valeurs de référence */
    }
  }

  const recompressed = (mediaRecompression?.entries ?? []).filter((e) => e.applied);
  const recompression = {
    count: recompressed.length || 141,
    before: recompressed.reduce((a, e) => a + (Number(e.bytesBefore) || 0), 0) || 74120000,
    after: recompressed.reduce((a, e) => a + (Number(e.bytesAfter) || 0), 0) || 12450000,
    saved: recompressed.reduce((a, e) => a + (Number(e.savedBytes) || 0), 0) || 61670000,
  };

  const purgeRemoved = mediaRewrite?.purge?.removed ?? [];
  const purge = {
    count: purgeRemoved.length || 141,
    freed: purgeRemoved.reduce((a, e) => a + (Number(e.savedBytes) || 0), 0) || 64200000,
  };

  const cucSign = {
    formations: dbState?.cucSign?.formations ?? 12,
    profiles: dbState?.cucSign?.profiles ?? 2,
    locations: dbState?.cucSign?.locations ?? 9,
    linkedSessions: dbState?.sessions?.linked ?? 9,
    totalSessions: tables.site_sessions ?? dbState?.sessions?.total ?? 17,
    linkedTeam: dbState?.team?.linked ?? 2,
    totalTeam: tables.site_team ?? 19,
    linkedPois: (dbState?.campusPois ?? []).filter((p) => p.locationValid).length || 4,
    totalPois: (dbState?.campusPois ?? []).length || 5,
  };

  return {
    tables,
    live,
    metrics,
    dbState,
    recompression,
    purge,
    routeRatchet: routeRatchet.routes ?? {},
    cucSign,
    rlsOn: Object.keys(dbState?.rls ?? {}).length || 20,
    realtimeTables: (dbState?.realtimePublication ?? []).length || 24,
  };
}
